# ADR-0004: Adopt a React front end on Supabase over the Django monolith

- **Status:** Accepted
- **Date:** 2026-11-11
- **Deciders:** Hadir team (M1 revision)
- **Related requirements:** AC-01, AC-02, AC-03, AT-01, AT-02, AN-01, NFR-2, NFR-4, NFR-8
- **Supersedes:** [ADR-0001](./0001-adopt-django-monolith-over-firebase.md), [ADR-0002](./0002-sqlite-via-django-orm.md)

## Context

The build is delivered by **one developer**. The earlier decisions (ADR-0001, ADR-0002)
chose a Django monolith on SQLite. That choice is defensible for a pair: every rule has
one home, the stack is testable with `pytest`, and there is one deployment target.

For a single developer it also carries work that no requirement asks for: authentication,
session management, password reset, forms and CSRF, an admin surface, an ORM, migrations,
and an email path. That is the largest block of code in the project, and none of it is the
product. The product is the attendance loop: event → session → QR check-in → status → export.

The alternative is to take those layers as managed services. Supabase provides Auth,
PostgreSQL, RLS, and an admin Studio; the front end becomes a React SPA that talks to them
through `supabase-js`.

## Decision

**Adopt Option A: a React single-page front end (Vite + `supabase-js`) on a static host,
backed by Supabase.**

- **Identity:** Supabase Auth (sign-up, sign-in, password reset, confirmation email).
- **Data:** managed PostgreSQL — 5 tables: `users`, `events`, `sessions`,
  `attendance_records`, `registrations`.
- **Authorization:** RLS policies on all five tables, reading the role claim from the JWT.
- **Business rules:** three SQL functions — `check_in()`, `register_for_event()`,
  `attendance_rate()`.
- **Lifecycle:** derived at read from `closes_at` / `registration_deadline`; no scheduler.
- **Live view:** the client polls a `select` every 5 seconds.

## Consequences

**Positive.**

- Removes the largest block of code one developer would write: identity, sessions, reset,
  admin, email, ORM, and migrations.
- Access control becomes **one boundary**: an RLS policy applies to every query, so a route
  cannot silently lose its check.
- The check-in status becomes **structural**: `check_in()` reads `now()` inside the database,
  so a forged client timestamp has no path into the decision (NFR-4).
- Capacity-limited registration is **transactional by construction** in
  `register_for_event()` (PB-07).
- No server is operated, so there is nothing to patch or keep awake.

**Accepted downside (explicitly accepted).**

- **Two managed targets** (static host + Supabase), which breaks the "one deployment
  target" ceiling. This is a knowing break, recorded here and in
  [`../risk-register.md`](../risk-register.md) R-02, not a silent one.
- **Weaker mutation evidence.** The declared language is no longer Python, so the Week 10
  mutation work moves to SQL and TypeScript, where the tooling is thinner and the marks are
  at risk.
- **Vendor coupling.** Auth, database, and email depend on one provider.
- **Quotas replace a fixed bill.** Free-tier limits (database size, monthly active users,
  email rate, project pause on inactivity) are now part of the risk surface.

**Rejected option:**

- **Option B (Django monolith on SQLite)** was rejected for this delivery because it makes
  one developer own the identity, session, admin, ORM, and email layers — the largest part of
  the codebase — while the requirements only need the attendance loop. It remains the better
  choice if the graded evidence must be Python: it is stronger at M4 explanation and at
  mutation testing.

See [`../architecture.md`](../architecture.md) §8 for the rationale and
[`../coupling-report.md`](../coupling-report.md) for the coupling evidence.
