import { describe, expect, it } from 'vitest';

const migrations = import.meta.glob<string>('../../supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const sql = Object.keys(migrations)
  .sort()
  .map((name) => migrations[name] ?? '')
  .join('\n')
  .replace(/--[^\n]*/g, ' ')
  .replace(/\s+/g, ' ')
  .toLowerCase();

function functionBody(name: string): string {
  const start = sql.lastIndexOf(`create or replace function public.${name}`);
  if (start === -1) return '';
  const end = sql.indexOf('$$;', start);
  return sql.slice(start, end === -1 ? undefined : end);
}

describe('database contract the client depends on', () => {
  it('adds the four digit check in code that sessions are created with', () => {
    expect(sql).toMatch(/alter table public\.sessions[^;]*add column[^;]*check_in_code text/);
    expect(sql).toMatch(/check \(check_in_code ~ '\^\[0-9\]\{4\}\$'\)/);
  });

  it('keeps check in codes unique so the client can retry on conflict', () => {
    expect(sql).toMatch(/create unique index[^;]*on public\.sessions \(check_in_code\)/);
  });

  it('defines join_session as a security definer function', () => {
    expect(sql).toMatch(
      /create or replace function public\.join_session\(p_code text\)[\s\S]*?security definer/,
    );
  });

  it('raises the failure codes the participant screen maps to messages', () => {
    expect(sql).toContain("raise exception 'invalid_code'");
    expect(sql).toContain("raise exception 'session_not_active'");
    expect(sql).toContain("raise exception 'session_ended'");
  });

  it('records the attendance and the event registration inside join_session', () => {
    const body = functionBody('join_session');
    expect(body).toMatch(/insert into public\.attendance_records/);
    expect(body).toMatch(/insert into public\.registrations/);
  });

  it('reports a repeated check in instead of failing it', () => {
    expect(functionBody('join_session')).toContain('already_checked_in');
  });

  it('limits join_session execution to signed in users', () => {
    expect(sql).toMatch(/revoke all on function public\.join_session\(text\) from public/);
    expect(sql).toMatch(/grant execute on function public\.join_session\(text\) to authenticated/);
  });

  it('lets a registered participant read their private event and its sessions', () => {
    expect(sql).toMatch(/create or replace function public\.is_registered\(p_event_id uuid\)/);
    expect(sql).toMatch(/create policy events_read_registered/);
    expect(sql).toMatch(/create policy sessions_read_registered/);
  });

  it('builds the profile name from the names collected at sign up', () => {
    const body = functionBody('handle_new_user');
    expect(body).toContain("raw_user_meta_data ->> 'first_name'");
    expect(body).toContain("raw_user_meta_data ->> 'last_name'");
  });

  it('issues the six digit event codes the provider screens show', () => {
    expect(sql).toMatch(/create or replace function public\.assign_event_code/);
    expect(sql).toMatch(/create trigger events_code/);
    expect(sql).toContain('1000000');
  });
});
