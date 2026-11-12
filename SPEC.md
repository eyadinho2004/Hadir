# SPEC.md — Feature/workflow specification (template)

> SWE 485 — Advanced Software Engineering with AI. Copy this file per feature or
> workflow (`SPEC-<feature>.md`), fill it, and write it **before generation**. The
> M4 engineering brief uses a committed `SPEC.md` as its *Specification* evidence.

---

## Feature

> Replace with the feature/workflow name and its requirement IDs (from
> `docs/m1/requirements.md`).

**Name:** `<name>` · **Requirement IDs:** `<ID…>` · **Milestone:** `<M2/M3/M4>`

## 1. Goal

> One sentence: what this unit must achieve.

## 2. Given–When–Then

> Include the **happy path**, the **failure path**, and at least one **boundary case**.

- **Given** <precondition>, **when** <action>, **then** <expected>.
- **Given** <failure condition>, **when** <action>, **then** <error/behavior>.
- **Boundary:** <at/over a limit>, **then** <behavior>.

## 3. Constraints

- **Stack:** Python/Django, server-rendered templates, Django ORM + SQLite.
- **Scope ceilings touched:** <views/endpoints/tables/roles>.
- **Other:** <e.g., auth on every provider route, NFR-4 server-side time>.

## 4. Non-goals

> What this unit must **not** do.

- <explicit exclusions>

## 5. Input / output / error contracts

- **Inputs:** <types, formats, validation>
- **Outputs:** <types, formats>
- **Errors:** <codes/messages, HTTP statuses>

## 6. Worked example

> One concrete in/out pair.

- **In:** <input>
- **Out:** <expected output>

## 7. Source files

> Files, DB tables, and views this change touches.

- **Files:** `<file paths>`
- **Tables:** `<table names>`
- **Views/URLs:** `<routes>`

## 8. Security constraints

- Auth/role check on provider-only and check-in routes.
- **Server-side** check-in timestamp only (never client-provided) — NFR-4.
- No secrets in code or logs.

## 9. Tests with an independent oracle

> A test that catches a bug even if the implementation is wrong.

- <test name — what it asserts and why it is an independent oracle>

---

## Worked example — QR check-in (AT-01/AT-02)

**Name:** QR check-in · **Requirement IDs:** AT-01, AT-02 · **Milestone:** M2

### Goal
Mark a participant `present` or `late` for an Active session by scanning the session
QR with the web camera, using the **server** clock.

### Given–When–Then
- **Given** the session is `Active` and the participant is logged in, **when** the
  QR check-in arrives within `creation_time + allowed_lateness`, **then** the status
  is `present`.
- **Failure:** **Given** the session is `Closed`, **when** a check-in is posted,
  **then** the request is rejected with a message and no record is written.
- **Boundary:** **Given** the check-in arrives after the lateness window, **then** the
  status is `late`.

### Constraints
- Django + SQLite; access controlled by a server-side role check.
- Uses the **server** timestamp (`test_checkin_uses_server_time`, NFR-4).

### Non-goals
- No F2F/GPS geolocation verification; no ability for a client to back-date the time.

### Input / output / error contracts
- **In:** POST `/sessions/<id>/checkin/` with the scanned QR string + authenticated user.
- **Out:** 201 with `{status: present|late}`; stored `attendance_records` row.
- **Errors:** 404 (no session), 409 (session not Active), 422 (malformed QR).

### Worked example
- **In:** session created at 09:00, `allowed_lateness=15`; QR scanned at 09:10.
- **Out:** `present` (10 ≤ 15).

### Source files
- `sessions/views.py`, `attendance/views.py`; tables `sessions`, `attendance_records`;
  routes `sessions:live`, `attendance:checkin`, `attendance:scan`.

### Security constraints
- Server-side timestamp at request time; role check; no secrets.

### Tests with an independent oracle
- `test_checkin_uses_server_time`: posts a **back-dated** client timestamp and asserts
  the stored status matches server time (would pass only if the code ignores the
  client value); `test_checkin_present_within_window`, `test_checkin_late_after_window`.
