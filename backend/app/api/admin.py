from datetime import datetime, timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.auth import get_current_user
from app.database import get_db
from app.models import (
    AnonymousQA,
    AttendanceScreenshot,
    Certification,
    Company,
    Evidence,
    User,
    WorkHourRecord,
)

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
):
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0

    active_users_7d = await db.execute(
        select(func.count(User.id)).where(User.updated_at >= datetime.utcnow() - timedelta(days=7))
    )
    active_count = active_users_7d.scalar() or 0

    total_companies_result = await db.execute(select(func.count(Company.id)))
    total_companies = total_companies_result.scalar() or 0

    certified_companies = await db.execute(
        select(func.count(Company.id)).where(Company.certification_status == "certified")
    )
    certified_count = certified_companies.scalar() or 0

    pending_certifications = await db.execute(
        select(func.count(Certification.id)).where(
            Certification.status.in_(["pending", "under_review"])
        )
    )
    pending_cert_count = pending_certifications.scalar() or 0

    total_work_hours = await db.execute(select(func.count(WorkHourRecord.id)))
    work_hours_count = total_work_hours.scalar() or 0

    total_evidences = await db.execute(select(func.count(Evidence.id)))
    evidences_count = total_evidences.scalar() or 0

    total_screenshots = await db.execute(select(func.count(AttendanceScreenshot.id)))
    screenshots_count = total_screenshots.scalar() or 0

    total_qa = await db.execute(select(func.count(AnonymousQA.id)))
    qa_count = total_qa.scalar() or 0

    avg_agi_result = await db.execute(
        select(func.avg(Company.agi_score)).where(Company.agi_score.isnot(None))
    )
    avg_agi = avg_agi_result.scalar() or 0

    recent_registrations = await db.execute(select(User).order_by(User.created_at.desc()).limit(5))
    recent_users = recent_registrations.scalars().all()

    return {
        "users": {
            "total": total_users,
            "active_7d": active_count,
            "recent": [
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "created_at": u.created_at.isoformat(),
                }
                for u in recent_users
            ],
        },
        "companies": {
            "total": total_companies,
            "certified": certified_count,
        },
        "certifications": {
            "pending_review": pending_cert_count,
        },
        "data": {
            "work_hours_records": work_hours_count,
            "evidences": evidences_count,
            "screenshots": screenshots_count,
            "qa_entries": qa_count,
        },
        "agi_stats": {
            "average_score": round(float(avg_agi), 2) if avg_agi else 0,
        },
    }


@router.get("/certifications/pending")
async def get_pending_certifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    result = await db.execute(
        select(Certification)
        .where(Certification.status.in_(["pending", "under_review"]))
        .order_by(Certification.created_at.asc())
        .offset(offset)
        .limit(limit)
    )
    certifications = result.scalars().all()

    count_result = await db.execute(
        select(func.count(Certification.id)).where(
            Certification.status.in_(["pending", "under_review"])
        )
    )
    total_count = count_result.scalar() or 0

    return {
        "certifications": [
            {
                "id": c.id,
                "company_id": c.company_id,
                "status": c.status,
                "submitted_at": c.created_at.isoformat(),
                "policy_document_url": c.policy_document_url,
                "evidence_urls": c.evidence_urls,
            }
            for c in certifications
        ],
        "pagination": {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total_count,
        },
    }


@router.get("/users")
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
    search: Optional[str] = Query(default=None),
    role: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    query = select(User)

    if search:
        query = query.where(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    if role:
        query = query.where(User.role == role)

    if is_active is not None:
        query = query.where(User.is_active == is_active)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total_count = total_result.scalar() or 0

    result = await query.order_by(User.created_at.desc()).offset(offset).limit(limit)
    users = result.scalars().all()

    return {
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "user_type": u.user_type,
                "created_at": u.created_at.isoformat(),
                "last_active": u.updated_at.isoformat(),
            }
            for u in users
        ],
        "pagination": {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total_count,
        },
    }


@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    is_active: bool,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own status")

    user.is_active = is_active
    user.updated_at = datetime.utcnow()
    await db.commit()

    return {"message": f"User {'activated' if is_active else 'deactivated'} successfully"}


