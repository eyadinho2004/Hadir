# Hadir (حاضر) — M1 Traceability Matrix

> SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> Milestone M1 | Part of the M1 package.
>
> Every in-scope requirement ID maps to a user story, a use case/scenario, a planned
> screen and its Supabase artifact (table, RPC function, or policy), the backing table,
> and the test that verifies it. The brief requires **verified links** — this matrix is
> the single source of truth; any row without a test is treated as a traceability gap.

## Conventions

- **Requirement IDs** are from [`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md) §2.1.
- **Story** references the matching story ID in [`requirements.md`](./requirements.md) §2.
- **Scenario** references a use case (UC-xx) or a non-functional scenario (NFR-x).
- **Screen / artifact** is the planned M2 React screen plus the Supabase artifact it calls:
  `rpc:<name>` for an SQL function, `<table> (select|insert|update|delete)` for a table
  operation under RLS, or `auth:<method>` for Supabase Auth.
- **Table** is from the scope's table list: `users`, `events`, `sessions`,
  `attendance_records`, `registrations`.
- **Test** names the planned test(s) that must pass for that requirement.

---

## 1. Requirements ↔ Story ↔ Scenario ↔ Screen/Artifact ↔ Table ↔ Test

| Req | Story | Scenario | Screen / Artifact | Table | Test |
|---|---|---|---|---|---|
| AC-01 | AC-01 | UC-01 | Auth screen · `auth:signUp` | users | `test_register_creates_user`, `test_register_duplicate_email`, `test_register_password_mismatch` |
| AC-02 | AC-02 | — | Auth screen · `auth:signInWithPassword` / `signOut` | users | `test_login_success`, `test_login_wrong_password`, `test_logout` |
| AC-03 | AC-03 | — | Auth screen · `auth:resetPasswordForEmail` | users | `test_password_reset_link`, `test_password_reset_token_expired` |
| EV-01 | EV-01 | — | Provider dashboard · `events` (insert/update/delete) | events | `test_event_create_code_generated`, `test_event_edit`, `test_event_delete` |
| EV-02 | EV-02 | — | Provider dashboard · `events` (default `provider_id = auth.uid()`, `created_at = now()`) | events | `test_event_auto_provider_and_timestamp` |
| EV-03 | EV-03 | — | Provider dashboard · `events` (select, owner policy) | events | `test_event_list_fields` |
| EV-04 | EV-04 | — | Event detail · `events` + `sessions` (select/insert) | events, sessions | `test_event_detail_adds_session` |
| SE-01 | SE-01 | — | Event detail / session screen · `sessions` (insert) | sessions | `test_session_create_standalone_and_linked` |
| SE-02 | SE-02 | — | Session screen · `sessions` (not-null constraints) | sessions | `test_session_mandatory_title_and_method` |
| SE-03 | SE-03 | — | Session screen · `sessions` (column defaults) | sessions | `test_session_optional_fields_defaults` (lateness 15) |
| SE-04 | SE-04 | — | Session screen · `sessions` (`qr_string` default `gen_random_uuid()`) | sessions | `test_session_generates_unique_qr_string` |
| SE-05 | SE-05 | — | Session screen · `sessions` (update, owner policy) | sessions | `test_session_status_transition_manual` |
| SE-06 | SE-06 | NFR-6 | Session screen · derived state from `sessions.closes_at` | sessions | `test_session_auto_close_after_duration` |
| SE-07 | SE-07 | — | Session screen · `sessions` (select, owner policy) | sessions | `test_session_list_columns` |
| SE-08 | SE-08 | NFR-1 | Session live screen · `sessions` + `attendance_records` (poll every 5 s) | sessions, attendance_records | `test_live_view_poll_payload` |
| AT-01 | AT-01 | UC-03 / NFR-4 | Participant check-in screen · `rpc:check_in` | attendance_records | `test_checkin_present_within_window`, `test_checkin_late_after_window`, `test_check_in_ignores_client_time` |
| AT-02 | AT-02 | UC-03 | Participant check-in screen (QR camera) · `rpc:check_in` | attendance_records | `test_qr_scan_marks_attendance` |
| AT-03 | AT-03 | UC-04 | Session live screen · `attendance_records` (select, owner policy) → CSV in the client | attendance_records | `test_export_csv_schema`, `test_export_empty` |
| AT-04 | AT-04 | — | Participant attendance screen · `attendance_records` (select, self policy) | attendance_records | `test_aggregate_per_participant` |
| PB-01 | PB-01 | — | Provider dashboard · `events.visibility` (update) | events | `test_event_visibility_private_public` |
| PB-02 | PB-02 | — | Provider dashboard · `events` (not-null on publish fields) | events | `test_public_event_required_fields` |
| PB-03 | PB-03 | NFR-7 | Public marketplace · derived state from `events.registration_deadline` | events | `test_event_auto_close_deadline` |
| PB-04 | PB-04 | — | Public marketplace · `events` (select, public policy) | events | `test_public_list_fields` |
| PB-05 | PB-05 | — | Public marketplace · `events` (select with filter/search) | events | `test_filter_by_category_date_provider_status`, `test_search_keyword` |
| PB-06 | PB-06 | — | Public event detail · `events` (select, public policy) | events | `test_public_detail_fields` |
| PB-07 | PB-07 | UC-02 | Public event detail · `rpc:register_for_event` | registrations, events | `test_register_blocked_when_full`, `test_register_blocked_after_deadline`, `test_confirmation_email`, `test_cancel_before_deadline` |
| AN-01 | AN-01 | UC-05 | Analytics screen · `rpc:attendance_rate` | sessions, attendance_records | `test_attendance_rate_percent`, `test_no_divide_by_zero` |
| AN-02 | AN-02 | UC-05 | Analytics screen · `rpc:attendance_rate` (event filter) | sessions, attendance_records | `test_filter_analytics_by_event` |

**Total requirements traced: 28.**
- Groups: AC (3), EV (4), SE (8), AT (4), PB (7), AN (2).
- Supabase artifacts: **3 RPC functions**, **5 tables**, **one RLS policy set per table** —
  within the scope ceilings in [`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md) §5.

---

## 2. Explicit non-goals (no traceability)

These are **deliberately excluded** and therefore have **no requirement ID, no screen,
and no test**. They appear here only to prove there is no orphan/accidental link (the
brief requires explicit non-goals). Full list: [`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md) §2.2.

- Certificates, mobile app, F2F/GPS location verification, file/media uploads,
  WebSocket real-time, participant categorization, payments/CRM/eLearning,
  advanced scheduling, i18n/dark mode, System Admin role, public REST API/webhooks,
  Zoom, and any Normal/Low item not already covered.

---

## 3. Verification notes (how the links are "verified")

- Each row is traced one way: **requirement → story → scenario → screen/artifact → table → test**.
- No requirement appears without a test name (gap check).
- No test name exists without a backing requirement (orphan check).
- The planned screens and artifact names are placeholders for M2; they will be reconciled
  against the implemented components, SQL functions, and policies at M2/M4 (drift hunt).
- Every table named here has both a positive and a negative RLS test (NFR-2), so an
  access-control gap cannot hide in an untested policy.
- Certificates and GPS/F2F are in the non-goals block (§2) and are **not** in the 28.
