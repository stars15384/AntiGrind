import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.main import app
from app.database import Base, get_db
from app.models import User


TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_antigrind.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session_maker = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="function")
async def db_session():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with test_session_maker() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def valid_user_data():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123!"
    }


@pytest.fixture
def invalid_password_data():
    return {
        "username": "weakuser",
        "email": "weak@example.com",
        "password": "123"
    }


class TestUserRegistration:
    """用户注册功能测试"""

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient, valid_user_data):
        response = await client.post("/api/auth/register", json=valid_user_data)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == valid_user_data["username"]
        assert data["email"] == valid_user_data["email"]
        assert "id" in data
        assert "password_hash" not in data

    @pytest.mark.asyncio
    async def test_register_duplicate_username(self, client: AsyncClient, valid_user_data):
        await client.post("/api/auth/register", json=valid_user_data)
        
        duplicate_data = valid_user_data.copy()
        duplicate_data["email"] = "another@example.com"
        response = await client.post("/api/auth/register", json=duplicate_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, valid_user_data):
        await client.post("/api/auth/register", json=valid_user_data)
        
        duplicate_data = valid_user_data.copy()
        duplicate_data["username"] = "anotheruser"
        response = await client.post("/api/auth/register", json=duplicate_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_weak_password_rejected(self, client: AsyncClient, invalid_password_data):
        response = await client.post("/api/auth/register", json=invalid_password_data)
        assert response.status_code == 422
        errors = response.json()["detail"]
        assert any("password" in str(error).lower() for error in errors)

    @pytest.mark.asyncio
    async def test_register_short_username_rejected(self, client: AsyncClient):
        data = {
            "username": "ab",
            "email": "short@example.com",
            "password": "ValidPass123!"
        }
        response = await client.post("/api/auth/register", json=data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_invalid_email_rejected(self, client: AsyncClient):
        data = {
            "username": "validuser",
            "email": "not-an-email",
            "password": "ValidPass123!"
        }
        response = await client.post("/api/auth/register", json=data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_password_without_uppercase_rejected(self, client: AsyncClient):
        data = {
            "username": "noupper",
            "email": "noupper@example.com",
            "password": "lowercase123!"  
        }
        response = await client.post("/api/auth/register", json=data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_password_without_number_rejected(self, client: AsyncClient):
        data = {
            "username": "nonum",
            "email": "nonum@example.com",
            "password": "NoNumbers!!"
        }
        response = await client.post("/api/auth/register", json=data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_password_too_long_rejected(self, client: AsyncClient):
        long_password = "A1!" + "a" * 130
        data = {
            "username": "longpass",
            "email": "longpass@example.com",
            "password": long_password
        }
        response = await client.post("/api/auth/register", json=data)
        assert response.status_code == 422


class TestUserLogin:
    """用户登录功能测试"""

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, valid_user_data):
        await client.post("/api/auth/register", json=valid_user_data)

        login_data = {
            "username": valid_user_data["username"],
            "password": valid_user_data["password"]
        }
        response = await client.post("/api/auth/login", data=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, valid_user_data):
        await client.post("/api/auth/register", json=valid_user_data)

        login_data = {
            "username": valid_user_data["username"],
            "password": "WrongPassword123!"
        }
        response = await client.post("/api/auth/login", data=login_data)
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        login_data = {
            "username": "nonexistent",
            "password": "SomePass123!"
        }
        response = await client.post("/api/auth/login", data=login_data)
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_returns_valid_jwt(self, client: AsyncClient, valid_user_data):
        await client.post("/api/auth/register", json=valid_user_data)

        login_data = {
            "username": valid_user_data["username"],
            "password": valid_user_data["password"]
        }
        response = await client.post("/api/auth/login", data=login_data)
        token = response.json()["access_token"]

        import jwt
        from app.config import get_settings
        settings = get_settings()
        
        decoded = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        assert "sub" in decoded
        assert "exp" in decoded


class TestAuthentication:
    """认证与授权测试"""

    @pytest.mark.asyncio
    async def test_access_protected_endpoint_without_token(self, client: AsyncClient):
        response = await client.get("/api/auth/profile")
        # FastAPI OAuth2Bearer未提供token时返回401 Unauthorized
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_access_protected_endpoint_with_invalid_token(self, client: AsyncClient):
        response = await client.get(
            "/api/auth/profile",
            headers={"Authorization": "Bearer invalid.token.here"}
        )
        # 无效token应返回401 Unauthorized
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_access_profile_with_valid_token(self, client: AsyncClient, valid_user_data, db_session: AsyncSession):
        register_response = await client.post("/api/auth/register", json=valid_user_data)
        assert register_response.status_code == 200

        # 从数据库查询用户ID（更稳定的方式）
        from sqlalchemy import select
        result = await db_session.execute(
            select(User).where(User.username == valid_user_data["username"])
        )
        user = result.scalar_one_or_none()
        assert user is not None, "注册后应在数据库中找到用户"
        user_id = str(user.id)

        login_data = {
            "username": valid_user_data["username"],
            "password": valid_user_data["password"]
        }
        login_response = await client.post("/api/auth/login", data=login_data)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        profile_response = await client.get(
            "/api/auth/profile",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert profile_response.status_code == 200
        profile_data = profile_response.json()
        # Pydantic v2会将UUID转为字符串，直接比较字符串
        assert str(profile_data.get("id")) == user_id or user_id in str(profile_data.get("id", ""))
        assert profile_data["username"] == valid_user_data["username"]
