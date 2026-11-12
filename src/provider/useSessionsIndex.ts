import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateCheckInCode } from '../lib/checkInCode';
import type { SessionMethod, SessionRow, SessionStatus } from '../lib/types';
import { demoData, isDemoUser } from '../demo/demoData';

export type IndexedSession = {
  id: string;
  event_id: string | null;
  title: string;
  starts_at: string;
  duration_minutes: number;
  status: SessionStatus;
  check_in_code: string;
  event_title: string;
};

export type NewSession = {
  event_id: string;
  title: string;
  starts_at: string;
  duration_minutes: number;
  allowed_lateness_minutes: number;
  method: SessionMethod;
};

export function useSessionsIndex(providerId: string | undefined) {
  const [sessions, setSessions] = useState<IndexedSession[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!providerId) return;

    if (isDemoUser(providerId)) {
      const titles = new Map(
        demoData.events
          .filter((event) => event.provider_id === providerId)
          .map((event) => [event.id, event.title]),
      );
      setSessions(
        demoData.sessions
          .filter((session) => session.provider_id === providerId)
          .map((session) => ({
            id: session.id,
            event_id: session.event_id,
            title: session.title,
            starts_at: session.starts_at,
            duration_minutes: session.duration_minutes,
            status: session.status,
            check_in_code: session.check_in_code,
            event_title: session.event_id ? (titles.get(session.event_id) ?? '') : '',
          }))
          .sort((left, right) => right.starts_at.localeCompare(left.starts_at)),
      );
      setFailed(false);
      return;
    }

    const result = await supabase
      .from('sessions')
      .select('*')
      .eq('provider_id', providerId)
      .order('starts_at', { ascending: false });

    if (result.error) {
      setFailed(true);
      return;
    }

    const rows = (result.data ?? []) as SessionRow[];
    const eventIds = [
      ...new Set(rows.map((row) => row.event_id).filter((id): id is string => Boolean(id))),
    ];
    const eventsResult = eventIds.length
      ? await supabase.from('events').select('id,title').in('id', eventIds)
      : { data: [], error: null };

    if (eventsResult.error) {
      setFailed(true);
      return;
    }

    const titles = new Map(
      ((eventsResult.data ?? []) as { id: string; title: string }[]).map((event) => [
        event.id,
        event.title,
      ]),
    );

    setSessions(
      rows.map((row) => ({
        id: row.id,
        event_id: row.event_id,
        title: row.title,
        starts_at: row.starts_at,
        duration_minutes: row.duration_minutes,
        status: row.status,
        check_in_code: row.check_in_code,
        event_title: row.event_id ? (titles.get(row.event_id) ?? '') : '',
      })),
    );
    setFailed(false);
  }, [providerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const createSession = useCallback(
    async (input: NewSession) => {
      if (!providerId) return false;

      if (isDemoUser(providerId)) {
        const checkInCode = generateCheckInCode(
          demoData.sessions.map((session) => session.check_in_code),
        );
        demoData.sessions.push({
          id: `demo-session-${Date.now()}`,
          provider_id: providerId,
          title: input.title,
          event_id: input.event_id,
          method: input.method,
          starts_at: input.starts_at,
          duration_minutes: input.duration_minutes,
          allowed_lateness_minutes: input.allowed_lateness_minutes,
          check_in_code: checkInCode,
          qr_string: `HADIR:JOIN:${checkInCode}`,
          status: 'scheduled',
          closes_at: new Date(
            new Date(input.starts_at).getTime() + input.duration_minutes * 60_000,
          ).toISOString(),
        });
        await load();
        return true;
      }

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const checkInCode = generateCheckInCode();
        const { error } = await supabase.from('sessions').insert({
          ...input,
          provider_id: providerId,
          check_in_code: checkInCode,
          qr_string: `HADIR:JOIN:${checkInCode}`,
        });
        if (!error) {
          await load();
          return true;
        }
        if (error.code !== '23505') return false;
      }
      return false;
    },
    [providerId, load],
  );

  return { sessions, failed, reload: load, createSession };
}
