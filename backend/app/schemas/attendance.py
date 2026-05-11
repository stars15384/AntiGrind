import uuid
from datetime import datetime

from pydantic import BaseModel


class AttendanceScreenshotResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    company_id: uuid.UUID
    source: str  # dingtalk, feishu, other
    file_path: str
    file_type: str
    status: str  # pending, verified, rejected
    verified_at: datetime | None
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyAttendanceStats(BaseModel):
    company_id: uuid.UUID
    total_screenshots: int
    verified_count: int
    total_employees: int
