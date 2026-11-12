# Hadir (حاضر) — M1 Requirements

> SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> Milestone M1 | Part of the M1 package.
> Requirement IDs (AC-\*, EV-\*, SE-\*, AT-\*, PB-\*, AN-\*) are defined in
> [`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md) §2.1 and
> reused here verbatim.

---

## 1. Simulated personas

The brief requires at least one simulated persona; we model two so both roles are
exercised.

### Persona 1 — "أحمد" (Provider)

**Profile:** Ahmed runs a small training center in Riyadh. He organizes workshops,
seminars, and short training programs across several fields. He is not a developer
and works mainly from a laptop browser.

**Goals:** create and publish events quickly, manage sessions without spreadsheets,
run accurate live attendance, and report attendance rates to sponsors.

**Frustrations today:** registrations arrive by email and phone, attendance is on
paper, and reports are manual — so numbers are often wrong and late.

### Persona 2 — "سارة" (Participant)

**Profile:** Sarah is a university student who signs up for free workshops and
training programs to build her CV. She uses a phone and a laptop to browse and
register.

**Goals:** discover public events by category, register before the deadline, get a
confirmation, and check her own attendance record.

**Frustrations today:** event pages are scattered, registration is email-only, and
she has no single place to see which sessions she actually attended.

---

## 2. User stories

### Core platform
- **AC-01** As a visitor, I want to create an account with email and password and
  choose my role (Provider or Participant), so registration matches how I will use
  Hadir.
- **AC-02** As a user, I want to log in and log out so my data is protected.
- **AC-03** As a user, I want to reset my password via an emailed link so I can
  recover access.

### Event management (Provider)
- **EV-01** As a Provider, I want to create, edit, and delete an event with a
  mandatory name and a system-generated code so events are uniquely identifiable.
- **EV-02** As a Provider, I want the event auto-linked to my account and
  timestamped on creation so I do not enter it manually.
- **EV-03** As a Provider, I want an event list showing name, code, creation date,
  and session count so I can see my portfolio at a glance.
- **EV-04** As a Provider, I want an event detail page where I can add linked
  sessions and notes so event context stays in one place.

### Session management (Provider)
- **SE-01** As a Provider, I want to create a session either standalone or linked to
  an event so sessions fit my workflow.
- **SE-02** As a Provider, I must provide a title and an attendance method (QR) for
  each session.
- **SE-03** As a Provider, I may set notes, allowed lateness (default 15 minutes),
  and duration (for auto-close) per session.
- **SE-04** As a Provider, I want the system to generate a unique random QR string
  stored with the session so attendees can check in.
- **SE-05** As a Provider, I want sessions to have Draft / Active / Closed states
  that I can change manually.
- **SE-06** As a Provider, I want a session to auto-close when its duration is
  reached so attendance closes reliably.
- **SE-07** As a Provider, I want a session list with title, status, creation date,
  method, lateness, duration, event, and attendance count.
- **SE-08** As a Provider, I want a live session view (title, notes, status, QR,
  attendance) that polls lightly.

### Attendance (QR-only)
- **AT-01** As a Participant, I want my attendance marked present or late based on
  check-in time so my status is automatic and fair.
- **AT-02** As a Participant, I want to scan the QR with my web camera to check in.
- **AT-03** As a Provider, I want to export a session's attendance to CSV so I can
  share or report it.
- **AT-04** As a Participant, I want an aggregate view of my attendance (total,
  present, late, list) so I can track it.

### Public events
- **PB-01** As a Provider, I want to publish an event as Private or Public.
- **PB-02** As a Provider, publishing publicly requires category, description, start
  date, end date, and registration deadline.
- **PB-03** As a Provider, publication states are Draft / Published / Closed, and
  auto-close applies at the registration deadline.
- **PB-04** As a visitor, I want a public events page showing name, category,
  provider, dates, description, and registration status.
- **PB-05** As a visitor, I want to filter by category/date/provider/status and
  search by keyword.
- **PB-06** As a visitor, I want a public event detail page with schedule, provider,
  deadline, and total registered.
- **PB-07** As a Participant, I want to register for a public event (blocked when
  closed/full), get a confirmation email, and cancel before the deadline. As a
  Provider, I want to set capacity and view/cancel registrations.

### Analytics
- **AN-01** As a Provider, I want the attendance rate as a percentage
  `(totalAttended / totalSessions) * 100`.
- **AN-02** As a Provider, I want analytics filterable by event so counts reflect
  that event only.

---

## 3. Use cases & scenarios

### UC-01 — Create an account (AC-01)
**Actors:** Visitor. **Precondition:** none. **Postcondition:** an active account
exists with the chosen role.

- **Happy path:** Visitor opens Register, enters email + password + confirmation,
  selects role (Provider/Participant), submits → system validates, creates the
  account, logs the visitor in, redirects to a role-appropriate home.
- **Failure:** Email already registered → inline error, no account created.
- **Failure:** Passwords don't match or are too short → inline error, form values
  retained.
- **Boundary:** Email whitespace and case are normalized before the uniqueness check.

### UC-02 — Register for a public event (PB-07)
**Actors:** Participant. **Precondition:** logged in as Participant; event is
Published and not Closed/Full. **Postcondition:** registration record + confirmation
email.

- **Happy path:** Participant opens event detail, clicks Register → system records
  UID + timestamp, increments count, sends confirmation, shows "Registered".
- **Boundary:** Capacity reached → status becomes "Full", further registration
  blocked.
- **Boundary:** Past deadline → event auto-closes, registration blocked.
- **Failure path:** Not logged in → redirected to login, then back to the event.

### UC-03 — Mark attendance by QR (AT-01/AT-02)
**Actors:** Participant. **Precondition:** session is Active; Participant logged in.
**Postcondition:** attendance record with present/late status based on **server**
time.

- **Happy path:** session is Active, Participant scans QR, check-in arrives within
  `creation_time + allowed_lateness` → status **present**.
- **Boundary:** check-in after the lateness window → status **late**.
- **Failure:** session Closed → check-in rejected with a message.
- **Security (residual risk):** status is derived from the **server** check-in
  timestamp, never the client-provided one (see the architecture doc's residual risk).

### UC-04 — Export attendance to CSV (AT-03)
**Actors:** Provider. **Precondition:** session exists. **Postcondition:** CSV with
session title, student name, student email, status, and timestamp.

- **Happy path:** Provider clicks Export on the session → file downloads with the
  expected header and rows.
- **Boundary:** no attendance → CSV has just the header row.

### UC-05 — View attendance analytics (AN-01/AN-02)
**Actors:** Provider. **Precondition:** at least one session with counts.
**Postcondition:** percentage shown and filterable by event.

- **Happy path:** Provider opens Analytics → sees overall rate; selects an event →
  counts reflect only that event's sessions.
- **Edge:** no sessions for the filtered event → rate shown as 0% (or "N/A"), never
  a divide-by-zero.

---

## 4. Functional requirements

The functional requirement set is the ID list in
[`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md) §2.1:

