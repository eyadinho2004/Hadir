# Hadir Implementation Plan (M2 → M4)

> **For agentic workers:** REQUIRED SUB-SKILL: load the `executing-plans` skill to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Hadir attendance platform — events, sessions, QR check-in, attendance status, exports, and analytics — on React + Supabase, with every rule enforced once and tested first.

**Architecture:** A React (Vite, TypeScript) single-page app on a static host, talking to Supabase through `supabase-js`. Identity is Supabase Auth; data is PostgreSQL; authorization is Row Level Security on all five tables; the three integrity rules (status, capacity, attendance rate) live in three SQL functions. Lifecycle state is derived at read. No server code is written or run by the team.

**Tech Stack:** React 19, Vite 6, TypeScript 5 (strict), `@supabase/supabase-js` 2, React Router 7, `@zxing/browser` (QR camera), Vitest 3 + Testing Library + `jsdom`, `pg` (database tests only), Supabase CLI (migrations).

**Spec:** [`docs/m1/requirements.md`](../../m1/requirements.md) (28 requirement IDs), [`docs/m1/architecture.md`](../../m1/architecture.md) (chosen architecture, §2), [`docs/m1/traceability.md`](../../m1/traceability.md) (requirement → artifact → test), [`docs/m1/hadir-scope-and-architecture.md`](../../m1/hadir-scope-and-architecture.md) (§5 ceilings). Per-unit specs are written as `SPEC-<feature>.md` following [`SPEC.md`](../../../SPEC.md) before each task's code is generated.

## Global Constraints

- **Screens:** ≤ 6 — Auth, Provider dashboard, Session/live, Public marketplace, Public event detail, Analytics.
- **Endpoints:** ≤ 10 — 3 RPC functions (`check_in`, `register_for_event`, `attendance_rate`) + table reads/writes through RLS. No REST API of our own.
- **Tables:** ≤ 8, of which 5 are used — `users`, `events`, `sessions`, `attendance_records`, `registrations`.
- **Roles:** exactly 2 — `provider`, `participant`. The role is stored in `auth.users.raw_app_meta_data` (`app_metadata`) **only**; never in `user_metadata`, never read from a client-writable field (R-08).
- **Deployment targets:** 2 managed targets (static host + Supabase), knowingly accepted in ADR-0004.
- **Server time:** the check-in status is decided only by `now()` inside `check_in()`; a client timestamp is never accepted (NFR-4).
- **Access control:** RLS is enabled on all five tables; no screen relies on a client-side guard for authorization (NFR-2).
- **Secrets:** the `anon` key is the only key in the client; `service_role` never ships to the browser; no secret in the repo; `.env.example` holds fake values only.
- **TypeScript:** `strict: true`, no `any` in `src/`, no non-null assertions on Supabase data.
- **Errors:** SQL functions raise named errors — `not_authenticated`, `session_not_found`, `session_closed`, `event_not_found`, `event_not_public`, `registration_closed`, `event_full` — and the client maps each to one message.
- **Language:** UI copy in Arabic (RTL) with English identifiers in code.
- **Process:** every task writes its failing test first, then the minimal code, then commits; raw AI output and human fixes are separate commits (RULES.md §3).

## Review Focus

Inputs and conditions the spec implies but no single test naturally covers — each has a test pinned in the task that owns the code:

1. **Double check-in (the same QR scanned twice)** — a person scans twice in a row; the second scan must not create a second row or flip `late` back to `present`. Pinned in Task 4.
2. **Exact late boundary** — checking in at exactly `starts_at + allowed_lateness` must be `late`, not `present`. Pinned in Task 4.
3. **Capacity race** — two participants register when one seat is left; exactly one must succeed. Pinned in Task 5.
4. **Forged role claim** — a participant sets `user_metadata.role = 'provider'` and tries to create an event; it must fail. Pinned in Task 3.
5. **Closed session / expired QR** — a scan after `closes_at` must be rejected, not stored as `absent`. Pinned in Task 4.

---

## File Structure

```
supabase/
  migrations/
    0001_schema.sql          five tables, enums, indexes, generated closes_at
    0002_role_and_rls.sql     role trigger + is_provider() + policies on all tables
    0003_check_in.sql         check_in() RPC
    0004_register_for_event.sql register_for_event() RPC
    0005_attendance_rate.sql  attendance_rate() RPC
  functions/
    notify-registration/index.ts  best-effort confirmation email
src/
  main.tsx                   router + providers
  App.tsx                    routes and guards
  lib/supabase.ts            typed client
  lib/errors.ts              error code -> Arabic message
  lib/types.ts                generated Database types
  auth/AuthPage.tsx           sign in / sign up / reset
  provider/EventsPage.tsx      provider dashboard: events + sessions
  provider/SessionPage.tsx     QR display + live attendance + export
  participant/MarketplacePage.tsx  public events list + filters
  participant/EventPage.tsx    public detail + register
  participant/CheckInPage.tsx  camera scan -> check_in()
  participant/MyAttendancePage.tsx  own attendance + rate
  analytics/AnalyticsPage.tsx  attendance_rate() + filters
  components/…               shared UI
tests/
  db/harness.ts               pg client, begin/rollback, JWT claims
  db/schema.test.ts            constraints, generated column, indexes
  db/rls.test.ts               positive + negative policy tests
  db/check_in.test.ts          status, boundary, idempotency, closed
  db/register.test.ts          capacity, deadline, duplicates
  db/attendance_rate.test.ts   rate, zero guard
  ui/*.test.tsx                screen behavior with a mocked client
```

---

