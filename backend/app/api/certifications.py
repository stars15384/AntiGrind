import hashlib
from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.auth import get_current_user
from app.database import get_db
from app.models import Certification, CertificationBadge, Company, User, WorkHourRecord
from app.schemas import (
    CertificationBadgeResponse,
    CertificationCreate,
    CertificationResponse,
    CertificationReview,
)
from app.services.agi_engine import AGIEngine
from app.services.report_service import PDFReportGenerator

router = APIRouter(prefix="/certifications", tags=["certifications"])


def generate_badge_code(company_id: str, certification_id: str) -> str:
    data = f"{company_id}:{certification_id}:{datetime.utcnow().timestamp()}"
    return hashlib.sha256(data.encode()).hexdigest()[:16].upper()


@router.post("/apply", response_model=CertificationResponse)
async def apply_certification(
    certification_data: CertificationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(
        select(Company)
        .where(Company.id == certification_data.company_id)
        .options(selectinload(Company.certifications))
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    existing = await db.execute(
        select(Certification)
        .where(Certification.company_id == certification_data.company_id)
        .where(Certification.status.in_(["pending", "under_review", "approved"]))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Certification already exists or is pending")

    certification = Certification(
        company_id=certification_data.company_id,
        submitted_by=current_user.id,
        policy_document_url=certification_data.policy_document_url,
        evidence_urls=certification_data.evidence_urls,
    )
    db.add(certification)

    company.certification_status = "pending"

    await db.commit()
    await db.refresh(certification)
    return certification


@router.get("/{certification_id}", response_model=CertificationResponse)
async def get_certification(
    certification_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Certification)
        .options(
            selectinload(Certification.company),
            selectinload(Certification.submitter),
            selectinload(Certification.reviewer),
            selectinload(Certification.badges),
        )
        .where(Certification.id == certification_id)
    )
    certification = result.scalar_one_or_none()
    if not certification:
        raise HTTPException(status_code=404, detail="Certification not found")
    return certification


@router.get("/company/{company_id}", response_model=CertificationResponse | None)
async def get_company_certification(
    company_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Certification)
        .options(selectinload(Certification.badges))
        .where(Certification.company_id == company_id)
        .order_by(Certification.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


@router.post("/{certification_id}/review", response_model=CertificationResponse)
async def review_certification(
    certification_id: str,
    review_data: CertificationReview,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(
        select(Certification)
        .options(selectinload(Certification.company))
        .where(Certification.id == certification_id)
    )
    certification = result.scalar_one_or_none()
    if not certification:
        raise HTTPException(status_code=404, detail="Certification not found")

    if certification.status not in ["pending", "under_review"]:
        raise HTTPException(status_code=400, detail="Certification cannot be reviewed")

    certification.reviewed_by = current_user.id
    certification.review_notes = review_data.review_notes

    if review_data.approved:
        certification.status = "approved"
        certification.approved_at = datetime.utcnow()
        certification.expires_at = datetime.utcnow() + timedelta(days=365)

        company = certification.company
        if company:
            company.certification_status = "certified"
            company.certification_level = review_data.certification_level or "bronze"
            company.certification_expires_at = certification.expires_at

        badge_code = generate_badge_code(certification.company_id, certification.id)
        badge = CertificationBadge(
            company_id=certification.company_id,
            certification_id=certification.id,
            badge_code=badge_code,
        )
        db.add(badge)

        if company:
            company.certification_badge_id = badge_code
    else:
        certification.status = "rejected"

        company = certification.company
        if company:
            company.certification_status = "rejected"

    await db.commit()
    await db.refresh(certification)
    return certification


@router.get("/{certification_id}/badge", response_model=CertificationBadgeResponse)
async def get_certification_badge(
    certification_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(CertificationBadge).where(CertificationBadge.certification_id == certification_id)
    )
    badge = result.scalar_one_or_none()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    return badge


@router.get("/badge/{badge_code}", response_model=CertificationBadgeResponse)
async def get_badge_by_code(
    badge_code: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(CertificationBadge).where(CertificationBadge.badge_code == badge_code)
    )
    badge = result.scalar_one_or_none()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    return badge


@router.get("/{certification_id}/report")
async def download_certification_report(
    certification_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    language: str = Query(default="zh", description="Language: zh or en"),
):
    result = await db.execute(
        select(Certification)
        .options(
            selectinload(Certification.company),
            selectinload(Certification.badges),
        )
        .where(Certification.id == certification_id)
    )
    certification = result.scalar_one_or_none()

    if not certification:
        raise HTTPException(status_code=404, detail="Certification not found")

    if certification.status != "approved":
        raise HTTPException(
            status_code=400, detail="Only approved certifications can generate reports"
        )

    company = certification.company
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    work_hours_result = await db.execute(
        select(WorkHourRecord)
        .where(WorkHourRecord.company_id == company.id)
        .where(WorkHourRecord.status == "verified")
    )
    verified_records = work_hours_result.scalars().all()

    agi_engine = AGIEngine()

    if verified_records:
        all_scores = [agi_engine.calculate(record) for record in verified_records]
        avg_agi = sum(all_scores) / len(all_scores)
        avg_dimensions = {
            "hours_score": {
                "value": sum(r.weekly_hours - 40 for r in verified_records if r.weekly_hours > 40)
                / len(verified_records),
                "weight": 0.4,
            },
            "weekend_score": {"value": 10, "weight": 0.25},
            "overtime_score": {"value": 5, "weight": 0.15},
            "shift_score": {"value": 3, "weight": 0.1},
            "vibe_score": {
                "value": sum(r.vibe_score for r in verified_records) / len(verified_records),
                "weight": 0.1,
            },
        }
    else:
        avg_agi = 0
        avg_dimensions = {}

    weekend_dist = {}
    overtime_dist = {}
    for record in verified_records:
        weekend_dist[record.weekend_policy] = weekend_dist.get(record.weekend_policy, 0) + 1
        overtime_dist[record.overtime_compensation] = (
            overtime_dist.get(record.overtime_compensation, 0) + 1
        )

    level = "green" if avg_agi <= 30 else ("yellow" if avg_agi <= 60 else "red")

    company_info = {
        "name": company.name,
        "industry": company.industry,
        "location": None,
    }

    agi_data = {
        "total_score": round(avg_agi, 2),
        "level": level,
        "dimensions": avg_dimensions,
    }

    work_hours_stats = {
        "avg_weekly_hours": round(
            sum(r.weekly_hours for r in verified_records) / len(verified_records), 1
        )
        if verified_records
        else 0,
        "weekend_policy_distribution": weekend_dist,
        "overtime_compensation_distribution": overtime_dist,
    }

    certification_info = {
        "level": company.certification_level or "bronze",
        "issue_date": certification.approved_at.strftime("%Y-%m-%d")
        if certification.approved_at
        else "N/A",
        "expiry_date": certification.expires_at.strftime("%Y-%m-%d")
        if certification.expires_at
        else "N/A",
        "badge_code": certification.badges[0].badge_code if certification.badges else "N/A",
    }

    recommendations = []
    if avg_agi > 30:
        recommendations.append("建议优化工作时长管理，确保员工周均工时接近40小时标准")
    if any(p in ["single_rest", "no_rest"] for p in weekend_dist.keys()):
        recommendations.append("建议完善周末休息制度，保障员工休息权益")
    if any(o in ["unpaid", "fixed_subsidy"] for o in overtime_dist.keys()):
        recommendations.append("建议规范加班补偿机制，按照法定标准支付加班费")

    try:
        generator = PDFReportGenerator()
        pdf_bytes = generator.generate_certification_report(
            company_info=company_info,
            agi_data=agi_data,
            work_hours_stats=work_hours_stats,
            certification_info=certification_info,
            recommendations=recommendations if recommendations else None,
            language=language,
        )

        filename = f"antigrind_certification_{company.name}_{datetime.now().strftime('%Y%m%d')}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")
