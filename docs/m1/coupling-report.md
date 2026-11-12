# Hadir (حاضر) — M1 Coupling Report

> SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> Milestone M1 | Part of the M1 package.
>
> The evidence behind [`architecture.md`](./architecture.md) §6. This report is a static
> coupling check of the two candidate architectures: what a *mixed / ambiguous* design gets
> flagged for, why **Option A (React on Supabase)** clears the check, and the residual risks
> **a static coupling detector cannot see**.
>
> **Method:** component-to-component dependency inspection over the C4 container diagrams in
> [`architecture.md`](./architecture.md) §2–3, plus a rule-level check of the attendance-status
> logic. No code exists yet (M1 is pre-implementation), so this is a design-time assessment.
>
> **Revised 2026-11-11** for the chosen architecture (ADR-0004).

---

## 1. What was checked

We inspected each container diagram for **source-of-truth duplication**, **cross-layer
entanglement**, and **multiple enforcement points for one rule**. The rules that matter most:

1. **`present`/`late` status** (AT-01) — derives from `created_at + allowed_lateness`.
2. **Capacity-limited registration** (PB-07) — a count and an insert must not race.
3. **Attendance rate** (AN-01) — a count over sessions, with a zero guard.
4. **Access control** (NFR-2) — two roles, enforced on every read and write.

---

## 2. What the AI-assembled draft was flagged for

The earlier assembled draft combined elements of both options into one design (a Django-style
backend *and* a client-rendered SPA *and* a BaaS persistence layer). The coupling check flags
exactly three failure classes that such a mix invites:

| Flagged condition | Why it is a coupling problem |
|---|---|
| **Dual source of truth for one rule** — status logic present in both the server and the client | The `present`/`late` decision exists in two places; they drift apart and no single place is authoritative. |
| **Auth enforced in more than one place** — server templates, SPA route guards, and BaaS rules | A role change must be repeated everywhere; a missed spot silently widens access. |
| **Persistence split across stores** — SQLite for some data, Firestore for others | A single entity's fields live in two stores; a write is no longer atomic or explainable. |

These are the classic **"one rule, many homes"** coupling smells. They make the M4 requirement
("nothing enters the repository that a member cannot explain") unmeetable, because explaining the
system requires explaining two entangled implementations.

---

## 3. Why Option A clears

Option A (React front end on Supabase) keeps **one enforcement point per rule**:

| Rule | Single home in Option A |
|---|---|
| `present`/`late` status | SQL function `check_in()`, reading `now()` inside the database |
| Capacity-limited registration | SQL function `register_for_event()`, one transaction |
| Attendance rate | SQL function `attendance_rate()`, zero-guarded |
| Access control | RLS policies on the five tables, one boundary |
| Persistence | PostgreSQL (one store) |
| Rendering | React components (one layer) |
| Email | Supabase Auth (one dependency) |

The dependency graph is **layered and acyclic**:

```
web ──> auth ──> (JWT)
web ──> db   ──> policies, functions
```

- `web` has no second path to the data: every read and write goes through `supabase-js` to one
  database, where the policies decide.
- There is **no client-side copy** of the status, capacity, or rate rule: the client renders
  results and scans a QR, and the database remains the single source of truth.
- **No second auth mechanism**: Supabase Auth is the only identity source, and the role it puts in
  the JWT is the only role the policies read.
- Every branch is a SQL function a member can open in one file, or a policy a member can read in
  one statement.

**The distinctness check in [`architecture.md`](./architecture.md) §4 passes** because Option A
differs from Option B in deployment model, rendering, logic location, access control, identity, and
persistence access — so there is no hidden mix.

---

## 4. Residual risks (a static coupling detector cannot see these)

**R-1 — the status rule depends on which clock produced the timestamp.** A static dependency graph
sees files and containers; it cannot see that correctness depends on the clock. In Option A the
decision is taken inside `check_in()` with `now()`, so a client-supplied timestamp has no path into
it. The risk is now **structural**, not a coding discipline: there is no client-side copy to drift.
Enforced by NFR-4 and the acceptance criterion `check_in` ignores a forged `client_time`.

**R-2 — the role travels in a token.** If the role is stored in `user_metadata` (which the user can
edit) instead of `app_metadata`, a participant can promote themselves to Provider and every RLS
policy will honour the forged claim. A coupling detector sees nothing: the policy is correct, the
claim is false. **Mitigation:** the role lives in `app_metadata` only, and no policy reads a
client-writable field. See [`risk-register.md`](./risk-register.md) R-08.

**R-3 — a policy fails silently.** An RLS policy that is too narrow returns **zero rows with no
error**, so a broken policy looks like an empty list, not a denial. A policy that is too broad
returns another participant's rows. Neither is a coupling smell, and neither appears in a dependency
graph. **Mitigation:** every table has a positive test (the owner sees the row) and a negative test
(the other role sees zero rows) — see NFR-2.

---

## 5. Conclusion

- The **mixed/ambiguous draft is flagged** for dual source-of-truth, multi-place auth, and split
  persistence.
- **Option A clears** the coupling check: one enforcement point per rule, an acyclic layer graph, and
  no client-side copy of any domain rule.
- The three **residual risks** (client clock, forged role claim, silent policy failure) are not
  coupling problems and are handled by the SQL functions, `app_metadata`, and paired
  positive/negative policy tests.

Related requirement IDs: **AT-01, PB-07, AN-01, NFR-2, NFR-4**. See
[`architecture.md`](./architecture.md) §8.