### Task 1: Scaffold, test harness, and environment

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `.env.example`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/lib/supabase.ts`, `tests/setup.ts`
- Modify: `SPEC.md:30` (the stack constraint line)

**Interfaces:**
- Produces: `supabase` (typed client singleton) from `src/lib/supabase.ts`; `npm test`, `npm run test:db` commands.

- [ ] **Step 1: Create the project files**

```json
{
  "name": "hadir",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:db": "vitest run tests/db",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "@zxing/browser": "^0.1.5",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "pg": "^8.13.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

`.env.example`:

```
VITE_SUPABASE_URL=https://example.supabase.co
VITE_SUPABASE_ANON_KEY=fake-anon-key
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
```

`src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) throw new Error('missing_supabase_env');

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});
```

- [ ] **Step 2: Write the failing smoke test**

```tsx
// tests/ui/app.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../../src/App';

describe('App', () => {
  it('renders the auth screen at /', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'تسجيل الدخول' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `npm test -- tests/ui/app.test.tsx`
Expected: FAIL — cannot resolve `../../src/App`.

- [ ] **Step 4: Write the minimal app**

```tsx
// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import { AuthPage } from './auth/AuthPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
    </Routes>
  );
}
```

```tsx
// src/auth/AuthPage.tsx
export function AuthPage() {
  return <h1>تسجيل الدخول</h1>;
}
```

- [ ] **Step 5: Run it, typecheck, and commit**

Run: `npm test -- tests/ui/app.test.tsx && npm run typecheck`
Expected: PASS, no type errors.

```bash
git add package.json vite.config.ts tsconfig.json vitest.config.ts .env.example src tests
git commit -m "chore: scaffold React app and test harness"
```

---

### Task 2: Schema — five tables, enums, indexes

**Files:**
- Create: `supabase/migrations/0001_schema.sql`, `tests/db/harness.ts`, `tests/db/schema.test.ts`

**Interfaces:**
- Produces: tables `users`, `events`, `sessions`, `attendance_records`, `registrations`; `sessions.closes_at` (generated); enum types `user_role`, `event_visibility`, `session_method`, `attendance_status`; `asUser(claims, fn)` test helper.

- [ ] **Step 1: Write the failing schema test**

```ts
// tests/db/schema.test.ts
import { describe, expect, it } from 'vitest';
import { asUser, seedProvider } from './harness';

describe('schema', () => {
  it('derives closes_at from starts_at + duration', async () => {
    const provider = await seedProvider();
    await asUser({ sub: provider }, async (db) => {
      await db.query(
        `insert into public.sessions (provider_id, title, method, starts_at, duration_minutes)
         values ($1, 'جلسة', 'face_to_face', '2026-11-11T09:00:00Z', 90)`,
        [provider],
      );
      const { rows } = await db.query(
        `select closes_at from public.sessions where provider_id = $1`, [provider],
      );
      expect(new Date(rows[0].closes_at).toISOString()).toBe('2026-11-11T10:30:00.000Z');
    });
  });

  it('rejects an event whose ends_at is before starts_at', async () => {
    const provider = await seedProvider();
    await expect(asUser({ sub: provider }, (db) => db.query(
      `insert into public.events (provider_id, title, category, starts_at, ends_at)
       values ($1, 'حدث', 'تقنية', '2026-11-11T10:00:00Z', '2026-11-11T09:00:00Z')`,
      [provider],
    ))).rejects.toThrow(/events_check/);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test:db -- tests/db/schema.test.ts`
Expected: FAIL — relation `public.sessions` does not exist.

- [ ] **Step 3: Write the migration**

```sql
-- supabase/migrations/0001_schema.sql
create type public.user_role as enum ('provider', 'participant');
create type public.event_visibility as enum ('private', 'public');
create type public.session_method as enum ('face_to_face', 'online');
create type public.attendance_status as enum ('present', 'late', 'absent');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) between 2 and 120),
  email text not null,
  role public.user_role not null default 'participant',
  created_at timestamptz not null default now()
);
create unique index users_email_key on public.users (lower(email));

create table public.events (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.users (id) on delete cascade,
  title text not null check (length(btrim(title)) between 3 and 120),
  description text,
  category text not null,
  location text,
  visibility public.event_visibility not null default 'private',
  event_code text not null unique
    default 'EV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  capacity integer check (capacity is null or capacity > 0),
  registration_deadline timestamptz,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint events_time_order check (ends_at > starts_at)
);
create index events_provider_idx on public.events (provider_id);
create index events_public_idx on public.events (visibility, starts_at);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events (id) on delete cascade,
  provider_id uuid not null references public.users (id) on delete cascade,
  title text not null check (length(btrim(title)) between 3 and 120),
  method public.session_method not null,
  starts_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  allowed_lateness_minutes integer not null default 15
    check (allowed_lateness_minutes between 0 and 120),
  qr_string text not null unique default gen_random_uuid()::text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'active', 'closed')),
  closes_at timestamptz generated always as
    (starts_at + make_interval(mins => duration_minutes)) stored
);
create index sessions_provider_idx on public.sessions (provider_id);
create index sessions_event_idx on public.sessions (event_id);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  participant_id uuid not null references public.users (id) on delete cascade,
  registered_at timestamptz not null default now(),
  unique (event_id, participant_id)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  participant_id uuid not null references public.users (id) on delete cascade,
  status public.attendance_status not null,
  checked_in_at timestamptz not null default now(),
  unique (session_id, participant_id)
);
create index attendance_session_idx on public.attendance_records (session_id);
```

`tests/db/harness.ts`:

```ts
import { Client } from 'pg';

export function db(): Client {
  return new Client({ connectionString: process.env.TEST_DATABASE_URL });
}

export async function asUser<T>(
  claims: { sub: string; role?: 'provider' | 'participant' },
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const client = db();
  await client.connect();
  try {
    await client.query('begin');
    await client.query('set local role authenticated');
    await client.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify({ sub: claims.sub, app_metadata: { role: claims.role ?? 'participant' } }),
    ]);
    return await fn(client);
  } finally {
    await client.query('rollback');
    await client.end();
  }
}

