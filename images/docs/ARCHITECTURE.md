# Int'L DJ Experience — Project Architecture

This document is the single source of truth for how the system is built and why.
It gets updated every time the architecture changes — treat it as the map, not
the code itself.

Last updated: Phase 3 (Supabase project created)

---

## 1. Roadmap status

| Phase | Status |
|---|---|
| 1. Planning & Architecture | ✅ Done |
| 2. Frontend foundation | ✅ Done |
| 3. Supabase + PostgreSQL | 🔵 In progress |
| 4. Database design | ⬜ Not started |
| 5. Frontend ↔ Database | ⬜ Not started |
| 6. Authentication | ⬜ Not started |
| 7. Admin Dashboard | ⬜ Not started |
| 8. Media Storage | ⬜ Not started |
| 9. Mixtape Upload System | ⬜ Not started |
| 10. Music Player (dynamic) | ⬜ Not started |
| 11. Events / Gallery / Contact (dynamic) | ⬜ Not started |
| 12. Validation + Error Handling | ⬜ Not started |
| 13. Accessibility + Responsive (revisit) | ⬜ Not started |
| 14. Security Review | ⬜ Not started |
| 15. Performance | ⬜ Not started |
| 16. Testing | ⬜ Not started |
| 17. Deployment | ⬜ Not started |
| 18. Maintenance + Future Features | ⬜ Not started |

---

## 2. System overview

```
Frontend (static site, hosted on Netlify)
        ↓
Netlify Functions (secure "hatch" for anything needing secret keys)
        ↓
Supabase — PostgreSQL Database (structured data: mixtape titles, genres, dates)
Supabase — Auth (admin login)
        +
Cloudinary — File Storage + CDN (actual MP3 and image files)
```

**Why two separate storage systems (Supabase DB vs Cloudinary)?**
A database is built for small, structured, searchable facts — not large binary
files. The database only ever stores a *reference* (a URL) to a file; the
actual file lives in Cloudinary, which is purpose-built for large media and
fast delivery via CDN.

---

## 3. Technology decisions (with reasoning)

| Layer | Choice | Why |
|---|---|---|
| Hosting (frontend) | Netlify | Already in use; free tier; auto-deploys from GitHub |
| Backend logic | Netlify Functions | No separate server to manage; keeps secret keys off the frontend |
| Database | Supabase (PostgreSQL) | Real SQL, transferable skill; generous free tier; built-in auth |
| Authentication | Supabase Auth | Bundled with the database choice; avoids building login from scratch |
| File/media storage | Cloudinary | Purpose-built for large media + CDN delivery; Supabase's own storage free tier (1GB) is too small for an audio-heavy site |
| Version control | Git + GitHub | Already set up; enables auto-deploy and change history |

**Options considered and rejected:**
- Firebase — solid alternative, but NoSQL (Firestore) is less transferable as a skill than SQL, and adds Google ecosystem lock-in
- Fully custom Node.js backend — most "real" but too many moving parts for a first backend
- Storing files directly in the database — technically possible, architecturally wrong; would blow past free-tier limits almost immediately and slow every query down

---

## 4. Credentials — what's public vs. secret

| Credential | Type | Where it lives |
|---|---|---|
| Supabase Project URL | Public | Safe in frontend code |
| Supabase anon/public key | Public | Safe in frontend code — protected by database permission rules, not secrecy |
| Supabase service role key | 🔴 SECRET | Netlify Functions only — never in HTML/CSS/JS |
| Cloudinary cloud name | Public | Safe in frontend code |
| Cloudinary API secret | 🔴 SECRET | Netlify Functions only |

**Rule of thumb:** if a key can bypass permission rules or take admin-level
action, it's secret. If it can only do what a logged-out visitor should
already be allowed to do, it's public.

---

## 5. Current resources

- **Supabase project:** blocked — Supabase platform outage (project creation failing as of Sep 3, 2026). Retry pending.
- **Cloudinary account:** ✅ created (Sep 4, 2026) — cloud name, API key, and API secret confirmed visible in dashboard. Not yet wired into any code.
- **Netlify Functions:** not yet created

---

## 6. Decision log

| Date/Phase | Decision | Reasoning |
|---|---|---|
| Phase 1 | Chose static site + Supabase + Cloudinary over full custom backend | Beginner-appropriate, free-tier friendly, still "real" architecture |
| Phase 3 | Created Supabase project | First concrete backend resource — everything else references this |
| Phase 3 | Hit Supabase platform outage during project creation | External issue, not user error — confirmed via status.supabase.com; paused Phase 3, moved to independent Phase 8 work while waiting |
| Phase 4 | Designed `mixtapes` table schema (8 columns, `bpm` removed at user's request) | Kept to only what's needed now; more tables (events, gallery) deferred to Phase 11 |
| Phase 8 | Created Cloudinary account | Confirmed cloud name, API key (public-safe) and API secret (private, viewed but not shared) |
| Phase 3 | Considered switching to Firebase during outage; decided to wait instead | Firebase would trade SQL (Postgres) for NoSQL (Firestore) — a real architectural cost, not just a swap. Supabase outage judged temporary; worth waiting rather than compromising the schema/skill goals |