from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import secrets
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import httpx
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends
from fastapi.responses import StreamingResponse, RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

SESSION_DAYS = 7
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("painmap")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def public_user(doc: dict) -> dict:
    return {
        "user_id": doc.get("user_id"),
        "email": doc.get("email"),
        "name": doc.get("name"),
        "phone": doc.get("phone"),
        "address": doc.get("address"),
        "emergency_contact_name": doc.get("emergency_contact_name"),
        "emergency_contact_phone": doc.get("emergency_contact_phone"),
        "age": doc.get("age"),
        "blood_type": doc.get("blood_type"),
        "conditions": doc.get("conditions"),
        "picture": doc.get("picture"),
        "role": doc.get("role", "patient"),
        "auth_provider": doc.get("auth_provider", "password"),
    }


async def create_session(user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": now_utc() + timedelta(days=SESSION_DAYS),
        "created_at": now_utc(),
    })
    return token


def set_session_cookie(response: Response, token: str):
    response.set_cookie(
        key="session_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=SESSION_DAYS * 24 * 3600, path="/",
    )


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now_utc():
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    address: str
    emergency_contact_name: str
    emergency_contact_phone: str
    age: int
    blood_type: str
    conditions: Optional[str] = ""


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    age: Optional[int] = None
    blood_type: Optional[str] = None
    conditions: Optional[str] = None
    picture: Optional[str] = None


class DiaryIn(BaseModel):
    level: str
    severity: int
    regions: List[str] = []
    descriptors: List[str] = []
    text: str = ""
    onset: str = ""
    duration: str = ""
    pattern: str = ""
    triggers: List[str] = []
    related: List[str] = []
    area_specific: List[str] = []
    summary: str = ""
    next_step: str = ""


class ReviewIn(BaseModel):
    rating: int
    title: str
    review: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatIn(BaseModel):
    messages: List[ChatMessage]
    context: str = ""


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    doc = {
        "user_id": user_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "phone": payload.phone,
        "address": payload.address,
        "emergency_contact_name": payload.emergency_contact_name,
        "emergency_contact_phone": payload.emergency_contact_phone,
        "age": payload.age,
        "blood_type": payload.blood_type,
        "conditions": payload.conditions or "",
        "picture": "",
        "role": "patient",
        "auth_provider": "password",
        "created_at": now_utc(),
    }
    await db.users.insert_one(doc)
    token = await create_session(user_id)
    set_session_cookie(response, token)
    return public_user(doc)


@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email. Please register first.")
    if not user.get("password_hash"):
        raise HTTPException(status_code=400, detail="This email is registered with Google. Please use 'Continue with Google'.")
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
    token = await create_session(user["user_id"])
    set_session_cookie(response, token)
    return public_user(user)


@api_router.post("/auth/session")
async def google_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session id")
    async with httpx.AsyncClient() as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google session")
    data = r.json()
    email = (data.get("email") or "").lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
            "phone": "", "address": "", "emergency_contact_name": "",
            "emergency_contact_phone": "", "age": None, "blood_type": "",
            "conditions": "", "role": "patient", "auth_provider": "google",
            "created_at": now_utc(),
        }
        await db.users.insert_one(user)
    else:
        if data.get("picture") and not user.get("picture"):
            await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"picture": data["picture"]}})
            user["picture"] = data["picture"]
    token = await create_session(user["user_id"])
    set_session_cookie(response, token)
    return public_user(user)


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api_router.patch("/auth/profile")
async def update_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": updates})
        user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return public_user(user)


# ---------------------------------------------------------------------------
# Social OAuth (Facebook + Microsoft) — coexist with Google / email-password
# ---------------------------------------------------------------------------
FB_APP_ID = os.environ.get("FACEBOOK_APP_ID", "")
FB_APP_SECRET = os.environ.get("FACEBOOK_APP_SECRET", "")
FB_GRAPH = os.environ.get("FACEBOOK_GRAPH_VERSION", "v21.0")
MS_CLIENT_ID = os.environ.get("MICROSOFT_CLIENT_ID", "")
MS_CLIENT_SECRET = os.environ.get("MICROSOFT_CLIENT_SECRET", "")
MS_TENANT = os.environ.get("MICROSOFT_TENANT", "common")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
FB_CB = f"{FRONTEND_URL}/api/auth/facebook/callback"
MS_CB = f"{FRONTEND_URL}/api/auth/microsoft/callback"


