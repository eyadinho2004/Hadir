# Hadir (حاضر) — M1 Scope & Architecture

> A web-only MVP that fits the SWE 485 scope ceilings.
>
> **Course:** SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> **Milestone:** M1 — Requirements and architecture (due 21 Oct 2026, 26 marks)
> **Product name:** Hadir (Arabic: حاضر = "present")
> **Adopted approach:** Web application only (no mobile app).

---

## 1. Product Charter (short)

**Problem.** Organizing a workshop, seminar, or training program involves many
manual, scattered tasks — registrations, attendance tracking, issuing
certificates, grades, and reports. There is no single platform that gathers
events across fields (technology, health, law) and manages their full lifecycle.

**Product.** Hadir is an all-in-one web platform that lets a **Provider**
create/publish events and sessions, run live attendance via **QR code**, export
attendance, and view analytics — while a **Participant** browses public events,
registers, attends, and tracks their own attendance. *Web only.*

**Stakeholders (2 roles only, to respect the ceiling):**
- **Provider** — organizes and manages events/sessions/attendance/analytics.
- **Participant** — browses, registers, attends, and tracks their own attendance.
- **System Admin** — explicitly **out of scope** (keeps the role count at 2).

---

## 2. Scope — In / Out

### 2.1 In scope (essential requirements)

**Core platform**
- AC-01 Account creation with email/password, choosing one of two roles (Provider/Participant).
- AC-02 Login / logout.
- AC-03 Password reset via email link.

**Event management (Provider)**
- EV-01 Create, edit, delete an Event. Mandatory fields: **Event Name**, **Event Code** (system-generated).
- EV-02 Auto-associate event with the Provider account; auto-timestamp creation date.
- EV-03 Event list page: name, code, creation date, number of associated sessions.
- EV-04 Event detail page: create sessions linked to the event; write notes.

**Session management (Provider)**
- SE-01 Create standalone or event-linked sessions.
- SE-02 Mandatory fields: **Title (string)**, **Attendance method** (QR Code).
- SE-03 Optional fields: notes, **allowed lateness (minutes, default 15)**, **duration (minutes, for auto-close)**.
- SE-04 For QR: system generates a unique random QR string, stored with the session.
- SE-05 States: **Draft / Active / Closed**; Provider can change status manually.
- SE-06 Sessions auto-transition to **Closed** when auto-close duration is reached.
- SE-07 Session list: title, status, creation date, method, allowed lateness, duration, associated event, attendance count.
- SE-08 Session/live view: title, notes, status, QR code, attendance list. (Lightweight polling.)

**Attendance (QR-only for the MVP)**
- AT-01 Mark attendance; status is **present** if within `creation_time + allowed_lateness_minutes`, otherwise **late**.
- AT-02 The session attendance method is **QR Code**. Participant scans the QR via the **web camera** to mark attendance. (Face-to-face with GPS location verification is deferred.)
- AT-03 Export session attendance to **CSV**: session title, student name, student email, attendance status (present/late/absent), attendance timestamp.
- AT-04 Aggregate attendance per Participant UID: total sessions, present count, late count, session list.

**Public events**
- PB-01 Provider publishes an event; choose visibility **Private** or **Public**.
- PB-02 Public events require: **category** (Hackathon / Training Program / Workshop / Seminar / Other), **description**, **start date**, **end date**, **registration deadline**. (Cover image optional in MVP.)
- PB-03 Publication status: **Draft / Published / Closed**; auto-close when the registration deadline is reached.
- PB-04 Public events page: name, category, provider name, start date, end date, short description, registration status (Open/Closed).
- PB-05 Filter by category / date / provider / registration status; search by keyword.
- PB-06 Public event detail page: full description, schedule, provider info, deadline, total registered.
- PB-07 Participant registers for a public event; blocked if closed/full; auto-set status "Full" at capacity; record Participant UID + registration timestamp; confirmation email; cancel before deadline. Provider sets max capacity and views registrants; Provider can cancel a published event.

