"""Backend API tests for Pain Map"""
import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://health-dashboard-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "vaibhavtaneja6453@gmail.com"
ADMIN_PASSWORD = "PainMap@2026"


@pytest.fixture(scope="session")
def unique_email():
    return f"test_{uuid.uuid4().hex[:8]}@example.com"


@pytest.fixture(scope="session")
def registered_session(unique_email):
    s = requests.Session()
    payload = {
        "email": unique_email,
        "password": "secret123",
        "name": "TEST User",
        "phone": "+919999999999",
        "address": "Test Street 1",
        "emergency_contact_name": "TEST Contact",
        "emergency_contact_phone": "+918888888888",
        "age": 30,
        "blood_type": "O+",
        "conditions": "",
    }
    r = s.post(f"{API}/auth/register", json=payload)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["email"] == unique_email
    return s, data


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return s


# ---- Health ----
def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert "Pain Map" in r.json().get("message", "")


# ---- Auth ----
def test_admin_login(admin_session):
    r = admin_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_register_and_me(registered_session):
    s, user = registered_session
    r = s.get(f"{API}/auth/me")
    assert r.status_code == 200
    assert r.json()["user_id"] == user["user_id"]


def test_register_duplicate(registered_session, unique_email):
    s, _ = registered_session
    r = requests.post(f"{API}/auth/register", json={
        "email": unique_email, "password": "secret123", "name": "Dup",
        "phone": "x", "address": "x", "emergency_contact_name": "x",
        "emergency_contact_phone": "x", "age": 20, "blood_type": "A+",
    })
    assert r.status_code == 400


def test_login_wrong_password():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_me_unauth():
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_google_session_missing_header():
    r = requests.post(f"{API}/auth/session")
    assert r.status_code in (400, 401)


def test_google_session_invalid():
    r = requests.post(f"{API}/auth/session", headers={"X-Session-ID": "invalid-fake"})
    assert r.status_code == 401


# ---- Diary ----
def test_diary_crud_and_stats(registered_session):
    s, _ = registered_session
    # List empty
    r = s.get(f"{API}/diary")
    assert r.status_code == 200
    assert r.json() == []

    entry = {
        "level": "Y", "severity": 6, "regions": ["chest", "head"],
        "descriptors": ["sharp"], "text": "test pain",
        "onset": "sudden", "duration": "hours", "pattern": "constant",
        "triggers": [], "related": [], "area_specific": [],
        "summary": "test summary", "next_step": "see doctor",
    }
    r = s.post(f"{API}/diary", json=entry)
    assert r.status_code == 200, r.text
    created = r.json()
    assert created["severity"] == 6
    assert "id" in created
    entry_id = created["id"]
    assert "_id" not in created

    # List
    r = s.get(f"{API}/diary")
    assert r.status_code == 200
    assert any(d["id"] == entry_id for d in r.json())

    # Stats
    r = s.get(f"{API}/diary/stats")
    assert r.status_code == 200
    st = r.json()
    assert st["count"] >= 1
    assert st["avg_severity"] > 0
    assert any(reg["name"] == "chest" for reg in st["regions"])

    # Delete
    r = s.delete(f"{API}/diary/{entry_id}")
    assert r.status_code == 200

    # Verify removed
    r = s.get(f"{API}/diary")
    assert all(d["id"] != entry_id for d in r.json())


def test_diary_unauth():
    r = requests.get(f"{API}/diary")
    assert r.status_code == 401
    r = requests.post(f"{API}/diary", json={"level": "G", "severity": 1})
    assert r.status_code == 401


# ---- Reviews ----
def test_reviews_list_seeded():
    r = requests.get(f"{API}/reviews")
    assert r.status_code == 200
    reviews = r.json()
    assert isinstance(reviews, list)
    assert len(reviews) >= 4  # 4 seeded
    assert all("_id" not in rv for rv in reviews)
    assert all("rating" in rv for rv in reviews)


def test_create_review_requires_auth():
    r = requests.post(f"{API}/reviews", json={"rating": 5, "title": "x", "review": "y"})
    assert r.status_code == 401


def test_create_review_logged_in(registered_session):
    s, _ = registered_session
    r = s.post(f"{API}/reviews", json={"rating": 4, "title": "TEST title", "review": "TEST review body"})
    assert r.status_code == 200
    doc = r.json()
    assert doc["rating"] == 4
    assert doc["title"] == "TEST title"
    # verify in list
    r = requests.get(f"{API}/reviews")
    assert any(x.get("id") == doc["id"] for x in r.json())


# ---- Assistant ----
def test_assistant_chat():
    r = requests.post(f"{API}/assistant/chat", json={
        "messages": [{"role": "user", "content": "What does severity 7 mean?"}],
        "context": ""
    }, timeout=60)
    assert r.status_code == 200
    assert "text" in r.json()
    assert len(r.json()["text"]) > 0


# ---- Logout ----
def test_logout_clears_session(registered_session):
    s, _ = registered_session
    # Do this test last by creating own session
    s2 = requests.Session()
    email = f"logout_{uuid.uuid4().hex[:6]}@example.com"
    r = s2.post(f"{API}/auth/register", json={
        "email": email, "password": "secret123", "name": "L",
        "phone": "x", "address": "x", "emergency_contact_name": "x",
        "emergency_contact_phone": "x", "age": 20, "blood_type": "A+",
    })
    assert r.status_code == 200
    r = s2.get(f"{API}/auth/me")
    assert r.status_code == 200
    r = s2.post(f"{API}/auth/logout")
    assert r.status_code == 200
    r = s2.get(f"{API}/auth/me")
    assert r.status_code == 401
