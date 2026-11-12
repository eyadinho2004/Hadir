# RULES.md — Team-owned reviewable AI workflow (Hadir)

> SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> Team-owned rules for working with DEVAI. Every member follows these so the
> repository stays reviewable, explaining, and honest. This file is verified at M4.
> Keep it current as the product changes.

---

## 1. Before prompting DEVAI for a feature/workflow

Write a `SPEC.md` for the unit of work **before** generation, and state in the prompt
or the spec:

- **Goal** — what this unit must achieve, in one sentence.
- **Given–When–Then criteria** — including a **failure path** and a **boundary case**
  (e.g., capacity reached, deadline passed, session closed).
- **Constraints** — stack, scope ceiling (≤6 views / ≤10 endpoints / ≤8 tables /
  2 roles / one deployment target), and any ceiling it touches.
- **Non-goals** — what this unit must **not** do (explicit exclusions).
- **Input/output and error contracts** — types, formats, and error codes/messages.
- **Worked example** — one concrete in/out pair to make the contract unambiguous.
- **Source files** — which files/DB tables/views the change touches.
- **Security constraints** — auth/role checks, server-side time (NFR-4), no secrets.
- **Tests with an independent oracle** — a test that would catch a bug even if the
  implementation is wrong (not just a mirror of the code).

## 2. Branch strategy

- Use **short-lived branches** for small units of work; one branch per unit.
- Never rebase or squash away another member's **raw/fix pair**.

## 3. Commit discipline

- Commit **raw AI output separately from human fixes**. Keep raw commits.
- **Attribution:** raw AI commits carry a `Co-authored-by:` trailer (see
  `AI_USE_DISCLOSURE.md` §3).
- **Review decisions:** record why a change was accepted, corrected, or rejected
  (this is evidence for M3/M4).
- **Merge conflicts:** resolve in a **new human commit that explains the
  reconciliation**; never delete the raw commit.

## 4. Secrets & tooling

- `.gitignore` already excludes `.env*`, keys/certs, and AI-tooling files.
- Never commit a real secret or real private data; `.env.example` uses fake values.
- Run **secret scanning** and **dependency verification** before each milestone.
- Preserve the **Week 9 sandbox configuration** and **REVIEW.md** for later review.

## 5. Run checks independently

- Run tests, lint, build, and CI **independently of the assistant** before claiming
  success (see "verification before completion").
- Fix what the checks report; report anything you could not verify.

## 6. Keep the package current as the product changes

- Keep **requirements, tests, ADRs, and the risk register** in sync with code.
- Before each milestone: check the **scope cap**; verify every required artifact and
  link is present; run the relevant checks; reconcile review findings; complete the
  **AI-use disclosure**; and ensure **every member can explain the package**.

## 7. Verification before completion

Do not claim a change "works", "is fixed", or "passes" without running the actual
commands and showing the output. Evidence precedes assertions.
