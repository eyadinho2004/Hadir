import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { DashboardShell } from '../components/DashboardShell';
import { CalendarIcon, ClockIcon, PinIcon } from '../components/Icons';
import { BrandLoader } from '../components/BrandLoader';
import { participantNav } from '../components/roleNav';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { formatDateTime } from '../lib/format';
import { EventCover } from './EventCover';
import { useParticipantEvents } from './useParticipantEvents';

export function ParticipantEventPage() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { events, failed, pending, reload, register } = useParticipantEvents(user?.id);
  const [error, setError] = useState<string | null>(null);

  const event = events?.find((row) => row.id === id);
  const finished = event ? new Date(event.ends_at).getTime() < Date.now() : false;

  async function handleRegister() {
    if (!event) return;
    setError(null);
    const ok = await register(event.id);
    if (!ok) setError(t('participant.registerFailed'));
  }

  return (
    <DashboardShell
      badge={t('roles.participant.title')}
      home="/participant"
      nav={participantNav(t)}
    >
      <BackLink to="/participant/explore" label={t('nav.explore')} />

      {failed && (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
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

      {!failed && events && !event && (
        <p className="mt-8 text-ink-soft">{t('participant.event.notFound')}</p>
      )}

      {!failed && event && (
        <article className="card mt-6 overflow-hidden">
          <div className="relative">
            <EventCover category={event.category} className="h-48 sm:h-64" />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/90 via-ink/45 to-transparent p-5 sm:p-7">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
                {event.category}
              </span>
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{event.title}</h1>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <CalendarIcon className="size-4" />
                  {t('participant.event.when')}
                </dt>
                <dd className="mt-1 font-medium">
                  {formatDateTime(event.starts_at, locale)}
                </dd>
                <dd className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
                  <ClockIcon className="size-3.5" />
                  {formatDateTime(event.ends_at, locale)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <PinIcon className="size-4" />
                  {t('participant.event.where')}
                </dt>
                <dd className="mt-1 font-medium">{event.location ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">{t('participant.event.capacity')}</dt>
                <dd className="mt-1 font-medium tabular-nums">{event.capacity ?? '—'}</dd>
                <dd className="mt-0.5 text-xs text-ink-soft">
                  {t('participant.deadline')}:{' '}
                  {event.registration_deadline
                    ? formatDateTime(event.registration_deadline, locale)
                    : t('participant.noDeadline')}
                </dd>
              </div>
            </dl>

            {event.description && (
              <section className="mt-7">
                <h2 className="text-sm font-semibold text-ink-soft">
                  {t('participant.event.about')}
                </h2>
                <p className="mt-2 leading-relaxed">{event.description}</p>
              </section>
            )}

            {error && (
              <p role="alert" className="mt-5 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-6">
              {event.registered ? (
                <>
                  <p className="text-sm font-semibold text-jade-deep">
                    {t('participant.event.registeredHint')}
                  </p>
                  <Link to="/participant/events" className="btn btn-outline ms-auto">
                    {t('participant.event.openMyEvents')}
                  </Link>
                </>
              ) : finished ? (
                <span className="rounded-full bg-ink/10 px-3 py-1 text-sm font-semibold text-ink-soft">
                  {t('participant.event.finished')}
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleRegister()}
                  disabled={pending === event.id}
                  aria-busy={pending === event.id}
                >
                  {pending === event.id ? <BrandLoader size="sm" /> : null}
                  {pending === event.id
                    ? t('participant.registering')
                    : t('participant.register')}
                </button>
              )}
            </div>
          </div>
        </article>
      )}
    </DashboardShell>
  );
}
