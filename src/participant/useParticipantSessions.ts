import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { parseCheckInCode } from '../lib/checkInCode';
import type {
  AttendanceRecord,
  AttendanceStatus,
  EventRow,
  RegistrationRow,
  SessionRow,
  SessionStatus,
} from '../lib/types';
import { demoData, isDemoUser } from '../demo/demoData';

export type ParticipantSession = {
  id: string;
  event_id: string | null;
  title: string;
  starts_at: string;
  duration_minutes: number;
  status: SessionStatus;
  event_title: string;
  registered: boolean;
  attendance: AttendanceStatus | null;
};

export type JoinResult =
  | 'joined'
  | 'already'
  | 'invalid'
  | 'notActive'
  | 'ended'
  | 'failed';

type EventInfo = Pick<EventRow, 'id' | 'title' | 'visibility'>;

function sessionCode(session: SessionRow): string | null {
  return session.check_in_code || parseCheckInCode(session.qr_string);
}

function joinError(error: { message?: string } | null): JoinResult {
  const message = error?.message ?? '';
  if (message.includes('invalid_code')) return 'invalid';
  if (message.includes('session_not_active')) return 'notActive';
  if (message.includes('session_ended')) return 'ended';
  return 'failed';
}

export function useParticipantSessions(participantId: string | undefined) {
  const [sessions, setSessions] = useState<ParticipantSession[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!participantId) return;

    if (isDemoUser(participantId)) {
      const registeredIds = new Set(
        demoData.registrations
          .filter((row) => row.participant_id === participantId)
          .map((row) => row.event_id),
      );
      const events = new Map(
        demoData.events
          .filter((event) => event.visibility === 'public' || registeredIds.has(event.id))
          .map((event) => [event.id, event]),
      );
      const attendance = new Map(
        demoData.attendance
          .filter((record) => record.participant_id === participantId)
          .map((record) => [record.session_id, record.status]),
      );

      setSessions(
        demoData.sessions
          .filter((session) => session.event_id && events.has(session.event_id))
          .map((session) => {
            const event = session.event_id ? events.get(session.event_id) : undefined;
            return {
              id: session.id,
              event_id: session.event_id,
              title: session.title,
              starts_at: session.starts_at,
              duration_minutes: session.duration_minutes,
              status: session.status,
              event_title: event?.title ?? '',
              registered: Boolean(event && registeredIds.has(event.id)),
              attendance: attendance.get(session.id) ?? null,
            };
          })
          .sort((left, right) => right.starts_at.localeCompare(left.starts_at)),
      );
      setFailed(false);
      return;
    }

    const [publicResult, registrationResult, attendanceResult] = await Promise.all([
      supabase.from('events').select('id').eq('visibility', 'public'),
      supabase.from('registrations').select('event_id').eq('participant_id', participantId),
      supabase.from('attendance_records').select('*').eq('participant_id', participantId),
    ]);

    if (publicResult.error || registrationResult.error || attendanceResult.error) {
      setFailed(true);
      return;
    }

    const registeredIds = new Set(
      ((registrationResult.data ?? []) as RegistrationRow[]).map((row) => row.event_id),
    );
    const eventIds = [
      ...new Set([
        ...((publicResult.data ?? []) as { id: string }[]).map((row) => row.id),
        ...registeredIds,
      ]),
    ];

    if (eventIds.length === 0) {
      setSessions([]);
      setFailed(false);
      return;
    }

    const [eventsResult, sessionsResult] = await Promise.all([
      supabase.from('events').select('id,title,visibility').in('id', eventIds),
      supabase
        .from('sessions')
        .select('*')
        .in('event_id', eventIds)
        .order('starts_at', { ascending: false }),
    ]);

    if (eventsResult.error || sessionsResult.error) {
      setFailed(true);
      return;
    }

    const events = new Map(
      ((eventsResult.data ?? []) as EventInfo[]).map((event) => [event.id, event]),
    );
    const attendance = new Map(
      ((attendanceResult.data ?? []) as AttendanceRecord[]).map((record) => [
        record.session_id,
        record.status,
      ]),
    );

    setSessions(
      ((sessionsResult.data ?? []) as SessionRow[]).map((session) => {
        const event = session.event_id ? events.get(session.event_id) : undefined;
        return {
          id: session.id,
          event_id: session.event_id,
          title: session.title,
          starts_at: session.starts_at,
          duration_minutes: session.duration_minutes,
          status: session.status,
          event_title: event?.title ?? '',
          registered: Boolean(event && registeredIds.has(event.id)),
          attendance: attendance.get(session.id) ?? null,
        };
      }),
    );
    setFailed(false);
  }, [participantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const joinWithCode = useCallback(
    async (rawCode: string): Promise<JoinResult> => {
      const code = parseCheckInCode(rawCode);
      if (!code) return 'invalid';
      if (!participantId) return 'failed';

      if (isDemoUser(participantId)) {
        const session = demoData.sessions.find((row) => sessionCode(row) === code);
        if (!session) return 'invalid';
        if (session.status !== 'active') return 'notActive';
        if (Date.now() > new Date(session.closes_at).getTime()) return 'ended';

        const existing = demoData.attendance.find(
          (record) =>
            record.session_id === session.id && record.participant_id === participantId,
        );
        if (existing) {
          await load();
          return 'already';
        }

        const startsAt = new Date(session.starts_at).getTime();
        const status: AttendanceStatus =
          Date.now() <= startsAt + session.allowed_lateness_minutes * 60_000
            ? 'present'
            : 'late';

        demoData.attendance.push({
          id: `demo-attendance-${Date.now()}`,
          session_id: session.id,
          participant_id: participantId,
          status,
          checked_in_at: new Date().toISOString(),
        });

        if (
          session.event_id &&
          !demoData.registrations.some(
            (row) =>
              row.event_id === session.event_id && row.participant_id === participantId,
          )
        ) {
          demoData.registrations.push({
            id: `demo-registration-${Date.now()}`,
            event_id: session.event_id,
            participant_id: participantId,
            registered_at: new Date().toISOString(),
          });
        }

        await load();
        return 'joined';
      }

      const { data, error } = await supabase.rpc('join_session', { p_code: code });
      if (error) return joinError(error);

      const row = (Array.isArray(data) ? data[0] : data) as
        | { already_checked_in?: boolean }
        | null;
      await load();
      return row?.already_checked_in ? 'already' : 'joined';
    },
    [participantId, load],
  );

  return { sessions, failed, reload: load, joinWithCode };
}
