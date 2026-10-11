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


# ---- OAuth providers gating ----
def test_auth_providers_endpoint():
    r = requests.get(f"{API}/auth/providers")
    assert r.status_code == 200
    data = r.json()
    # Google env may or may not be configured; facebook & microsoft must be False (envs empty)
    assert data.get("facebook") is False
    assert data.get("microsoft") is False
    assert "google" in data


def test_facebook_start_unconfigured_returns_400():
    r = requests.get(f"{API}/auth/facebook", allow_redirects=False)
    assert r.status_code == 400


def test_microsoft_start_unconfigured_returns_400():
    r = requests.get(f"{API}/auth/microsoft", allow_redirects=False)
    assert r.status_code == 400



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


# ---- Assistant (now auth-gated) ----
def test_assistant_chat_requires_auth():
    r = requests.post(f"{API}/assistant/chat", json={
        "messages": [{"role": "user", "content": "hi"}],
        "context": ""
    }, timeout=30)
    assert r.status_code == 401


def test_assistant_chat_logged_in(registered_session):
    s, _ = registered_session
    r = s.post(f"{API}/assistant/chat", json={
        "messages": [{"role": "user", "content": "What does severity 7 mean?"}],
        "context": ""
    }, timeout=60)
    assert r.status_code == 200
    assert "text" in r.json()
    assert len(r.json()["text"]) > 0


def test_assistant_chat_too_many_messages(registered_session):
    s, _ = registered_session
    msgs = [{"role": "user", "content": f"msg {i}"} for i in range(31)]
    r = s.post(f"{API}/assistant/chat", json={"messages": msgs, "context": ""}, timeout=30)
    assert r.status_code == 400


def test_assistant_chat_message_too_long(registered_session):
    s, _ = registered_session
    r = s.post(f"{API}/assistant/chat", json={
        "messages": [{"role": "user", "content": "x" * 4001}], "context": ""
    }, timeout=30)
    assert r.status_code == 400


# ---- Profile picture validation ----
def test_profile_picture_invalid_scheme(registered_session):
    s, _ = registered_session
    r = s.patch(f"{API}/auth/profile", json={"picture": "javascript:alert(1)"})
    assert r.status_code == 400


def test_profile_picture_too_large(registered_session):
    s, _ = registered_session
    big = "data:image/png;base64," + ("A" * 3_000_001)
    r = s.patch(f"{API}/auth/profile", json={"picture": big})
    assert r.status_code == 400


def test_profile_picture_valid_data_url(registered_session):
    s, _ = registered_session
    small = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    r = s.patch(f"{API}/auth/profile", json={"picture": small})
    assert r.status_code == 200
    assert r.json()["picture"] == small


# ---- Session cookie regression: must set httponly session_token and session works ----
def test_login_sets_session_cookie_and_works():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    set_cookie = r.headers.get("set-cookie", "")
    assert "session_token=" in set_cookie
    assert "httponly" in set_cookie.lower()
    # Session persists across requests (page navigation / reload regression)
    me = s.get(f"{API}/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == ADMIN_EMAIL
    # Note: public ingress may rewrite SameSite to None;Partitioned; backend code uses Lax (same-origin app)


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


# ---- Onboarding / profile_complete flag ----
def test_admin_profile_complete_true(admin_session):
    r = admin_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    assert r.json().get("profile_complete") is True
    assert r.json().get("role") == "admin"


def test_registered_user_profile_complete_true(registered_session):
    s, _ = registered_session
    r = s.get(f"{API}/auth/me")
    assert r.status_code == 200
    assert r.json().get("profile_complete") is True


def test_profile_complete_toggles_false_then_true():
    # Register fresh user to avoid polluting shared session
    s = requests.Session()
    email = f"onb_{uuid.uuid4().hex[:6]}@example.com"
    r = s.post(f"{API}/auth/register", json={
        "email": email, "password": "secret123", "name": "Onb",
        "phone": "9876543210", "address": "A", "emergency_contact_name": "C1",
        "emergency_contact_phone": "9876500000", "age": 25, "blood_type": "O+",
    })
    assert r.status_code == 200
    assert r.json()["profile_complete"] is True

    # Blank out phone + emergency phone -> incomplete
    r = s.patch(f"{API}/auth/profile", json={"phone": "", "emergency_contact_phone": ""})
    assert r.status_code == 200
    assert r.json()["profile_complete"] is False
    # /auth/me reflects it
    r = s.get(f"{API}/auth/me")
    assert r.json()["profile_complete"] is False

    # Fill them back -> complete again
    r = s.patch(f"{API}/auth/profile", json={"phone": "9876543210", "emergency_contact_phone": "9876500000"})
    assert r.status_code == 200
    assert r.json()["profile_complete"] is True


# ---- Second emergency contact persistence (registration + profile update) ----
def test_register_with_two_contacts_and_persist():
    s = requests.Session()
    email = f"two_{uuid.uuid4().hex[:6]}@example.com"
    payload = {
        "email": email, "password": "secret123", "name": "Two",
        "phone": "9876543210", "address": "Street",
        "emergency_contact_name": "Alice", "emergency_contact_phone": "9000000001",
        "emergency_contact_relation": "Spouse",
        "emergency_contact2_name": "Bob", "emergency_contact2_phone": "9000000002",
        "emergency_contact2_relation": "Friend",
        "age": 30, "blood_type": "A+",
    }
    r = s.post(f"{API}/auth/register", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["emergency_contact_name"] == "Alice"
    assert data["emergency_contact_relation"] == "Spouse"
    assert data["emergency_contact2_name"] == "Bob"
    assert data["emergency_contact2_phone"] == "9000000002"
    assert data["emergency_contact2_relation"] == "Friend"
    assert data["profile_complete"] is True

    # GET /auth/me verifies persistence
    r = s.get(f"{API}/auth/me")
    assert r.status_code == 200
    me = r.json()
    assert me["emergency_contact2_name"] == "Bob"
    assert me["emergency_contact2_relation"] == "Friend"


def test_update_emergency_contact2_via_profile(registered_session):
    s, _ = registered_session
    r = s.patch(f"{API}/auth/profile", json={
        "emergency_contact2_name": "Carol",
        "emergency_contact2_phone": "9000000009",
        "emergency_contact2_relation": "Sibling",
    })
    assert r.status_code == 200
    assert r.json()["emergency_contact2_name"] == "Carol"
    assert r.json()["emergency_contact2_relation"] == "Sibling"

    # Verify persistence after re-fetch
    r = s.get(f"{API}/auth/me")
    me = r.json()
    assert me["emergency_contact2_name"] == "Carol"
    assert me["emergency_contact2_phone"] == "9000000009"
    assert me["emergency_contact2_relation"] == "Sibling"

