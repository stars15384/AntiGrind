from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.exceptions import NotFoundError
from app.models import Company, WorkHourRecord
from app.schemas import CompanyCreate, CompanySearchResult, CompanyUpdate


class CompanyService:
    """企业信息管理服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_company(self, company_id: str) -> Company:
        """获取企业详情（含关联数据预加载）"""
        result = await self.db.execute(
            select(Company)
            .options(
                selectinload(Company.work_hour_records),
                selectinload(Company.subsidiaries),
                selectinload(Company.certifications),
                selectinload(Company.badges),
            )
            .where(Company.id == company_id)
        )
        company = result.scalar_one_or_none()
        if not company:
            raise NotFoundError("Company", company_id)
        return company

    async def create_company(self, data: CompanyCreate, creator_id: str) -> Company:
        """
        创建新企业

        业务规则：
        1. 验证必填字段
        2. 设置默认值
        3. 关联创建者（如果适用）
        """
        company_data = data.model_dump()

        company = Company(**company_data)
        self.db.add(company)

        await self.db.commit()
        await self.db.refresh(company)

        return company

    async def update_company(
        self,
        company_id: str,
        data: CompanyUpdate,
    ) -> Company:
        """
        更新企业信息

        支持部分更新，只更新提供的字段
        """
        company = await self.get_company(company_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(company, field, value)

        await self.db.commit()
        await self.db.refresh(company)

        return company

    async def list_companies(
        self,
        skip: int = 0,
        limit: int = 20,
        verification_status: Optional[str] = None,
        sort_by: str = "agi_score",
        sort_order: str = "desc",
    ) -> tuple[List[Company], int]:
        """
        获取企业列表（支持分页、筛选、排序）

        返回: (企业列表, 总数)
        """
        query = select(Company).options(selectinload(Company.work_hour_records))

        count_query = select(func.count()).select_from(Company)

        if verification_status:
            query = query.where(Company.verification_status == verification_status)
            count_query = count_query.where(Company.verification_status == verification_status)

        # 排序处理
        sort_field = getattr(Company, sort_by, None)
        if sort_field is not None:
            order_func = getattr(sort_field, sort_order.lower(), None)
            if callable(order_func):
                query = query.order_by(order_func())
        else:
            query = query.order_by(Company.agi_score.desc().nulls_last())

        # 获取总数
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页查询
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        companies = result.scalars().all()

        return list(companies), total

    async def search_companies(
        self,
        query_string: str,
        limit: int = 10,
    ) -> List[CompanySearchResult]:
        """
        搜索企业

        搜索范围：名称、描述、网站
        排序：名称匹配优先级 > AGI分数
        """
        search_pattern = f"%{query_string}%"

        from sqlalchemy import case, or_

        sql_query = (
            select(Company)
            .where(
                or_(
                    Company.name.ilike(search_pattern),
                    Company.description.ilike(search_pattern),
                    Company.website.ilike(search_pattern),
                )
            )
            .order_by(
                case(
                    (Company.name.ilike(f"%{query_string}%"), 1),
                    else_=2,
                ),
                Company.agi_score.desc().nulls_last(),
            )
            .limit(limit)
        )

        result = await self.db.execute(sql_query)
        companies = result.scalars().all()

        return [
            CompanySearchResult(
                id=c.id,
                name=c.name,
                agi_score=float(c.agi_score) if c.agi_score else None,
                verification_status=c.verification_status,
            )
            for c in companies
        ]

    async def get_company_statistics(self, company_id: str) -> dict:
        """获取企业统计数据"""
        company = await self.get_company(company_id)

        # 工时记录统计
        work_hours_result = await self.db.execute(
            select(func.count(WorkHourRecord.id)).where(WorkHourRecord.company_id == company_id)
        )
        total_records = work_hours_result.scalar() or 0

        # 已验证员工数
        verified_employees_result = await self.db.execute(
            select(func.count(func.distinct(WorkHourRecord.user_id))).where(
                WorkHourRecord.company_id == company_id,
                WorkHourRecord.status == "verified",
            )
        )
        verified_employees = verified_employees_result.scalar() or 0

        # 平均工时
        avg_hours_result = await self.db.execute(
            select(func.avg(WorkHourRecord.weekly_hours)).where(
                WorkHourRecord.company_id == company_id,
                WorkHourRecord.status == "verified",
            )
        )
        avg_weekly_hours = avg_hours_result.scalar()

        return {
            "company_id": company_id,
            "total_work_records": total_records,
            "verified_employees": verified_employees,
            "avg_weekly_hours": round(avg_weekly_hours, 1) if avg_weekly_hours else None,
            "agi_score": float(company.agi_score) if company.agi_score else None,
            "certification_status": company.certification_status,
            "certification_level": company.certification_level,
        }

    async def delete_company(self, company_id: str) -> bool:
        """删除企业（软删除或硬删除）"""
        company = await self.get_company(company_id)

        await self.db.delete(company)
        await self.db.commit()

        return True

    async def verify_company(self, company_id: str) -> Company:
        """验证企业（通过审核）"""
        company = await self.get_company(company_id)
        company.verification_status = "verified"

        await self.db.commit()
        await self.db.refresh(company)

        return company
