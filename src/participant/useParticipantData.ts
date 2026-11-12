import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AttendanceRecord, AttendanceStatus, EventRow, RegistrationRow } from '../lib/types';
import { demoData, isDemoUser } from '../demo/demoData';

export type MyAttendance = {
  id: string;
  status: AttendanceStatus;
  checked_in_at: string;
  session_title: string;
  session_starts_at: string;
};

export type MyRegistration = {
  id: string;
  registered_at: string;
  event: EventRow | null;
};

export function useParticipantData(participantId: string | undefined) {
  const [attendance, setAttendance] = useState<MyAttendance[] | null>(null);
  const [registrations, setRegistrations] = useState<MyRegistration[] | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!participantId) return;
    if (isDemoUser(participantId)) {
      const records = demoData.attendance.filter(
        (record) => record.participant_id === participantId,
      );
      const sessionRows = demoData.sessions.map((session) => ({
        id: session.id,
        title: session.title,
        starts_at: session.starts_at,
      }));
      const sessions = new Map(sessionRows.map((session) => [session.id, session]));
      setSessionCount(sessionRows.length);
      setAttendance(
        records
          .map((record) => {
            const session = sessions.get(record.session_id);
            return {
              id: record.id,
              status: record.status,
              checked_in_at: record.checked_in_at,
              session_title: session?.title ?? '',
              session_starts_at: session?.starts_at ?? record.checked_in_at,
            };
          })
          .sort((left, right) => right.session_starts_at.localeCompare(left.session_starts_at)),
      );
      setRegistrations(
        demoData.registrations
          .filter((row) => row.participant_id === participantId)
          .map((row) => ({
            id: row.id,
            registered_at: row.registered_at,
            event: demoData.events.find((event) => event.id === row.event_id) ?? null,
          })),
      );
      setFailed(false);
      return;
    }

    const recordResult = await supabase
      .from('attendance_records')
      .select('*')
      .eq('participant_id', participantId);
    if (recordResult.error) {
      setFailed(true);
      return;
    }

    const records = (recordResult.data ?? []) as AttendanceRecord[];
    const sessionsResult = await supabase.from('sessions').select('id,title,starts_at');
    if (sessionsResult.error) {
      setFailed(true);
      return;
    }

    const sessionRows = (sessionsResult.data ?? []) as {
      id: string;
      title: string;
      starts_at: string;
    }[];
    const sessions = new Map(sessionRows.map((session) => [session.id, session]));
    setSessionCount(sessionRows.length);

    setAttendance(
      records
        .map((record) => {
          const session = sessions.get(record.session_id);
          return {
            id: record.id,
            status: record.status,
            checked_in_at: record.checked_in_at,
            session_title: session?.title ?? '',
            session_starts_at: session?.starts_at ?? record.checked_in_at,
          };
        })
        .sort((left, right) => right.session_starts_at.localeCompare(left.session_starts_at)),
    );

    const registrationResult = await supabase
      .from('registrations')
      .select('*')
      .eq('participant_id', participantId);
    if (registrationResult.error) {
      setFailed(true);
      return;
    }

    const registrationRows = (registrationResult.data ?? []) as RegistrationRow[];
    const eventIds = [...new Set(registrationRows.map((row) => row.event_id))];
    const eventsResult = eventIds.length
      ? await supabase.from('events').select('*').in('id', eventIds)
      : { data: [], error: null };
    if (eventsResult.error) {
      setFailed(true);
      return;
    }

    const events = new Map(
      ((eventsResult.data ?? []) as EventRow[]).map((event) => [event.id, event]),
    );

    setRegistrations(
      registrationRows.map((row) => ({
        id: row.id,
        registered_at: row.registered_at,
        event: events.get(row.event_id) ?? null,
      })),
    );
    setFailed(false);
  }, [participantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const present = (attendance ?? []).filter((row) => row.status === 'present').length;
  const late = (attendance ?? []).filter((row) => row.status === 'late').length;
  const total = sessionCount;
  const attended = present + late;

  return {
    attendance,
    registrations,
    failed,
    reload: load,
    summary: {
      total,
      present,
      late,
      rate: total === 0 ? 0 : Math.round((attended / total) * 100),
    },
  };
}
