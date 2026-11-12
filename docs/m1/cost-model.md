# Hadir (حاضر) — M1 Cost Model

> SWE 485 — Advanced Software Engineering with AI (Term 1 1448 AH)
> Milestone M1 | Part of the M1 package.
>
> The detailed arithmetic behind the summary in [`architecture.md`](./architecture.md)
> §7. Prices are **approximate list prices** (USD) for the reference services, cited so
> the team can re-verify at decision time; tier pricing drifts, so this is an estimate to
> justify the choice, not a procurement quote.
>
> **Revised 2026-11-11** for the chosen architecture (React front end on Supabase,
> [ADR-0004](./adr/0004-adopt-react-on-supabase-over-django.md)).

---

## 1. Usage assumptions (the load we cost against)

These mirror the scope ceilings in [`hadir-scope-and-architecture.md`](./hadir-scope-and-architecture.md)
§5 and the NFR-1 figure of up to **500 registered participants** per event.

| Assumption | Value | Source / note |
|---|---|---|
| Events per month | 10 | ~2 active providers |
| Sessions per event | 3 | → 30 sessions/month |
| Avg participants per event | 50 | small training center (Persona أحمد) |
| Registrations per month | 500 | ~10 events × 50 |
| Check-ins per month | 1,000 | ~2 sessions per participant |
| Auth emails per month | ~1,500 | confirmations + resets + cancellations |
| Page renders per month | ~10,000 | public browse + provider views |
| Live-view polls per month | ~43,000 | 1 poll / 5 s × 2 h × 30 sessions |
| Peak concurrent users | 50–100 | small-scale |

**Database size.** 1,000 check-ins/month at ~200 bytes per row is ~200 KB/month, so the
500 MB free database holds years of the assumed load. Size is not the constraint.

---

## 2. Option A — React front end on Supabase (CHOSEN)

### Fixed infrastructure

| Item | Unit cost (approx.) | Monthly | Notes |
|---|---|---|---|
| Supabase Free (PostgreSQL + Auth) | $0 (500 MB DB, 50k MAU, 2 projects) | **$0** | 5 tables; ~200 KB/month of rows |
| Static host for the SPA (Vercel/Netlify free tier) | $0 (~100 GB bandwidth) | **$0** | ~3 GB/month egress at 10k renders |
| Email (built-in, or SendGrid free tier) | $0 | **$0** | ~1,500/month; the built-in service is rate-limited, so a custom SMTP is needed at this volume |
| Domain name (optional) | ~$12/yr | **~$1** | Amortized; a free subdomain also works ($0) |

**Total (typical): ~$0–1 / month.**

### Why it stays at zero — and where the ceiling actually is

- No per-operation billing at this tier: the limits are **storage, egress, and monthly
  active users**, and the assumed load is far inside all three.
- The live view polls `select` every 5 s: ~43,000 polls/month × ~2 KB ≈ **86 MB** of
  egress — under 2% of the 5 GB free egress.
- The real limits are **not** traffic; they are (a) **500 MB of database** and (b) **the
  free project pausing after a period of inactivity**. Both are operational risks, not
  cost risks — [`risk-register.md`](./risk-register.md) R-07 and R-09.
- Growth path: the paid tier is a **fixed $25/month**, not a metered bill.

**Monthly cost envelope: $0 on free tiers, $25 if a paid tier is needed.**

---

## 3. Option B — Django monolith + server-rendered UI (rejected)

Option B is billed as a **fixed host**, so the arithmetic is simple and predictable.

| Item | Unit cost (approx.) | Monthly | Notes |
|---|---|---|---|
| Small VPS/container (2 vCPU / 4 GB) | ~$5–6/mo | **~$5–6** | Single host; 50–100 concurrent + ~1,000 check-ins/mo |
| SQLite database | $0 | **$0** | File on the same volume |
| Domain name (optional) | ~$12/yr | **~$1** | Amortized |
| Email (SendGrid free tier) | $0 (≤100/day) | **$0** | ~1,500/mo fits |
| Backup (optional) | ~$1 | **~$1** | Cheap snapshot |
| **Total** | | **~$6–8/mo** | |

### Why it is not the cheaper option

Option B costs **more** in money than Option A at the assumed load, and it is not the
reason it was rejected. It was rejected because it makes one developer own identity,
sessions, admin, ORM, and email — the largest block of code — while the requirements only
need the attendance loop.

---

## 4. Comparison & decision

| Dimension | Option A (React + Supabase) | Option B (Django monolith) |
|---|---|---|
| Cost at §1 load | **~$0–1/mo** | ~$6–8/mo |
| Cost at 10× load | **~$0–1/mo** (quota-bounded) | ~$6–8/mo (unchanged) |
| Cost shape | Free tier with quotas, then a fixed $25 plan | Fixed host |
| Ceiling / cap | Vendor free tier (DB size, egress, MAU) | Ours (VPS plan, email quota) |
| Operational risk | **Project pauses on inactivity**; quotas | Host patching, backups |
| Code volume for one developer | **Small** | Large |
| Monitoring needed | Quota and pause monitoring | Host monitoring |

**Conclusion.** Option A is cheaper *and* smaller at the assumed load, and its limits are
quotas rather than a bill. The decision rests on **code volume and access-control
correctness**, not on price; the price difference simply removes Option B's last advantage.

**Adopt Option A**, consistent with [`architecture.md`](./architecture.md) §8 and
[ADR-0004](./adr/0004-adopt-react-on-supabase-over-django.md).

---

## 5. Rates re-verified & assumptions to re-check before M4

The list prices used in §2–§3 were re-verified against the published vendor pricing pages
on the M1 revision date:

- **Supabase Free:** 500 MB database, 1 GB storage, 5 GB egress, 50,000 monthly active
  users, 2 projects; free projects **pause after a period of inactivity**. Paid tier
  **$25/month**. Used as approximate values.
- **Supabase email:** the built-in service is **rate-limited** and intended for testing; a
  custom SMTP provider is required at the assumed ~1,500 emails/month.
- **Static host:** free tier with ~100 GB bandwidth (Vercel/Netlify class).
- **SendGrid:** free tier **≤100 emails/day** (~3,000/month).
- **VPS (Option B only):** ~$5–6/month list price (Hetzner `CX22` / DigitalOcean Basic).

Assumptions to confirm again before submitting M4:

- Domain name is optional; the free subdomain works for **$0**.
- If the free database approaches 500 MB, the next step is a fixed $25 plan — still not a
  metered bill.
- Re-verify the free-tier quotas on the submission day; vendors change them without notice.
