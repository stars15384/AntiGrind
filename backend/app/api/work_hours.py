from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.database import get_db
from app.models import Company, User, WorkHourRecord
from app.schemas import WorkHourRecordCreate, WorkHourRecordResponse, WorkHourRecordVerify
from app.services.agi_engine import AGIEngine

router = APIRouter(prefix="/work-hours", tags=["work-hours"])


@router.post("", response_model=WorkHourRecordResponse)
async def create_work_hour_record(
    record_data: WorkHourRecordCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(Company).where(Company.id == record_data.company_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Company not found")

    record = WorkHourRecord(
        **record_data.model_dump(),
        user_id=current_user.id,
        source="user_reported",
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/company/{company_id}", response_model=list[WorkHourRecordResponse])
async def get_company_work_hours(
    company_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 20,
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Company not found")

    query = (
        select(WorkHourRecord)
        .where(WorkHourRecord.company_id == company_id)
        .offset(skip)
        .limit(limit)
        .order_by(WorkHourRecord.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{record_id}/verify", response_model=WorkHourRecordResponse)
async def verify_work_hour_record(
    record_id: str,
    verify_data: WorkHourRecordVerify,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(WorkHourRecord).where(WorkHourRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Work hour record not found")

    if verify_data.verified:
        record.verification_count += 1
        if record.verification_count >= 5:
            record.status = "verified"

            company_result = await db.execute(
                select(Company).where(Company.id == record.company_id)
            )
            company = company_result.scalar_one_or_none()
            if company:
                agi_engine = AGIEngine()
                company.agi_score = agi_engine.calculate_company_agi(record.company_id, db)

    await db.commit()
    await db.refresh(record)
    return record
