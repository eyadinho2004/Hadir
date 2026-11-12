import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../components/DashboardShell';
import { ArrowIcon, PlusIcon } from '../components/Icons';
import { BrandLoader } from '../components/BrandLoader';
import { providerNav } from '../components/roleNav';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { defaultStart, formatDateTime, fromInputValue } from '../lib/format';
import type { SessionStatus } from '../lib/types';
import { useEvents } from './useEvents';
import { useSessionsIndex } from './useSessionsIndex';

const statusStyles: Record<SessionStatus, string> = {
  scheduled: 'bg-sand-deep text-ink',
  active: 'bg-jade/15 text-jade',
  closed: 'bg-ink/10 text-ink-soft',
};

type StatusFilter = 'all' | SessionStatus;

export function ProviderSessionsPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { sessions, failed, reload, createSession } = useSessionsIndex(user?.id);
  const { events } = useEvents(user?.id);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [duration, setDuration] = useState(60);
  const [lateness, setLateness] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => (sessions ?? []).filter((session) => status === 'all' || session.status === status),
    [sessions, status],
  );

  async function submit(formEvent: FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!eventId) {
      setError(t('session.errorEvent'));
      return;
    }
    if (title.trim().length < 3) {
      setError(t('session.errorTitle'));
      return;
    }
    const durationValue = Number(duration);
    if (!Number.isFinite(durationValue) || durationValue < 5 || durationValue > 480) {
      setError(t('session.errorDuration'));
      return;
    }
    const latenessValue = Number(lateness);
    if (!Number.isFinite(latenessValue) || latenessValue < 0 || latenessValue > 120) {
      setError(t('session.errorLateness'));
      return;
    }
    if (!startsAt) {
      setError(t('session.errorStartsAt'));
      return;
    }

    setBusy(true);
    const ok = await createSession({
      event_id: eventId,
      title: title.trim(),
      starts_at: fromInputValue(startsAt),
      duration_minutes: durationValue,
      allowed_lateness_minutes: latenessValue,
      method: 'face_to_face',
    });
    setBusy(false);
    if (!ok) {
      setError(t('common.saveFailed'));
      return;
    }
    setTitle('');
    setEventId('');
    setFormOpen(false);
  }

  return (
    <DashboardShell badge={t('roles.provider.title')} home="/provider" nav={providerNav(t)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t('provider.sessions.title')}</h1>
          <p className="mt-2 max-w-xl text-ink-soft">{t('provider.sessions.lead')}</p>
        </div>
        {events && events.length > 0 && !formOpen && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFormOpen(true)}
          >
            <PlusIcon className="size-4" />
            {t('session.new')}
          </button>
        )}
      </div>

      {events?.length === 0 && (
        <div className="card mt-6 p-6">
          <p className="text-sm text-ink-soft">{t('session.needEvent')}</p>
          <Link to="/provider" className="btn btn-primary mt-4">
            {t('session.createEvent')}
          </Link>
        </div>
      )}

      {formOpen && (
        <form className="card mt-6 space-y-4 p-6" onSubmit={submit} noValidate>
          <div>
            <label htmlFor="session-event" className="block text-sm font-medium">
              {t('session.event')}
            </label>
            <select
              id="session-event"
              value={eventId}
              onChange={(changeEvent) => setEventId(changeEvent.target.value)}
              className="field mt-1.5"
            >
              <option value="">{t('session.eventPlaceholder')}</option>
              {(events ?? []).map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="session-title" className="block text-sm font-medium">
              {t('session.title')}
            </label>
            <input
              id="session-title"
              value={title}
              onChange={(changeEvent) => setTitle(changeEvent.target.value)}
              className="field mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="session-starts" className="block text-sm font-medium">
                {t('session.startsAt')}
              </label>
              <input
                id="session-starts"
                type="datetime-local"
                value={startsAt}
                onChange={(changeEvent) => setStartsAt(changeEvent.target.value)}
                className="field mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="session-duration" className="block text-sm font-medium">
                {t('session.duration')}
              </label>
              <input
                id="session-duration"
                type="number"
                min={5}
                max={480}
                value={duration}
                onChange={(changeEvent) => setDuration(Number(changeEvent.target.value))}
                className="field mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="session-lateness" className="block text-sm font-medium">
                {t('session.lateness')}
              </label>
              <input
                id="session-lateness"
                type="number"
                min={0}
                max={120}
                value={lateness}
                onChange={(changeEvent) => setLateness(Number(changeEvent.target.value))}
                className="field mt-1.5"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
              {busy ? <BrandLoader size="sm" /> : null}
              {busy ? t('session.creating') : t('session.create')}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setFormOpen(false);
                setError(null);
              }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ['all', t('common.all')],
            ['scheduled', t('session.status.scheduled')],
            ['active', t('session.status.active')],
            ['closed', t('session.status.closed')],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            aria-pressed={status === value}
            className={`chip ${status === value ? 'chip-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {failed && (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-ink-soft">{t('common.loadFailed')}</p>
          <button type="button" className="btn btn-outline" onClick={() => void reload()}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {!failed && sessions === null && (
        <div className="mt-8 flex justify-center">
          <BrandLoader size="lg" delay={300} />
        </div>
      )}

      {!failed && sessions?.length === 0 && (
        <div className="card mt-8 p-8 text-center">
          <h2 className="text-lg font-semibold">{t('session.empty')}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{t('session.emptyHint')}</p>
        </div>
      )}

      {!failed && sessions && sessions.length > 0 && filtered.length === 0 && (
        <div className="card mt-8 p-8 text-center text-sm text-ink-soft">
          {t('search.noResults')}
        </div>
      )}

      {!failed && filtered.length > 0 && (
        <ul className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          {filtered.map((session) => (
            <li key={session.id}>
              <Link
                to={`/provider/sessions/${session.id}`}
                className="group flex flex-wrap items-center gap-3 p-4 transition-colors duration-150 hover:bg-sand/70"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium transition-colors group-hover:text-jade">
                    {session.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-ink-soft">
                    {session.event_title ? `${session.event_title} · ` : ''}
                    {formatDateTime(session.starts_at, locale)} · {session.duration_minutes}{' '}
                    {t('common.minutesUnit')}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[session.status]}`}
                >
                  {t(`session.status.${session.status}`)}
                </span>
                <ArrowIcon className="size-4 text-ink-soft transition-colors group-hover:text-jade rtl:rotate-180" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
