"""
AntiGrind Seed Data Generator
生成演示用的种子数据，包括用户、企业、工时记录和认证
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))
os.chdir(Path(__file__).parent.parent)

from app.database import async_session_maker  # noqa: E402
from app.models import (  # noqa: E402
    Certification,
    CertificationBadge,
    Company,
    User,
    WorkHourRecord,
)


async def create_seed_data():
    """创建所有种子数据"""

    print("[SEED] Starting seed data creation...")

    async with async_session_maker() as session:
        # ========== 1. 创建种子用户 ==========
        print("\n[USER] Creating seed users...")

        seed_users = [
            {
                "username": "admin",
                "email": "admin@antigrind.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.HZguGc8RDOOjO",  # noqa: E501 Admin123!
                "role": "admin",
                "user_type": "admin",
            },
            {
                "username": "demo_hr",
                "email": "hr@greencorp.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.HZguGc8RDOOjO",  # noqa: E501 Demo123!
                "role": "company",
                "user_type": "hr",
            },
            {
                "username": "employee_zhang",
                "email": "zhang@test.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.HZguGc8RDOOjO",  # noqa: E501 Test123!
                "role": "employee",
                "user_type": "consumer",
            },
            {
                "username": "employee_li",
                "email": "li@test.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.HZguGc8RDOOjO",  # noqa: E501 Test123!
                "role": "employee",
                "user_type": "consumer",
            },
            {
                "username": "employee_wang",
                "email": "wang@test.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.HZguGc8RDOOjO",  # noqa: E501 Test123!
                "role": "employee",
                "user_type": "consumer",
            },
        ]

        created_users = []
        for user_data in seed_users:
            user = User(**user_data)
            session.add(user)
            created_users.append(user)
            print(f"   [OK] Created user: {user_data['username']} ({user_data['role']})")

        await session.flush()

        # ========== 2. 创建种子企业 ==========
        print("\n[COMPANY] Creating seed companies...")

        seed_companies = [
            {
                "name": "GreenLife 绿色生活科技",
                "name_en": "GreenLife Technology",
                "industry": "tech",
                "agi_score": 18.5,
                "certification_status": "certified",
                "certification_level": "gold",
                "verification_status": "verified",
                "description": "专注于环保科技的新兴企业，倡导工作与生活平衡",
                "website": "https://greenlife.example.com",
            },
            {
                "name": "TechCorp 互联网科技",
                "name_en": "TechCorp Internet Technology",
                "industry": "tech",
                "agi_score": 28.3,
                "certification_status": "certified",
                "certification_level": "silver",
                "verification_status": "verified",
                "description": "领先的互联网解决方案提供商",
                "website": "https://techcorp.example.com",
            },
            {
                "name": "HappyWork 快乐办公",
                "name_en": "HappyWork Office Solutions",
                "industry": "service",
                "agi_score": 22.1,
                "certification_status": "certified",
                "certification_level": "silver",
                "verification_status": "verified",
                "description": "打造最佳职场体验的企业服务公司",
                "website": "https://happywork.example.com",
            },
            {
                "name": "FastDev 极速开发",
                "name_en": "FastDev Speed Development",
                "industry": "tech",
                "agi_score": 45.8,
                "certification_status": "none",
                "certification_level": None,
                "verification_status": "pending",
                "description": "敏捷开发团队，项目驱动型公司",
                "website": "https://fastdev.example.com",
            },
            {
                "name": "RetailMax 零售巨头",
                "name_en": "RetailMax Retail Giant",
                "industry": "retail",
                "agi_score": 52.4,
                "certification_status": "pending",
                "certification_level": None,
                "verification_status": "verified",
                "description": "全国连锁零售企业",
                "website": "https://retailmax.example.com",
            },
            {
                "name": "FinancePro 金融专家",
                "name_en": "FinancePro Financial Expert",
                "industry": "finance",
                "agi_score": 38.7,
                "certification_status": "none",
                "certification_level": None,
                "verification_status": "pending",
                "description": "专业金融服务机构",
                "website": "https://financepro.example.com",
            },
            {
                "name": "EduStar 教育之星",
                "name_en": "EduStar Education Star",
                "industry": "education",
                "agi_score": 25.9,
                "certification_status": "certified",
                "certification_level": "bronze",
                "verification_status": "verified",
                "description": "在线教育平台，关注教师福祉",
                "website": "https://edustar.example.com",
            },
            {
                "name": "HealthPlus 健康加",
                "name_en": "HealthPlus Healthcare",
                "industry": "healthcare",
                "agi_score": 32.1,
                "certification_status": "rejected",
                "certification_level": None,
                "verification_status": "verified",
                "description": "医疗健康服务提供商",
                "website": "https://healthplus.example.com",
            },
            {
                "name": "Manufacture 制造先锋",
                "name_en": "Manufacture Manufacturing Pioneer",
                "industry": "manufacturing",
                "agi_score": 58.3,
                "certification_status": "none",
                "certification_level": None,
                "verification_status": "pending",
                "description": "智能制造企业",
                "website": "https://manufacture.example.com",
            },
            {
                "name": "LogisticsHub 物流中心",
                "name_en": "LogisticsHub Logistics Center",
                "industry": "logistics",
                "agi_score": 65.7,
                "certification_status": "none",
                "certification_level": None,
                "verification_status": "unverified",
                "description": "现代物流解决方案",
                "website": "https://logisticshub.example.com",
            },
        ]

        created_companies = []
        for company_data in seed_companies:
            company = Company(**company_data)
            if company.certification_status == "certified":
                company.certification_expires_at = datetime.utcnow() + timedelta(days=365)

            session.add(company)
            created_companies.append(company)

            level_emoji = (
                "[GOLD]"
                if company_data.get("certification_level") == "gold"
                else "[SILVER]"
                if company_data.get("certification_level") == "silver"
                else "[BRONZE]"
                if company_data.get("certification_level") == "bronze"
                else "[NONE]"
            )

            print(
                f"   [OK] Created company: {company_data['name'][:20]} "
                f"(AGI: {company_data['agi_score']}) [{level_emoji}]"
            )

        await session.flush()

        # ========== 3. 创建工时记录 ==========
        print("\n[TIME] Creating work hour records...")

        work_hour_templates = [
            {
                "weekly_hours": 40,
                "weekend_policy": "double_rest",
                "overtime_compensation": "legal",
                "shift_policy": "no_shift",
            },
            {
                "weekly_hours": 42,
                "weekend_policy": "double_rest",
                "overtime_compensation": "legal",
                "shift_policy": "no_shift",
            },
            {
                "weekly_hours": 45,
                "weekend_policy": "big_small_week",
                "overtime_compensation": "legal",
                "shift_policy": "occasional",
            },
            {
                "weekly_hours": 48,
                "weekend_policy": "single_rest",
                "overtime_compensation": "fixed_subsidy",
                "shift_policy": "occasional",
            },
            {
                "weekly_hours": 55,
                "weekend_policy": "single_rest",
                "overtime_compensation": "unpaid",
                "shift_policy": "frequent",
            },
            {
                "weekly_hours": 60,
                "weekend_policy": "no_rest",
                "overtime_compensation": "unpaid",
                "shift_policy": "frequent",
            },
            {
                "weekly_hours": 50,
                "weekend_policy": "big_small_week",
                "overtime_compensation": "fixed_subsidy",
                "shift_policy": "no_shift",
            },
            {
                "weekly_hours": 44,
                "weekend_policy": "double_rest",
                "overtime_compensation": "legal",
                "shift_policy": "no_shift",
            },
        ]

        total_records = 0
        for idx, company in enumerate(created_companies):
            # 根据AGI分数选择合适的工时模板
            agi = float(company.agi_score or 0)

            if agi <= 30:
                # 绿色区域 - 使用较好的工时模板（前3个）
                templates_to_use = work_hour_templates[:4]
            elif agi <= 60:
                # 黄色区域 - 使用中等模板（中间4个）
                templates_to_use = work_hour_templates[2:6]
            else:
                # 红色区域 - 使用较差的模板（后4个）
                templates_to_use = work_hour_templates[4:]

            num_records = min(len(templates_to_use), 5)  # 每家公司5条记录

            for i in range(num_records):
                template = templates_to_use[i % len(templates_to_use)]

                record = WorkHourRecord(
                    company_id=company.id,
                    user_id=created_users[min(i + 2, len(created_users) - 1)].id,  # 分配给员工用户
                    weekly_hours=template["weekly_hours"],
                    weekend_policy=template["weekend_policy"],
                    overtime_compensation=template["overtime_compensation"],
                    shift_policy=template["shift_policy"],
                    vibe_score=max(1, min(10, int(10 - (template["weekly_hours"] - 40) / 3))),
                    status="verified",
                    verification_count=5,
                )
                session.add(record)
                total_records += 1

            print(f"   [OK] Company '{company.name[:15]}': {num_records} records created")

        await session.flush()
        print(f"\n   [STATS] Total work hour records: {total_records}")

        # ========== 4. 创建认证记录 ==========
        print("\n[CERT] Creating certification records...")

        certifications_created = 0

        for idx, company in enumerate(created_companies):
            if company.certification_status in ["certified", "pending", "under_review", "rejected"]:
                cert = Certification(
                    company_id=company.id,
                    submitted_by=created_users[1].id,  # demo_hr 提交
                    status=company.certification_status
                    if company.certification_status != "certified"
                    else "approved",
                    policy_document_url=f"https://example.com/policies/{company.id}.pdf",
                    evidence_urls='["https://example.com/evidence1.jpg", "https://example.com/evidence2.pdf"]',
                )

                if company.certification_status == "certified":
                    cert.status = "approved"
                    cert.reviewed_by = created_users[0].id  # admin审核
                    cert.approved_at = datetime.utcnow() - timedelta(days=30 * (idx + 1))
                    cert.expires_at = datetime.utcnow() + timedelta(days=365 - 30 * idx)
                    cert.review_notes = "符合反内卷标准，予以通过"

                elif company.certification_status == "rejected":
                    cert.status = "rejected"
                    cert.reviewed_by = created_users[0].id
                    cert.review_notes = "部分指标未达标，建议改进后重新申请"

                elif company.certification_status == "pending":
                    cert.status = "under_review"
                    cert.review_notes = None

                session.add(cert)
                await session.flush()  # Flush to get certification ID

                if company.certification_status == "certified" and cert.status == "approved":
                    # 创建徽章（现在cert有id了）
                    badge_code = (  # noqa: E501
                        f"AGI-{company.certification_level.upper()}-"
                        f"{datetime.utcnow().strftime('%Y%m%d')}-{idx + 1:03d}"
                    )
                    badge = CertificationBadge(
                        company_id=company.id,
                        certification_id=cert.id,
                        badge_code=badge_code,
                        is_active=True,
                    )
                    session.add(badge)
                certifications_created += 1

                status_icon = (
                    "[OK]"
                    if cert.status == "approved"
                    else "[PENDING]"
                    if cert.status in ["pending", "under_review"]
                    else "[ERROR]"
                )
                print(  # noqa: E501
                    f"   [OK] Certification for '{company.name[:15]}': "
                    f"{cert.status} [{status_icon}]"
                )

        await session.flush()
        print(f"\n   [CERT] Total certifications: {certifications_created}")

        # ========== 5. 提交所有数据 ==========
        print("\n[SAVE] Committing all changes to database...")
        await session.commit()

        print("\n" + "=" * 60)
        print("[OK] SEED DATA CREATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\n[STATS] Summary:")
        print(f"   [PEOPLE] Users created: {len(created_users)}")
        print(f"   [COMPANY] Companies created: {len(created_companies)}")
        print(f"   [TIME] Work hour records: {total_records}")
        print(f"   [CERT] Certifications: {certifications_created}")
        print("\n[KEY] Login Credentials:")
        print("   Admin:     admin / Admin123!")
        print("   HR:        demo_hr / Demo123!")
        print("   Employee:  employee_zhang / Test123!")
        print("              employee_li / Test123!")
        print("              employee_wang / Test123!")
        print("\n[WEB] Access URLs:")
        print("   Frontend: http://localhost:5173")
        print("   Backend API: http://localhost:8000/docs")
        print("   Rankings: http://localhost:5173/rankings")
        print("   Admin Panel: http://localhost:5173/admin")
        print("\n" + "=" * 60)


if __name__ == "__main__":
    try:
        asyncio.run(create_seed_data())
    except Exception as e:
        print(f"\n[ERROR] Error creating seed data: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