@api_router.get("/auth/providers")
async def auth_providers():
    return {
        "google": True,
        "facebook": bool(FB_APP_ID and FB_APP_SECRET),
        "microsoft": bool(MS_CLIENT_ID and MS_CLIENT_SECRET),
    }


async def _social_login(email, name, picture, provider, sub, response):
    email = (email or "").lower().strip()
    user = None
    if sub:
        user = await db.users.find_one({f"oauth_{provider}": sub})
    if not user and email:
        user = await db.users.find_one({"email": email})
    if not user:
        user = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}", "email": email, "name": name or "",
            "picture": picture or "", "phone": "", "address": "",
            "emergency_contact_name": "", "emergency_contact_phone": "", "age": None,
            "blood_type": "", "conditions": "", "role": "patient",
            "auth_provider": provider, f"oauth_{provider}": sub, "created_at": now_utc(),
        }
        await db.users.insert_one(user)
    else:
        upd = {f"oauth_{provider}": sub}
        if picture and not user.get("picture"):
            upd["picture"] = picture
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": upd})
    token = await create_session(user["user_id"])
    set_session_cookie(response, token)


def _state_cookie(resp, state):
    resp.set_cookie("oauth_state", state, max_age=600, httponly=True, secure=True, samesite="none", path="/")


@api_router.get("/auth/facebook")
async def facebook_start():
    if not (FB_APP_ID and FB_APP_SECRET):
        raise HTTPException(status_code=400, detail="Facebook login is not configured")
    from urllib.parse import urlencode
    state = secrets.token_urlsafe(24)
    q = urlencode({"client_id": FB_APP_ID, "redirect_uri": FB_CB, "state": state, "scope": "public_profile,email"})
    resp = RedirectResponse(f"https://www.facebook.com/{FB_GRAPH}/dialog/oauth?{q}")
    _state_cookie(resp, state)
    return resp


@api_router.get("/auth/facebook/callback")
async def facebook_callback(request: Request, code: str = None, state: str = None, error: str = None):
    expected = request.cookies.get("oauth_state")
    if error or not code or not state or state != expected:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=facebook")
    base = f"https://graph.facebook.com/{FB_GRAPH}"
    async with httpx.AsyncClient(timeout=10) as c:
        tok = await c.get(f"{base}/oauth/access_token", params={
            "client_id": FB_APP_ID, "client_secret": FB_APP_SECRET, "redirect_uri": FB_CB, "code": code})
        if tok.status_code != 200:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=facebook")
        at = tok.json().get("access_token")
        prof = await c.get(f"{base}/me", params={"fields": "id,name,email,picture", "access_token": at})
    p = prof.json()
    pic = (p.get("picture") or {}).get("data", {}).get("url", "")
    resp = RedirectResponse(f"{FRONTEND_URL}/dashboard")
    await _social_login(p.get("email"), p.get("name"), pic, "facebook", p.get("id"), resp)
    resp.delete_cookie("oauth_state", path="/")
    return resp


@api_router.get("/auth/microsoft")
async def microsoft_start():
    if not (MS_CLIENT_ID and MS_CLIENT_SECRET):
        raise HTTPException(status_code=400, detail="Microsoft login is not configured")
    from urllib.parse import urlencode
    state = secrets.token_urlsafe(24)
    authority = f"https://login.microsoftonline.com/{MS_TENANT}/oauth2/v2.0"
    q = urlencode({"client_id": MS_CLIENT_ID, "response_type": "code", "redirect_uri": MS_CB,
                   "response_mode": "query", "scope": "openid profile email", "state": state})
    resp = RedirectResponse(f"{authority}/authorize?{q}")
    _state_cookie(resp, state)
    return resp


@api_router.get("/auth/microsoft/callback")
async def microsoft_callback(request: Request, code: str = None, state: str = None, error: str = None):
    expected = request.cookies.get("oauth_state")
    if error or not code or not state or state != expected:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=microsoft")
    authority = f"https://login.microsoftonline.com/{MS_TENANT}/oauth2/v2.0"
    async with httpx.AsyncClient(timeout=10) as c:
        tok = await c.post(f"{authority}/token", data={
            "client_id": MS_CLIENT_ID, "client_secret": MS_CLIENT_SECRET, "grant_type": "authorization_code",
            "code": code, "redirect_uri": MS_CB, "scope": "openid profile email"})
        if tok.status_code != 200:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=microsoft")
        at = tok.json().get("access_token")
        info = await c.get("https://graph.microsoft.com/oidc/userinfo", headers={"Authorization": f"Bearer {at}"})
    p = info.json()
    resp = RedirectResponse(f"{FRONTEND_URL}/dashboard")
    await _social_login(p.get("email") or p.get("preferred_username"), p.get("name"), "", "microsoft", p.get("sub"), resp)
    resp.delete_cookie("oauth_state", path="/")
    return resp


