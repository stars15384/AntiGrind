import uuid
from typing import Annotated

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.config import get_settings
from app.database import get_db
from app.models import Company, Evidence, User
from app.schemas import EvidenceCreate, EvidenceResponse

router = APIRouter(prefix="/evidences", tags=["evidences"])
settings = get_settings()


@router.post("", response_model=EvidenceResponse)
async def upload_evidence(
    evidence_data: EvidenceCreate,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Company).where(Company.id == evidence_data.company_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Company not found")

    file_path = f"evidences/{current_user.id}/{str4()}_{file.filename}"

    evidence = Evidence(
        user_id=current_user.id,
        company_id=evidence_data.company_id,
        work_hour_record_id=evidence_data.work_hour_record_id,
        file_path=file_path,
        file_type=evidence_data.file_type,
        type=evidence_data.type,
    )
    db.add(evidence)
    await db.commit()
    await db.refresh(evidence)

    return evidence


@router.get("/{evidence_id}", response_model=EvidenceResponse)
async def get_evidence(
    evidence_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(Evidence).where(Evidence.id == evidence_id))
    evidence = result.scalar_one_or_none()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence

