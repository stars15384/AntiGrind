"""
Database Init Script - Populate Test Data
Run: python -m app.init_db
"""

import asyncio
import uuid
from datetime import datetime, timedelta

import bcrypt

from app.database import Base, engine
from app.models.models import (
    Certification,
    CertificationBadge,
    Company,
    Product,
    User,
    WorkHourRecord,
)


def hash_password(password: str) -> str:
    """Safe password hashing for bcrypt"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


async def init_db():
    """Create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Database tables created")


async def seed_data():
    """Populate test data"""
    async with engine.begin() as conn:
        # ==================== 1. Create Companies ====================
        companies_data = [
            {
                "id": str(uuid.uuid4()),
                "name": "腾讯科技",
                "name_en": "Tencent Technology",
                "industry": "I",  # 信息传输、软件和信息技术服务业
                "agi_score": 92.5,
                "verification_status": "verified",
                "description": "Leading internet technology company in China",
                "website": "https://www.tencent.com",
                "certification_status": "active",
                "created_at": datetime(2025, 1, 15),
            },
            {
                "id": str(uuid.uuid4()),
                "name": "阿里巴巴集团",
                "name_en": "Alibaba Group",
                "industry": "I",  # 信息传输、软件和信息技术服务业
                "agi_score": 88.3,
                "verification_status": "verified",
                "description": "Global leader in e-commerce and cloud computing",
                "website": "https://www.alibaba.com",
                "certification_status": "active",
                "created_at": datetime(2025, 2, 20),
            },
            {
                "id": str(uuid.uuid4()),
                "name": "字节跳动",
                "name_en": "ByteDance",
                "industry": "I",  # 信息传输、软件和信息技术服务业
                "agi_score": 85.7,
                "verification_status": "verified",
                "description": "Creator of Douyin and Toutiao",
                "website": "https://www.bytedance.com",
                "certification_status": "pending",
                "created_at": datetime(2025, 3, 10),
            },
            {
                "id": str(uuid.uuid4()),
                "name": "华为技术",
                "name_en": "Huawei Technologies",
                "industry": "C",  # 制造业 (ICT设备制造)
                "agi_score": 90.2,
                "verification_status": "verified",
                "description": "Leading ICT infrastructure provider",
                "website": "https://www.huawei.com",
                "certification_status": "active",
                "created_at": datetime(2024, 12, 1),
            },
            {
                "id": str(uuid.uuid4()),
                "name": "美团",
                "name_en": "Meituan",
                "industry": "I",  # 信息传输、软件和信息技术服务业 (互联网平台)
                "agi_score": 78.5,
                "verification_status": "pending",
                "description": "China's leading life service e-commerce platform",
                "website": "https://www.meituan.com",
                "certification_status": "none",
                "created_at": datetime(2025, 4, 5),
            },
            {
                "id": str(uuid.uuid4()),
                "name": "京东集团",
                "name_en": "JD.com",
                "industry": "F",  # 批发和零售业
                "agi_score": 82.1,
                "verification_status": "verified",
                "description": "Technology and service enterprise based on supply chain",
                "website": "https://www.jd.com",
                "certification_status": "active",
                "created_at": datetime(2025, 1, 28),
            },
            {
                "id": str(uuid.uuid4()),
                "name": "网易",
                "name_en": "NetEase",
                "industry": "I",  # 信息传输、软件和信息技术服务业
                "agi_score": 86.8,
                "verification_status": "verified",
                "description": "Leading Chinese internet technology company",
                "website": "https://www.163.com",
                "certification_status": "active",
                "created_at": datetime(2025, 2, 14),
            },
            {
                "id": str(uuid.uuid4()),
                "name": "小米科技",
                "name_en": "Xiaomi Tech",
                "industry": "C",  # 制造业 (智能硬件制造)
                "agi_score": 84.3,
                "verification_status": "pending",
                "description": "Internet company focused on smartphones and IoT",
                "website": "https://www.mi.com",
                "certification_status": "none",
                "created_at": datetime(2025, 3, 22),
            },
        ]

        # Insert companies
        company_ids = []
        for comp in companies_data:
            await conn.execute(Company.__table__.insert().values(**comp))
            company_ids.append(comp["id"])

        print(f"[OK] Created {len(companies_data)} companies")

        # ==================== 2. Create Users ====================
        users_data = []

        # Create employee users for each company
        employee_names = [
            ("zhang_wei", "tencent"),
            ("li_na", "tencent"),
            ("wang_fang", "alibaba"),
            ("zhao_qiang", "alibaba"),
            ("chen_jie", "bytedance"),
            ("liu_yang", "huawei"),
            ("yang_ming", "meituan"),
            ("zhou_xin", "jd"),
            ("wu_hao", "netease"),
            ("sun_lei", "xiaomi"),
        ]

        for i, (username, domain) in enumerate(employee_names):
            company_idx = i % len(company_ids)
            users_data.append(
                {
                    "id": str(uuid.uuid4()),
                    "username": username,
                    "email": f"{username}@{domain}.com",
                    "password_hash": hash_password("password123"),
                    "role": "employee",
                    "company_id": company_ids[company_idx],
                    "is_active": True,
                    "is_verified": True,
                    "created_at": datetime(2025, 1, 1) + timedelta(days=i * 5),
                }
            )

        # Add admin users
        admin_users = [
            {
                "id": str(uuid.uuid4()),
                "username": "admin_tencent",
                "email": "admin@tencent.com",
                "password_hash": hash_password("admin123"),
                "role": "company",
                "company_id": company_ids[0],
                "is_active": True,
                "is_verified": True,
                "created_at": datetime(2025, 1, 10),
            },
            {
                "id": str(uuid.uuid4()),
                "username": "admin_alibaba",
                "email": "admin@alibaba.com",
                "password_hash": hash_password("admin123"),
                "role": "company",
                "company_id": company_ids[1],
                "is_active": True,
                "is_verified": True,
                "created_at": datetime(2025, 2, 15),
            },
        ]

        users_data.extend(admin_users)

        for user in users_data:
            await conn.execute(User.__table__.insert().values(**user))

        print(f"[OK] Created {len(users_data)} users")

        # ==================== 3. Create Work Hour Records ====================
        work_hour_records = []

        for i in range(len(company_ids)):
            company_id = company_ids[i]

            # Create several records per company
            num_records = 2 + (i % 3)
            for j in range(num_records):
                work_hour_records.append(
                    {
                        "id": str(uuid.uuid4()),
                        "company_id": company_id,
                        "user_id": users_data[min(i + j, len(users_data) - 1)]["id"],
                        "weekly_hours": 38 + (i * 2),
                        "weekend_policy": ["double_rest", "big_small_week"][j % 2],
                        "overtime_compensation": ["legal", "fixed_subsidy"][j % 2],
                        "shift_policy": ["no_shift", "occasional"][j % 2],
                        "vibe_score": 70 + (i * 3),
                        "verification_count": 3 + (j * 2),
                        "status": "verified" if j < num_records - 1 else "pending",
                        "source": "dingtalk",
                        "notes": f"Record {j + 1} submission",
                        "created_at": datetime.now() - timedelta(days=j * 7),
                    }
                )

        for record in work_hour_records:
            await conn.execute(WorkHourRecord.__table__.insert().values(**record))

        print(f"[OK] Created {len(work_hour_records)} work hour records")

        # ==================== 4. Create Products ====================
        products_data = [
            {
                "id": str(uuid.uuid4()),
                "barcode": "6901236370843",
                "name": "WeChat Reader E-Book",
                "brand_owner_id": company_ids[0],
                "manufacturer_id": company_ids[0],
                "category": "Electronics",
                "image_url": "/images/products/wechat_reader.png",
                "created_at": datetime(2025, 5, 1),
            },
            {
                "id": str(uuid.uuid4()),
                "barcode": "6921168509289",
                "name": "Tmall Genie Smart Speaker",
                "brand_owner_id": company_ids[1],
                "manufacturer_id": company_ids[1],
                "category": "Smart Home",
                "image_url": "/images/products/tmall_genie.png",
                "created_at": datetime(2025, 5, 10),
            },
            {
                "id": str(uuid.uuid4()),
                "barcode": "6975053880086",
                "name": "Douyin Volcano Engine T-Shirt",
                "brand_owner_id": company_ids[2],
                "manufacturer_id": company_ids[5],
                "category": "Clothing",
                "image_url": "/images/products/douyin_tshirt.png",
                "created_at": datetime(2025, 5, 15),
            },
        ]

        for product in products_data:
            await conn.execute(Product.__table__.insert().values(**product))

        print(f"[OK] Created {len(products_data)} products")

        # ==================== 5. Create Certifications ====================
        certifications_data = [
            {
                "id": str(uuid.uuid4()),
                "company_id": company_ids[0],
                "status": "approved",
                "submitted_by": admin_users[0]["id"],
                "reviewed_by": admin_users[1]["id"],
                "review_notes": "Meets anti-involvement standards",
                "approved_at": datetime(2025, 6, 1),
                "expires_at": datetime(2026, 6, 1),
                "created_at": datetime(2025, 5, 20),
            },
            {
                "id": str(uuid.uuid4()),
                "company_id": company_ids[1],
                "status": "approved",
                "submitted_by": admin_users[1]["id"],
                "reviewed_by": admin_users[0]["id"],
                "review_notes": "Approved, monitor overtime",
                "approved_at": datetime(2025, 6, 5),
                "expires_at": datetime(2026, 6, 5),
                "created_at": datetime(2025, 5, 25),
            },
        ]

        for cert in certifications_data:
            await conn.execute(Certification.__table__.insert().values(**cert))

        # Create badges
        badges_data = [
            {
                "id": str(uuid.uuid4()),
                "company_id": company_ids[0],
                "certification_id": certifications_data[0]["id"],
                "badge_code": "AIC-2025-001",
                "badge_url": "/badges/antigrind_gold.png",
                "is_active": True,
                "created_at": datetime(2025, 6, 1),
            },
            {
                "id": str(uuid.uuid4()),
                "company_id": company_ids[1],
                "certification_id": certifications_data[1]["id"],
                "badge_code": "AIC-2025-002",
                "badge_url": "/badges/antigrind_silver.png",
                "is_active": True,
                "created_at": datetime(2025, 6, 5),
            },
        ]

        for badge in badges_data:
            await conn.execute(CertificationBadge.__table__.insert().values(**badge))

        print(f"[OK] Created {len(certifications_data)} certifications")
        print(f"[OK] Created {len(badges_data)} certification badges")

    print("\n" + "=" * 60)
    print("[SUCCESS] Test data populated!")
    print("=" * 60)
    print("\n[STATS] Data Summary:")
    print(f"  - Companies: {len(companies_data)}")
    print(f"  - Users: {len(users_data)}")
    print(f"  - Work Hour Records: {len(work_hour_records)}")
    print(f"  - Products: {len(products_data)}")
    print(f"  - Certifications: {len(certifications_data)}")

    print("\n[ACCOUNTS] Test Accounts:")
    print("  Employee accounts:")
    for user in users_data[:5]:
        role = "[Employee]" if user["role"] == "employee" else "[Admin]"
        print(f"    * {user['username']} / password123 ({role})")

    print("\n  Admin accounts:")
    for admin in admin_users:
        print(f"    * {admin['username']} / admin123 ([Company Admin])")

    print("\n[URLS] Access URLs:")
    print("  - Backend API: http://localhost:8000")
    print("  - API Docs: http://localhost:8000/docs")
    print("  - Frontend: http://localhost:5174")


async def main():
    print("=" * 60)
    print("AntiGrind Database Init Script")
    print("=" * 60)

    await init_db()
    await seed_data()


if __name__ == "__main__":
    asyncio.run(main())