**AC-01…AC-03, EV-01…EV-04, SE-01…SE-08, AT-01…AT-04, PB-01…PB-07, AN-01…AN-02.**

Each ID maps to one row in the traceability matrix (`traceability.md`). The user
stories above state each requirement in Given–When–Then form at the story level, and
the scenarios in §3 give the failure and boundary cases the brief requires.

---

## 5. Non-functional requirements (testable quality-attribute scenarios)

### NFR-1 Performance
- **Given** an event with up to 500 registered participants, **when** the Provider
  opens the live session view, **then** initial load and each poll return in under 2
  seconds on the reference host, with a poll interval of no more than 5 seconds.
- **Threshold:** p95 page render < 2 s; measured under the stated load.

### NFR-2 Security — access control
- **Given** a logged-in Participant, **when** they attempt a Provider-only operation
  (create an event, export attendance, open analytics), **then** the operation returns no
  rows or is rejected by the RLS policy, and nothing is written.
- **Threshold:** every table has a positive test (the owner sees the row) and a negative
  test (the other role sees zero rows), including a forged role claim.

### NFR-3 Security — password handling
- **Given** a new account, **when** it is created, **then** the password is stored
  using a salted, adaptive hash (Supabase Auth / GoTrue), never in plain text or a
  reversible form.
