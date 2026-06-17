"""Integration tests for interview endpoints under /api/applications/{id}/interviews."""
import pytest


pytestmark = pytest.mark.asyncio


async def _setup(client, email="int@example.com"):
    r = await client.post("/api/auth/signup", json={
        "email": email,
        "password": "password123",
        "name": "Recruiter",
        "organizationName": "Interview Corp",
    })
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    job_r = await client.post("/api/jobs", json={
        "title": "QA Engineer",
        "description": "",
        "requirements": "",
    }, headers=headers)
    job_id = job_r.json()["id"]

    cand_r = await client.post("/api/candidates", json={
        "name": "Bob Interview",
        "email": "bob-int@example.com",
        "jobId": job_id,
    }, headers=headers)

    list_r = await client.get("/api/applications", headers=headers)
    app_id = list_r.json()[0]["id"]

    return headers, app_id


async def test_list_interviews_empty(client):
    headers, app_id = await _setup(client)
    r = await client.get(f"/api/applications/{app_id}/interviews", headers=headers)
    assert r.status_code == 200
    assert r.json() == []


async def test_create_interview(client):
    headers, app_id = await _setup(client, "int2@example.com")
    r = await client.post(f"/api/applications/{app_id}/interviews", json={
        "title": "Technical Screen",
        "scheduledAt": "2026-07-01T10:00:00Z",
        "durationMinutes": 60,
    }, headers=headers)
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "Technical Screen"
    assert data["status"] == "SCHEDULED"


async def test_create_interview_unauthenticated(client):
    r = await client.post("/api/applications/fake-id/interviews", json={"title": "X"})
    assert r.status_code == 401


async def test_list_interviews_shows_created(client):
    headers, app_id = await _setup(client, "int3@example.com")
    await client.post(f"/api/applications/{app_id}/interviews", json={
        "title": "Culture Fit",
        "durationMinutes": 30,
    }, headers=headers)
    r = await client.get(f"/api/applications/{app_id}/interviews", headers=headers)
    assert r.status_code == 200
    titles = [i["title"] for i in r.json()]
    assert "Culture Fit" in titles
