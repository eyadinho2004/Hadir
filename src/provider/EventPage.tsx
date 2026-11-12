import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { DashboardShell } from '../components/DashboardShell';
import { providerNav } from '../components/roleNav';
import { BrandLoader } from '../components/BrandLoader';
import { DownloadIcon, PencilIcon, PlusIcon, TrashIcon } from '../components/Icons';
import { useI18n } from '../i18n/I18nProvider';
import {
  defaultStart,
  formatDate,
  formatDateTime,
  fromInputValue,
} from '../lib/format';
import { downloadCsv, toCsvTable } from '../lib/csv';
import type { AttendanceStatus, SessionStatus } from '../lib/types';
import { EventEditForm } from './EventEditForm';
import { SessionEditForm } from './SessionEditForm';
import { useEvent, type EventUpdate, type SessionUpdate } from './useEvent';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-3 outline-none transition-colors focus:border-jade';

const statusStyles: Record<SessionStatus, string> = {
  scheduled: 'bg-sand-deep text-ink',
  active: 'bg-jade/15 text-jade',
  closed: 'bg-ink/10 text-ink-soft',
};

const attendanceStyles: Record<AttendanceStatus, string> = {
  present: 'bg-jade/15 text-jade',
  late: 'bg-amber-100 text-amber-800',
  absent: 'bg-ink/10 text-ink-soft',
};