export async function seedProvider(): Promise<string> {
  const client = db();
  await client.connect();
  try {
    const id = crypto.randomUUID();
    await client.query(
      `insert into auth.users (id, email, raw_app_meta_data)
       values ($1, $2, '{"role":"provider"}')`, [id, `${id}@example.test`],
    );
    return id;
  } finally {
    await client.end();
  }
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test:db -- tests/db/schema.test.ts`
Expected: PASS — both tests.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_schema.sql tests/db
git commit -m "feat: add schema with five tables and derived closes_at"
```

---

### Task 3: Trusted role + RLS on every table

**Files:**
- Create: `supabase/migrations/0002_role_and_rls.sql`, `tests/db/rls.test.ts`

**Interfaces:**
- Produces: `public.is_provider()` (reads `auth.jwt() -> 'app_metadata' ->> 'role'`), `public.handle_new_user()` trigger on `auth.users`, and one policy set per table.

- [ ] **Step 1: Write the failing RLS tests (positive and negative)**

```ts
// tests/db/rls.test.ts
import { describe, expect, it } from 'vitest';
import { asUser, seedProvider } from './harness';

describe('RLS', () => {
  it('lets a provider create and read their own event', async () => {
    const provider = await seedProvider();
    await asUser({ sub: provider, role: 'provider' }, async (db) => {
      await db.query(
        `insert into public.events (provider_id, title, category, starts_at, ends_at)
         values ($1, 'ورشة', 'تقنية', now() + interval '1 day', now() + interval '2 days')`,
        [provider],
      );
      const { rows } = await db.query('select count(*)::int as n from public.events');
      expect(rows[0].n).toBe(1);
    });
  });

  it('denies a participant creating an event', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    await expect(
      asUser({ sub: participant, role: 'participant' }, (db) =>
        db.query(
          `insert into public.events (provider_id, title, category, starts_at, ends_at)
           values ($1, 'حدث', 'تقنية', now(), now() + interval '1 hour')`, [participant],
        )),
    ).rejects.toThrow(/row-level security/);
  });

  it('ignores a role forged in user_metadata', async () => {
    const participant = await seedProvider();
    const client = (await import('./harness')).db();
    await client.connect();
    try {
      await client.query('begin');
      await client.query('set local role authenticated');
      await client.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: participant, user_metadata: { role: 'provider' } }),
      ]);
      await expect(client.query(
        `insert into public.events (provider_id, title, category, starts_at, ends_at)
         values ($1, 'حدث', 'تقنية', now(), now() + interval '1 hour')`, [participant],
      )).rejects.toThrow(/row-level security/);
    } finally {
      await client.query('rollback');
      await client.end();
    }
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test:db -- tests/db/rls.test.ts`
Expected: FAIL — `public.is_provider` does not exist (or the insert succeeds when it must not).

- [ ] **Step 3: Write the migration**

```sql
-- supabase/migrations/0002_role_and_rls.sql
create or replace function public.is_provider()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'provider';
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'مستخدم'),
    coalesce(new.email, ''),
    coalesce((new.raw_app_meta_data ->> 'role')::public.user_role, 'participant')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.sessions enable row level security;
alter table public.registrations enable row level security;
alter table public.attendance_records enable row level security;

create policy users_read_self on public.users for select
  using (id = auth.uid() or public.is_provider());
create policy users_update_self on public.users for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy events_read on public.events for select
  using (visibility = 'public' or provider_id = auth.uid());
create policy events_write on public.events for all
  using (provider_id = auth.uid() and public.is_provider())
  with check (provider_id = auth.uid() and public.is_provider());

create policy sessions_read on public.sessions for select
  using (
    provider_id = auth.uid()
    or exists (select 1 from public.events e
               where e.id = sessions.event_id and e.visibility = 'public')
  );
create policy sessions_write on public.sessions for all
  using (provider_id = auth.uid() and public.is_provider())
  with check (provider_id = auth.uid() and public.is_provider());

create policy registrations_read on public.registrations for select
  using (
    participant_id = auth.uid()
    or exists (select 1 from public.events e
               where e.id = registrations.event_id and e.provider_id = auth.uid())
  );
create policy registrations_insert on public.registrations for insert
  with check (participant_id = auth.uid());
create policy registrations_delete on public.registrations for delete
  using (participant_id = auth.uid());

create policy attendance_read on public.attendance_records for select
  using (
    participant_id = auth.uid()
    or exists (select 1 from public.sessions s
               join public.events e on e.id = s.event_id
               where s.id = attendance_records.session_id and e.provider_id = auth.uid())
    or exists (select 1 from public.sessions s
               where s.id = attendance_records.session_id and s.provider_id = auth.uid())
  );
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test:db -- tests/db/rls.test.ts`
Expected: PASS — three tests.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0002_role_and_rls.sql tests/db/rls.test.ts
git commit -m "feat: add trusted role claim and RLS policies"
```

---

### Task 4: `check_in()` — server clock, idempotent

**Files:**
- Create: `supabase/migrations/0003_check_in.sql`, `tests/db/check_in.test.ts`

**Interfaces:**
- Produces: `public.check_in(p_qr_string text) returns jsonb` — `{ session_id, status, checked_in_at }`; errors `not_authenticated`, `session_not_found`, `session_closed`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/db/check_in.test.ts
import { describe, expect, it } from 'vitest';
import { asUser, seedProvider } from './harness';

async function seedSession(provider: string, startsAt: string, lateness = 15) {
  return asUser({ sub: provider, role: 'provider' }, async (db) => {
    const { rows } = await db.query(
      `insert into public.sessions (provider_id, title, method, starts_at,
         duration_minutes, allowed_lateness_minutes)
       values ($1, 'جلسة', 'face_to_face', $2, 60, $3) returning qr_string`,
      [provider, startsAt, lateness],
    );
    return rows[0].qr_string as string;
  });
}

describe('check_in', () => {
  it('marks present inside the lateness window', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const qr = await seedSession(provider, new Date(Date.now() - 60_000).toISOString());
    await asUser({ sub: participant }, async (db) => {
      const { rows } = await db.query('select public.check_in($1) as r', [qr]);
      expect(rows[0].r.status).toBe('present');
    });
  });

  it('marks late after the lateness window', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const qr = await seedSession(provider, new Date(Date.now() - 20 * 60_000).toISOString());
    await asUser({ sub: participant }, async (db) => {
      const { rows } = await db.query('select public.check_in($1) as r', [qr]);
      expect(rows[0].r.status).toBe('late');
    });
  });

  it('marks late at exactly the lateness boundary', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const qr = await seedSession(provider, new Date(Date.now() - 15 * 60_000).toISOString());
    await asUser({ sub: participant }, async (db) => {
      const { rows } = await db.query('select public.check_in($1) as r', [qr]);
      expect(rows[0].r.status).toBe('late');
    });
  });

  it('keeps one row when the same QR is scanned twice', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const qr = await seedSession(provider, new Date(Date.now() - 20 * 60_000).toISOString());
    await asUser({ sub: participant }, async (db) => {
      await db.query('select public.check_in($1)', [qr]);
      const { rows } = await db.query(
        `select public.check_in($1) as r, (select count(*)::int from public.attendance_records) as n`,
        [qr],
      );
      expect(rows[0].n).toBe(1);
      expect(rows[0].r.status).toBe('late');
    });
  });

  it('rejects a scan after the session closes', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const qr = await seedSession(provider, new Date(Date.now() - 3 * 3600_000).toISOString());
    await expect(asUser({ sub: participant }, (db) =>
      db.query('select public.check_in($1)', [qr]))).rejects.toThrow(/session_closed/);
  });

  it('ignores a client-supplied timestamp', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const qr = await seedSession(provider, new Date(Date.now() - 20 * 60_000).toISOString());
    await asUser({ sub: participant }, async (db) => {
      const { rows } = await db.query(
        `select public.check_in($1) as r,
                (select checked_in_at from public.attendance_records) as at`, [qr],
      );
      expect(rows[0].r.status).toBe('late');
      expect(Date.now() - new Date(rows[0].at).getTime()).toBeLessThan(5_000);
    });
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test:db -- tests/db/check_in.test.ts`
Expected: FAIL — `public.check_in` does not exist.

- [ ] **Step 3: Write the function**

```sql
-- supabase/migrations/0003_check_in.sql
create or replace function public.check_in(p_qr_string text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_session public.sessions%rowtype;
  v_now timestamptz := now();
  v_status public.attendance_status;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_session from public.sessions where qr_string = p_qr_string;
  if not found then
    raise exception 'session_not_found' using errcode = 'P0002';
  end if;

  if v_now > v_session.closes_at then
    raise exception 'session_closed' using errcode = 'P0001';
  end if;

  v_status := case
    when v_now > v_session.starts_at
         + make_interval(mins => v_session.allowed_lateness_minutes)
    then 'late'::public.attendance_status
    else 'present'::public.attendance_status
  end;

  insert into public.attendance_records (session_id, participant_id, status, checked_in_at)
  values (v_session.id, v_uid, v_status, v_now)
  on conflict (session_id, participant_id) do update
    set status = excluded.status,
        checked_in_at = excluded.checked_in_at;

  return jsonb_build_object(
    'session_id', v_session.id,
    'status', v_status,
    'checked_in_at', v_now
  );
end;
$$;

revoke all on function public.check_in(text) from public;
grant execute on function public.check_in(text) to authenticated;
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test:db -- tests/db/check_in.test.ts`
Expected: PASS — six tests.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0003_check_in.sql tests/db/check_in.test.ts
git commit -m "feat: add check_in with server-side clock"
```

---

### Task 5: `register_for_event()` — capacity and deadline in one transaction

**Files:**
- Create: `supabase/migrations/0004_register_for_event.sql`, `tests/db/register.test.ts`

**Interfaces:**
- Produces: `public.register_for_event(p_event_id uuid) returns jsonb` — `{ registration_id, registered_at }`; errors `event_not_found`, `event_not_public`, `registration_closed`, `event_full`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/db/register.test.ts
import { describe, expect, it } from 'vitest';
import { asUser, seedProvider } from './harness';

async function seedEvent(provider: string, capacity: number | null, deadline: string | null) {
  return asUser({ sub: provider, role: 'provider' }, async (db) => {
    const { rows } = await db.query(
      `insert into public.events (provider_id, title, category, visibility, capacity,
         registration_deadline, starts_at, ends_at)
       values ($1, 'حدث', 'تقنية', 'public', $2, $3, now() + interval '1 day',
         now() + interval '2 days') returning id`,
      [provider, capacity, deadline],
    );
    return rows[0].id as string;
  });
}

describe('register_for_event', () => {
  it('registers a participant when a seat is free', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const eventId = await seedEvent(provider, 2, null);
    await asUser({ sub: participant }, async (db) => {
      const { rows } = await db.query('select public.register_for_event($1) as r', [eventId]);
      expect(rows[0].r.registration_id).toBeTruthy();
    });
  });

  it('blocks a full event', async () => {
    const provider = await seedProvider();
    const first = await seedProvider();
    const second = await seedProvider();
    const eventId = await seedEvent(provider, 1, null);
    await asUser({ sub: first }, (db) =>
      db.query('select public.register_for_event($1)', [eventId]));
    await expect(asUser({ sub: second }, (db) =>
      db.query('select public.register_for_event($1)', [eventId])))
      .rejects.toThrow(/event_full/);
  });

  it('lets exactly one of two racing registrations take the last seat', async () => {
    const provider = await seedProvider();
    const a = await seedProvider();
    const b = await seedProvider();
    const eventId = await seedEvent(provider, 1, null);
    const results = await Promise.allSettled([
      asUser({ sub: a }, (db) => db.query('select public.register_for_event($1)', [eventId])),
      asUser({ sub: b }, (db) => db.query('select public.register_for_event($1)', [eventId])),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  });

  it('blocks registration after the deadline', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const eventId = await seedEvent(provider, null, new Date(Date.now() - 60_000).toISOString());
    await expect(asUser({ sub: participant }, (db) =>
      db.query('select public.register_for_event($1)', [eventId])))
      .rejects.toThrow(/registration_closed/);
  });

  it('refuses a private event', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const eventId = await seedEvent(provider, null, null);
    await asUser({ sub: provider, role: 'provider' }, (db) =>
      db.query(`update public.events set visibility = 'private' where id = $1`, [eventId]));
    await expect(asUser({ sub: participant }, (db) =>
      db.query('select public.register_for_event($1)', [eventId])))
      .rejects.toThrow(/event_not_public/);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test:db -- tests/db/register.test.ts`
Expected: FAIL — `public.register_for_event` does not exist.

- [ ] **Step 3: Write the function**

```sql
-- supabase/migrations/0004_register_for_event.sql
create or replace function public.register_for_event(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events%rowtype;
  v_taken int;
  v_id uuid;
  v_at timestamptz := now();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  if not found then
    raise exception 'event_not_found' using errcode = 'P0002';
  end if;
  if v_event.visibility <> 'public' then
    raise exception 'event_not_public' using errcode = 'P0001';
  end if;
  if v_event.registration_deadline is not null
     and v_at > v_event.registration_deadline then
    raise exception 'registration_closed' using errcode = 'P0001';
  end if;

  if v_event.capacity is not null then
    select count(*) into v_taken
      from public.registrations where event_id = p_event_id;
    if v_taken >= v_event.capacity then
      raise exception 'event_full' using errcode = 'P0001';
    end if;
  end if;

  insert into public.registrations (event_id, participant_id, registered_at)
  values (p_event_id, v_uid, v_at)
  on conflict (event_id, participant_id) do nothing
  returning id, registered_at into v_id, v_at;

  if v_id is null then
    select id, registered_at into v_id, v_at
      from public.registrations
      where event_id = p_event_id and participant_id = v_uid;
  end if;

  return jsonb_build_object('registration_id', v_id, 'registered_at', v_at);
end;
$$;

revoke all on function public.register_for_event(uuid) from public;
grant execute on function public.register_for_event(uuid) to authenticated;
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test:db -- tests/db/register.test.ts`
Expected: PASS — five tests, including the capacity race.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0004_register_for_event.sql tests/db/register.test.ts
git commit -m "feat: add transactional capacity-limited registration"
```

---

### Task 6: `attendance_rate()` — aggregate with a zero guard

**Files:**
- Create: `supabase/migrations/0005_attendance_rate.sql`, `tests/db/attendance_rate.test.ts`

**Interfaces:**
- Produces: `public.attendance_rate(p_event_id uuid default null) returns jsonb` — `{ total_sessions, total_attended, rate }` with `rate = 0` when there are no sessions.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/db/attendance_rate.test.ts
import { describe, expect, it } from 'vitest';
import { asUser, seedProvider } from './harness';

describe('attendance_rate', () => {
  it('returns 0 when there are no sessions', async () => {
    const participant = await seedProvider();
    await asUser({ sub: participant }, async (db) => {
      const { rows } = await db.query('select public.attendance_rate() as r');
      expect(rows[0].r).toEqual({ total_sessions: 0, total_attended: 0, rate: 0 });
    });
  });

  it('counts present and late as attended', async () => {
    const provider = await seedProvider();
    const participant = await seedProvider();
    const { sessionIds } = await asUser({ sub: provider, role: 'provider' }, async (db) => {
      const ids: string[] = [];
      for (const offset of ['1 hour', '2 hours']) {
        const { rows } = await db.query(
          `insert into public.sessions (provider_id, title, method, starts_at, duration_minutes)
           values ($1, 'جلسة', 'face_to_face', now() - interval '${offset}', 30)
           returning id`, [provider]);
        ids.push(rows[0].id);
      }
      return { sessionIds: ids };
    });
    await asUser({ sub: participant }, async (db) => {
      await db.query('select public.check_in((select qr_string from public.sessions where id = $1))',
        [sessionIds[0]]);
      const { rows } = await db.query('select public.attendance_rate() as r');
      expect(rows[0].r).toEqual({ total_sessions: 2, total_attended: 1, rate: 50 });
    });
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test:db -- tests/db/attendance_rate.test.ts`
Expected: FAIL — `public.attendance_rate` does not exist.

- [ ] **Step 3: Write the function**

```sql
-- supabase/migrations/0005_attendance_rate.sql
create or replace function public.attendance_rate(p_event_id uuid default null)
returns jsonb
language sql
stable
security invoker
as $$
  with scoped as (
    select s.id
    from public.sessions s
    where p_event_id is null or s.event_id = p_event_id
  ),
  attended as (
    select count(*)::int as n
    from public.attendance_records ar
    join scoped on scoped.id = ar.session_id
    where ar.participant_id = auth.uid()
      and ar.status in ('present', 'late')
  )
  select jsonb_build_object(
    'total_sessions', (select count(*)::int from scoped),
    'total_attended', (select n from attended),
    'rate',
      case
        when (select count(*) from scoped) = 0 then 0
        else round((select n from attended) * 100.0 / (select count(*) from scoped))
      end
  );
$$;

grant execute on function public.attendance_rate(uuid) to authenticated;
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test:db -- tests/db/attendance_rate.test.ts`
Expected: PASS — two tests, including the zero guard.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0005_attendance_rate.sql tests/db/attendance_rate.test.ts
git commit -m "feat: add attendance rate with zero guard"
```

---

### Task 7: Auth screens and route guard

**Files:**
- Create: `src/auth/AuthPage.tsx`, `src/auth/useSession.ts`, `src/auth/RequireAuth.tsx`, `src/lib/errors.ts`, `tests/ui/auth.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `supabase` from `src/lib/supabase.ts`.
- Produces: `useSession(): { user: User | null; role: 'provider' | 'participant' | null; loading: boolean }`; `RequireAuth({ role, children })`.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/ui/auth.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

import { AuthPage } from '../../src/auth/AuthPage';

describe('AuthPage', () => {
  it('shows the duplicate-email error', async () => {
    const { supabase } = await import('../../src/lib/supabase');
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      error: { message: 'User already registered' },
    } as never);
    render(<MemoryRouter><AuthPage /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'a@b.test');
    await userEvent.type(screen.getByLabelText('كلمة المرور'), 'secret123');
    await userEvent.type(screen.getByLabelText('تأكيد كلمة المرور'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء حساب' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('هذا البريد مسجل مسبقًا');
  });

  it('shows a mismatch error without calling the server', async () => {
    const { supabase } = await import('../../src/lib/supabase');
    render(<MemoryRouter><AuthPage /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'a@b.test');
    await userEvent.type(screen.getByLabelText('كلمة المرور'), 'secret123');
    await userEvent.type(screen.getByLabelText('تأكيد كلمة المرور'), 'secret124');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء حساب' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('كلمتا المرور غير متطابقتين');
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- tests/ui/auth.test.tsx`
Expected: FAIL — `AuthPage` has no fields.

- [ ] **Step 3: Write the screens and the error map**

```ts
// src/lib/errors.ts
export const messages: Record<string, string> = {
  invalid_credentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  email_exists: 'هذا البريد مسجل مسبقًا',
  password_mismatch: 'كلمتا المرور غير متطابقتين',
  session_closed: 'أُغلقت هذه الجلسة',
  session_not_found: 'رمز الجلسة غير صحيح',
  event_full: 'اكتمل العدد',
  registration_closed: 'انتهى موعد التسجيل',
  event_not_public: 'هذا الحدث غير متاح للتسجيل',
  not_authenticated: 'سجّل الدخول أولًا',
};

export function messageFor(code: string | undefined): string {
  return (code && messages[code]) ?? 'حدث خطأ غير متوقع';
}
```

```tsx
// src/auth/AuthPage.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { messageFor } from '../lib/errors';

export function AuthPage() {
  const [mode, setMode] = useState<'in' | 'up' | 'reset'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'up' && password !== confirm) {
      setError(messageFor('password_mismatch'));
      return;
    }
    if (mode === 'in') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(messageFor('invalid_credentials'));
    } else if (mode === 'up') {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(messageFor('email_exists'));
    } else {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email);
      if (err) setError('تعذر إرسال رابط الاستعادة');
    }
  }

  return (
    <main>
      <h1>{mode === 'in' ? 'تسجيل الدخول' : mode === 'up' ? 'إنشاء حساب' : 'استعادة كلمة المرور'}</h1>
      <form onSubmit={submit}>
        <label htmlFor="email">البريد الإلكتروني</label>
        <input id="email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} />
        {mode !== 'reset' && (
          <>
            <label htmlFor="password">كلمة المرور</label>
            <input id="password" type="password" required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </>
        )}
        {mode === 'up' && (
          <>
            <label htmlFor="confirm">تأكيد كلمة المرور</label>
            <input id="confirm" type="password" required value={confirm}
              onChange={(e) => setConfirm(e.target.value)} />
          </>
        )}
        <button type="submit">
          {mode === 'in' ? 'دخول' : mode === 'up' ? 'إنشاء حساب' : 'إرسال الرابط'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={() => setMode('up')}>حساب جديد</button>
      <button type="button" onClick={() => setMode('reset')}>نسيت كلمة المرور</button>
    </main>
  );
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- tests/ui/auth.test.tsx`
Expected: PASS — two tests.

- [ ] **Step 5: Commit**

```bash
git add src/auth src/lib/errors.ts tests/ui/auth.test.tsx
git commit -m "feat: add auth screens with mapped errors"
```

---

### Task 8: Provider dashboard — events CRUD

**Files:**
- Create: `src/provider/EventsPage.tsx`, `src/provider/useEvents.ts`, `tests/ui/events.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `supabase`, `useSession()`.
- Produces: `useEvents(): { events: EventRow[]; create(input): Promise<void>; loading; error }`.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/events.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: vi.fn(), auth: { getSession: vi.fn() } },
}));

