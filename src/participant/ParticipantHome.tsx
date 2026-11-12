import { Link } from 'react-router-dom';
import { DashboardShell } from '../components/DashboardShell';
import { ArrowIcon, CalendarIcon, ClockIcon, CompassIcon, SearchIcon } from '../components/Icons';
import { BrandLoader } from '../components/BrandLoader';
import { participantNav } from '../components/roleNav';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { formatDateTime } from '../lib/format';
import { useParticipantData } from './useParticipantData';

const statusStyles: Record<string, string> = {
  present: 'bg-jade/15 text-jade',
  late: 'bg-amber-100 text-amber-800',
  absent: 'bg-ink/10 text-ink-soft',
};

export function ParticipantHome() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { attendance, registrations, failed, reload, summary } = useParticipantData(user?.id);

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
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t('participant.title')}</h1>
        <p className="mt-2 max-w-xl text-ink-soft">{t('participant.lead')}</p>
      </div>

      <nav aria-label={t('dashboard.quick')} className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          {
            to: '/participant/explore',
            label: t('dashboard.quick.explore'),
            icon: <CompassIcon className="size-5" />,
          },
          {
            to: '/participant/events',
            label: t('dashboard.quick.myEvents'),
            icon: <CalendarIcon className="size-5" />,
          },
          {
            to: '/participant/sessions',
            label: t('dashboard.quick.sessions'),
            icon: <ClockIcon className="size-5" />,
          },
          {
            to: '/participant/search',
            label: t('dashboard.quick.search'),
            icon: <SearchIcon className="size-5" />,
          },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group card card-interactive flex items-center gap-3 p-4"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-jade/10 text-jade transition-colors duration-150 group-hover:bg-jade group-hover:text-sand">
              {action.icon}
            </span>
            <span className="text-sm font-semibold">{action.label}</span>
            <ArrowIcon className="ms-auto size-4 text-ink-soft transition-colors group-hover:text-jade rtl:rotate-180" />
          </Link>
        ))}
      </nav>

      {failed && (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-ink-soft">{t('common.loadFailed')}</p>
          <button type="button" className="btn btn-outline" onClick={() => void reload()}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {!failed && attendance === null && (
        <div className="mt-8 flex justify-center">
          <BrandLoader size="lg" delay={300} />
        </div>
      )}

      {!failed && attendance && (
        <>
          <section className="mt-10" aria-labelledby="participant-summary">
            <h2 id="participant-summary" className="text-lg font-semibold">
              {t('participant.summary')}
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [t('participant.totalSessions'), String(summary.total)],
                [t('participant.attended'), String(summary.present)],
                [t('participant.lateCount'), String(summary.late)],
                [t('participant.rate'), `${summary.rate}%`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="card p-5 transition-colors duration-150 hover:border-jade/30"
                >
                  <dt className="text-xs text-ink-soft">{label}</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-10" aria-labelledby="participant-attendance">
            <h2 id="participant-attendance" className="text-lg font-semibold">
              {t('participant.attendance')}
            </h2>

            {attendance.length === 0 && (
              <div className="card mt-4 p-8 text-center text-sm text-ink-soft">
                {t('participant.emptyAttendance')}
              </div>
            )}

            {attendance.length > 0 && (
              <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
                {attendance.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors duration-150 hover:bg-sand/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.session_title}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {formatDateTime(row.checked_in_at, locale)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusStyles[row.status]
                      }`}
                    >
                      {t(`attendance.${row.status}`)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10" aria-labelledby="participant-registrations">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="participant-registrations" className="text-lg font-semibold">
                {t('participant.registrations')}
              </h2>
              <Link
                to="/participant/events"
                className="text-sm font-semibold text-jade transition-colors hover:text-jade-deep"
              >
                {t('dashboard.viewAll')}
              </Link>
            </div>

            {registrations?.length === 0 && (
              <div className="card mt-4 p-8 text-center text-sm text-ink-soft">
                {t('participant.emptyRegistrations')}
              </div>
            )}

            {registrations && registrations.length > 0 && (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {registrations.map((row) => (
                  <li key={row.id} className="card card-interactive p-5">
                    <p className="font-medium">{row.event?.title ?? '—'}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {row.event
                        ? `${formatDateTime(row.event.starts_at, locale)} — ${formatDateTime(
                            row.event.ends_at,
                            locale,
                          )}`
                        : ''}
                    </p>
                    <p className="mt-3 text-xs text-ink-soft">
                      {t('participant.deadline')}:{' '}
                      {row.event?.registration_deadline
                        ? formatDateTime(row.event.registration_deadline, locale)
                        : t('participant.noDeadline')}
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