export function EventPage() {
  const { eventId } = useParams();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    event,
    sessions,
    registrants,
    attendance,
    failed,
    notFound,
    reload,
    createSession,
    updateEvent,
    updateSession,
    deleteEvent,
  } = useEvent(eventId);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(searchParams.get('edit') === '1');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [openAttendanceId, setOpenAttendanceId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [duration, setDuration] = useState(60);
  const [lateness, setLateness] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function submit(event_: FormEvent) {
    event_.preventDefault();
    setError(null);
    if (title.trim().length < 3) {
      setError(t('session.errorTitle'));
      return;
    }
    setBusy(true);
    const ok = await createSession({
      title: title.trim(),
      starts_at: fromInputValue(startsAt),
      duration_minutes: duration,
      allowed_lateness_minutes: lateness,
      method: 'face_to_face',
    });
    setBusy(false);
    if (!ok) {
      setError(t('common.saveFailed'));
      return;
    }
    setTitle('');
    setFormOpen(false);
  }

  function closeEditEvent() {
    setEditingEvent(false);
    if (searchParams.has('edit')) setSearchParams({}, { replace: true });
  }

  async function handleUpdateEvent(input: EventUpdate) {
    const ok = await updateEvent(input);
    if (ok) closeEditEvent();
    return ok;
  }

  async function handleUpdateSession(id: string, input: SessionUpdate) {
    const ok = await updateSession(id, input);
    if (ok) setEditingSessionId(null);
    return ok;
  }

  async function handleDeleteEvent() {
    setDeleting(true);
    const ok = await deleteEvent();
    setDeleting(false);
    if (ok) navigate('/provider', { replace: true });
  }

  const statusLabel = (status: SessionStatus) => t(`session.status.${status}`);

  const sessionCount = sessions?.length ?? 0;
  const registrantCount = registrants?.length ?? 0;
  const attendanceCount = attendance
    ? Object.values(attendance).reduce((total, rows) => total + rows.length, 0)
    : 0;
  const attendanceRate =
    attendance && sessionCount > 0 && registrantCount > 0
      ? Math.min(100, Math.round((attendanceCount / (sessionCount * registrantCount)) * 100))
      : null;

  function handleExportRegistrants() {
    if (!event || !registrants || registrants.length === 0) return;
    downloadCsv(
      `registrants-${event.event_code}.csv`,
      toCsvTable(
        [t('event.csvName'), t('event.csvRegisteredAt')],
        registrants.map((registrant) => [registrant.name, registrant.registered_at]),
      ),
    );
  }

  const stats = [
    { label: t('event.sessions'), value: sessions ? String(sessionCount) : '—' },
    {
      label: t('event.stats.registrants'),
      value: registrants ? String(registrantCount) : '—',
    },
    {
      label: t('event.stats.attendance'),
      value: attendance ? String(attendanceCount) : '—',
    },
    {
      label: t('event.stats.rate'),
      value: attendanceRate === null ? '—' : `${attendanceRate}%`,
    },
  ];

  return (
    <DashboardShell badge={t('roles.provider.title')} home="/provider" nav={providerNav(t)}>
      <BackLink to="/provider" label={t('event.back')} />

      {failed && (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-ink-soft">{t('common.loadFailed')}</p>
          <button type="button" className="btn btn-outline" onClick={() => void reload()}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {!failed && notFound && <p className="mt-6 text-ink-soft">{t('event.notFound')}</p>}

      {!failed && !notFound && !event && (
        <div className="mt-8 flex justify-center">
          <BrandLoader size="lg" delay={300} />
        </div>
      )}

      {event && (
        <>
          <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jade">
                {event.category}
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{event.title}</h1>
              <p className="mt-2 text-sm text-ink-soft">
                {formatDateTime(event.starts_at, locale)} — {formatDateTime(event.ends_at, locale)}
                {' · '}
                {event.visibility === 'public' ? t('event.public') : t('event.private')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold text-jade"
                dir="ltr"
              >
                {event.event_code}
              </span>
              {!editingEvent && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingEvent(true)}
                >
                  <PencilIcon className="size-4" />
                  {t('event.edit')}
                </button>
              )}
              {!confirmingDelete && (
                <button
                  type="button"
                  className="btn border border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                  onClick={() => setConfirmingDelete(true)}
                >
                  <TrashIcon className="size-4" />
                  {t('common.delete')}
                </button>
              )}
            </div>
          </header>

          {confirmingDelete && (
            <div className="mt-4 rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-800">{t('event.deleteConfirm')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary bg-red-700 hover:bg-red-800"
                  onClick={() => void handleDeleteEvent()}
                  disabled={deleting}
                  aria-busy={deleting}
                >
                  {deleting ? <BrandLoader size="sm" /> : null}
                  {t('common.deleteConfirm')}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setConfirmingDelete(false)}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}


          <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-5">
                <dt className="text-xs text-ink-soft">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>

          {editingEvent && (
            <EventEditForm
              event={event}
              onSave={handleUpdateEvent}
              onCancel={closeEditEvent}
            />
          )}

          <section className="card mt-4 p-6" aria-labelledby="event-info">
            <h2 id="event-info" className="text-sm font-semibold text-ink-soft">
              {t('event.info')}
            </h2>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-xs text-ink-soft">{t('event.description')}</dt>
                <dd className="mt-1 leading-relaxed">{event.description || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">{t('event.location')}</dt>
                <dd className="mt-1 font-medium">{event.location || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">{t('event.capacity')}</dt>
                <dd className="mt-1 font-medium tabular-nums">{event.capacity ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">{t('event.registrationDeadline')}</dt>
                <dd className="mt-1 font-medium">
                  {event.registration_deadline
                    ? formatDateTime(event.registration_deadline, locale)
                    : t('event.noDeadline')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">{t('event.createdAt')}</dt>
                <dd className="mt-1 font-medium">{formatDate(event.created_at, locale)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">{t('event.visibility')}</dt>
                <dd className="mt-1 font-medium">
                  {event.visibility === 'public' ? t('event.public') : t('event.private')}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-8" aria-labelledby="event-sessions">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="event-sessions" className="text-lg font-semibold">
                {t('event.sessions')}
                {sessions && (
                  <span className="ms-2 text-sm font-normal text-ink-soft">
                    ({sessionCount})
                  </span>
                )}
              </h2>
              {!formOpen && (
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

            {formOpen && (
              <form className="card mt-4 space-y-4 p-6" onSubmit={submit} noValidate>
                <div>
                  <label htmlFor="session-title" className="block text-sm font-medium">
                    {t('session.title')}
                  </label>
                  <input
                    id="session-title"
                    value={title}
                    onChange={(changeEvent) => setTitle(changeEvent.target.value)}
                    className={inputClass}
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
                      className={inputClass}
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
                      className={inputClass}
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
                      className={inputClass}
                    />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
                    {busy ? <BrandLoader size="sm" /> : null}
                    {busy ? t('session.creating') : t('session.create')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setFormOpen(false)}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            )}

            {sessions?.length === 0 && (
              <div className="card mt-4 p-8 text-center">
                <h3 className="font-semibold">{t('session.empty')}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                  {t('session.emptyHint')}
                </p>
              </div>
            )}

            {sessions && sessions.length > 0 && (
              <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
                {sessions.map((session) => {
                  const attendees = attendance?.[session.id] ?? [];
                  const attendanceOpen = openAttendanceId === session.id;
                  const editing = editingSessionId === session.id;
                  return (
                    <li key={session.id} className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium">{session.title}</p>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[session.status]}`}
                            >
                              {statusLabel(session.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-ink-soft">
                            {formatDateTime(session.starts_at, locale)} ·{' '}
                            {session.duration_minutes} {t('common.minutesUnit')} · +
                            {session.allowed_lateness_minutes} {t('common.minutesUnit')}
                          </p>
                        </div>
                        <div className="mt-3 grid w-full grid-cols-2 gap-2 sm:mt-0 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                          <Link
                            to={`/provider/sessions/${session.id}`}
                            className="btn btn-primary col-span-2 px-4 text-sm"
                          >
                            {t('session.open')}
                          </Link>
                          <button
                            type="button"
                            aria-expanded={editing}
                            aria-controls={`session-edit-${session.id}`}
                            className="btn btn-outline px-4 text-sm"
                            onClick={() => setEditingSessionId(editing ? null : session.id)}
                          >
                            <PencilIcon className="size-4" />
                            {t('session.edit')}
                          </button>
                          <button
                            type="button"
                            aria-expanded={attendanceOpen}
                            aria-controls={`session-attendance-${session.id}`}
                            className="btn btn-outline px-4 text-sm"
                            onClick={() =>
                              setOpenAttendanceId(attendanceOpen ? null : session.id)
                            }
                          >
                            {t('session.attendance')}
                            <span className="rounded-full bg-sand-deep px-2 py-0.5 text-xs font-semibold tabular-nums">
                              {attendance ? attendees.length : '—'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {editing && (
                        <div id={`session-edit-${session.id}`}>
                          <SessionEditForm
                            session={session}
                            onSave={(input) => handleUpdateSession(session.id, input)}
                            onCancel={() => setEditingSessionId(null)}
                          />
                        </div>
                      )}

                      {attendanceOpen && (
                        <div
                          id={`session-attendance-${session.id}`}
                          className="mt-3 rounded-xl bg-sand/60 p-4"
                        >
                          {attendees.length === 0 ? (
                            <p className="text-sm text-ink-soft">
                              {t('session.emptySessionAttendance')}
                            </p>
                          ) : (
                            <ul className="divide-y divide-ink/10">
                              {attendees.map((attendee) => (
                                <li
                                  key={attendee.id}
                                  className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                      {attendee.name || '—'}
                                    </p>
                                    <p className="text-xs text-ink-soft">
                                      {formatDateTime(attendee.checked_in_at, locale)}
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${attendanceStyles[attendee.status]}`}
                                  >
                                    {t(`attendance.${attendee.status}`)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mt-8" aria-labelledby="event-registrants">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="event-registrants" className="text-lg font-semibold">
                {t('event.registrants')}
                {registrants && (
                  <span className="ms-2 text-sm font-normal text-ink-soft">
                    ({registrantCount})
                  </span>
                )}
              </h2>
              <button
                type="button"
                className="btn btn-outline px-4 text-sm"
                aria-label={t('event.exportRegistrantsAria')}
                onClick={handleExportRegistrants}
                disabled={registrantCount === 0}
              >
                <DownloadIcon className="size-4" />
                {t('event.exportRegistrants')}
              </button>
            </div>

            {registrants?.length === 0 && (
              <div className="card mt-4 p-8 text-center text-sm text-ink-soft">
                {t('event.emptyRegistrants')}
              </div>
            )}

            {registrants && registrants.length > 0 && (
              <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
                {registrants.map((registrant) => (
                  <li
                    key={registrant.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <p className="min-w-0 truncate font-medium">{registrant.name || '—'}</p>
                    <p className="text-xs text-ink-soft">
                      {t('event.registeredAt')} {formatDateTime(registrant.registered_at, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </DashboardShell>
  );
}
