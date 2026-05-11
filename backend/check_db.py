import os
import sqlite3

db_path = "antigrind.db"
print(f"DB exists: {os.path.exists(db_path)}")
print(f"DB size: {os.path.getsize(db_path) if os.path.exists(db_path) else 0} bytes")
conn = sqlite3.connect(db_path)
tables = [
    t[0] for t in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
]
print(f"\nTables ({len(tables)}): {tables}")
if "users" in tables:
    print("\n=== USERS ===")
    for row in conn.execute("SELECT username, email, role FROM users LIMIT 20"):
        print(f"  {row[0]} | {row[1]} | {row[2]}")
if "companies" in tables:
    print("\n=== COMPANIES ===")
    for row in conn.execute("SELECT name, agi_score, verification_status FROM companies"):
        print(f"  {row[0]} | AGI:{row[1]} | {row[2]}")
for t in ["work_hour_records", "certifications", "certification_badges"]:
    if t in tables:
        c = conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"\n{t}: {c} records")
conn.close()
