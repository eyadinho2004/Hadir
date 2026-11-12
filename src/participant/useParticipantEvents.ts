import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { EventRow, RegistrationRow } from '../lib/types';
import { demoData, isDemoUser } from '../demo/demoData';

export type ParticipantEvent = EventRow & { registered: boolean };

export function useParticipantEvents(participantId: string | undefined) {
  const [events, setEvents] = useState<ParticipantEvent[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!participantId) return;

    if (isDemoUser(participantId)) {
      const registeredIds = new Set(
        demoData.registrations
          .filter((row) => row.participant_id === participantId)
          .map((row) => row.event_id),
      );
      setEvents(
        demoData.events
          .filter((event) => event.visibility === 'public' || registeredIds.has(event.id))
          .map((event) => ({ ...event, registered: registeredIds.has(event.id) }))
          .sort((left, right) => left.starts_at.localeCompare(right.starts_at)),
      );
      setFailed(false);
      return;
    }

    const [publicResult, registrationResult] = await Promise.all([
      supabase.from('events').select('*').eq('visibility', 'public'),
      supabase.from('registrations').select('event_id').eq('participant_id', participantId),
    ]);

    if (publicResult.error || registrationResult.error) {
      setFailed(true);
      return;
    }

    const registeredIds = new Set(
      ((registrationResult.data ?? []) as RegistrationRow[]).map((row) => row.event_id),
    );
    const ids = [
      ...new Set([
        ...((publicResult.data ?? []) as EventRow[]).map((event) => event.id),
        ...registeredIds,
      ]),
    ];

    if (ids.length === 0) {
      setEvents([]);
      setFailed(false);
      return;
    }

    const eventsResult = await supabase.from('events').select('*').in('id', ids);
    if (eventsResult.error) {
      setFailed(true);
      return;
    }

    setEvents(
      ((eventsResult.data ?? []) as EventRow[])
        .map((event) => ({ ...event, registered: registeredIds.has(event.id) }))
        .sort((left, right) => left.starts_at.localeCompare(right.starts_at)),
    );
    setFailed(false);
  }, [participantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const register = useCallback(
    async (eventId: string) => {
      if (!participantId) return false;
      setPending(eventId);

      if (isDemoUser(participantId)) {
        const exists = demoData.registrations.some(
          (row) => row.participant_id === participantId && row.event_id === eventId,
        );
        if (!exists) {
          demoData.registrations.push({
            id: `demo-registration-${Date.now()}`,
            event_id: eventId,
            participant_id: participantId,
            registered_at: new Date().toISOString(),
          });
        }
        await load();
        setPending(null);
        return true;
      }

      const { error } = await supabase
        .from('registrations')
        .insert({ event_id: eventId, participant_id: participantId });
      if (error) {
        setPending(null);
        return false;
      }
      await load();
      setPending(null);
      return true;
    },
    [participantId, load],
  );

  return { events, failed, pending, reload: load, register };
}