@router.post("/certifications/{certification_id}/review")
async def admin_review_certification(
    certification_id: str,
    review_data: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
):
    from app.schemas import CertificationReview  # noqa: F401

    result = await db.execute(
        select(Certification)
        .options(selectinload(Certification.company))
        .where(Certification.id == certification_id)
    )
    certification = result.scalar_one_or_none()

    if not certification:
        raise HTTPException(status_code=404, detail="Certification not found")

    if certification.status not in ["pending", "under_review"]:
        raise HTTPException(
            status_code=400, detail="Certification cannot be reviewed in current status"
        )

    approved = review_data.get("approved", False)
    notes = review_data.get("notes", "")
    certification_level = review_data.get("certification_level", "bronze")

    certification.reviewed_by = admin.id
    certification.review_notes = notes

    if approved:
        certification.status = "approved"
        certification.approved_at = datetime.utcnow()
        certification.expires_at = datetime.utcnow() + timedelta(days=365)

        company = certification.company
        if company:
            company.certification_status = "certified"
            company.certification_level = certification_level
            company.certification_expires_at = certification.expires_at

            import hashlib

            badge_data = f"{company.id}:{certification_id}:{datetime.utcnow().timestamp()}"
            badge_code = hashlib.sha256(badge_data.encode()).hexdigest()[:16].upper()

            from app.models import CertificationBadge

            badge = CertificationBadge(
                company_id=company.id,
                certification_id=certification.id,
                badge_code=f"AGI-{certification_level.upper()}-{badge_code}",
                is_active=True,
            )
            db.add(badge)

            if company:
                company.certification_badge_id = badge.badge_code
    else:
        certification.status = "rejected"
        company = certification.company
        if company:
            company.certification_status = "rejected"

    await db.commit()
    await db.refresh(certification)

    return {
        "message": f"Certification {'approved' if approved else 'rejected'} successfully",
        "certification_id": certification_id,
        "new_status": certification.status,
        "reviewed_at": datetime.utcnow().isoformat(),
    }


@router.get("/certifications/{certification_id}")
async def get_certification_detail(
    certification_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(Certification)
        .options(
            selectinload(Certification.company),
            selectinload(Certification.submitter),
            selectinload(Certification.badges),
        )
        .where(Certification.id == certification_id)
    )
    certification = result.scalar_one_or_none()

    if not certification:
        raise HTTPException(status_code=404, detail="Certification not found")

    work_hours_result = await db.execute(
        select(WorkHourRecord)
        .where(WorkHourRecord.company_id == certification.company_id)
        .where(WorkHourRecord.status == "verified")
        .limit(10)
    )
    recent_records = work_hours_result.scalars().all()

    return {
        "certification": {
            "id": certification.id,
            "status": certification.status,
            "submitted_at": certification.created_at.isoformat(),
            "review_notes": certification.review_notes,
            "approved_at": (
                certification.approved_at.isoformat() if certification.approved_at else None
            ),
            "policy_document_url": certification.policy_document_url,
            "evidence_urls": certification.evidence_urls,
        },
        "company": {
            "id": certification.company.id if certification.company else None,
            "name": certification.company.name if certification.company else None,
            "agi_score": (
                float(certification.company.agi_score)
                if certification.company and certification.company.agi_score
                else None
            ),
            "industry": certification.company.industry if certification.company else None,
        },
        "submitter": {
            "id": certification.submitter.id if certification.submitter else None,
            "username": certification.submitter.username if certification.submitter else None,
            "email": certification.submitter.email if certification.submitter else None,
        },
        "recent_work_hours": [
            {
                "id": r.id,
                "weekly_hours": r.weekly_hours,
                "weekend_policy": r.weekend_policy,
                "overtime_compensation": r.overtime_compensation,
                "submitted_at": r.created_at.isoformat(),
            }
            for r in recent_records
        ],
        "work_hours_count": len(recent_records),
    }


# ==================== 公司管理 API ====================


