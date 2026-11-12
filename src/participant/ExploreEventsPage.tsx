import { Link } from 'react-router-dom';
import { DashboardShell } from '../components/DashboardShell';
import { ArrowIcon, CalendarIcon, PinIcon } from '../components/Icons';
import { BrandLoader } from '../components/BrandLoader';
import { participantNav } from '../components/roleNav';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { formatDateTime } from '../lib/format';
import { EventCover } from './EventCover';
import { useParticipantEvents } from './useParticipantEvents';

export function ExploreEventsPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { events, failed, reload } = useParticipantEvents(user?.id);

  const published = (events ?? []).filter((event) => event.visibility === 'public');

  return (
    <DashboardShell
      badge={t('roles.participant.title')}
      home="/participant"
      nav={participantNav(t)}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jade">
          {t('dashboard.eyebrow')}
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t('participant.explore.title')}</h1>
        <p className="mt-2 max-w-xl text-ink-soft">{t('participant.explore.lead')}</p>
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

      {!failed && events && published.length === 0 && (
        <div className="card mt-8 p-8 text-center text-sm text-ink-soft">
          {t('participant.explore.empty')}
        </div>
      )}

      {!failed && published.length > 0 && (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {published.map((event) => (
            <li key={event.id} className="flex">
              <Link
                to={`/participant/events/${event.id}`}
                className="group card card-interactive flex w-full flex-col overflow-hidden"
              >
                <EventCover category={event.category} className="h-40 sm:h-44" />

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-jade/10 px-2.5 py-0.5 text-xs font-semibold text-jade">
                      {event.category}
                    </span>
                    {event.registered && (
                      <span className="rounded-full bg-jade/15 px-2.5 py-0.5 text-xs font-semibold text-jade-deep">
                        {t('participant.registered')}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-lg font-semibold leading-snug">{event.title}</h2>
                  {event.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{event.description}</p>
                  )}

                  <p className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
                    <CalendarIcon className="size-4 shrink-0" />
                    <span>{formatDateTime(event.starts_at, locale)}</span>
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 text-xs text-ink-soft">
                    <PinIcon className="size-4 shrink-0" />
                    <span className="truncate">{event.location ?? '—'}</span>
                  </p>

                  <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-jade transition-colors group-hover:text-jade-deep">
                    {t('participant.explore.view')}
                    <ArrowIcon className="size-4 rtl:rotate-180" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
