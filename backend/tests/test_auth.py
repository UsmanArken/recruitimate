"""Integration tests for /api/auth endpoints."""
import pytest


pytestmark = pytest.mark.asyncio


async def test_health(client):
    r = await client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


async def test_signup_and_login(client):
    payload = {
        "email": "alice@example.com",
        "password": "Secret123!",
        "name": "Alice",
        "organizationName": "Acme Corp",
    }
    r = await client.post("/api/auth/signup", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    token = data["access_token"]

    r2 = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200
    me = r2.json()
    assert me["email"] == "alice@example.com"
    assert me["name"] == "Alice"


async def test_login_returns_token(client):
    await client.post("/api/auth/signup", json={
        "email": "bob@example.com",
        "password": "password123",
        "name": "Bob",
        "organizationName": "Bob Co",
    })
    r = await client.post("/api/auth/login", json={
        "email": "bob@example.com",
        "password": "password123",
    })
    assert r.status_code == 200
    assert "access_token" in r.json()


async def test_login_wrong_password(client):
    await client.post("/api/auth/signup", json={
        "email": "carol@example.com",
        "password": "correct",
        "name": "Carol",
        "organizationName": "Carol Inc",
    })
    r = await client.post("/api/auth/login", json={
        "email": "carol@example.com",
        "password": "wrong",
    })
    assert r.status_code == 401


async def test_me_unauthenticated(client):
    r = await client.get("/api/auth/me")
    assert r.status_code == 401


async def test_me_bad_token(client):
    r = await client.get("/api/auth/me", headers={"Authorization": "Bearer not.a.real.token"})
    assert r.status_code == 401
