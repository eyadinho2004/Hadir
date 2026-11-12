-- Trusted role claim, profile row, and RLS on every table.

-- The role arrives at sign-up in user_metadata, which the client can rewrite.
-- A BEFORE INSERT trigger copies it into app_metadata, which only the server writes.
create or replace function public.set_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(new.raw_user_meta_data ->> 'role', 'participant');
begin
  if v_role not in ('provider', 'participant') then
    v_role := 'participant';
  end if;
  new.raw_app_meta_data :=
    coalesce(new.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', v_role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_role on auth.users;
create trigger on_auth_user_created_role
  before insert on auth.users
  for each row execute function public.set_user_role();

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
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'مستخدم'
    ),
    coalesce(new.email, ''),
    coalesce((new.raw_app_meta_data ->> 'role')::public.user_role, 'participant')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
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
