import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateCheckInCode } from '../lib/checkInCode';
import type {
  AttendanceRecord,
  AttendanceStatus,
  EventRow,
  RegistrationRow,
  SessionMethod,
  SessionRow,
  Visibility,
} from '../lib/types';
import { demoAttendanceFor, demoData, demoNameFor, isDemoUser } from '../demo/demoData';

export type NewSession = {
  title: string;
  starts_at: string;
  duration_minutes: number;
  allowed_lateness_minutes: number;
  method: SessionMethod;
};

export type EventUpdate = {
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  visibility: Visibility;
  capacity: number | null;
  registration_deadline: string | null;
  starts_at: string;
  ends_at: string;
};

export type SessionUpdate = NewSession;

export type Registrant = {
  id: string;
  name: string;
  registered_at: string;
};

export type SessionAttendee = {
  id: string;
  name: string;
  status: AttendanceStatus;
  checked_in_at: string;
};

export type AttendanceBySession = Record<string, SessionAttendee[]>;

type PersonRow = { id: string; full_name: string };

function namesById(people: PersonRow[]): Map<string, string> {
  return new Map(people.map((person) => [person.id, person.full_name]));
}

function groupAttendance(
  sessions: SessionRow[],
  records: AttendanceRecord[],
  names: Map<string, string>,
): AttendanceBySession {
  const grouped: AttendanceBySession = {};
  for (const session of sessions) grouped[session.id] = [];
  for (const record of records) {
    (grouped[record.session_id] ??= []).push({
      id: record.id,
      name: names.get(record.participant_id) ?? '',
      status: record.status,
      checked_in_at: record.checked_in_at,
    });
  }
  return grouped;
}

export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [registrants, setRegistrants] = useState<Registrant[] | null>(null);
  const [attendance, setAttendance] = useState<AttendanceBySession | null>(null);
  const [failed, setFailed] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!eventId) return;

    const demoEvent = demoData.events.find((row) => row.id === eventId);
    if (demoEvent) {
      const eventSessions = demoData.sessions
        .filter((session) => session.event_id === eventId)
        .sort((left, right) => right.starts_at.localeCompare(left.starts_at));
      const demoRecords = eventSessions.flatMap((session) => demoAttendanceFor(session.id));

      setEvent(demoEvent);
      setSessions(eventSessions);
      setRegistrants(
        demoData.registrations
          .filter((registration) => registration.event_id === eventId)
          .sort((left, right) => right.registered_at.localeCompare(left.registered_at))
          .map((registration) => ({
            id: registration.id,
            name: demoNameFor(registration.participant_id),
            registered_at: registration.registered_at,
          })),
      );
      setAttendance(
        groupAttendance(
          eventSessions,
          demoRecords,
          new Map(
            demoRecords.map((record) => [
              record.participant_id,
              demoNameFor(record.participant_id),
            ]),
          ),
        ),
      );
      setFailed(false);
      setNotFound(false);
      return;
    }

    const [eventResult, sessionResult] = await Promise.all([
      supabase.from('events').select('*').eq('id', eventId).maybeSingle(),
      supabase
        .from('sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('starts_at', { ascending: false }),
    ]);

    if (eventResult.error || sessionResult.error) {
      setFailed(true);
      return;
    }
    if (!eventResult.data) {
      setNotFound(true);
      return;
    }

    const eventRow = eventResult.data as EventRow;
    const sessionRows = (sessionResult.data ?? []) as SessionRow[];
    setEvent(eventRow);
    setSessions(sessionRows);

    const [registrationResult, attendanceResult] = await Promise.all([
      supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false }),
      sessionRows.length
        ? supabase
            .from('attendance_records')
            .select('*')
            .in(
              'session_id',
              sessionRows.map((session) => session.id),
            )
            .order('checked_in_at')
        : Promise.resolve({ data: [] as AttendanceRecord[], error: null }),
    ]);

    if (registrationResult.error || attendanceResult.error) {
      setFailed(true);
      return;
    }

    const registrationRows = (registrationResult.data ?? []) as RegistrationRow[];
    const attendanceRows = (attendanceResult.data ?? []) as AttendanceRecord[];
    const personIds = [
      ...new Set([
        ...registrationRows.map((registration) => registration.participant_id),
        ...attendanceRows.map((record) => record.participant_id),
      ]),
    ];
    const peopleResult = personIds.length
      ? await supabase.from('users').select('id,full_name').in('id', personIds)
      : { data: [] as PersonRow[], error: null };

    if (peopleResult.error) {
      setFailed(true);
      return;
    }

    const names = namesById((peopleResult.data ?? []) as PersonRow[]);
    setRegistrants(
      registrationRows.map((registration) => ({
        id: registration.id,
        name: names.get(registration.participant_id) ?? '',
        registered_at: registration.registered_at,
      })),
    );
    setAttendance(groupAttendance(sessionRows, attendanceRows, names));
    setFailed(false);
    setNotFound(false);
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  const createSession = useCallback(
    async (input: NewSession) => {
      if (!event) return false;
      if (isDemoUser(event.provider_id)) {
        const id = `demo-session-${Date.now()}`;
        const checkInCode = generateCheckInCode(
          demoData.sessions.map((session) => session.check_in_code),
        );
        const endsAt = new Date(
          new Date(input.starts_at).getTime() + input.duration_minutes * 60_000,
        ).toISOString();
        demoData.sessions.push({
          id,
          event_id: event.id,
          provider_id: event.provider_id,
          check_in_code: checkInCode,
          qr_string: `HADIR:JOIN:${checkInCode}`,
          status: 'scheduled',
          closes_at: endsAt,
          ...input,
        });
        await load();
        return true;
      }

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const checkInCode = generateCheckInCode();
        const { error } = await supabase.from('sessions').insert({
          ...input,
          event_id: event.id,
          provider_id: event.provider_id,
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
    [event, load],
  );

  const updateEvent = useCallback(
    async (input: EventUpdate) => {
      if (!event) return false;
      if (isDemoUser(event.provider_id)) {
        demoData.events = demoData.events.map((row) =>
          row.id === event.id ? { ...row, ...input } : row,
        );
        await load();
        return true;
      }
      const { error } = await supabase.from('events').update(input).eq('id', event.id);
      if (error) return false;
      await load();
      return true;
    },
    [event, load],
  );

  const updateSession = useCallback(
    async (id: string, input: SessionUpdate) => {
      if (demoData.sessions.some((row) => row.id === id)) {
        const closesAt = new Date(
          new Date(input.starts_at).getTime() + input.duration_minutes * 60_000,
        ).toISOString();
        demoData.sessions = demoData.sessions.map((row) =>
          row.id === id ? { ...row, ...input, closes_at: closesAt } : row,
        );
        await load();
        return true;
      }
      const { error } = await supabase.from('sessions').update(input).eq('id', id);
      if (error) return false;
      await load();
      return true;
    },
    [load],
  );

  const deleteEvent = useCallback(async () => {
    if (!event) return false;
    if (isDemoUser(event.provider_id)) {
      demoData.events = demoData.events.filter((row) => row.id !== event.id);
      demoData.sessions = demoData.sessions.filter((row) => row.event_id !== event.id);
      demoData.registrations = demoData.registrations.filter(
        (row) => row.event_id !== event.id,
      );
      return true;
    }
    const { error } = await supabase.from('events').delete().eq('id', event.id);
    return !error;
  }, [event]);

  return {
    event,
    sessions,
    registrants,
    attendance,
    failed,
    notFound,
    reload: load,
    createSession,
    updateEvent,
    updateSession,
    deleteEvent,
  };
}
