import pytest
from httpx import AsyncClient
from app.main import app


@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    return TestClient(app)


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