**Analytics (minimal)**
- AN-01 Attendance rate = `(totalAttended / totalSessions) * 100`, displayed as a percentage.
- AN-02 Filter analytics by event; event-filtered counts reflect only that event's sessions/attendance.

### 2.2 Out of scope (explicit non-goals for Hadir M1)

- **Certificates (template upload, name positioning, eligibility, email dispatch, PDF download)** — removed to keep requirements lean.
- **Mobile (React Native) app** — web only, per the adopted decision.
- **Face-to-face (F2F) with GPS/geolocation + radius verification** — attendance is QR-only in the MVP; F2F location verification is deferred.
- **File / link / media upload & notes attachments** — removed (reduces storage complexity).
- **Real-time live monitoring via WebSocket** — the session/live view uses lightweight polling.
- **Participant performance categorization (Perfect / Frequently Late)** — analytics keeps only the attendance rate.
- **Payments / monetization** (HyperPay, Mada, VAT/ZATCA e-invoicing, credit notes, refunds).
- **CRM** (contacts, organizations, leads, pipeline).
- **eLearning** (SCORM, modules, progress tracking), **customer portal**, **marketing** (Mailchimp, GA/Tag Manager).
- **Advanced reports/scheduling** (template sets, calendar with conflict detection, presenters, venues, catering).
- **i18n Arabic/English** and **dark mode** — deferred.
- **System Admin role**, public REST API/webhooks/Zapier, Zoom integration.
- Any feature tagged **Normal / Low** priority that the above doesn't already cover.

---

## 3. Declared language & tech stack (M1 decision, revised 2026-11-11)

**Front end: TypeScript + React (Vite), full-stack client.** A React single-page
application using the `supabase-js` client; SQL for the database rules and policies.
**Backend: Supabase (managed).** Supabase Auth for identity, PostgreSQL for data, RLS
policies for authorization, and three SQL functions (`check_in`,
`register_for_event`, `attendance_rate`) for the business rules. No server code is
written or operated by the team. Deployment: a static host plus Supabase — two managed
targets (ADR-0004).

> **Revision note:** this replaces the original Django + SQLite declaration. The change is
> recorded in ADR-0004 and knowingly breaks the one-deployment-target ceiling; it also puts
> the Week 10 mutation marks at risk because the delivered language is no longer Python.

**Why this stack (answers the "is it faster for one developer?" question):**
- Identity, sessions, password reset, admin, and email are managed — the largest block of code in
  the project is code we do not write.
- PostgreSQL gives the capacity rule one transaction and the status rule a server-side `now()`.
- RLS puts access control in one place instead of per-route checks.
- Cost is $0 on free tiers at this scale ([`cost-model.md`](./cost-model.md)).

**Why the Django monolith was rejected for this delivery:** it makes one developer own the identity,
session, admin, ORM, and email layers while the requirements only need the attendance loop. It remains
the better choice if the graded evidence must be Python, because it is stronger at M4 explanation and at
mutation testing — that is the price this decision pays (ADR-0004).

**Why a BaaS was once rejected and is now accepted:** the earlier rejection (ADR-0001) was about a
pay-per-use NoSQL store with rules outside the code, plus a second deployment target. Supabase is
PostgreSQL with SQL policies that live in the repository, so the rules stay ours; the second target is
the **knowingly accepted** break recorded in ADR-0004.

---

## 4. Architecture (two distinct options for M1)

### Option A — React front end on Supabase (RECOMMENDED, ADR-0004)
- **C4 Context:** Provider and Participant browsers → React SPA → Supabase Auth (identity)
  + PostgreSQL (data). Email for password reset and registration confirmation.
- **C4 Container:** `web` (React + Vite + `supabase-js` + one QR camera widget), `auth`
  (Supabase Auth), `db` (PostgreSQL: 5 tables, RLS policies, 3 SQL functions).
