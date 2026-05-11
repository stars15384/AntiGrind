import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    karma_score: Mapped[int] = mapped_column(Integer, default=0)
    user_type: Mapped[str] = mapped_column(String(20), default="consumer")
    role: Mapped[str] = mapped_column(String(20), default="employee")  # employee | company
    company_id: Mapped[str | None] = mapped_column(String(36), nullable=True)  # 所属公司ID
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    work_hour_records = relationship("WorkHourRecord", back_populates="user")
    evidences = relationship("Evidence", back_populates="user")
    certifications_submitted = relationship(
        "Certification", foreign_keys="Certification.submitted_by", back_populates="submitter"
    )
    certifications_reviewed = relationship(
        "Certification", foreign_keys="Certification.reviewed_by", back_populates="reviewer"
    )
    attendance_screenshots = relationship(
        "AttendanceScreenshot", foreign_keys="AttendanceScreenshot.user_id", back_populates="user"
    )
    verified_screenshots = relationship(
        "AttendanceScreenshot",
        foreign_keys="AttendanceScreenshot.verified_by",
        back_populates="verifier",
    )


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    name_en: Mapped[str | None] = mapped_column(String(200), nullable=True)
    industry: Mapped[str | None] = mapped_column(
        String(50), nullable=True, index=True
    )  # 行业分类 (GB/T 4754-2017)
    gs1_prefix: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    parent_company_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("companies.id"), nullable=True
    )
    agi_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    verification_status: Mapped[str] = mapped_column(String(20), default="pending")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)

    certification_status: Mapped[str] = mapped_column(String(20), default="none")
    certification_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    certification_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    certification_badge_id: Mapped[str | None] = mapped_column(String(50), nullable=True)

    subscription_tier: Mapped[str] = mapped_column(String(20), default="free")
    contact_email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    parent = relationship("Company", remote_side=[id], backref="subsidiaries")
    work_hour_records = relationship("WorkHourRecord", back_populates="company")
    evidences = relationship("Evidence", back_populates="company")
    products_as_brand = relationship(
        "Product", foreign_keys="Product.brand_owner_id", back_populates="brand_owner"
    )
    products_as_manufacturer = relationship(
        "Product", foreign_keys="Product.manufacturer_id", back_populates="manufacturer"
    )
    certifications = relationship("Certification", back_populates="company")
    badges = relationship("CertificationBadge", back_populates="company")
    attendance_screenshots = relationship("AttendanceScreenshot", back_populates="company")
    qa = relationship("AnonymousQA", back_populates="company")


class Certification(Base):
    __tablename__ = "certifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    submitted_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    reviewed_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )

    policy_document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    evidence_urls: Mapped[list[str] | None] = mapped_column(Text, nullable=True)

    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    company = relationship("Company", back_populates="certifications")
    submitter = relationship(
        "User", foreign_keys=[submitted_by], back_populates="certifications_submitted"
    )
    reviewer = relationship(
        "User", foreign_keys=[reviewed_by], back_populates="certifications_reviewed"
    )
    badges = relationship("CertificationBadge", back_populates="certification")


class CertificationBadge(Base):
    __tablename__ = "certification_badges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False)
    certification_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("certifications.id"), nullable=False
    )
    badge_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    badge_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="badges")
    certification = relationship("Certification", back_populates="badges")


class AttendanceScreenshot(Base):
    __tablename__ = "attendance_screenshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False)
    source: Mapped[str] = mapped_column(String(20), nullable=False)  # dingtalk, feishu, other
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # pending, verified, rejected
    verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    verified_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship(
        "User", back_populates="attendance_screenshots", foreign_keys="AttendanceScreenshot.user_id"
    )
    verifier = relationship(
        "User",
        back_populates="verified_screenshots",
        foreign_keys="AttendanceScreenshot.verified_by",
    )
    company = relationship("Company", back_populates="attendance_screenshots")


class AnonymousQA(Base):
    __tablename__ = "anonymous_qa"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    answered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_verified_employee: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="qa")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    barcode: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    brand_owner_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("companies.id"), nullable=True
    )
    manufacturer_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("companies.id"), nullable=True
    )
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    brand_owner = relationship(
        "Company", foreign_keys=[brand_owner_id], back_populates="products_as_brand"
    )
    manufacturer = relationship(
        "Company", foreign_keys=[manufacturer_id], back_populates="products_as_manufacturer"
    )


class WorkHourRecord(Base):
    __tablename__ = "work_hour_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    weekly_hours: Mapped[int] = mapped_column(Integer, nullable=False)
    weekend_policy: Mapped[str] = mapped_column(String(20), nullable=False)
    overtime_compensation: Mapped[str] = mapped_column(String(50), nullable=False)
    shift_policy: Mapped[str] = mapped_column(String(50), nullable=False)
    vibe_score: Mapped[int] = mapped_column(Integer, default=0)
    source: Mapped[str] = mapped_column(String(20), default="user_reported")
    verification_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="work_hour_records")
    user = relationship("User", back_populates="work_hour_records")


class Evidence(Base):
    __tablename__ = "evidences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False)
    work_hour_record_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("work_hour_records.id"), nullable=True
    )
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="evidences")
    company = relationship("Company", back_populates="evidences")
