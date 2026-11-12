import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { EventRow, Visibility } from '../lib/types';
import { demoData, isDemoUser } from '../demo/demoData';

export type EventWithCount = EventRow & { session_count: number };

export type NewEvent = {
  title: string;
  category: string;
  visibility: Visibility;
  starts_at: string;
  ends_at: string;
};

export function useEvents(providerId: string | undefined) {
  const [events, setEvents] = useState<EventWithCount[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!providerId) return;
    if (isDemoUser(providerId)) {
      setEvents(
        demoData.events
          .filter((event) => event.provider_id === providerId)
          .sort((left, right) => right.starts_at.localeCompare(left.starts_at))
          .map((event) => ({
            ...event,
            session_count: demoData.sessions.filter((session) => session.event_id === event.id)
              .length,
          })),
      );
      setFailed(false);
      return;
    }
    const [eventResult, sessionResult] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .eq('provider_id', providerId)
        .order('starts_at', { ascending: false }),
      supabase.from('sessions').select('id,event_id').eq('provider_id', providerId),
    ]);

    if (eventResult.error || sessionResult.error) {
      setFailed(true);
      return;
    }

    const counts = new Map<string, number>();
    for (const session of (sessionResult.data ?? []) as { event_id: string | null }[]) {
      if (session.event_id) {
        counts.set(session.event_id, (counts.get(session.event_id) ?? 0) + 1);
      }
    }

    setEvents(
      ((eventResult.data ?? []) as EventRow[]).map((event) => ({
        ...event,
        session_count: counts.get(event.id) ?? 0,
      })),
    );
    setFailed(false);
  }, [providerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const createEvent = useCallback(
    async (input: NewEvent) => {
      if (!providerId) return false;
      if (isDemoUser(providerId)) {
        demoData.events.push({
          id: `demo-event-${Date.now()}`,
          provider_id: providerId,
          description: null,
          location: null,
          event_code: String(100000 + Math.floor(Math.random() * 900000)),
          capacity: null,
          registration_deadline: null,
          created_at: new Date().toISOString(),
          ...input,
        });
        await load();
        return true;
      }
      const { error } = await supabase
        .from('events')
        .insert({ ...input, provider_id: providerId });
      if (error) return false;
      await load();
      return true;
    },
    [providerId, load],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      if (isDemoUser(demoData.events.find((event) => event.id === id)?.provider_id)) {
        demoData.events = demoData.events.filter((event) => event.id !== id);
        demoData.sessions = demoData.sessions.filter((session) => session.event_id !== id);
        await load();
        return true;
      }
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) return false;
      await load();
      return true;
    },
    [load],
  );

  return { events, failed, reload: load, createEvent, deleteEvent };
}
