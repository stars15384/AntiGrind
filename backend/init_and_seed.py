import asyncio, sys, os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
os.chdir(Path(__file__).parent)

from app.database import engine, Base
from app.models import User, Company, WorkHourRecord, Certification, CertificationBadge
from sqlalchemy import text


async def init_and_seed():
    db_path = Path("./antigrind.db").resolve()
    print(f"DB absolute path: {db_path}")
    print(f"DB exists before: {db_path.exists()} size={db_path.stat().st_size if db_path.exists() else 0}")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"[OK] Tables created. DB exists after: {db_path.exists()} size={db_path.stat().st_size if db_path.exists() else 0}")

    from app.database import async_session_maker
    import bcrypt
    from datetime import datetime, timedelta

    async with async_session_maker() as session:
        result = await session.execute(text("SELECT COUNT(*) as c FROM users"))
        count = result.scalar_one()
        print(f"[INFO] Existing users: {count}")
        if count > 0:
            rows = await session.execute(text("SELECT username, role FROM users LIMIT 10"))
            for r in rows:
                print(f"  - {r[0]} ({r[1]})")
            return

        def hp(p):
            return bcrypt.hashpw(p.encode('utf-8'), bcrypt.gensalt()).decode()

        users = []
        for u in [
            ("admin", "admin@antigrind.com", "Admin123!", "admin", "admin"),
            ("demo_hr", "hr@greencorp.com", "Demo123!", "company", "hr"),
            ("employee_zhang", "zhang@test.com", "Test123!", "employee", "consumer"),
            ("employee_li", "li@test.com", "Test123!", "employee", "consumer"),
            ("employee_wang", "wang@test.com", "Test123!", "employee", "consumer"),
        ]:
            obj = User(username=u[0], email=u[1], password_hash=hp(u[2]), role=u[3], user_type=u[4])
            users.append(obj)
            session.add(obj)
        await session.flush()
        print(f"[OK] {len(users)} users created")

        companies_data = [
            {"name": "GreenLife 绿色生活科技", "name_en": "GreenLife Technology", "industry": "tech", "agi_score": 18.5,
             "certification_status": "certified", "certification_level": "gold", "verification_status": "verified"},
            {"name": "TechCorp 互联网科技", "name_en": "TechCorp Internet Technology", "industry": "tech", "agi_score": 28.3,
             "certification_status": "certified", "certification_level": "silver", "verification_status": "verified"},
            {"name": "HappyWork 快乐办公", "name_en": "HappyWork Office Solutions", "industry": "service", "agi_score": 22.1,
             "certification_status": "certified", "certification_level": "silver", "verification_status": "verified"},
            {"name": "FastDev 极速开发", "name_en": "FastDev Speed Development", "industry": "tech", "agi_score": 45.8,
             "certification_status": "none", "certification_level": None, "verification_status": "pending"},
            {"name": "RetailMax 零售巨头", "name_en": "RetailMax Retail Giant", "industry": "retail", "agi_score": 52.4,
             "certification_status": "pending", "certification_level": None, "verification_status": "verified"},
            {"name": "FinancePro 金融专家", "name_en": "FinancePro Financial Expert", "industry": "finance", "agi_score": 38.7,
             "certification_status": "none", "certification_level": None, "verification_status": "pending"},
            {"name": "EduStar 教育之星", "name_en": "EduStar Education Star", "industry": "education", "agi_score": 25.9,
             "certification_status": "certified", "certification_level": "bronze", "verification_status": "verified"},
            {"name": "HealthPlus 健康加", "name_en": "HealthPlus Healthcare", "industry": "healthcare", "agi_score": 32.1,
             "certification_status": "rejected", "certification_level": None, "verification_status": "verified"},
            {"name": "Manufacture 制造先锋", "name_en": "Manufacture Manufacturing Pioneer", "industry": "manufacturing", "agi_score": 58.3,
             "certification_status": "none", "certification_level": None, "verification_status": "pending"},
            {"name": "LogisticsHub 物流中心", "name_en": "LogisticsHub Logistics Center", "industry": "logistics", "agi_score": 65.7,
             "certification_status": "none", "certification_level": None, "verification_status": "unverified"},
        ]
        created_companies = []
        for cd in companies_data:
            c = Company(**cd)
            if cd["certification_status"] == "certified":
                c.certification_expires_at = datetime.utcnow() + timedelta(days=365)
            session.add(c)
            created_companies.append(c)
        await session.flush()
        print(f"[OK] {len(created_companies)} companies created")

        templates = [
            {"weekly_hours": 40, "weekend_policy": "double_rest", "overtime_compensation": "legal", "shift_policy": "no_shift"},
            {"weekly_hours": 42, "weekend_policy": "double_rest", "overtime_compensation": "legal", "shift_policy": "no_shift"},
            {"weekly_hours": 45, "weekend_policy": "big_small_week", "overtime_compensation": "legal", "shift_policy": "occasional"},
            {"weekly_hours": 48, "weekend_policy": "single_rest", "overtime_compensation": "fixed_subsidy", "shift_policy": "occasional"},
            {"weekly_hours": 55, "weekend_policy": "single_rest", "overtime_compensation": "unpaid", "shift_policy": "frequent"},
            {"weekly_hours": 60, "weekend_policy": "no_rest", "overtime_compensation": "unpaid", "shift_policy": "frequent"},
        ]
        total = 0
        for idx, company in enumerate(created_companies):
            agi = float(company.agi_score or 0)
            if agi <= 30: tmpl = templates[:3]
            elif agi <= 60: tmpl = templates[2:5]
            else: tmpl = templates[4:]
            for i in range(min(len(tmpl), 4)):
                t = tmpl[i % len(tmpl)]
                session.add(WorkHourRecord(
                    company_id=company.id, user_id=users[min(i+2, len(users)-1)].id,
                    weekly_hours=t["weekly_hours"], weekend_policy=t["weekend_policy"],
                    overtime_compensation=t["overtime_compensation"], shift_policy=t["shift_policy"],
                    vibe_score=max(1, min(10, int(10 - (t["weekly_hours"] - 40) / 3))),
                    status="verified", verification_count=5,
                ))
                total += 1
        await session.flush()
        print(f"[OK] {total} work hour records created")

        for idx, company in enumerate(created_companies):
            if company.certification_status in ["certified", "pending", "rejected"]:
                cert = Certification(company_id=company.id, submitted_by=users[1].id,
                    status="approved" if company.certification_status == "certified" else company.certification_status,
                    policy_document_url=f"https://example.com/policies/{company.id}.pdf")
                if company.certification_status == "certified":
                    cert.reviewed_by = users[0].id
                    cert.approved_at = datetime.utcnow() - timedelta(days=30 * (idx + 1))
                    cert.expires_at = datetime.utcnow() + timedelta(days=365 - 30 * idx)
                    cert.review_notes = "符合反内卷标准"
                elif company.certification_status == "rejected":
                    cert.reviewed_by = users[0].id
                    cert.review_notes = "部分指标未达标"
                session.add(cert)
                await session.flush()
                if company.certification_status == "certified" and cert.status == "approved":
                    badge_code = f"AGI-{company.certification_level.upper()}-{datetime.utcnow().strftime('%Y%m%d')}-{idx+1:03d}"
                    session.add(CertificationBadge(company_id=company.id, certification_id=cert.id, badge_code=badge_code, is_active=True))
        await session.commit()

    print("\n" + "=" * 60)
    print("[OK] DATABASE INIT & SEED COMPLETED!")
    print("=" * 60)
    print(f"\nFinal DB size: {db_path.stat().st_size} bytes")
    print("\n[Test Accounts]")
    print("  Admin:    admin / Admin123!")
    print("  HR:       demo_hr / Demo123!")
    print("  Employee: employee_zhang / Test123!")
    print("            employee_li   / Test123!")
    print("            employee_wang / Test123!")


if __name__ == "__main__":
    asyncio.run(init_and_seed())
