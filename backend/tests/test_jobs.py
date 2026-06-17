"""Integration tests for /api/jobs endpoints."""
import pytest


pytestmark = pytest.mark.asyncio


async def _signup_token(client, email="user@example.com"):
    r = await client.post("/api/auth/signup", json={
        "email": email,
        "password": "password123",
        "name": "Test User",
        "organizationName": "Test Org",
    })
    return r.json()["access_token"]


async def test_list_jobs_empty(client):
    token = await _signup_token(client)
    r = await client.get("/api/jobs", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json() == []


async def test_create_and_get_job(client):
    token = await _signup_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    r = await client.post("/api/jobs", json={
        "title": "Senior Engineer",
        "description": "Build great software",
        "requirements": "5+ years Python",
    }, headers=headers)
    assert r.status_code == 201
    job = r.json()
    assert job["title"] == "Senior Engineer"
    job_id = job["id"]

    r2 = await client.get(f"/api/jobs/{job_id}", headers=headers)
    assert r2.status_code == 200
    assert r2.json()["id"] == job_id


async def test_create_job_unauthenticated(client):
    r = await client.post("/api/jobs", json={"title": "Dev", "description": "", "requirements": ""})
    assert r.status_code == 401


async def test_list_jobs_returns_created(client):
    token = await _signup_token(client, "list@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    await client.post("/api/jobs", json={"title": "Job A", "description": "", "requirements": ""}, headers=headers)
    await client.post("/api/jobs", json={"title": "Job B", "description": "", "requirements": ""}, headers=headers)

    r = await client.get("/api/jobs", headers=headers)
    titles = [j["title"] for j in r.json()]
    assert "Job A" in titles
    assert "Job B" in titles


async def test_get_nonexistent_job(client):
    token = await _signup_token(client, "missing@example.com")
    r = await client.get("/api/jobs/nonexistent-id", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 404
