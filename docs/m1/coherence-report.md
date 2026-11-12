# Hadir (حاضر) — M1 Coherence Report

> SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> Milestone M1 | Part of the M1 package.
>
> Coherence check across the M1 documents: [`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md),
> [`charter.md`](./charter.md), [`requirements.md`](./requirements.md),
> [`traceability.md`](./traceability.md), [`architecture.md`](./architecture.md),
> [`cost-model.md`](./cost-model.md), [`coupling-report.md`](./coupling-report.md),
> [`risk-register.md`](./risk-register.md), and [`adr/`](./adr/).
>
> **Method:** cross-check each cross-document claim for contradiction, orphan or
> duplicated source-of-truth. Wherever a break is found, it is recorded with its
> **resolution** (addressed or explained).

---

## 1. Coherence breaks found and their resolution

| # | Break | Documents | Resolution |
|---|---|---|---|
| C-01 | Real-time wording conflicted: `hadir-scope-and-architecture.md` §4 trade-off row said **"WebSocket/polling (own)"** while the non-goals **exclude WebSocket**. | scope §4 vs scope §2.2, charter §4, architecture §8 | Clarified to **lightweight polling only** (HTTP polling then; a `select` poll now); WebSocket is an explicit non-goal. Polling is the accepted downside in ADR-0004. |
| C-02 | Cost figures inconsistent in magnitude: `architecture.md` §7 said **"~$5–10"**; `cost-model.md` §2 total **"~$6–8"**. | architecture §7 vs cost-model §2 | Reconciled for the Django option (now Option B); **superseded by C-10** for the chosen option. |
| C-03 | Table count edge: `hadir-scope-and-architecture.md` §5 lists **5 core tables + "(optional: settings/email logs)"**; `traceability.md` §1 traces only the **5 core tables**. | scope §5 vs traceability §1 | Checks out: 5 core + up to 2 optional = **≤8 table ceiling**, and optional tables carry no requirement ID (no orphan links). Recorded so M2 doesn't silently add a 9th table. |
| C-04 | Residual-risk claim repeated across several files with slightly different wording (client-time vs server-time). | architecture §8, scope §4, requirements UC-03 + NFR-4, risk R-01, ADR-0003 | Mutually consistent and reinforcing: the rule is always stated as **derive status from the server-side check-in timestamp**, never the client payload. No contradiction. |
| C-05 | `requirements.md` §6 Human correction log was **empty** (a required artifact). | requirements §6 | Now populated (see §3); its content is the basis for the AI-use disclosure. |
| C-06 | After the 2026-11-11 stack decision, `requirements.md` NFR-2/3/8/9 were still worded for Django (403 redirects, "Django's default hasher", "one command + SQLite on one host"). | requirements §2.3 vs charter §5, ADR-0004 | Reworded: RLS denials with paired positive/negative policy tests, Supabase Auth hashing, and a documented setup against the managed database. |
| C-07 | `traceability.md` still mapped every requirement to a **Django view/URL**, so the matrix pointed at artifacts that no longer exist. | traceability §1 vs architecture §2 | Column replaced by **screen + Supabase artifact** (`rpc:`, table operation, or `auth:`); the 28 links are unchanged. |
| C-08 | `risk-register.md` R-06 measured a **SendGrid 100/day** cap that is no longer the email path. | risk-register R-06 vs architecture §2 | Rewritten as the **Supabase Auth email rate limit**, with a custom SMTP as the mitigation. |
| C-09 | `charter.md` §6 claimed the architecture "fits every scope ceiling" while ADR-0004 knowingly breaks the one-target ceiling. | charter §6 vs ADR-0004, scope §5 | Charter now states it **fits every size ceiling and knowingly exceeds one** (deployment target), so no document claims a fit that the decision denies. |
| C-10 | `cost-model.md` compared **Firebase** (Option B) against Django and concluded the monolith was cheaper; after the decision the comparison set and the conclusion both changed. | cost-model §2–4 vs architecture §7 | Rewritten for Supabase vs Django: the chosen option is now the cheaper one (~$0–1 vs ~$6–8/mo), and the decision is stated to rest on code volume, not price. |

---

## 2. Confirmed-consistent items (no action)

- **Two managed targets:** charter §5, scope §5, architecture §2/§8, ADR-0004, risk R-02 — all state the same knowing break, and none claims a single target.
- **Scope ceilings (6 views / 10 endpoints / 8 tables / 2 roles):** charter §6, scope §5, architecture, traceability — consistent; 5 tables + 3 RPCs; roles are Provider + Participant only (Admin dropped).
- **Access control model:** RLS policies on all five tables, with the role read from `app_metadata` in the JWT (charter §5, architecture §2, coupling-report §3, risk R-08); no client-side guard.
- **Attendance rate formula** `(totalAttended / totalSessions) * 100`: requirements AN-01, scope AN-01, traceability AN-01 (`attendance_rate()`), architecture §2 — identical.
- **QR-only attendance, web-camera check-in:** requirements AT-02, scope AT-02, traceability AT-02, architecture §2 — consistent.

---

## 3. Open / to confirm (non-blocking)

- **Minor textual defect:** `charter.md` §2 contains a stray malformed token
  (`their full lifecycle)Skip, so organizers…`). Recommend a one-line fix to
  `their full lifecycle, so organizers…`.
- **Owners in `risk-register.md`** are assigned by member name; with a single member,
  every risk is owned by EYAD ALSALAMAH.

---

## 4. Conclusion

- No **contradictory** design claim survives: every cross-document difference is either resolved
  (C-01…C-10) or is a required-now-complete artifact (C-05).
- The **2026-11-11 conformance pass** is complete: no M1 document still describes the rejected
  Django/SQLite design as the chosen one, and every reference to it is marked as Option B or superseded.
- The requirements ↔ architecture integration is intact; **no orphan requirements** and
  **no untraced in-scope requirement** remain (see [`traceability.md`](./traceability.md)).
