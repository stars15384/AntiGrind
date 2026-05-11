from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.database import get_db
from app.models import AnonymousQA, Company, User
from app.schemas import QAAnswer, QACreate, QAResponse

router = APIRouter(prefix="/qa", tags=["qa"])


@router.post("", response_model=QAResponse)
async def create_question(
    qa_data: QACreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(Company).where(Company.id == qa_data.company_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Company not found")

    qa = AnonymousQA(
        company_id=qa_data.company_id,
        question=qa_data.question,
    )
    db.add(qa)
    await db.commit()
    await db.refresh(qa)
    return qa


@router.get("/company/{company_id}", response_model=list[QAResponse])
async def get_company_qa(
    company_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 20,
    answered_only: bool = False,
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Company not found")

    query = select(AnonymousQA).where(AnonymousQA.company_id == company_id)
    if answered_only:
        query = query.where(AnonymousQA.answer.isnot(None))

    query = query.offset(skip).limit(limit).order_by(AnonymousQA.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{qa_id}/answer", response_model=QAResponse)
async def answer_question(
    qa_id: str,
    answer_data: QAAnswer,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(AnonymousQA).where(AnonymousQA.id == qa_id))
    qa = result.scalar_one_or_none()
    if not qa:
        raise HTTPException(status_code=404, detail="Question not found")

    if qa.answer:
        raise HTTPException(status_code=400, detail="Question already answered")

    qa.answer = answer_data.answer
    qa.answered_at = datetime.utcnow()
    qa.is_verified_employee = answer_data.is_verified_employee

    await db.commit()
    await db.refresh(qa)
    return qa
