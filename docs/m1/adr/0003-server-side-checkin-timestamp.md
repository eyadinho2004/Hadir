# ADR-0003: Derive attendance status from the server-side check-in timestamp

- **Status:** Accepted
- **Date:** 2026-10-18
- **Deciders:** Hadir team (M1)
- **Related requirements:** AT-01, AT-02, NFR-4
- **Supersedes:** (none)

## Context

The attendance rule (AT-01) derives `present`/`late` from `creation_time +
allowed_lateness`. If the status is computed from a **client-sent** check-in
timestamp, a malicious or buggy client can back-date it and forge a `present`
status. A static coupling detector does not flag this because it is a
**trust-boundary / integrity** issue inside a single view, not a component-coupling
problem (see [`../coupling-report.md`](../coupling-report.md) §4).

## Decision

**Record the server-side check-in timestamp** (`timezone.now()` at the moment the
request is handled) and derive `present`/`late` from that value. **Never** trust the
timestamp in the client payload.

## Consequences

**Positive.**

- A forged earlier client timestamp cannot change the stored status (NFR-4).
- The rule is testable directly: `test_checkin_uses_server_time` posts a back-dated
  client timestamp and asserts the stored status matches server time
  (see [`../requirements.md`](../requirements.md) §5, NFR-4).

**Accepted downside (explicitly accepted):**

- Status reflects the **server clock**, not the participant's device clock. A client
  whose clock is skewed will see the status based on server time; we accept this as
  the authoritative clock and document it.

**Rejected option:**

- **Trusting the client-sent check-in timestamp** was rejected because it allows a
  malicious or buggy client to forge a `present` status by back-dating, and a static
  coupling detector would not expose it. This is the system-specific residual risk
  stated in the M1 architecture, and it is the reason NFR-4 exists.
