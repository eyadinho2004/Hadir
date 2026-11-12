# ADR-0002: Use SQLite via the Django ORM (no separate database service)

- **Status:** Superseded by [ADR-0004](./0004-adopt-react-on-supabase-over-django.md)
- **Date:** 2026-10-18
- **Deciders:** Hadir team (M1)
- **Related requirements:** NFR-8, NFR-9, EV-01..EV-04, SE-01..SE-08, AT-01..AT-04,
  PB-01..PB-07, AN-01..AN-02
- **Supersedes:** (none)

## Context

Persistence must serve a single-host, student-scale, two-role web app with at most
8 tables (`users`, `events`, `sessions`, `attendance_records`, `registrations`, and
optional settings/email logs). The project must run from a fresh clone with one
documented command (NFR-8) and be trivially explainable (M4). Options were a
separate database server (e.g., PostgreSQL) or a managed NoSQL database.

## Decision

**Use SQLite as the database, accessed only through the Django ORM.** The SQLite
file lives on the same volume as the app; there is no external database service.

## Consequences

**Positive.**

- Zero separate service cost (see [`../cost-model.md`](../cost-model.md) §2).
- Simple portability: a fresh clone runs with the default SQLite DB (NFR-8).
- The ORM gives a single, testable persistence seam; repository/domain rules are
  unit-testable against the ORM (NFR-9).

**Accepted downside (explicitly accepted):**

- SQLite is a **single-writer** store with no horizontal write scaling and limited
  concurrency. At the stated scale (up to ~1,000 check-ins/month, ≤500 at one event)
  this is well within SQLite's capabilities; we accept it and do not engineer for
  multi-writer or sharded writes.

**Rejected option:**

- **A separate database server (PostgreSQL) or managed NoSQL (Firestore)** was
  rejected because it adds a second deployment target/service, complicates the
  fresh-clone setup, and increases cost and explainability burden for no benefit at
  this scale. Firestore additionally puts access control in security rules outside
  our code (see ADR-0001).