# ---------------------------------------------------------------------------
# Diary + stats
# ---------------------------------------------------------------------------
@api_router.post("/diary")
async def create_diary(payload: DiaryIn, user: dict = Depends(get_current_user)):
    entry = payload.model_dump()
    entry["id"] = str(uuid.uuid4())
    entry["user_id"] = user["user_id"]
    entry["created_at"] = now_utc().isoformat()
    await db.diary_entries.insert_one({**entry})
    entry.pop("_id", None)
    return entry


@api_router.get("/diary")
async def list_diary(user: dict = Depends(get_current_user)):
    docs = await db.diary_entries.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    docs.sort(key=lambda d: d.get("created_at", ""), reverse=True)
    return docs


@api_router.delete("/diary/{entry_id}")
async def delete_diary(entry_id: str, user: dict = Depends(get_current_user)):
    await db.diary_entries.delete_one({"id": entry_id, "user_id": user["user_id"]})
    return {"ok": True}


@api_router.get("/diary/stats")
async def diary_stats(user: dict = Depends(get_current_user)):
    docs = await db.diary_entries.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    docs.sort(key=lambda d: d.get("created_at", ""))
    n = len(docs)
    if n == 0:
        return {"count": 0, "avg_severity": 0, "levels": {"G": 0, "Y": 0, "R": 0},
                "regions": [], "timeline": [], "trend": "none"}
    sev_total = sum(d.get("severity", 0) for d in docs)
    levels = {"G": 0, "Y": 0, "R": 0}
    region_counts = {}
    timeline = []
    for d in docs:
        levels[d.get("level", "G")] = levels.get(d.get("level", "G"), 0) + 1
        for r in d.get("regions", []):
            region_counts[r] = region_counts.get(r, 0) + 1
        timeline.append({
            "date": d.get("created_at", "")[:10],
            "severity": d.get("severity", 0),
            "level": d.get("level", "G"),
        })
    regions = sorted([{"name": k, "count": v} for k, v in region_counts.items()],
                     key=lambda x: x["count"], reverse=True)
    trend = "steady"
    if n >= 2:
        mid = (n + 1) // 2
        a1 = sum(d.get("severity", 0) for d in docs[:mid]) / mid
        a2 = sum(d.get("severity", 0) for d in docs[mid:]) / (n - mid)
        if a2 - a1 <= -1:
            trend = "improving"
        elif a2 - a1 >= 1:
            trend = "worsening"
    else:
        trend = "none"
    return {
        "count": n,
        "avg_severity": round(sev_total / n, 1),
        "levels": levels,
        "regions": regions,
        "timeline": timeline,
        "trend": trend,
    }


# ---------------------------------------------------------------------------
# Reviews
# ---------------------------------------------------------------------------
@api_router.get("/reviews")
async def list_reviews():
    docs = await db.reviews.find({}, {"_id": 0}).to_list(1000)
    docs.sort(key=lambda d: d.get("created_at", ""), reverse=True)
    return docs


@api_router.post("/reviews")
async def create_review(payload: ReviewIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "name": user.get("name") or user.get("email"),
        "role": "Verified Patient",
        "rating": max(1, min(5, payload.rating)),
        "title": payload.title,
        "review": payload.review,
        "picture": user.get("picture", ""),
        "verified": True,
        "created_at": now_utc().isoformat(),
    }
    await db.reviews.insert_one({**doc})
    doc.pop("_id", None)
    return doc


# ---------------------------------------------------------------------------
# AI help assistant (Claude via Emergent LLM key)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are the Pain Map help assistant inside a non-diagnostic pain communication app. "
    "Help users use the app (body map, guided questions, Green/Yellow/Red result, diary, "
    "stats, voice input) and explain pain-related terms in simple everyday words. "
    "Never diagnose, never name a likely disease as the cause, never recommend medicines or doses. "
    "For anything serious or worsening, advise seeing a doctor. For red flags (chest pain with "
    "breathlessness, sudden severe headache, fainting, one-sided weakness, trouble breathing) tell "
    "them to call their local emergency number (112 in India) now. If the user mentions self-harm, "
    "respond kindly and share Tele-MANAS 14416 and 112. Reply in the user's language (English, Hindi "
    "or Hinglish) in 2-4 short plain sentences, no markdown."
)


