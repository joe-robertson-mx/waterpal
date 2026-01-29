from fastapi.testclient import TestClient

from app.main import app


def test_list_zones():
    with TestClient(app) as client:
        response = client.get("/api/zones")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "name" in data[0]
