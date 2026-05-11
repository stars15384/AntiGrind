import uuid
from datetime import datetime

from pydantic import BaseModel


class QACreate(BaseModel):
    company_id: uuid.UUID
    question: str


class QAAnswer(BaseModel):
    answer: str
    is_verified_employee: bool = False


class QAResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    question: str
    answer: str | None
    answered_at: datetime | None
    is_verified_employee: bool
    created_at: datetime

    class Config:
        from_attributes = True
