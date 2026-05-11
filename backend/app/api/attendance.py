import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.database import get_db
from app.models import AttendanceScreenshot, Company, User
from app.schemas import AttendanceScreenshotResponse, CompanyAttendanceStats

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/screenshots", response_model=AttendanceScreenshotResponse)
async def upload_attendance_screenshot(
    company_id: str,
    source: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Company not found")

    valid_sources = ["dingtalk", "feishu", "other"]
    if source not in valid_sources:
        raise HTTPException(
            status_code=400, detail=f"Invalid source. Must be one of: {valid_sources}"
        )

    file_path = f"attendance/{current_user.id}/{uuid.uuid4().hex}_{file.filename}"

    screenshot = AttendanceScreenshot(
        user_id=current_user.id,
        company_id=company_id,
        source=source,
        file_path=file_path,
        file_type=file.content_type or "image/png",
        status="pending",
    )
    db.add(screenshot)
    await db.commit()
    await db.refresh(screenshot)
    return screenshot


@router.get("/my/screenshots", response_model=list[AttendanceScreenshotResponse])
async def get_my_screenshots(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    skip: int = 0,
    limit: int = 20,
):
    result = await db.execute(
        select(AttendanceScreenshot)
        .where(AttendanceScreenshot.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(AttendanceScreenshot.created_at.desc())
    )
    return result.scalars().all()


@router.get("/company/{company_id}/stats", response_model=CompanyAttendanceStats)
async def get_company_attendance_stats(
    company_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Company not found")

    total_result = await db.execute(
        select(func.count(AttendanceScreenshot.id)).where(
            AttendanceScreenshot.company_id == company_id
        )
    )
    total_screenshots = total_result.scalar() or 0

    verified_result = await db.execute(
        select(func.count(AttendanceScreenshot.id)).where(
            AttendanceScreenshot.company_id == company_id,
            AttendanceScreenshot.status == "verified",
        )
    )
    verified_count = verified_result.scalar() or 0

    employees_result = await db.execute(
        select(func.count(func.distinct(AttendanceScreenshot.user_id))).where(
            AttendanceScreenshot.company_id == company_id
        )
    )
    total_employees = employees_result.scalar() or 0

    return CompanyAttendanceStats(
        company_id=company_id,
        total_screenshots=total_screenshots,
        verified_count=verified_count,
        total_employees=total_employees,
    )


@router.post("/{screenshot_id}/verify")
async def verify_screenshot(
    screenshot_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(
        select(AttendanceScreenshot).where(AttendanceScreenshot.id == screenshot_id)
    )
    screenshot = result.scalar_one_or_none()
    if not screenshot:
        raise HTTPException(status_code=404, detail="Screenshot not found")

    if screenshot.status != "pending":
        raise HTTPException(status_code=400, detail="Screenshot already processed")

    screenshot.status = "verified"
    screenshot.verified_at = datetime.utcnow()
    screenshot.verified_by = current_user.id

    await db.commit()
    await db.refresh(screenshot)
    return {"status": "success", "message": "Screenshot verified"}
