# AI Use Disclosure — Hadir (حاضر) M1

> SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> Milestone M1 | Part of the M1 package.
>
> One-page AI-use disclosure log per the brief, consistent with the repository
> evidence (the docs in this `docs/m1` folder). Updated at each milestone.

---

## 1. Tools and contribution

| Tool | Model / mode | Purpose | Contribution by area |
|---|---|---|---|
| DEVAI (Developer agent) | `deepseek v4 flash vision exp model` — `{mode: pending}` | Drafting M1 documents: charter, requirements, traceability, architecture (C4 + trade-off + coupling), cost model, ADRs, risk register | **Substantial** for prose/diagrams; **Human** for decisions and final review |

> **Contribution by area:** Requirements (substantial) · Architecture (substantial) ·
> Traceability (substantial) · Cost model (substantial) · Coupling report (substantial) ·
> ADRs (substantial) · Risk register (substantial) · Human review & approval (primary).

## 2. Errors and rejections (≥1 error + 1 rejected suggestion)

| # | AI error | How detected / corrected |
|---|---|---|
| 1 | Initial requirement draft **overreached the scope ceilings** (added certificates, F2F/GPS attendance, WebSocket real-time, payments, CRM, eLearning). | Human moved each to the **explicit non-goals** list so requirements stay within ceilings — see `hadir-scope-and-architecture.md` §2.2 and `charter.md` §4. |
| 2 | Initial architecture was a **mixed/ambiguous design** (combined Django-style backend, an SPA, and a BaaS persistence layer). | Human split it into the **two genuinely distinct options** (A/B); the coupling check then flagged the mix and cleared Option A — see `coupling-report.md` §2–3. |
| 3 | AI wrote `architecture.md` referencing `cost-model.md` and `coupling-report.md` **before they existed**. | Human created both files and reconciled the cost summary — see `cost-model.md` and `coupling-report.md`. |
| 4 | After the team changed the decision to **React on Supabase**, the AI first answered by summarising the new architecture and **left the package on the rejected Django/SQLite design** — `charter.md` §5, `hadir-scope-and-architecture.md` §3–5, `cost-model.md`, `coupling-report.md`, `risk-register.md`, and `traceability.md` all still described Django. | Human directed a full conformance pass; the package was corrected and ADR-0004 was added, superseding ADR-0001/0002 — see `architecture.md` §8 and `adr/0004`. |
| 5 | The AI's first pass at the new architecture **did not name the role-escalation hole**: with the role in the JWT, a client-editable `user_metadata` claim would let a participant promote themselves to Provider and every RLS policy would honour it. | Human review added it as **R-08** with a positive/negative test, and the `app_metadata`-only rule — see `risk-register.md` R-08 and `coupling-report.md` R-2. |


**Rejected suggestion:** the **Django monolith on SQLite** (the earlier recommendation) is now rejected
for this delivery and recorded in ADR-0001 / ADR-0002, both **superseded by ADR-0004**. The AI had also
earlier rejected a **managed BaaS** (Firebase); the team later adopted a managed BaaS in the form of
**Supabase**, which is a different proposition — PostgreSQL and SQL policies instead of a pay-per-use NoSQL
store with rules outside the code — and it **knowingly breaks the one-deployment-target ceiling**. That break
is recorded, not hidden, in ADR-0004.

## 3. Provenance

- Per the brief, **raw AI output** and **human fixes** are committed **separately**; raw commits are preserved and never squashed/rebase-away.
- Every generated file carries a **Co-authored-by** trailer naming the AI author; the **named member who read/approved** each file is recorded below.

| File | Raw-output commit | Human fix commit | Member who read it |
| (all files) | `{hash}` | `{hash}` | EYAD ALSALAMAH (444101342) |
| `cost-model.md` | `{hash}` | `{hash}` | `{...}` |
| `coupling-report.md` | `{hash}` | `{hash}` | `{...}` |
| `risk-register.md` | `{hash}` | `{hash}` | `{...}` |
| `adr/*.md` | `{hash}` | `{hash}` | `{...}` |

> **To complete at commit time (still pending):** the **model mode** (`{mode}`) in §1; the
> **raw/fix commit hashes** and the reader names in §3 (fill from `git log`); and the
> **request/token counts + cost** in §6.

## 4. Data and licensing

- **Data boundaries:** synthetic/public-data only in M1; **no sensitive institutional
  data** and **no real private data** are committed.
- **Attribution / licenses:** no third-party dataset requiring attribution is used;
  dependencies (React, Vite, `supabase-js`, Vitest) are the intended packages and are
  verified (secret scan + dependency check at M3).
- **Secrets:** no live secrets in the repo; `.env.example` will use fake values.

## 5. Individual ownership

> "I can explain and defend every part of this submission that carries my name."

| Member | ID | Statement | Areas |
|---|---|---|---|
| EYAD ALSALAMAH | 444101342 | signed — `18 Oct 2026` | Full-stack; React, SQL/RLS, tests, review |

## 6. Cost at M3 / M4

- **Estimation method:** count DEVAI requests/tokens from the session/usage logs and
  apply the published model pricing.
- **Approx. value (to be measured):** `{N}` requests, `{N}` tokens → approx. `$X`.
- **One way to reduce it:** write targeted prompts with the working file/line context
  instead of re-reading whole documents, and group related edits into a single turn.
