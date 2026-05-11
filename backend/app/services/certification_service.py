import hashlib
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.exceptions import BusinessLogicError, ConflictError, NotFoundError
from app.models import Certification, CertificationBadge, Company
from app.schemas import CertificationCreate, CertificationReview


class CertificationService:
    """企业认证业务逻辑服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_company(self, company_id: str) -> Company:
        """获取企业信息（含认证预加载）"""
        result = await self.db.execute(
            select(Company)
            .where(Company.id == company_id)
            .options(selectinload(Company.certifications))
        )
        company = result.scalar_one_or_none()
        if not company:
            raise NotFoundError("Company", company_id)
        return company

    async def check_duplicate_application(self, company_id: str) -> None:
        """检查是否已有进行中的申请"""
        result = await self.db.execute(
            select(Certification)
            .where(Certification.company_id == company_id)
            .where(Certification.status.in_(["pending", "under_review", "approved"]))
        )
        if result.scalar_one_or_none():
            raise ConflictError("Certification", "该企业已存在进行中的认证申请")

    async def apply_certification(
        self,
        company_id: str,
        user_id: str,
        data: CertificationCreate,
    ) -> Certification:
        """
        申请企业认证

        业务规则：
        1. 企业必须存在
        2. 不能有重复的进行中申请
        3. 创建pending状态的申请
        4. 更新企业状态为pending
        """
        company = await self.get_company(company_id)
        await self.check_duplicate_application(company_id)

        certification = Certification(
            company_id=company_id,
            submitted_by=user_id,
            policy_document_url=data.policy_document_url,
            evidence_urls=data.evidence_urls,
        )

        self.db.add(certification)
        company.certification_status = "pending"

        await self.db.commit()
        await self.db.refresh(certification)

        return certification

    async def get_certification(self, certification_id: str) -> Certification:
        """获取认证详情（含关联数据）"""
        result = await self.db.execute(
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
            raise NotFoundError("Certification", certification_id)
        return certification

    async def _validate_reviewable(self, certification: Certification) -> None:
        """验证认证是否可以审核"""
        if certification.status not in ["pending", "under_review"]:
            raise BusinessLogicError(
                f"当前状态 {certification.status} 不允许审核",
                error_code="INVALID_STATUS_TRANSITION",
            )

    async def review_certification(
        self,
        certification_id: str,
        reviewer_id: str,
        data: CertificationReview,
    ) -> Certification:
        """
        审核认证申请

        状态机：
        pending/under_review → approved (通过)
        pending/under_review → rejected (拒绝)

        通过时副作用：
        1. 更新企业状态为certified
        2. 设置认证等级和有效期
        3. 生成认证徽章
        """
        certification = await self.get_certification(certification_id)
        await self._validate_reviewable(certification)

        certification.reviewed_by = reviewer_id
        certification.review_notes = data.review_notes

        if data.approved:
            await self._approve_certification(certification, data)
        else:
            await self._reject_certification(certification)

        await self.db.commit()
        await self.db.refresh(certification)

        return certification

    async def _approve_certification(
        self,
        certification: Certification,
        data: CertificationReview,
    ) -> None:
        """处理认证通过逻辑"""
        certification.status = "approved"
        certification.approved_at = datetime.utcnow()
        certification.expires_at = datetime.utcnow() + timedelta(days=365)

        company = certification.company
        if company:
            company.certification_status = "certified"
            company.certification_level = data.certification_level or "bronze"
            company.certification_expires_at = certification.expires_at

        badge_code = self._generate_badge_code(certification.company_id, certification.id)

        badge = CertificationBadge(
            company_id=certification.company_id,
            certification_id=certification.id,
            badge_code=badge_code,
        )
        self.db.add(badge)

        if company:
            company.certification_badge_id = badge_code

    async def _reject_certification(self, certification: Certification) -> None:
        """处理认证拒绝逻辑"""
        certification.status = "rejected"

        company = certification.company
        if company:
            company.certification_status = "rejected"

    @staticmethod
    def _generate_badge_code(company_id: str, certification_id: str) -> str:
        """生成唯一徽章编码"""
        data = f"{company_id}:{certification_id}:{datetime.utcnow().timestamp()}"
        return hashlib.sha256(data.encode()).hexdigest()[:16].upper()

    async def get_company_latest_certification(self, company_id: str) -> Optional[Certification]:
        """获取企业最新的认证记录"""
        result = await self.db.execute(
            select(Certification)
            .options(selectinload(Certification.badges))
            .where(Certification.company_id == company_id)
            .order_by(Certification.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_badge_by_code(self, badge_code: str) -> CertificationBadge:
        """根据徽章编码获取徽章信息"""
        result = await self.db.execute(
            select(CertificationBadge).where(CertificationBadge.badge_code == badge_code)
        )
        badge = result.scalar_one_or_none()
        if not badge:
            raise NotFoundError("Badge", badge_code)
        return badge

    async def get_badge_for_certification(self, certification_id: str) -> CertificationBadge:
        """获取指定认证的徽章"""
        result = await self.db.execute(
            select(CertificationBadge).where(
                CertificationBadge.certification_id == certification_id
            )
        )
        badge = result.scalar_one_or_none()
        if not badge:
            raise NotFoundError("Badge", f"for certification {certification_id}")
        return badge
