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

## Backlog (P1/P2)
- PDF export of doctor summary (prototype had it).
- Hindi/English language toggle (prototype had it).
- PWA install + offline service worker.
- Password reset / brute-force lockout; auth-gate the assistant endpoint.
- Per-user diary backup export/import.
