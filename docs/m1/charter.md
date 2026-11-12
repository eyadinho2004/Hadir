# Hadir (حاضر) — M1 Charter

> SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> Milestone M1 | Due 21 Oct 2026 | Part of the M1 package.
> Companion to [`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md).

---

## 1. Team members

| Name | ID | Role on the project |
|---|---|---|
| EYAD ALSALAMAH | 444101342 | Full-stack (React, SQL/RLS, tests, review) |

> The brief requires there to be **no member who cannot explain a committed file**.
> EYAD ALSALAMAH is full-stack and owns the whole package for M1.

---

## 2. Stakeholder problem

Organizing a workshop, seminar, or training program involves many manual, scattered
tasks — registrations, attendance tracking, issuing certificates, grades, and
reports. There is no single platform that gathers events across fields (technology,
full lifecycle, so organizers juggle
spreadsheets, email, and paper, and participants have no one place to find events
and track their own attendance. The result is a slow, error-prone process with
untrustworthy attendance and reporting numbers.

---

## 3. Product scope (in scope)

**Product.** Hadir is an all-in-one **web-only** platform that lets a **Provider**
create/publish events and sessions, run live attendance via **QR code**, export
attendance, and view analytics — while a **Participant** browses public events,
registers, attends, and tracks their own attendance.

**Two user roles only (to respect the scope ceiling):**
- **Provider** — organizes and manages events/sessions/attendance/analytics.
- **Participant** — browses, registers, attends, and tracks their own attendance.

**In-scope functional areas** (full requirement IDs in
[`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md) §2.1):

- **Core platform (AC-01…AC-03):** account creation with email/password + role
  choice, login/logout, password reset via emailed link.
- **Event management (EV-01…EV-04):** create/edit/delete events, auto provider +
  timestamp, event list, event detail with linked sessions and notes.
- **Session management (SE-01…SE-08):** standalone or event-linked sessions, title +
  QR method, optional lateness/duration/notes, unique QR string, Draft/Active/Closed
  states, auto-close on duration, session list, live view (lightweight polling).
- **Attendance (AT-01…AT-04):** present/late rule on server time, web-camera QR
  check-in, CSV export, per-participant aggregate.
- **Public events (PB-01…PB-07):** private/public visibility, required public
  fields, Draft/Published/Closed, auto-close at deadline, public list with
  filters/search, public detail, registration + cancellation + capacity.
- **Analytics (AN-01…AN-02):** attendance rate percentage, filter by event.

---

## 4. Explicit non-goals (out of scope for Hadir M1)

The following are **deliberately excluded** (see §2.2 of
[`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md) for the full
reasoning):

- **Certificates** (template upload, name positioning, eligibility, email dispatch,
  PDF download).
- **Mobile app** (React Native) — web only.
- **Face-to-face (F2F) with GPS/geolocation + radius verification** — QR-only.
- **File / link / media upload & notes attachments**.
- **Real-time live monitoring via WebSocket** — uses lightweight polling.
- **Participant performance categorization** (Perfect / Frequently Late).
- **Payments / monetization** (HyperPay, Mada, VAT/ZATCA e-invoicing, credit notes,
  refunds).
- **CRM** (contacts, organizations, leads, pipeline).
- **eLearning** (SCORM, modules, progress tracking), **customer portal**,
  **marketing** (Mailchimp, GA/Tag Manager).
- **Advanced reports/scheduling** (template sets, calendar conflict detection,
  presenters, venues, catering).
- **i18n Arabic/English** and **dark mode** — deferred.
- **System Admin role**, public REST API/webhooks/Zapier, Zoom integration.
- Any feature tagged **Normal/Low** priority that the in-scope list above does not
  already cover.

---

## 5. Declared implementation language & stack

- **Language/framework:** **TypeScript, full-stack front end** — React (Vite) with the
  `supabase-js` client; SQL for the database rules and policies.
- **Backend:** **Supabase** (managed) — Supabase Auth for identity, PostgreSQL for data,
  RLS policies for authorization, and three SQL functions for the business rules. No server
  code is written or operated by the team.
- **Persistence:** PostgreSQL (Supabase free tier).
- **Email:** Supabase Auth (password reset and registration confirmation).
- **Deployment:** a static host for the front end plus Supabase — **two managed targets**
  (a knowing break of the one-target ceiling, recorded in ADR-0004).
- **Testing:** Vitest for the front end; SQL assertions for the three functions.

> Declared at M1 per the brief. Changing the primary language afterward forfeits the Week 10
> mutation-gauntlet marks.
>
> **Revision note (2026-11-11):** this replaces the M1 declaration (Python/Django). The
> change is recorded in [ADR-0004](./adr/0004-adopt-react-on-supabase-over-django.md) and
> accepts the stated consequence — the Week 10 mutation marks are now at risk because the
> delivered language is TypeScript/SQL.

---

## 6. Success measures (charter level)

- A Provider can publish an event, run a QR session, and export attendance end to end.
- A Participant can discover a public event, register, check in by QR, and see an
  aggregate attendance record.
- All in-scope requirements are traceable to a story, scenario, screen/artifact, table, and
  test (see the traceability matrix).
- The chosen architecture fits the size ceilings it can (6 views, 10 endpoints, 8 tables,
  2 roles) and **knowingly exceeds one** — one deployment target, now two managed targets
  (recorded in ADR-0004, not silently).
