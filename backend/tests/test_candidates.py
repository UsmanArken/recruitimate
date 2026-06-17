"""Integration tests for /api/candidates endpoints."""
import pytest


pytestmark = pytest.mark.asyncio


async def _signup_token(client, email="cand@example.com"):
    r = await client.post("/api/auth/signup", json={
        "email": email,
        "password": "password123",
        "name": "Recruiter",
        "organizationName": "Hiring Co",
    })
    return r.json()["access_token"]


async def _create_job(client, token):
    r = await client.post("/api/jobs", json={
        "title": "Software Engineer",
        "description": "Build things",
        "requirements": "Python",
    }, headers={"Authorization": f"Bearer {token}"})
    return r.json()["id"]


async def test_list_candidates_empty(client):
    token = await _signup_token(client)
    r = await client.get("/api/candidates", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200


async def test_create_candidate(client):
    token = await _signup_token(client, "recruiter@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    job_id = await _create_job(client, token)

    r = await client.post("/api/candidates", json={
        "name": "Jane Smith",
        "email": "jane@example.com",
        "jobId": job_id,
    }, headers=headers)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Jane Smith"


async def test_get_candidate(client):
    token = await _signup_token(client, "rec2@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    job_id = await _create_job(client, token)

    create_r = await client.post("/api/candidates", json={
        "name": "John Doe",
        "email": "john@example.com",
        "jobId": job_id,
    }, headers=headers)
    candidate_id = create_r.json()["id"]

    r = await client.get(f"/api/candidates/{candidate_id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["id"] == candidate_id


async def test_create_candidate_unauthenticated(client):
    r = await client.post("/api/candidates", json={"name": "X", "email": "x@x.com", "jobId": "fake"})
    assert r.status_code == 401


async def test_get_nonexistent_candidate(client):
    token = await _signup_token(client, "missing-c@example.com")
    r = await client.get("/api/candidates/does-not-exist", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 404
