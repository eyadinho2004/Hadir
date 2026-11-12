-- Hadir check-in: the four digit code, the join RPC, and the gaps found
-- while wiring the client to a real project.

-- 1. Sessions are created with a four digit code, and the client retries on 23505.
alter table public.sessions add column if not exists check_in_code text;

do $$
declare
  r record;
  v_code text;
begin
  for r in select id from public.sessions where check_in_code is null loop
    loop
      v_code := lpad((floor(random() * 10000))::int::text, 4, '0');
      exit when not exists (select 1 from public.sessions where check_in_code = v_code);
    end loop;
    update public.sessions set check_in_code = v_code where id = r.id;
  end loop;
end $$;

alter table public.sessions alter column check_in_code set not null;

alter table public.sessions drop constraint if exists sessions_check_in_code_format;
alter table public.sessions
  add constraint sessions_check_in_code_format check (check_in_code ~ '^[0-9]{4}$');

create unique index if not exists sessions_check_in_code_key
  on public.sessions (check_in_code);

-- 2. A participant who joined by code can read that event and its sessions,
--    including private events. Security definer keeps the policy out of a loop.
create or replace function public.is_registered(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.registrations r
    where r.event_id = p_event_id and r.participant_id = auth.uid()
  );
$$;

drop policy if exists events_read_registered on public.events;
create policy events_read_registered on public.events for select
  using (public.is_registered(events.id));

drop policy if exists sessions_read_registered on public.sessions;
create policy sessions_read_registered on public.sessions for select
  using (public.is_registered(sessions.event_id));

-- 3. The check-in the participant screen calls. It owns the attendance insert,
--    so attendance_records stays read only for clients.
create or replace function public.join_session(p_code text)
returns table (already_checked_in boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_session public.sessions;
  v_status public.attendance_status;
  v_existing boolean;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_session from public.sessions where check_in_code = p_code;
  if not found then
    raise exception 'invalid_code';
  end if;

  if v_session.status <> 'active' then
    raise exception 'session_not_active';
  end if;

  if now() > v_session.closes_at then
    raise exception 'session_ended';
  end if;

  select exists (
    select 1
    from public.attendance_records a
    where a.session_id = v_session.id and a.participant_id = v_uid
  ) into v_existing;

  if v_existing then
    return query select true;
    return;
  end if;

  v_status := case
    when now() <= v_session.starts_at
      + make_interval(mins => v_session.allowed_lateness_minutes)
      then 'present'::public.attendance_status
    else 'late'::public.attendance_status
  end;

  insert into public.attendance_records (session_id, participant_id, status)
  values (v_session.id, v_uid, v_status)
  on conflict (session_id, participant_id) do nothing;

  if v_session.event_id is not null then
    insert into public.registrations (event_id, participant_id)
    values (v_session.event_id, v_uid)
    on conflict (event_id, participant_id) do nothing;
  end if;

  return query select false;
end;
$$;

revoke all on function public.join_session(text) from public;
grant execute on function public.join_session(text) to authenticated;

-- 4. Sign-up sends first_name and last_name, and the provider screens show
--    users.full_name, so the profile row has to compose both.
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
      nullif(
        btrim(concat_ws(' ',
          new.raw_user_meta_data ->> 'first_name',
          new.raw_user_meta_data ->> 'last_name'
        )),
        ''
      ),
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

-- 5. Event codes are six digits in every screen, so the database issues them
--    and retries until the code is free instead of using the EV- prefix.
create or replace function public.assign_event_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.event_code is null or btrim(new.event_code) = '' then
    loop
      new.event_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
      exit when not exists (select 1 from public.events where event_code = new.event_code);
    end loop;
  end if;
  return new;
end;
$$;

alter table public.events alter column event_code drop default;

drop trigger if exists events_code on public.events;
create trigger events_code
  before insert on public.events
  for each row execute function public.assign_event_code();
