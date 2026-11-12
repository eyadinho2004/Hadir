# ADR-0001: Adopt Django monolith + server-rendered UI over Firebase BaaS

- **Status:** Superseded by [ADR-0004](./0004-adopt-react-on-supabase-over-django.md)
- **Date:** 2026-10-18
- **Deciders:** Hadir team (M1)
- **Related requirements:** AT-01, AT-02, NFR-1, NFR-2, NFR-4, NFR-8, NFR-9
- **Supersedes:** (none)

## Context

Hadir is a web-only attendance platform with two roles (Provider, Participant),
one deployment target, SQLite persistence, and email for reset/confirmation. The
team must build and, at M4, explain and defend every line. Two architectures were
put forward (see [`../architecture.md`](../architecture.md) §2–3):

- **Option A** — Django monolith, server-rendered templates, Django ORM + SQLite,
  Django auth for access control; a single host.
- **Option B** — React SPA on a static host + Firebase Auth, Cloud Firestore, Cloud
  Functions, FCM/email; no custom server.

## Decision

**Adopt Option A: a single Django project (templates + views + ORM) on one host,
with SQLite persistence and DJango auth-role checks in views.** Django REST
Framework is optional and only for the pieces that need a JSON API.

## Consequences

**Positive.**

- Fits the "one deployment target" ceiling exactly (one container + SQLite volume).
- One enforcement point per rule: the status rule and access control live in Django
  views; there is no client-side copy of domain logic.
- Directly unit-testable via `pytest-django` (critical for M2/M3 mutation work).
- Every request/response is server-rendered and explainable line-by-line.
- Cost is near-fixed (one host), no pay-per-use surprise.

**Accepted downside (explicitly accepted):**

- We give up the managed **real-time** attendance and the zero-ops scaling of a BaaS.
  We accept **lightweight HTTP polling** for the live session view (SE-08 / NFR-1)
  and operate a single host ourselves. At student scale (up to 500 participants,
  NFR-1) polling every ≤5 s is sufficient.

**Rejected option:**

- **Option B (Firebase BaaS + React SPA)** was rejected because it is
  multi-service (violates the one-deployment-target ceiling), is harder to
  mutation-test and defend line-by-line, is opaque (BaaS "magic"), and bills
  pay-per-use with no hard cap (see [`../cost-model.md`](../cost-model.md) §3).

See [`../architecture.md`](../architecture.md) §8 for the full rationale and
[`../coupling-report.md`](../coupling-report.md) for the coupling evidence.
