from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.ranking_service import RankingService

router = APIRouter(prefix="/rankings", tags=["rankings"])
ranking_service = RankingService()


@router.get("")
async def get_rankings(
    db: Annotated[AsyncSession, Depends(get_db)],
    industry: Optional[str] = Query(default=None, description="Filter by industry"),
    region: Optional[str] = Query(default=None, description="Filter by region"),
    sort_by: str = Query(default="agi_score", description="Sort field: agi_score, name, created_at"),
    sort_order: str = Query(default="asc", description="Sort order: asc, desc"),
    limit: int = Query(default=20, ge=1, le=100, description="Number of results"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination"),
):
    try:
        result = await ranking_service.get_rankings(
            db=db,
            industry=industry,
            region=region,
            sort_by=sort_by,
            sort_order=sort_order,
            limit=limit,
            offset=offset,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch rankings: {str(e)}")


@router.get("/top")
async def get_top_companies(
    db: Annotated[AsyncSession, Depends(get_db)],
    level: Optional[str] = Query(default=None, description="Filter by level: green, yellow, red"),
    limit: int = Query(default=10, ge=1, le=50, description="Number of results"),
):
    try:
        companies = await ranking_service.get_top_companies(
            db=db,
            limit=limit,
            level=level,
        )
        return {"companies": companies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top companies: {str(e)}")


@router.get("/industries")
async def get_industry_comparison(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        comparison = await ranking_service.get_industry_comparison(db=db)
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch industry comparison: {str(e)}")