@api_router.post("/assistant/chat")
async def assistant_chat(payload: ChatIn):
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    history = payload.messages[:-1] if payload.messages else []
    last = payload.messages[-1].content if payload.messages else ""
    convo = "\n".join([("User: " if m.role == "user" else "Assistant: ") + m.content for m in history])
    sys = SYSTEM_PROMPT
    if payload.context:
        sys += "\n\nSaved result of this user (explain simply, do not diagnose):\n" + payload.context
    prompt = (("Conversation so far:\n" + convo + "\n\n") if convo else "") + last

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"painmap_{uuid.uuid4().hex[:10]}",
        system_message=sys,
    ).with_model("anthropic", "claude-sonnet-5-5")
    try:
        reply = await chat.send_message(UserMessage(text=prompt))
        return {"text": reply}
    except Exception as e:
        logger.error(f"AI assistant error: {e}")
        return {"text": "I'm having trouble reaching the assistant right now. For how-to help: use the "
                        "body map to tap where it hurts, then describe it and answer the questions. "
                        "For anything urgent, please call your local emergency number."}


@api_router.get("/")
async def root():
    return {"message": "Pain Map API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup: indexes, admin seed, sample reviews
# ---------------------------------------------------------------------------
SAMPLE_REVIEWS = [
    {"name": "Aishwarya Taneja", "role": "Migraine & Neck Pain", "rating": 5,
     "picture": "https://images.unsplash.com/photo-1573497019707-1c04de26e58c?crop=entropy&cs=srgb&fm=jpg&q=85&w=256",
     "title": "I finally felt heard at my appointment",
     "review": "I always struggled to explain my migraines. I showed my doctor the Pain Map summary with the exact spots and an 8/10 severity and she understood immediately. The follow-up trend chart is honestly brilliant."},
    {"name": "Rajvir Saini", "role": "Lower Back Pain (Gym Injury)", "rating": 5,
     "picture": "https://images.unsplash.com/photo-1649433658557-54cf58577c68?crop=entropy&cs=srgb&fm=jpg&q=85&w=256",
     "title": "The body map is so simple to use",
     "review": "After a deadlift injury I could point to the exact lower-back spot and the app flagged it Yellow and told me to get it checked. Turned out to be a muscle strain. Saved me a lot of panic and a wasted trip."},
    {"name": "S. P. Yadav", "role": "Chronic Knee Pain · Age 64", "rating": 5,
     "picture": "https://images.unsplash.com/photo-1779630986800-f0ed643f357b?crop=entropy&cs=srgb&fm=jpg&q=85&w=256",
     "title": "Simple enough for someone my age",
     "review": "The buttons are big and clear and the voice option makes it easy for me. I log my knee pain every evening and my son goes through the dashboard with me on weekends."},
    {"name": "Tenzin Rawat", "role": "Sports Physiotherapy Patient", "rating": 5,
     "picture": "https://images.unsplash.com/photo-1759755487703-91f22c31bfbd?crop=entropy&cs=srgb&fm=jpg&q=85&w=256",
     "title": "Red / Yellow / Green gives real peace of mind",
     "review": "During my rehab the colour guidance helped me know when pain was normal and when to call my physio. Watching my severity drop from 7 down to 2 kept me motivated every single day."},
]


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id")
    await db.user_sessions.create_index("session_token")
    await db.diary_entries.create_index("user_id")
    await db.users.create_index("oauth_facebook", sparse=True)
    await db.users.create_index("oauth_microsoft", sparse=True)

    admin_email = os.environ.get("ADMIN_EMAIL", "").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if admin_email and admin_password:
        existing = await db.users.find_one({"email": admin_email})
        if existing is None:
            await db.users.insert_one({
                "user_id": f"user_{uuid.uuid4().hex[:12]}",
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "name": "Vaibhav (Owner)", "phone": "", "address": "",
                "emergency_contact_name": "", "emergency_contact_phone": "",
                "age": None, "blood_type": "", "conditions": "",
                "picture": "", "role": "admin", "auth_provider": "password",
                "created_at": now_utc(),
            })
        elif not verify_password(admin_password, existing.get("password_hash", "")):
            await db.users.update_one({"email": admin_email},
                                      {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}})

    await db.reviews.delete_many({"user_id": "seed"})
    base = now_utc()
    for i, r in enumerate(SAMPLE_REVIEWS):
        await db.reviews.insert_one({
            **r, "id": str(uuid.uuid4()), "user_id": "seed", "verified": True,
            "created_at": (base - timedelta(days=i * 4 + 1)).isoformat(),
        })


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
