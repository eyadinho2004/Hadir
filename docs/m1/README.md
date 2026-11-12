# Hadir (حاضر) — M1 Package (read me first)

> **Start here.** This is the index into the whole M1 package. Read this file first,
> then follow the reading path below. Everything is in this `docs/m1` folder.
>
> **للزملاء (بالعربية):** هذا الملف هو نقطة البداية لفهم حزمة M1 — يعرّف المنتج ويرتب
> الملفات ويشرح القرارات والإضافات. اتبع ترتيب القراءة بالأسفل.

SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH) · M1 due 21 Oct 2026.

---

## 1. What the product is

**Hadir (حاضر = "present")** is a **web-only** attendance platform for events,
sessions, and training programs. Two roles:

- **Provider** — creates/publishes events and sessions, runs live **QR** attendance,
  exports CSV, views analytics.
- **Participant** — browses public events, registers, checks in via **QR web-camera**,
  tracks their own attendance.

Persistence is **PostgreSQL on Supabase**; identity and email (password reset,
registration confirmation) are **Supabase Auth**.

## 2. How the package fits the brief (M1, 26 marks)

| Brief deliverable | Where it lives |
|---|---|
| Charter (team, problem, scope, non-goals) | [`charter.md`](./charter.md) |
| Requirements (personas, stories, use cases, FRs, NFRs) | [`requirements.md`](./requirements.md) |
| Traceability matrix (28 verified links) | [`traceability.md`](./traceability.md) |
| Architecture (2 distinct options + C4 diagrams + trade-off) | [`architecture.md`](./architecture.md) |
| Cost model (stated assumptions, rates, arithmetic) | [`cost-model.md`](./cost-model.md) |
| Coupling report (what was flagged, why A clears, residual risk) | [`coupling-report.md`](./coupling-report.md) |
| 4 Architecture Decision Records | [`adr/`](./adr/) |
| Risk register (thresholds + owners) | [`risk-register.md`](./risk-register.md) |
| AI-use disclosure log | [`AI_USE_DISCLOSURE.md`](./AI_USE_DISCLOSURE.md) |
| Coherence report (breaks found + resolution) | [`coherence-report.md`](./coherence-report.md) |
| Scope & architecture source (original decision doc) | [`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md) |

## 3. Recommended reading path

1. **`README.md`** (this file) — orient yourself.
2. **`charter.md`** — the problem, scope, non-goals, and team.
3. **`requirements.md`** — personas, user stories, use cases, and NFRs.
4. **`hadir-scope-and-architecture.md`** — scope ceilings + the stack decision.
5. **`architecture.md`** — the two options, C4 diagrams, trade-off matrix, and the
   recommendation (**Option A**).
6. **`adr/`** — the decisions that lock the choice: **0004** is current; **0001** and
   **0002** are superseded (kept for the record).
7. **`cost-model.md`** — the cost arithmetic behind the recommendation.
8. **`coupling-report.md`** — the coupling check + system-specific residual risk.
9. **`risk-register.md`** — what could go wrong, the alert thresholds, and owners.
10. **`traceability.md`** — the requirement↔test links.
11. **`coherence-report.md`** — cross-document consistency and its fixes.
12. **`AI_USE_DISCLOSURE.md`** — how AI was used, errors found, and provenance.

## 4. What was added / changed in this package (recent edits)

**2026-11-11 — architecture conformance pass.** The team changed the decision to
**React on Supabase**. The package was rewritten to match:

- **`architecture.md`** — rewritten: Option A is now **React + Supabase** (recommended),
  Option B is the **Django monolith** (rejected). New C4 diagrams, distinctness check,
  trade-off matrix, coupling and cost sections.
- **`adr/0004-adopt-react-on-supabase-over-django.md`** — the decision, the accepted
  downsides (two managed targets, weaker mutation evidence), and the rejected option.
  **ADR-0001 and ADR-0002 are now marked superseded.**
- **`charter.md` §5–6**, **`hadir-scope-and-architecture.md` §3–5** — declared stack,
  the two options, and the ceilings (the one-target ceiling is knowingly exceeded).
- **`cost-model.md`** — rewritten: Supabase free tier vs the Django VPS.
- **`coupling-report.md`** — rewritten: one enforcement point per rule, plus the residual
  risks a coupling check cannot see (forged role claim, silent policy failure).
- **`risk-register.md`** — 11 risks, including the forged role claim (R-08), the free-project
  pause (R-09), and silent RLS failure (R-10).
- **`traceability.md`** — the View/URL column is now a screen + Supabase artifact
  (table, RPC, or `auth:` call).
- **`AI_USE_DISCLOSURE.md`** — errors 4 and 5 added for this pass.

**Earlier (M1 first draft):**

- **`adr/0001`**, **`adr/0002`**, **`adr/0003`** — the original Django/SQLite decisions
  (0001/0002 now superseded).
- **`risk-register.md`**, **`AI_USE_DISCLOSURE.md`**, **`coherence-report.md`**,
  **`cost-model.md`** — created so the package is complete against the brief.

**Other files updated for the same pass:**

- **`requirements.md`** — NFR-2/3/8/9 reworded for RLS and Supabase Auth; a fourth
  correction-log row added.
- **`coherence-report.md`** — breaks C-06…C-10 added (and C-01/C-02 updated).

## 5. Team & decision summary

- **Member:** EYAD ALSALAMAH (444101342) — full-stack, sole owner of the package.
  RLS policies, and three SQL functions; Vitest for tests. Deployed as a static host plus
  Supabase (two managed targets).
- **Headline decision:** **Option A (React on Supabase)** over the Django monolith, because it
  removes the identity/session/admin/email code a single developer would own and makes access
  control one boundary (RLS). Accepted downside: two managed targets and weaker mutation
  evidence. See [`architecture.md`](./architecture.md) §8 and ADR-0004.

## 6. Remaining items for the team (need your real data)

These cannot be completed by the assistant and must be filled from your own records.

**For the AI-use disclosure (`AI_USE_DISCLOSURE.md`):**

- Model name/mode (`{model}` / `{mode}`) — the *Tools and contribution* section.
- Commit hashes (raw/fix) and the member who read each file — the *Provenance* table.
- Signature dates — the *Individual ownership* table.
- Token/request counts and cost — the *Cost at M3/M4* section.

**Not part of AI disclosure — separate requirement:**

- Re-verify the vendor prices cited in **`cost-model.md` §5** on the submission day
  (the cost-model rubric requires *rates re-verified*).
