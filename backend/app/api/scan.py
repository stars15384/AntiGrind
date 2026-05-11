import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Company, Product
from app.schemas import ScanResult, CompanyBrief, ProductResponse

router = APIRouter(prefix="/scan", tags=["scan"])


@router.get("/barcode/{barcode}", response_model=ScanResult)
async def scan_barcode(
    barcode: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    query = (
        select(Product)
        .options(
            selectinload(Product.brand_owner),
            selectinload(Product.manufacturer),
        )
        .where(Product.barcode == barcode)
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        return ScanResult(
            product=None,
            brand_owner=None,
            manufacturer=None,
            is_oem=False,
            agi_score=None,
            recommendation="unknown",
        )

    brand_owner = None
    manufacturer = None
    is_oem = False

    if product.brand_owner:
        brand_owner = CompanyBrief(
            id=product.brand_owner.id,
            name=product.brand_owner.name,
            agi_score=float(product.brand_owner.agi_score) if product.brand_owner.agi_score else None,
            verification_status=product.brand_owner.verification_status,
        )

    if product.manufacturer:
        manufacturer = CompanyBrief(
            id=product.manufacturer.id,
            name=product.manufacturer.name,
            agi_score=float(product.manufacturer.agi_score) if product.manufacturer.agi_score else None,
            verification_status=product.manufacturer.verification_status,
        )

    if product.brand_owner_id and product.manufacturer_id and product.brand_owner_id != product.manufacturer_id:
        is_oem = True

    agi_score = None
    recommendation = "unknown"

    if brand_owner and manufacturer:
        if brand_owner.agi_score is not None and manufacturer.agi_score is not None:
            agi_score = max(brand_owner.agi_score, manufacturer.agi_score)
        elif brand_owner.agi_score is not None:
            agi_score = brand_owner.agi_score
        elif manufacturer.agi_score is not None:
            agi_score = manufacturer.agi_score
    elif brand_owner and brand_owner.agi_score is not None:
        agi_score = brand_owner.agi_score
    elif manufacturer and manufacturer.agi_score is not None:
        agi_score = manufacturer.agi_score

    if agi_score is not None:
        if agi_score <= 30:
            recommendation = "green"
        elif agi_score <= 60:
            recommendation = "yellow"
        else:
            recommendation = "red"

    return ScanResult(
        product=ProductResponse.model_validate(product),
        brand_owner=brand_owner,
        manufacturer=manufacturer,
        is_oem=is_oem,
        agi_score=agi_score,
        recommendation=recommendation,
    )

