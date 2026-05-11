from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import select, func, case, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Company, Certification, WorkHourRecord


class RankingService:
    def __init__(self):
        self.cache_timeout = timedelta(minutes=5)

    async def get_rankings(
        self,
        db: AsyncSession,
        industry: Optional[str] = None,
        region: Optional[str] = None,
        sort_by: str = "agi_score",
        sort_order: str = "asc",
        limit: int = 20,
        offset: int = 0,
    ) -> Dict[str, Any]:
        query = (
            select(Company)
            .options(
                selectinload(Company.certifications),
                selectinload(Company.badges),
            )
            .where(Company.certification_status == "certified")
            .where(Company.agi_score.isnot(None))
        )

        if industry:
            query = query.where(Company.industry == industry)

        count_query = (
            select(func.count(Company.id))
            .where(Company.certification_status == "certified")
            .where(Company.agi_score.isnot(None))
        )
        if industry:
            count_query = count_query.where(Company.industry == industry)

        total_count_result = await db.execute(count_query)
        total_count = total_count_result.scalar() or 0

        if sort_by == "agi_score":
            order_col = Company.agi_score
        elif sort_by == "name":
            order_col = Company.name
        elif sort_by == "created_at":
            order_col = Company.created_at
        else:
            order_col = Company.agi_score

        if sort_order == "desc":
            query = query.order_by(desc(order_col))
        else:
            query = query.order_by(order_col.asc())

        query = query.offset(offset).limit(limit)

        result = await db.execute(query)
        companies = result.scalars().all()

        rankings = []
        for idx, company in enumerate(companies, start=offset + 1):
            level = self._get_agi_level(float(company.agi_score) if company.agi_score else 0)

            rankings.append({
                "rank": idx,
                "company_id": company.id,
                "name": company.name,
                "agi_score": float(company.agi_score) if company.agi_score else 0,
                "level": level,
                "industry": company.industry or "Unknown",
                "region": region or "Unknown",
                "employee_count": 0,
                "certification_level": company.certification_level or "bronze",
                "trend": "stable",
                "certification_expires_at": company.certification_expires_at.isoformat() if company.certification_expires_at else None,
            })

        industries_result = await db.execute(
            select(Company.industry, func.count(Company.id))
            .where(Company.certification_status == "certified")
            .group_by(Company.industry)
            .order_by(desc(func.count(Company.id)))
            .limit(10)
        )
        industries = [
            {"name": row[0] or "Other", "count": row[1]}
            for row in industries_result.all()
        ]

        green_count = sum(1 for r in rankings if r["level"] == "green")
        yellow_count = sum(1 for r in rankings if r["level"] == "yellow")
        red_count = sum(1 for r in rankings if r["level"] == "red")

        all_agi_scores = [r["agi_score"] for r in rankings]
        avg_agi = sum(all_agi_scores) / len(all_agi_scores) if all_agi_scores else 0

        return {
            "rankings": rankings,
            "filters": {
                "industries": industries,
                "current_industry": industry,
                "current_region": region,
            },
            "pagination": {
                "total_count": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": (offset + limit) < total_count,
            },
            "statistics": {
                "avg_agi_score": round(avg_agi, 2),
                "green_companies": green_count,
                "yellow_companies": yellow_count,
                "red_companies": red_count,
                "total_certified": total_count,
            },
        }

    def _get_agi_level(self, score: float) -> str:
        if score <= 30:
            return "green"
        elif score <= 60:
            return "yellow"
        else:
            return "red"

    async def get_top_companies(
        self,
        db: AsyncSession,
        limit: int = 10,
        level: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = (
            select(Company)
            .where(Company.certification_status == "certified")
            .where(Company.agi_score.isnot(None))
            .order_by(Company.agi_score.asc())
            .limit(limit)
        )

        if level == "green":
            query = query.where(Company.agi_score <= 30)
        elif level == "yellow":
            query = query.where(
                (Company.agi_score > 30) & (Company.agi_score <= 60)
            )
        elif level == "red":
            query = query.where(Company.agi_score > 60)

        result = await db.execute(query)
        companies = result.scalars().all()

        return [
            {
                "rank": idx + 1,
                "company_id": c.id,
                "name": c.name,
                "agi_score": float(c.agi_score) if c.agi_score else 0,
                "level": self._get_agi_level(float(c.agi_score) if c.agi_score else 0),
                "industry": c.industry,
                "certification_level": c.certification_level,
            }
            for idx, c in enumerate(companies)
        ]

    async def get_industry_comparison(
        self,
        db: AsyncSession,
    ) -> Dict[str, Any]:
        industry_stats = await db.execute(
            select(
                Company.industry,
                func.count(Company.id).label("count"),
                func.avg(Company.agi_score).label("avg_agi"),
                func.min(Company.agi_score).label("min_agi"),
                func.max(Company.agi_score).label("max_agi"),
            )
            .where(Company.certification_status == "certified")
            .where(Company.agi_score.isnot(None))
            .group_by(Company.industry)
            .order_by(func.avg(Company.agi_score).asc())
        )

        comparison_data = []
        for row in industry_stats.all():
            avg_score = float(row.avg_agi) if row.avg_agi else 0
            comparison_data.append({
                "industry": row.industry or "Other",
                "company_count": row.count,
                "avg_agi_score": round(avg_score, 2),
                "best_score": float(row.min_agi) if row.min_agi else 0,
                "worst_score": float(row.max_agi) if row.max_agi else 0,
                "level": self._get_agi_level(avg_score),
            })

        return {
            "industries": comparison_data,
            "total_industries": len(comparison_data),
            "generated_at": datetime.utcnow().isoformat(),
        }
