import asyncio
import sys
sys.path.insert(0, '.')
from app.database import async_session_maker
from sqlalchemy import text
import bcrypt

async def fix_admin_password():
    password = 'Admin123!'
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    print(f'Generated hash: {password_hash[:50]}...')
    
    async with async_session_maker() as session:
        result = await session.execute(
            text("UPDATE users SET password_hash = :hash WHERE username = 'admin'"),
            {'hash': password_hash}
        )
        await session.commit()
        
        print(f'[OK] Admin password updated! Rows affected: {result.rowcount}')

if __name__ == "__main__":
    asyncio.run(fix_admin_password())