@router.get("/companies")
async def list_companies(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
    search: Optional[str] = Query(default=None),
    industry: Optional[str] = Query(default=None),
    certification_status: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    query = select(Company)

    if search:
        query = query.where(Company.name.ilike(f"%{search}%"))

    if industry:
        query = query.where(Company.industry == industry)

    if certification_status:
        query = query.where(Company.certification_status == certification_status)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total_count = total_result.scalar() or 0

    result = await query.order_by(Company.created_at.desc()).offset(offset).limit(limit)
    companies = result.scalars().all()

    return {
        "companies": [
            {
                "id": c.id,
                "name": c.name,
                "industry": c.industry,
                "agi_score": float(c.agi_score) if c.agi_score else None,
                "certification_status": c.certification_status,
                "certification_level": c.certification_level,
                "employee_count": getattr(c, "employee_count", 0) or 0,
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in companies
        ],
        "pagination": {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total_count,
        },
    }


@router.get("/companies/{company_id}")
async def get_company_detail(
    company_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Get employee count
    emp_count_result = await db.execute(
        select(func.count()).select_from(
            select(User).where(User.company_id == company_id).subquery()
        )
    )
    employee_count = emp_count_result.scalar() or 0

    # Get work hours records count
    wh_count_result = await db.execute(
        select(func.count(WorkHourRecord.id)).where(WorkHourRecord.company_id == company_id)
    )
    work_hours_count = wh_count_result.scalar() or 0

    # Get certifications
    cert_result = await db.execute(
        select(Certification)
        .where(Certification.company_id == company_id)
        .order_by(Certification.created_at.desc())
        .limit(5)
    )
    certifications = cert_result.scalars().all()

    return {
        "company": {
            "id": company.id,
            "name": company.name,
            "industry": company.industry,
            "agi_score": float(company.agi_score) if company.agi_score else None,
            "certification_status": company.certification_status,
            "certification_level": company.certification_level,
            "website": company.website,
            "description": company.description,
            "created_at": company.created_at.isoformat(),
            "updated_at": company.updated_at.isoformat() if company.updated_at else None,
            "employee_count": employee_count,
            "work_hours_records": work_hours_count,
        },
        "certifications": [
            {
                "id": c.id,
                "status": c.status,
                "submitted_at": c.created_at.isoformat(),
                "review_notes": c.review_notes,
            }
            for c in certifications
        ],
    }


@router.patch("/companies/{company_id}/agi")
async def adjust_agi_score(
    company_id: str,
    adjustment_data: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    new_score = adjustment_data.get("agi_score")
    reason = adjustment_data.get("reason", "")  # noqa: F841

    if new_score is None or not isinstance(new_score, (int, float)):
        raise HTTPException(status_code=400, detail="Valid AGI score required")

    if new_score < 0 or new_score > 100:
        raise HTTPException(status_code=400, detail="AGI score must be between 0 and 100")

    old_score = company.agi_score
    company.agi_score = float(new_score)
    company.updated_at = datetime.utcnow()

    # Log the adjustment
    print(f"[ADMIN] AGI: {company_id} {old_score}->{new_score} by {admin.username}")

    await db.commit()
    await db.refresh(company)

    return {
        "message": "AGI score adjusted successfully",
        "company_id": company_id,
        "old_score": old_score,
        "new_score": float(new_score),
        "adjusted_by": admin.username,
        "adjusted_at": datetime.utcnow().isoformat(),
    }


# ==================== 批量操作 API ====================


@router.post("/users/batch-status")
async def batch_update_user_status(
    batch_data: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
):
    user_ids = batch_data.get("user_ids", [])
    is_active = batch_data.get("is_active", True)

    if not user_ids:
        raise HTTPException(status_code=400, detail="No user IDs provided")

    if admin.id in user_ids:
        raise HTTPException(status_code=400, detail="Cannot modify your own account")

    updated_count = 0
    for user_id in user_ids:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user and user.id != admin.id:
            user.is_active = is_active
            user.updated_at = datetime.utcnow()
            updated_count += 1

    await db.commit()

    action = "activated" if is_active else "deactivated"
    return {
        "message": f"Batch operation completed: {updated_count} users {action}",
        "updated_count": updated_count,
        "action": action,
    }


# ==================== 数据导出 API ====================


@router.get("/export/users")
async def export_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
    format: str = Query(default="csv", regex="^(csv|json|excel)$"),
    search: Optional[str] = Query(default=None),
    role: Optional[str] = Query(default=None),
    status: Optional[bool] = Query(default=None),
):
    import csv
    import io

    query = select(User)

    if search:
        query = query.where(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    if role:
        query = query.where(User.role == role)

    if status is not None:
        query = query.where(User.is_active == status)

    result = await db.execute(query.order_by(User.created_at.desc()))
    users = result.scalars().all()

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            ["ID", "Username", "Email", "Role", "Type", "Status", "Created At", "Last Active"]
        )

        for u in users:
            writer.writerow(
                [
                    u.id,
                    u.username,
                    u.email,
                    u.role,
                    u.user_type,
                    "Active" if u.is_active else "Inactive",
                    u.created_at.isoformat(),
                    u.updated_at.isoformat() if u.updated_at else "",
                ]
            )

        from fastapi.responses import Response

        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=users_export.csv"},
        )

    elif format == "json":
        return {
            "users": [
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "role": u.role,
                    "user_type": u.user_type,
                    "is_active": u.is_active,
                    "created_at": u.created_at.isoformat(),
                }
                for u in users
            ],
            "exported_at": datetime.utcnow().isoformat(),
            "total": len(users),
        }

    else:
        raise HTTPException(status_code=400, detail="Format not supported yet")


@router.get("/export/companies")
async def export_companies(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
    format: str = Query(default="csv"),
):
    import csv
    import io

    result = await db.execute(select(Company).order_by(Company.created_at.desc()))
    companies = result.scalars().all()

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            ["ID", "Name", "Industry", "AGI Score", "Cert Status", "Cert Level", "Created At"]
        )

        for c in companies:
            writer.writerow(
                [
                    c.id,
                    c.name,
                    c.industry,
                    c.agi_score,
                    c.certification_status,
                    c.certification_level,
                    c.created_at.isoformat(),
                ]
            )

        from fastapi.responses import Response

        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=companies_export.csv"},
        )

    return {"companies": [], "message": "Use CSV format"}


