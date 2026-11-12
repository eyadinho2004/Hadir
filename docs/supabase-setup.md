# Connecting a Supabase project

For a developer pointing this workspace at a fresh Supabase project. Follow the steps in order; the
app runs on the local demo data until `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` point at a
project with all three migrations applied.

## 1. Apply the migrations

Run the files in `supabase/migrations/` in order — either with the CLI or by pasting each file into
**SQL Editor** and running it:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

| File | Adds |
|---|---|
| `0001_schema.sql` | five tables, enums, indexes, generated `sessions.closes_at` |
| `0002_role_and_rls.sql` | `set_user_role`, `handle_new_user`, `is_provider`, RLS on every table |
| `0003_check_in.sql` | `sessions.check_in_code`, `join_session`, `is_registered`, six digit event codes |

`0003` is required: sessions are created with a four digit `check_in_code` and the participant screen
calls `join_session`. Without it, session creation and code check-in fail.

## 2. Set the environment

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Project Settings → API → anon public key |
| `VITE_DEMO_PROVIDER_EMAIL` / `_PASSWORD` | no | an account you create in step 3 |
| `VITE_DEMO_PARTICIPANT_EMAIL` / `_PASSWORD` | no | an account you create in step 3 |

Only the anon key belongs in the client. Never put the `service_role` key in `.env`.

## 3. Create the demo accounts (optional)

The demo buttons sign in with the real accounts when both values are set, and fall back to the local
demo data when they are missing. See [`demo-accounts.md`](./demo-accounts.md). The demo names in the
local mode are عبدالله القحطاني (provider) and محمد العتيبي (participant).

## 4. Verify

```bash
npm run typecheck
npm test
```

`tests/db/schema-contract.test.ts` reads the migrations and fails if the columns and functions the
client calls are missing. It does not connect to a database, so also smoke-test against the real project:

1. Sign up as a provider, create an event and a session — the session shows a four digit code.
2. Sign up as a participant, enter the code on **جلساتي** — attendance is recorded as present or late.
3. Open the session as the provider — the participant appears with their name.

## Known gaps before real data

- Capacity and the registration deadline are checked in the UI only; two simultaneous registrations can
  exceed `events.capacity`. A `register_for_event` RPC is not written yet.
- Demo account passwords ship in the client bundle. Use a throwaway project with sample data.
- The client polls attendance every 5 seconds; there is no realtime channel.
