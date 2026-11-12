import { QRCodeSVG } from 'qrcode.react';
import { useParams } from 'react-router-dom';
import { BrandLoader } from '../components/BrandLoader';
import { BackLink } from '../components/BackLink';
import { DashboardShell } from '../components/DashboardShell';
import { providerNav } from '../components/roleNav';
import { useI18n } from '../i18n/I18nProvider';
import { downloadCsv, toCsv } from '../lib/csv';
import { buildJoinUrl, parseCheckInCode } from '../lib/checkInCode';
import { formatDateTime } from '../lib/format';
import { useSession } from './useSession';

const statusStyles: Record<string, string> = {
  scheduled: 'bg-sand-deep text-ink',
  active: 'bg-jade/15 text-jade',
  closed: 'bg-ink/10 text-ink-soft',
};

export function SessionPage() {
  const { sessionId } = useParams();
  const { t, locale } = useI18n();
  const { session, rows, failed, reload, setStatus } = useSession(sessionId);
  const checkInCode = session
    ? session.check_in_code || parseCheckInCode(session.qr_string) || ''
    : '';

  function exportCsv() {
    if (!session || !rows) return;
    downloadCsv(
      `attendance-${session.id}.csv`,
      toCsv(rows.map((row) => ({ name: row.name, status: row.status, at: row.checked_in_at }))),
    );
  }

  return (
    <DashboardShell
      badge={t('roles.provider.title')}
      home="/provider"
      nav={providerNav(t)}
    >
      {session?.event_id && (
        <BackLink to={`/provider/events/${session.event_id}`} label={t('event.back')} />
      )}

      {failed && (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-ink-soft">{t('common.loadFailed')}</p>
          <button type="button" className="btn btn-outline" onClick={() => void reload()}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {!failed && !session && (
        <div className="mt-8 flex justify-center">
          <BrandLoader size="lg" delay={300} />
        </div>
      )}

      {session && (
        <>
          <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{session.title}</h1>
              <p className="mt-2 text-sm text-ink-soft">
                {formatDateTime(session.starts_at, locale)} · {session.duration_minutes}{' '}
                {t('common.minutesUnit')}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[session.status]
              }`}
            >
              {t(`session.status.${session.status}`)}
            </span>
          </header>

          <section className="card mt-6 p-6">
            <div className="flex flex-wrap items-center gap-6">
              {checkInCode && (
                <div className="grid size-40 shrink-0 place-items-center rounded-xl bg-white p-2 ring-1 ring-ink/10">
                  <QRCodeSVG
                    value={buildJoinUrl(checkInCode)}
                    size={136}
                    aria-label={t('session.qrLabel')}
                  />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-ink-soft">
                  {t('session.checkInCode')}
                </h2>
                <p
                  className="mt-2 font-mono text-4xl font-bold tracking-[0.35em]"
                  dir="ltr"
                >
                  {checkInCode || '—'}
                </p>
                <p className="mt-3 max-w-sm text-xs text-ink-soft">
                  {t('session.checkInHint')}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {session.status !== 'active' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void setStatus('active')}
                >
                  {t('session.activate')}
                </button>
              )}
              {session.status !== 'closed' && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void setStatus('closed')}
                >
                  {t('session.close')}
                </button>
              )}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {t('session.attendance')}
                {rows && (
                  <span className="ms-2 text-sm font-normal text-ink-soft">({rows.length})</span>
                )}
              </h2>
              <button
                type="button"
                className="btn btn-outline"
                onClick={exportCsv}
                disabled={!rows || rows.length === 0}
              >
                {t('session.export')}
              </button>
            </div>

            {rows?.length === 0 && (
              <div className="card mt-4 p-8 text-center text-sm text-ink-soft">
                {t('session.emptyAttendance')}
              </div>
            )}

            {rows && rows.length > 0 && (
              <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.name || '—'}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {formatDateTime(row.checked_in_at, locale)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        row.status === 'present'
                          ? 'bg-jade/15 text-jade'
                          : row.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-ink/10 text-ink-soft'
                      }`}
                    >
                      {t(`attendance.${row.status}`)}
                    </span>
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