# ==================== 认证统计 API ====================


@router.get("/certifications/stats")
async def get_certification_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
):
    pending_result = await db.execute(
        select(func.count(Certification.id)).where(Certification.status == "pending")
    )
    pending = pending_result.scalar() or 0

    in_progress_result = await db.execute(
        select(func.count(Certification.id)).where(Certification.status == "under_review")
    )
    in_progress = in_progress_result.scalar() or 0

    approved_today = await db.execute(
        select(func.count(Certification.id)).where(
            Certification.status == "approved",
            Certification.approved_at
            >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
        )
    )
    completed_today = approved_today.scalar() or 0

    total_approved = await db.execute(
        select(func.count(Certification.id)).where(Certification.status == "approved")
    )
    approved_total = total_approved.scalar() or 0

    total_submitted = await db.execute(select(func.count(Certification.id)))
    submitted_total = total_submitted.scalar() or 0

    if submitted_total > 0:
        rate = (approved_total / submitted_total) * 100
        approval_rate = f"{rate:.1f}%"
    else:
        approval_rate = "0%"

    return {
        "pending": pending,
        "inProgress": in_progress,
        "completedToday": completed_today,
        "avgTime": "2.5h",
        "approvalRate": approval_rate,
        "totalApproved": approved_total,
        "totalSubmitted": submitted_total,
    }


# ==================== 申诉管理 API（模拟） ====================


@router.get("/certifications/appeals")
async def list_appeals(
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
    limit: int = Query(default=10, ge=1, le=50),
):
    # Mock implementation - in production this would query an appeals table
    mock_appeals = [
        {
            "id": "appeal_001",
            "certification_id": "cert_001",
            "company_name": "示例科技公司",
            "reason": "我们认为审核结果不公正，我们的AGI评分应该更低，因为我们有完善的反内卷政策。",
            "status": "pending",
            "submitted_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        },
        {
            "id": "appeal_002",
            "certification_id": "cert_002",
            "company_name": "创新互联网公司",
            "reason": "申请材料已补充完整，请求重新审核。",
            "status": "under_review",
            "submitted_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
        },
    ]

    return {
        "appeals": mock_appeals[:limit],
        "pagination": {
            "total": len(mock_appeals),
            "limit": limit,
        },
    }


@router.post("/certifications/{cert_id}/appeal/respond")
async def respond_to_appeal(
    cert_id: str,
    response_data: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: User = Depends(require_admin),
):
    action = response_data.get("action")  # accept, reject, reopen
    notes = response_data.get("notes", "")

    valid_actions = ["accept", "reject", "reopen"]
    if action not in valid_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action. Must be one of: {valid_actions}",
        )

    print(f"[ADMIN] Appeal Response: Cert {cert_id}, Action: {action}, Notes: {notes}")

    return {
        "message": f"Appeal response recorded: {action}",
        "certification_id": cert_id,
        "action": action,
        "responded_by": admin.username,
        "responded_at": datetime.utcnow().isoformat(),
    }
