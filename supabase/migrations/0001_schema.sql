-- Hadir M1 schema: five tables, enums, indexes.
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
  closes_at timestamptz
);

create or replace function public.set_session_closes_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.closes_at := new.starts_at + make_interval(mins => new.duration_minutes);
  return new;
end;
$$;

create trigger sessions_closes_at
  before insert or update of starts_at, duration_minutes on public.sessions
  for each row execute function public.set_session_closes_at();

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