- One enforcement point per rule: the status, capacity, and rate rules live in SQL functions;
  authorization lives in RLS; the React layer renders and re-implements nothing.
- Lifecycle states are derived at read from `closes_at` / `registration_deadline`; the live
  view polls a `select` every 5 seconds. No scheduler.

### Option B — Django monolith + server-rendered UI (rejected)
- **C4 Context:** same actors → Hadir web app (Django templates + views) → Django ORM →
  SQLite DB. Email service (SMTP/SendGrid) for reset and confirmation.
- **C4 Container:** `web` (Django templates/views), `db` (SQLite), `mail` (SMTP adapter).
- Server-side auth/session + role check in views; one JSON view for the live poll.
- Access control in views; logic in Python services.

### Trade-off matrix

| Criterion | Option A (React + Supabase) | Option B (Django monolith) |
|---|---|---|
| Code volume for one developer | **Small** (auth, sessions, reset, admin, email managed) | Large (ORM, auth, forms, admin) |
| Operational surface | **No server to run** (two managed targets) | One container + DB |
| Explainability at M4 | Weaker (SQL + RLS + BaaS) | **Strong** (own Python code) |
| Mutation testing | Weak (SQL/TS) | **Strong** (`pytest` + `mutmut`) |
| Access control | **One boundary** (RLS) | Per-route checks that can be forgotten |
| Clock integrity | **Structural** (`now()` in the DB) | Correct only if the view is written right |
| Capacity correctness | **Transactional by construction** | Needs `atomic` + row locking |
| Cost | **$0 on free tiers** | ~$5–10/month, fixed |
| Vendor lock-in | High | **None** |

**Recommendation:** **Option A** — it removes the largest block of code a single
developer would write, makes access control one boundary, and makes the check-in clock
structural (NFR-4). It accepts two managed targets and weaker mutation evidence.

**System-specific residual risk:** the role now travels in a JWT. If the role is stored in
`user_metadata` (client-editable), a participant can promote themselves to Provider and every
RLS policy will honour the forged claim. Mitigation: the role lives in `app_metadata` only, and
no policy is written against a client-writable field. See ADR-0004 and
[`risk-register.md`](./risk-register.md) R-08.

---

## 5. Scope ceilings — how Hadir fits

| Ceiling | Hadir plan |
|---|---|
| 6 screens/views | Auth; Provider dashboard (events+sessions); Session/live view; Public events marketplace; Public event detail + register; Analytics. |
| 10 API endpoints | 3 RPC functions (`check_in`, `register_for_event`, `attendance_rate`) + table reads through RLS. No REST API of our own. |
| 8 tables/collections | `users`, `events`, `sessions`, `attendance_records`, `registrations`. |
| 2 user roles | Provider, Participant (Admin dropped; roles live in `app_metadata`). |
| One deployment target | **Knowingly exceeded**: static host + Supabase = two managed targets (ADR-0004). |
| ≥4 required elements | frontend, persistence, access control (RLS), automated tests, security scanning — all present; AI/agentic optional. |

---

## 6. Traceability (sketch)

Every requirement ID above (AC-*, EV-*, SE-*, AT-*, PB-*, AN-*) maps to a user story, a
screen + Supabase artifact (table, RPC, or policy), a table, and a test. The full matrix
is [`traceability.md`](./traceability.md).

---

## 7. Pending confirmation before finalizing M1

1. **Stack:** ~~confirm Option A (Django full-stack + SQLite)~~ — **confirmed 2026-11-11:**
   Option A is now React + Supabase (ADR-0004). Django/SQLite is the rejected Option B.
2. **Scope:** confirm the lean in-scope list above. Certificates, F2F/GPS,
   file uploads, and WebSocket real-time have been removed/deferred to keep
   requirements within the ceilings.
3. **Admin role:** confirm we drop the System Admin role (keeps us at 2 roles).
