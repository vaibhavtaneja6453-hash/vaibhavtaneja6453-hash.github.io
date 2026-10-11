# Pain Map — Product Requirements Document

## Original problem statement
Enhance the "Pain Map" prototype (a non-diagnostic pain self-assessment PWA) into a full-stack app:
login/register at start (register captures Gmail, phone, name, address, emergency contact, password,
age, blood type, etc.); a dashboard housing the pain diary ("shift diary") and statistics; a customer
reviews page with images and feedback; a homepage that leads into "diagnostics" (the pain-mapping flow);
and an enhanced display/theme.

## User choices
- Sign-in: BOTH Emergent-managed Google login and email/password.
- Keep the AI help assistant (Claude).
- Reviews: logged-in users can post their own; seeded sample testimonials shown.
- Theme: calm medical teal (prototype palette, polished).

## Architecture
- Frontend: React 19, react-router, Tailwind, framer-motion, recharts, lucide-react, sonner.
- Backend: FastAPI, Motor/MongoDB. Unified cookie-session auth (`session_token`, 7-day) for both
  email/password and Google; users in `users` (custom `user_id`), sessions in `user_sessions`.
- AI assistant: Claude (claude-sonnet-5-5) via Emergent LLM key + emergentintegrations.

### Routes
- `/` Landing (hero, features, CTA into diagnostics)
- `/login`, `/register` (email/password + Google)
- `/diagnostics` (protected) — 5-step wizard: Profile → Body map → Describe → Questions → Result
- `/dashboard` (protected) — profile strip, stat cards, severity trend + region charts, pain diary list
- `/reviews` — seeded + user-submitted reviews, rating breakdown, add-review modal

### Key APIs
- Auth: POST /api/auth/register|login|session|logout, GET /api/auth/me
- Diary: POST/GET /api/diary, DELETE /api/diary/{id}, GET /api/diary/stats
- Reviews: GET/POST /api/reviews
- AI: POST /api/assistant/chat

## Implemented (2026-10-09)
- Full auth (email/password + Emergent Google), admin seeded (vaibhavtaneja6453@gmail.com).
- Smart login (unregistered email -> register handoff with prefill); editable Profile page with avatar/DP upload.
- Named genuine testimonials (Aishwarya Taneja, Rajvir Saini, S. P. Yadav, Tenzin Rawat) with photos; nav avatar dropdown.
- Care & Relief on Yellow/Red results: home remedies by region, relief/relaxation YouTube videos, mandala "breathe" animation.
- Red emergency section: Call 112 + one-tap WhatsApp alert (wa.me) to emergency contact (India code normalised); add-contact fallback.
- Diagnostics wizard with interactive front/back SVG body map, voice input, rule-based Green/Yellow/Red
  triage + doctor summary (ported from prototype), save-to-diary.
- Dashboard with diary + recharts statistics.
- Reviews with seeded samples, photos, star ratings, user submission.
- Floating AI assistant, dark/light theme toggle, mobile bottom nav.
- Tested: backend 100% (15 pytest), frontend 100% (Playwright E2E). No bugs found.

## Implemented (2026-10-09, later session)
- Facebook + Microsoft OAuth (authorization-code) added in server.py, gated on env creds (FACEBOOK_APP_ID/SECRET, MICROSOFT_CLIENT_ID/SECRET/TENANT). GET /api/auth/providers drives button visibility; buttons hidden until creds added. Coexists with Google + email/password (same users collection, oauth_<provider> sub fields, sparse indexes).
- Deep body-part-specific Care & Relief: REGION_CONTENT keyed by 16 body areas (head, neck, shoulder, upper_arm/biceps, forearm, hand, chest, upper_back, abdomen, lower_back, pelvis, buttocks, thigh, knee, shin_calf, foot) with tailored assessment text, home remedies, and real follow-along YouTube rehab videos. regionKeys() maps selected regions.
- RED emergency: one-tap WhatsApp + SMS alert to emergency contact (phone normalised to +91 for 10-digit), Call 112, add-contact fallback.

## Backlog (P1/P2)
- To enable Facebook/Microsoft login: user must create provider apps, set redirect URIs to {APP}/api/auth/facebook|microsoft/callback, and add the client IDs/secrets to backend .env.
- PDF export of doctor summary (prototype had it).
- Hindi/English language toggle (prototype had it).
- PWA install + offline service worker.
- Password reset / brute-force lockout; auth-gate the assistant endpoint.
- Per-user diary backup export/import.


## Changelog
- 2026-06 — Code-review safe fixes: removed hardcoded test secret (env), fixed empty catch in AuthContext, replaced array-index React keys with stable keys, `is True/False` → `==` in tests.
- 2026-06 — Refactor + hook-dep pass (verified, iteration_8, frontend 100%):
  - Extracted components: Navbar → nav/UserMenu + nav/MobileDock; Dashboard → dashboard/{ProfileStrip,StatCards,DiaryCharts,DiaryList}; CareRelief → care/{EmergencyAlert,ReliefVideos,MandalaBreathe,emergency}; FloatingAIAssistant → ai/AiMessageList; BodyMap → bodyMapStyle helper.
  - Hook fixes: FloatingAIAssistant welcome-seed effect no longer reads messages.length from closure (sole real eslint warning cleared); Reviews/Dashboard `load` wrapped in useCallback. Build now compiles with 0 warnings.
  - Verified: onboarding inputs retain focus while typing (OnbInput is module-level), mandala gating (shown chest/head/back, hidden limbs), navbar menu, dashboard sections, diagnostics red flow + emergency alert, AI assistant signed-in-only.
  - Note: painEngine.analyse and careContent.regionKeys (pure logic, high complexity) left intact to avoid regressions in the core diagnostic engine.
