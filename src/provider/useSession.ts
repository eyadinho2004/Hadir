import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AttendanceRecord, SessionRow, SessionStatus } from '../lib/types';
import { demoAttendanceFor, demoData, demoNameFor } from '../demo/demoData';

export type AttendanceWithName = {
  id: string;
  name: string;
  status: AttendanceRecord['status'];
  checked_in_at: string;
};

export function useSession(sessionId: string | undefined, pollMs = 5000) {
  const [session, setSession] = useState<SessionRow | null>(null);
  const [rows, setRows] = useState<AttendanceWithName[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!sessionId) return;
    if (demoData.sessions.some((row) => row.id === sessionId)) {
      setSession(demoData.sessions.find((row) => row.id === sessionId) ?? null);
      setRows(
        demoAttendanceFor(sessionId).map((record) => ({
          id: record.id,
          name: demoNameFor(record.participant_id),
          status: record.status,
          checked_in_at: record.checked_in_at,
        })),
      );
      setFailed(false);
      return;
    }
    const sessionResult = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionResult.error) {
      setFailed(true);
      return;
    }
    setSession((sessionResult.data as SessionRow | null) ?? null);

    const recordResult = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', sessionId)
      .order('checked_in_at');

    if (recordResult.error) {
      setFailed(true);
      return;
    }

    const records = (recordResult.data ?? []) as AttendanceRecord[];
    const ids = [...new Set(records.map((record) => record.participant_id))];
    const people = ids.length
      ? await supabase.from('users').select('id,full_name').in('id', ids)
      : { data: [], error: null };
    const names = new Map(
      ((people.data ?? []) as { id: string; full_name: string }[]).map((person) => [
        person.id,
        person.full_name,
      ]),
    );

    setRows(
      records.map((record) => ({
        id: record.id,
        name: names.get(record.participant_id) ?? '',
        status: record.status,
        checked_in_at: record.checked_in_at,
      })),
    );
    setFailed(false);
  }, [sessionId]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      void load();
    }, pollMs);
    return () => clearInterval(timer);
  }, [load, pollMs]);

  const setStatus = useCallback(
    async (status: SessionStatus) => {
      if (!sessionId) return false;
      if (demoData.sessions.some((row) => row.id === sessionId)) {
        demoData.sessions = demoData.sessions.map((row) =>
          row.id === sessionId ? { ...row, status } : row,
        );
        await load();
        return true;
      }
      const { error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', sessionId);
      if (error) return false;
      await load();
      return true;
    },
    [sessionId, load],
  );

  return { session, rows, failed, reload: load, setStatus };
}
