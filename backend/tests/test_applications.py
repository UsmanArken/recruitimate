"""Integration tests for /api/applications endpoints."""
import pytest


pytestmark = pytest.mark.asyncio


async def _setup(client, email="app@example.com"):
    r = await client.post("/api/auth/signup", json={
        "email": email,
        "password": "password123",
        "name": "Recruiter",
        "organizationName": "App Co",
    })
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    job_r = await client.post("/api/jobs", json={
        "title": "Backend Engineer",
        "description": "",
        "requirements": "",
    }, headers=headers)
    job_id = job_r.json()["id"]

    cand_r = await client.post("/api/candidates", json={
        "name": "Alice Test",
        "email": "alice-test@example.com",
        "jobId": job_id,
    }, headers=headers)
    application_id = cand_r.json().get("applicationId") or cand_r.json().get("id")

    return headers, job_id, cand_r.json()["id"], application_id


async def test_list_applications(client):
    headers, _, _, _ = await _setup(client)
    r = await client.get("/api/applications", headers=headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_list_applications_unauthenticated(client):
    r = await client.get("/api/applications")
    assert r.status_code == 401


async def test_get_application_by_id(client):
    headers, _, candidate_id, _ = await _setup(client, "app2@example.com")

    list_r = await client.get("/api/applications", headers=headers)
    apps = list_r.json()
    assert len(apps) >= 1
    app_id = apps[0]["id"]

    r = await client.get(f"/api/applications/{app_id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["id"] == app_id


async def test_get_nonexistent_application(client):
    r_signup = await client.post("/api/auth/signup", json={
        "email": "noapp@example.com",
        "password": "password123",
        "name": "User",
        "organizationName": "Org",
    })
    token = r_signup.json()["access_token"]
    r = await client.get("/api/applications/nonexistent", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 404
