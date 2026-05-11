import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.auth import get_current_user
from app.database import get_db
from app.models import Company, User, WorkHourRecord
from app.schemas import CompanyCreate, CompanyDetail, CompanyResponse, CompanySearchResult, CompanyUpdate

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=list[CompanyResponse])
async def list_companies(
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    verification_status: str | None = Query(None),
    sort_by: str = Query("agi_score", description="排序字段: agi_score, created_at, name, employee_count"),
    sort_order: str = Query("desc", description="排序方向: asc, desc"),
):
    query = select(Company).options(selectinload(Company.work_hour_records))

    if verification_status:
        query = query.where(Company.verification_status == verification_status)

    # 根据不同字段排序
    sort_field = getattr(Company, sort_by, None)

    if sort_by == "employee_count":
        # 按员工数量排序（需要子查询）
        from sqlalchemy import func
        subquery = (
            select(
                WorkHourRecord.company_id,
                func.count(func.distinct(WorkHourRecord.user_id)).label('emp_count')
            )
            .group_by(WorkHourRecord.company_id)
            .subquery()
        )
        query = query.outerjoin(subquery, Company.id == subquery.c.company_id)
        if sort_order == "desc":
            query = query.order_by(func.coalesce(subquery.c.emp_count, 0).desc())
        else:
            query = query.order_by(func.coalesce(subquery.c.emp_count, 0).asc())

    elif sort_by == "agi_score":
        if sort_order == "desc":
            query = query.order_by(Company.agi_score.desc().nulls_last())
        else:
            query = query.order_by(Company.agi_score.asc().nulls_last())

    elif sort_by == "created_at":
        if sort_order == "desc":
            query = query.order_by(Company.created_at.desc())
        else:
            query = query.order_by(Company.created_at.asc())

    elif sort_by == "name":
        if sort_order == "desc":
            query = query.order_by(Company.name.desc())
        else:
            query = query.order_by(Company.name.asc())

    elif sort_by == "verification_status":
        # 按认证状态排序 (verified > pending > none)
        from sqlalchemy import case as sql_case
        if sort_order == "desc":
            query = query.order_by(
                sql_case(
                    (Company.verification_status == 'verified', 3),
                    (Company.verification_status == 'pending', 2),
                    (Company.verification_status == 'none', 1),
                    else_=0,
                ).desc()
            )
        else:
            query = query.order_by(
                sql_case(
                    (Company.verification_status == 'verified', 3),
                    (Company.verification_status == 'pending', 2),
                    (Company.verification_status == 'none', 1),
                    else_=0,
                ).asc()
            )

    else:
        # 默认按 AGI 分数降序
        query = query.order_by(Company.agi_score.desc().nulls_last())

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/search", response_model=list[CompanySearchResult])
async def search_companies(
    db: Annotated[AsyncSession, Depends(get_db)],
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
):
    search_pattern = f"%{q}%"

    from sqlalchemy import or_, case

    query = (
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
                (Company.name.ilike(f"%{q}%"), 1),
                else_=2,
            ),
            Company.agi_score.desc().nulls_last(),
        )
        .limit(limit)
    )

    result = await db.execute(query)
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


@router.get("/{company_id}", response_model=CompanyDetail)
async def get_company(
    company_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    query = (
        select(Company)
        .options(
            selectinload(Company.work_hour_records),
            selectinload(Company.subsidiaries),
        )
        .where(Company.id == company_id)
    )
    result = await db.execute(query)
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.post("", response_model=CompanyResponse)
async def create_company(
    company_data: CompanyCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    company = Company(**company_data.model_dump())
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: str,
    company_data: CompanyUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    update_data = company_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    await db.commit()
    await db.refresh(company)
    return company

