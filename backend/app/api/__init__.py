from app.api.auth import router as auth_router
from app.api.companies import router as companies_router
from app.api.evidences import router as evidences_router
from app.api.scan import router as scan_router
from app.api.work_hours import router as work_hours_router
from app.api.certifications import router as certifications_router
from app.api.attendance import router as attendance_router
from app.api.qa import router as qa_router
from app.api.rankings import router as rankings_router
from app.api.admin import router as admin_router

__all__ = [
    "auth_router",
    "companies_router",
    "scan_router",
    "work_hours_router",
    "evidences_router",
    "certifications_router",
    "attendance_router",
    "qa_router",
    "rankings_router",
    "admin_router",
]

