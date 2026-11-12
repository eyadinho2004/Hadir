# Hadir (حاضر) — M1 Risk Register

> SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> Milestone M1 | Part of the M1 package.
>
> Risks for the **chosen** architecture (Option A — React front end on Supabase, see
> [`architecture.md`](./architecture.md) §8 and
> [ADR-0004](./adr/0004-adopt-react-on-supabase-over-django.md)).
> Each risk has a **measurable alert threshold** and a **named owner**. The project is
> delivered by one member, who is full-stack and can explain every part; each risk has a
> primary owner for accountability.
>
> **Team:** EYAD ALSALAMAH (444101342).
>
> Thresholds are **alert** levels (act when crossed), not hard failures. The
> **top 3** are the ones to present in the M1 review session.

---

## Top 3 risks (prepare these for review)

### R-01 — Attendance-status integrity (residual trust-boundary risk)
- **Owner:** EYAD ALSALAMAH
- **What happens:** a client-sent (back-dated) timestamp is used to derive `present`.
- **Alert threshold:** any code path where a client-supplied timestamp reaches the status
  decision, **or** any test that does not assert server time passes.
- **Detection:** run `test_check_in_ignores_client_time` (NFR-4) and read `check_in()`;
  a failing/missing test is the trigger.
- **Mitigation:** the status is decided inside the SQL function `check_in()` from
  `now()`; there is no client-side copy of the rule (ADR-0003, ADR-0004).

### R-02 — Scope drift breaks a ceiling (6 views / 10 endpoints / 8 tables / 2 roles)
- **Owner:** EYAD ALSALAMAH
- **Alert threshold:** any new view, table, SQL function, or policy beyond the plan
  (5 tables, 3 functions, one policy set per table), or a third role, or any new
  requirement ID without a traceability row.
- **Detection:** run the traceability gap check in [`traceability.md`](./traceability.md)
  and count tables/functions/policies before each milestone (M2–M4).
- **Mitigation:** keep the explicit non-goals list
  ([`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md) §2.2); get
  instructor approval before any scope add.
- **Note:** the **one deployment target** ceiling is knowingly exceeded (static host +
  Supabase = two managed targets). That is a recorded decision (ADR-0004), **not** drift;
  any *further* target is drift.

### R-03 — Session / registration auto-close reliability (NFR-6, NFR-7)
- **Owner:** EYAD ALSALAMAH
- **Alert threshold:** any session still `Active` after its duration, or any registration
  accepted after the deadline.
- **Detection:** tests that advance the clock (`test_session_auto_close_after_duration`,
  `test_event_auto_close_deadline`) must pass at M2.
- **Mitigation:** the lifecycle state is **derived at read** from `closes_at` and
  `registration_deadline` — there is no scheduler to fall behind, so a late write is
  impossible rather than merely unlikely.

---

## Remaining risks

### R-04 — Live polling exceeds the performance or egress budget (NFR-1)
- **Owner:** EYAD ALSALAMAH
- **Alert threshold:** p95 render of the live session view ≥ 2 s, a poll interval > 5 s,
  or free-tier egress above **80% of the monthly allowance**.
- **Detection:** measure in the M2 load check; check the Supabase usage panel weekly.
- **Mitigation:** poll a narrow `select` (columns only, no joins), lazy-load the attendance
  list, index `session_id` on `attendance_records`, and stop polling when the tab is hidden.

### R-05 — Tests too weak to survive the M2/M3 mutation gauntlet
- **Owner:** EYAD ALSALAMAH
- **Alert threshold:** any surviving mutant in the status, capacity, or rate rule, or any
  requirement without a linked test.
- **Detection:** run the mutation tooling at M2 — `mutmut`/`cosmic-ray` for SQL where it
  applies, `Stryker` for the TypeScript rule guards; a surviving mutant is the trigger.
- **Mitigation:** strengthen tests for the three SQL functions and for access control (the
  rules most likely to be mutated).
- **Why this is elevated:** the declared stack is no longer Python, so the Week 10 mutation
  marks are **at risk**. The tooling is thinner and the evidence is harder to produce.

### R-06 — Auth email rate limit blocks registration or reset
- **Owner:** EYAD ALSALAMAH
- **Alert threshold:** > 2 failed sends in an hour, or any sign-up that cannot confirm.
- **Detection:** watch Supabase Auth logs during each demo; a rate-limit error is the trigger.
- **Mitigation:** configure a custom SMTP provider before the M2 demo (the built-in service
  is rate-limited and meant for testing), and confirm the current limit on the vendor page
  before relying on it.

### R-07 — Cost / quota drift from the published rates
- **Owner:** EYAD ALSALAMAH
- **Alert threshold:** the paid tier or the free-tier quotas change by > 20% from the
  estimate, or the database passes 400 MB (80% of 500 MB).
- **Detection:** re-check vendor list prices and the usage panel before M4 (see
  [`cost-model.md`](./cost-model.md) §5).
- **Mitigation:** the growth step is a fixed $25/month plan, not a metered bill; re-run the
  arithmetic if the plan changes.

### R-08 — Forged role claim grants Provider access
- **Owner:** EYAD ALSALAMAH
- **What happens:** the role travels in the JWT. If it is stored in `user_metadata` (which the
  user can edit) a participant can promote themselves, and every RLS policy will honour the
  forged claim.
- **Alert threshold:** any policy or client code that reads the role from a client-writable
  field, or any test that cannot show a participant being denied.
- **Detection:** grep the policies and migrations for `user_metadata`; run the negative test
  `test_participant_cannot_create_event` (NFR-2) — a pass with a forged claim is the trigger.
- **Mitigation:** the role lives in `app_metadata` only (server-set); no policy reads a
  client-writable field.

### R-09 — Free project paused for inactivity before a demo
- **Owner:** EYAD ALSALAMAH
- **Alert threshold:** the project is paused, or no request has been made for the vendor's
  inactivity window.
- **Detection:** open the app the day before each review; a paused project returns an error
  on the first query.
- **Mitigation:** keep a warm-up request in the M2–M4 checklists, and restore the project
  before a demo; upgrade to the paid tier if a demo cannot tolerate a pause.

### R-10 — An RLS policy fails silently (too narrow or too broad)
- **Owner:** EYAD ALSALAMAH
- **What happens:** a policy that is too narrow returns **zero rows with no error**, so a
  broken policy looks like an empty list; a policy that is too broad returns another
  participant's rows.
- **Alert threshold:** any table without both a positive and a negative policy test.
- **Detection:** run the policy test suite (NFR-2); a table with only one of the two tests is
  the trigger.
- **Mitigation:** every table gets a positive test (the owner sees the row) and a negative
  test (the other role sees zero rows); review policies before each milestone.

### R-11 — Coupling regressions from a future mixed design (defensive)
- **Owner:** EYAD ALSALAMAH
- **Alert threshold:** business rules implemented in more than one layer (e.g., a client-side
  copy of the status rule), or auth enforced in more than one place.
- **Detection:** re-run the coupling check in [`coupling-report.md`](./coupling-report.md)
  before each milestone.
- **Mitigation:** the SQL functions and RLS policies remain the single source of truth; the
  React layer renders results and never re-derives a rule.