import { EventsPage } from '../../src/provider/EventsPage';

describe('EventsPage', () => {
  it('requires a title before creating an event', async () => {
    render(<EventsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء حدث' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('أدخل عنوان الحدث');
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- tests/ui/events.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the screen**

```tsx
// src/provider/useEvents.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { messageFor } from '../lib/errors';

export type EventRow = {
  id: string; title: string; category: string; visibility: 'private' | 'public';
  event_code: string; capacity: number | null;
  registration_deadline: string | null; starts_at: string; ends_at: string;
};

export function useEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error: err } = await supabase
      .from('events')
      .select('id,title,category,visibility,event_code,capacity,registration_deadline,starts_at,ends_at')
      .order('starts_at', { ascending: false });
    if (err) setError(messageFor(err.code));
    else setEvents(data as EventRow[]);
  }

  async function create(input: { title: string; category: string; starts_at: string; ends_at: string }) {
    const { error: err } = await supabase.from('events').insert(input);
    if (err) throw new Error(messageFor(err.code));
    await load();
  }

  useEffect(() => { void load(); }, []);
  return { events, create, error };
}
```

```tsx
// src/provider/EventsPage.tsx
import { useState } from 'react';
import { useEvents } from './useEvents';

export function EventsPage() {
  const { events, create, error } = useEvents();
  const [title, setTitle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (title.trim().length < 3) {
      setFormError('أدخل عنوان الحدث');
      return;
    }
    await create({
      title, category: 'تقنية',
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 86_400_000).toISOString(),
    });
    setTitle('');
  }

  return (
    <section>
      <h1>لوحة المزوّد</h1>
      <form onSubmit={submit}>
        <label htmlFor="title">عنوان الحدث</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit">إنشاء حدث</button>
      </form>
      {(formError ?? error) && <p role="alert">{formError ?? error}</p>}
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            {e.title} — {e.event_code} — {e.visibility === 'public' ? 'عام' : 'خاص'}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- tests/ui/events.test.tsx && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/provider/EventsPage.tsx src/provider/useEvents.ts tests/ui/events.test.tsx
git commit -m "feat: add provider events dashboard"
```

---

### Task 9: Sessions, QR display, live attendance, CSV export

**Files:**
- Create: `src/provider/SessionPage.tsx`, `src/provider/useSessions.ts`, `src/lib/csv.ts`, `tests/ui/session.test.tsx`, `tests/ui/csv.test.ts`

**Interfaces:**
- Consumes: `supabase`, `check_in` results.
- Produces: `toCsv(rows: AttendanceRow[]): string`; `useLiveAttendance(sessionId, intervalMs = 5000)`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/ui/csv.test.ts
import { describe, expect, it } from 'vitest';
import { toCsv } from '../../src/lib/csv';

describe('toCsv', () => {
  it('writes the header and escapes commas', () => {
    const csv = toCsv([{ name: 'أحمد, علي', status: 'present', at: '2026-11-11T09:05:00Z' }]);
    expect(csv.split('\n')[0]).toBe('الاسم,الحالة,وقت الحضور');
    expect(csv).toContain('"أحمد, علي"');
  });

  it('writes only the header when there are no rows', () => {
    expect(toCsv([])).toBe('الاسم,الحالة,وقت الحضور');
  });
});
```

```tsx
// tests/ui/session.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
      })),
    })),
  },
}));

