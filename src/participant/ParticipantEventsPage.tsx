import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../components/DashboardShell';
import { CalendarIcon, CompassIcon, PinIcon, SearchIcon } from '../components/Icons';
import { BrandLoader } from '../components/BrandLoader';
import { participantNav } from '../components/roleNav';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { formatDateTime } from '../lib/format';
import { useParticipantEvents } from './useParticipantEvents';

export function ParticipantEventsPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { events, failed, reload } = useParticipantEvents(user?.id);
  const [query, setQuery] = useState('');

  const mine = useMemo(
    () => (events ?? []).filter((event) => event.registered),
    [events],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return mine.filter(
      (event) =>
        needle === '' ||
        event.title.toLowerCase().includes(needle) ||
        event.category.toLowerCase().includes(needle),
    );
  }, [mine, query]);

  return (
    <DashboardShell
      badge={t('roles.participant.title')}
      home="/participant"
      nav={participantNav(t)}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t('participant.myEvents.title')}</h1>
          <p className="mt-2 max-w-xl text-ink-soft">{t('participant.myEvents.lead')}</p>
        </div>
        <Link to="/participant/explore" className="btn btn-outline">
          <CompassIcon className="size-4" />
          {t('participant.myEvents.browse')}
        </Link>
      </div>

      <div className="relative mt-6">
        <SearchIcon className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('participant.myEvents.search')}
          aria-label={t('participant.myEvents.search')}
          className="field ps-12"
        />
      </div>

      {failed && (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-ink-soft">{t('common.loadFailed')}</p>
          <button type="button" className="btn btn-outline" onClick={() => void reload()}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {!failed && events === null && (
        <div className="mt-8 flex justify-center">
          <BrandLoader size="lg" delay={300} />
        </div>
      )}

      {!failed && events && mine.length === 0 && (
        <div className="card mt-8 flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-sm text-ink-soft">{t('participant.myEvents.empty')}</p>
          <Link to="/participant/explore" className="btn btn-primary">
            <CompassIcon className="size-4" />
            {t('participant.myEvents.browse')}
          </Link>
        </div>
      )}

      {!failed && mine.length > 0 && filtered.length === 0 && (
        <div className="card mt-8 p-8 text-center text-sm text-ink-soft">
          {t('provider.events.noResults')}
        </div>
      )}

      {!failed && filtered.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((event) => {
            const finished = new Date(event.ends_at).getTime() < Date.now();
            return (
              <li key={event.id} className="flex">
                <Link
                  to={`/participant/events/${event.id}`}
                  className="card card-interactive flex w-full flex-col p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold">{event.title}</h2>
                      <p className="mt-1 text-xs text-ink-soft">
                        {formatDateTime(event.starts_at, locale)} —{' '}
                        {formatDateTime(event.ends_at, locale)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        finished ? 'bg-ink/10 text-ink-soft' : 'bg-jade/10 text-jade'
                      }`}
                    >
                      {finished
                        ? t('participant.event.finished')
                        : t('participant.event.upcoming')}
                    </span>
                  </div>

                  <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
                    <CalendarIcon className="size-4 shrink-0" />
                    <span className="truncate">{event.category}</span>
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 text-xs text-ink-soft">
                    <PinIcon className="size-4 shrink-0" />
                    <span className="truncate">{event.location ?? '—'}</span>
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink/10 pt-3">
                    <span className="text-xs text-ink-soft">
                      {t('participant.deadline')}:{' '}
                      {event.registration_deadline
                        ? formatDateTime(event.registration_deadline, locale)
                        : t('participant.noDeadline')}
                    </span>
                    <span className="rounded-full bg-jade/15 px-3 py-1 text-xs font-semibold text-jade">
                      {t('participant.registered')}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardShell>
  );
}