- **Threshold:** a test inspects the stored value and asserts it is not the raw
  password.

### NFR-4 Integrity — attendance status
- **Given** a check-in request carrying a forged earlier timestamp, **when** it is
  recorded, **then** the stored status uses the server-side time, so the forged value
  cannot change present/late.
- **Threshold:** a test posts a back-dated client timestamp and asserts the stored
  status matches the server time.

### NFR-5 Usability
- **Given** a first-time Provider, **when** they create an event and a session,
  **then** the flow completes without leaving the app and uses no more than four
  screens.
- **Threshold:** measured via a scripted task; success rate ≥ 80% on first attempt.

### NFR-6 Reliability — session auto-close
- **Given** a session with a duration, **when** that duration elapses, **then** the
  session transitions to Closed and rejects further check-ins.
- **Threshold:** a unit test advances time and asserts Closed + rejected check-in.

### NFR-7 Reliability — registration auto-close
- **Given** a published event, **when** the registration deadline passes, **then**
  the event closes and registration is blocked.
- **Threshold:** a unit test advances past the deadline and asserts the status change
  and the blocked registration.

### NFR-8 Portability / deployability
- **Given** a fresh clone of the repository on the reference environment, **when** the
  documented setup steps are run, **then** the app starts against the managed Supabase
  project with one documented setup (env vars + `supabase db push`) — no server we run.
- **Threshold:** the M4 drift hunt re-checks these exact steps. The stack uses **two managed
  targets** (static host + Supabase); that is a recorded decision, not drift (ADR-0004).

### NFR-9 Maintainability
- **Given** the codebase, **when** the test suite is executed (Vitest for the client, SQL
  assertions for the three functions and the policies), **then** the suite passes and each
  functional requirement has at least one linked test.
  test.
- **Threshold:** coverage is measured and reported at M2/M3; no functional
  requirement is left untested.

---

## 6. Human correction log (AI requirements draft)

This section records, for each AI-drafted requirement item, what a human reviewed and
changed (if anything). The M1 brief requires this log as part of Requirements.

| Date | Req / Section | What AI drafted | What the human corrected | Reason |
|---|---|---|---|---|
| 2026-10-18 | Scope (§2.2/charter §4) | Drafted a broad scope: certificates, F2F/GPS, WebSocket real-time, payments, CRM, eLearning, etc. | Moved all of them to the explicit non-goals list, keeping only the lean in-scope set. | Scope ceilings (6 views / 10 endpoints / 8 tables / 2 roles / one target) for a 1–2 member MVP. |
| 2026-10-18 | Architecture (§2–3) | Drafted a single **mixed/ambiguous** design combining a Django-style backend, an SPA, and a BaaS persistence layer. | Split it into **two genuinely distinct options** (A: Django monolith; B: Firebase BaaS); the coupling check then flagged the mix and cleared Option A. | Distinctness, explainability, and M2/M3 mutation-testability (see coupling-report §2–3). *Both options were re-decided on 2026-11-11 — see the row below.* |
| 2026-10-18 | SE-08 / NFR-1 (real-time) | Wrote the live view as "WebSocket/polling". | Fixed to **lightweight HTTP polling** only; WebSocket is an explicit non-goal. | Consistency with the non-goals list (coherence break C-01). |
| 2026-11-11 | §2.3 NFR-2/3/8/9, §2.2 stack | Kept the requirements worded for Django after the stack decision changed (403 redirects, Django hasher, "one command + SQLite on one host"). | Reworded to RLS denials with paired positive/negative policy tests, Supabase Auth hashing, and a documented setup against the managed database. | Conformance with ADR-0004 (coherence C-06). |
> The rows above are grounded in the repository evidence and are the basis for the
> AI-use disclosure (see [`AI_USE_DISCLOSURE.md`](./AI_USE_DISCLOSURE.md)).