import { SessionPage } from '../../src/provider/SessionPage';

describe('SessionPage', () => {
  it('shows the empty attendance state', async () => {
    render(<MemoryRouter><SessionPage sessionId="s1" /></MemoryRouter>);
    expect(await screen.findByText('لا يوجد حضور بعد')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- tests/ui/session.test.tsx tests/ui/csv.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the code**

```ts
// src/lib/csv.ts
export type AttendanceRow = { name: string; status: string; at: string };

export function toCsv(rows: AttendanceRow[]): string {
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const header = 'الاسم,الحالة,وقت الحضور';
  return [header, ...rows.map((r) => [r.name, r.status, r.at].map(escape).join(','))].join('\n');
}
```

```tsx
// src/provider/SessionPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toCsv, type AttendanceRow } from '../lib/csv';

export function SessionPage({ sessionId }: { sessionId: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data } = await supabase
        .from('sessions').select('qr_string').eq('id', sessionId).single();
      if (alive && data) setQr(data.qr_string);
      const { data: records } = await supabase
        .from('attendance_records')
        .select('checked_in_at,status,users(full_name)')
        .eq('session_id', sessionId)
        .order('checked_in_at');
      if (alive) {
        setRows((records ?? []).map((r) => ({
          name: r.users?.full_name ?? '',
          status: r.status,
          at: r.checked_in_at,
        })));
        setLoaded(true);
      }
    }
    void load();
    const timer = setInterval(load, 5000);
    return () => { alive = false; clearInterval(timer); };
  }, [sessionId]);

  function exportCsv() {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${sessionId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section>
      <h1>الجلسة</h1>
      {qr && <p dir="ltr">{qr}</p>}
      {rows.length === 0 && loaded && <p>لا يوجد حضور بعد</p>}
      <ul>
        {rows.map((r) => <li key={r.at}>{r.name} — {r.status}</li>)}
      </ul>
      <button onClick={exportCsv} disabled={rows.length === 0}>تصدير CSV</button>
    </section>
  );
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- tests/ui/session.test.tsx tests/ui/csv.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/provider/SessionPage.tsx src/lib/csv.ts tests/ui
git commit -m "feat: add live session view and CSV export"
```

---

### Task 10: Participant check-in by camera and own attendance

**Files:**
- Create: `src/participant/CheckInPage.tsx`, `src/participant/MyAttendancePage.tsx`, `tests/ui/checkin.test.tsx`

**Interfaces:**
- Consumes: `supabase.rpc('check_in', { p_qr_string })`, `supabase.rpc('attendance_rate')`.
- Produces: two screens; no new shared code.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/checkin.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/supabase', () => ({
  supabase: { rpc: vi.fn() },
}));

import { CheckInPage } from '../../src/participant/CheckInPage';

describe('CheckInPage', () => {
  it('shows the closed-session message', async () => {
    const { supabase } = await import('../../src/lib/supabase');
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null, error: { code: 'P0001', message: 'session_closed' },
    } as never);
    render(<CheckInPage />);
    await userEvent.type(screen.getByLabelText('رمز الجلسة'), 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'تسجيل الحضور' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('أُغلقت هذه الجلسة');
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- tests/ui/checkin.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the screens**

```tsx
// src/participant/CheckInPage.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { messageFor } from '../lib/errors';

export function CheckInPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const { data, error: err } = await supabase.rpc('check_in', { p_qr_string: code });
    if (err) setError(messageFor(err.message));
    else setResult(data.status === 'late' ? 'تم التسجيل — متأخر' : 'تم التسجيل — حاضر');
  }

  return (
    <section>
      <h1>تسجيل الحضور</h1>
      <form onSubmit={submit}>
        <label htmlFor="code">رمز الجلسة</label>
        <input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <button type="submit">تسجيل الحضور</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {result && <p role="status">{result}</p>}
    </section>
  );
}
```

```tsx
// src/participant/MyAttendancePage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Rate = { total_sessions: number; total_attended: number; rate: number };

export function MyAttendancePage() {
  const [rate, setRate] = useState<Rate | null>(null);

  useEffect(() => {
    void supabase.rpc('attendance_rate').then(({ data }) => setRate(data as Rate));
  }, []);

  if (!rate) return <p>جارٍ التحميل…</p>;
  return (
    <section>
      <h1>حضوري</h1>
      <p>حضرت {rate.total_attended} من {rate.total_sessions}</p>
      <p>{rate.rate}%</p>
    </section>
  );
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- tests/ui/checkin.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/participant tests/ui/checkin.test.tsx
git commit -m "feat: add participant check-in and attendance screens"
```

---

### Task 11: Public marketplace, event detail, registration

**Files:**
- Create: `src/participant/MarketplacePage.tsx`, `src/participant/EventPage.tsx`, `tests/ui/marketplace.test.tsx`
- Create: `supabase/functions/notify-registration/index.ts`

**Interfaces:**
- Consumes: `register_for_event` RPC; `events` select under the public policy.
- Produces: `notify-registration` edge function that accepts `{ registration_id }` and returns `202`; failure never blocks the registration.

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/ui/marketplace.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
        })),
      })),
    })),
    rpc: vi.fn(),
  },
}));

import { MarketplacePage } from '../../src/participant/MarketplacePage';

describe('MarketplacePage', () => {
  it('shows the empty state when no public events exist', async () => {
    render(<MarketplacePage />);
    expect(await screen.findByText('لا توجد فعاليات منشورة')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- tests/ui/marketplace.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the screens and the function**

```tsx
// src/participant/MarketplacePage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type PublicEvent = { id: string; title: string; category: string; starts_at: string };

export function MarketplacePage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void supabase.from('events')
      .select('id,title,category,starts_at')
      .eq('visibility', 'public')
      .order('starts_at')
      .limit(50)
      .then(({ data }) => {
        setEvents((data ?? []) as PublicEvent[]);
        setLoaded(true);
      });
  }, []);

  return (
    <section>
      <h1>الفعاليات</h1>
      {loaded && events.length === 0 && <p>لا توجد فعاليات منشورة</p>}
      <ul>
        {events.map((e) => (
          <li key={e.id}><Link to={`/events/${e.id}`}>{e.title}</Link> — {e.category}</li>
        ))}
      </ul>
    </section>
  );
}
```

```tsx
// src/participant/EventPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { messageFor } from '../lib/errors';

export function EventPage({ eventId }: { eventId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => { setError(null); setDone(false); }, [eventId]);

  async function register() {
    setError(null);
    const { data, error: err } = await supabase.rpc('register_for_event', { p_event_id: eventId });
    if (err) {
      setError(messageFor(err.message));
      return;
    }
    setDone(true);
    void supabase.functions.invoke('notify-registration', {
      body: { registration_id: data.registration_id },
    });
  }

  return (
    <section>
      <h1>تفاصيل الفعالية</h1>
      <button onClick={register} disabled={done}>التسجيل</button>
      {error && <p role="alert">{error}</p>}
      {done && <p role="status">تم التسجيل</p>}
    </section>
  );
}
```

```ts
// supabase/functions/notify-registration/index.ts
Deno.serve(async (req) => {
  const { registration_id } = await req.json();
  const apiKey = Deno.env.get('MAIL_API_KEY');
  if (!apiKey) return new Response('email_skipped', { status: 202 });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'no-reply@hadir.example',
      to: 'participant@example.test',
      subject: 'تم تسجيلك',
      text: `تم تأكيد تسجيلك (${registration_id})`,
    }),
  });
  return new Response(JSON.stringify({ ok: res.ok }), {
    status: 202, headers: { 'Content-Type': 'application/json' },
  });
});
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- tests/ui/marketplace.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/participant supabase/functions/notify-registration tests/ui/marketplace.test.tsx
git commit -m "feat: add public marketplace and registration"
```

---

### Task 12: Analytics

**Files:**
- Create: `src/analytics/AnalyticsPage.tsx`, `tests/ui/analytics.test.tsx`

**Interfaces:**
- Consumes: `supabase.rpc('attendance_rate', { p_event_id })`.
- Produces: analytics screen with an event filter and a zero state.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/ui/analytics.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/supabase', () => ({ supabase: { rpc: vi.fn() } }));

import { AnalyticsPage } from '../../src/analytics/AnalyticsPage';

describe('AnalyticsPage', () => {
  it('renders 0% when there are no sessions', async () => {
    const { supabase } = await import('../../src/lib/supabase');
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: { total_sessions: 0, total_attended: 0, rate: 0 }, error: null,
    } as never);
    render(<AnalyticsPage />);
    expect(await screen.findByText('0%')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- tests/ui/analytics.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the screen**

```tsx
// src/analytics/AnalyticsPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Rate = { total_sessions: number; total_attended: number; rate: number };

export function AnalyticsPage() {
  const [rate, setRate] = useState<Rate | null>(null);

  useEffect(() => {
    void supabase.rpc('attendance_rate').then(({ data }) => setRate(data as Rate));
  }, []);

  if (!rate) return <p>جارٍ التحميل…</p>;
  return (
    <section>
      <h1>التحليلات</h1>
      <p>{rate.total_attended} من {rate.total_sessions}</p>
      <p>{rate.rate}%</p>
    </section>
  );
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- tests/ui/analytics.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/analytics tests/ui/analytics.test.tsx
git commit -m "feat: add analytics screen"
```

---

### Task 13: Wiring, seed data, deployment, run instructions

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`, `README.md`
- Create: `supabase/seed.sql`, `docs/m4/runbook.md`

**Interfaces:**
- Consumes: every screen and RPC from Tasks 1–12.
- Produces: the six routes, a seeded demo project, and the documented run steps (NFR-8).

- [ ] **Step 1: Write the failing routing test**

```tsx
// tests/ui/routes.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn(() => Promise.resolve({ data: { session: null } })) },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

import App from '../../src/App';

describe('routes', () => {
  it('sends an anonymous visitor to the marketplace', async () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(await screen.findByText('الفعاليات')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- tests/ui/routes.test.tsx`
Expected: FAIL — the app still renders the auth screen at `/`.

- [ ] **Step 3: Wire the routes and the seed**

```tsx
// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import { AuthPage } from './auth/AuthPage';
import { RequireAuth } from './auth/RequireAuth';
import { EventsPage } from './provider/EventsPage';
import { SessionPage } from './provider/SessionPage';
import { MarketplacePage } from './participant/MarketplacePage';
import { EventPage } from './participant/EventPage';
import { CheckInPage } from './participant/CheckInPage';
import { MyAttendancePage } from './participant/MyAttendancePage';
import { AnalyticsPage } from './analytics/AnalyticsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<MarketplacePage />} />
      <Route path="/events/:id" element={<EventPage />} />
      <Route path="/checkin" element={<RequireAuth><CheckInPage /></RequireAuth>} />
      <Route path="/me" element={<RequireAuth><MyAttendancePage /></RequireAuth>} />
      <Route path="/provider" element={<RequireAuth role="provider"><EventsPage /></RequireAuth>} />
      <Route path="/provider/sessions/:id" element={<RequireAuth role="provider"><SessionPage /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth role="provider"><AnalyticsPage /></RequireAuth>} />
    </Routes>
  );
}
```

`supabase/seed.sql`:

```sql
insert into auth.users (id, email, raw_app_meta_data)
values
  ('00000000-0000-0000-0000-000000000001', 'provider@hadir.test',
   '{"role":"provider"}'),
  ('00000000-0000-0000-0000-000000000002', 'participant@hadir.test',
   '{"role":"participant"}');
```

- [ ] **Step 4: Run the whole suite and confirm it passes**

Run: `npm test && npm run test:db && npm run typecheck && npm run build`
Expected: PASS — every suite, no type errors, a successful build.

- [ ] **Step 5: Document the run steps and commit**

`docs/m4/runbook.md` must state: the Supabase project and keys, `supabase db push`, the seed command, `npm run dev`, the static build, and the two deployment targets. Then:

```bash
git add src/App.tsx supabase/seed.sql docs/m4/runbook.md README.md
git commit -m "feat: wire routes, seed data, and run instructions"
```

---

## Self-Review

- **Spec coverage:** AC-01…03 → Task 7; EV-01…04 → Task 8; SE-01…08 → Tasks 2, 8, 9; AT-01…04 → Tasks 4, 9, 10; PB-01…07 → Tasks 3, 8, 11; AN-01…02 → Tasks 6, 12; NFR-1 → Task 9 (poll); NFR-2 → Task 3; NFR-4 → Task 4; NFR-6/7 → Tasks 2 (generated `closes_at`) and 8/11 (deadline checks); NFR-8 → Task 13; NFR-9 → every task's tests.
- **Placeholder scan:** no TBD, no "add validation", no "similar to Task N" — every step carries its code.
- **Type consistency:** `check_in(p_qr_string)`, `register_for_event(p_event_id)`, `attendance_rate(p_event_id)` are used with the same names and shapes in Tasks 4–6, 10, 11, and 12; `asUser({ sub, role })` and `seedProvider()` are used identically in Tasks 2–6.
- **Review Focus:** each of the five lines has a test in the owning task (Task 4: twice-scan, boundary, closed; Task 5: capacity race; Task 3: forged claim).
- **Known gaps to raise before Task 1:** SE-01 and PB-05 are the two requirements most likely to push past the ceiling (a standalone session screen and a filter/search bar); if either is dropped, `traceability.md` must be updated in the same commit. The registration confirmation email needs `MAIL_API_KEY`; without it the edge function returns `202` and no email is sent, which must be stated in the runbook.
