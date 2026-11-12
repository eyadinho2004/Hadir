import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardShell } from '../components/DashboardShell';
import { ClockIcon } from '../components/Icons';
import { BrandLoader } from '../components/BrandLoader';
import { participantNav } from '../components/roleNav';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { formatDateTime } from '../lib/format';
import { JoinCodeCard } from './JoinCodeCard';
import { useParticipantSessions } from './useParticipantSessions';

const attendanceStyles: Record<string, string> = {
  present: 'bg-jade/15 text-jade',
  late: 'bg-amber-100 text-amber-800',
  absent: 'bg-ink/10 text-ink-soft',
};

export function ParticipantSessionsPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { sessions, failed, reload, joinWithCode } = useParticipantSessions(user?.id);
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code');
  const [openId, setOpenId] = useState<string | null>(null);

  const mine = useMemo(
    () => (sessions ?? []).filter((session) => session.registered),
    [sessions],
  );

  return (
    <DashboardShell
      badge={t('roles.participant.title')}
      home="/participant"
      nav={participantNav(t)}
    >
      <h1 className="text-2xl font-bold sm:text-3xl">{t('participant.sessions.title')}</h1>
      <p className="mt-2 max-w-xl text-ink-soft">{t('participant.sessions.lead')}</p>

      <JoinCodeCard initialCode={initialCode} onJoin={joinWithCode} />

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

      {!failed && sessions && mine.length === 0 && (
        <div className="card mt-8 p-8 text-center text-sm text-ink-soft">
          {t('participant.sessions.empty')}
        </div>
      )}

      {!failed && mine.length > 0 && (
        <ul className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
          {mine.map((session) => {
            const expanded = openId === session.id;
            return (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : session.id)}
                  aria-expanded={expanded}
                  className="flex w-full flex-wrap items-center gap-3 p-4 text-start transition-colors duration-150 hover:bg-sand/70"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-jade/10 text-jade">
                    <ClockIcon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{session.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-ink-soft">
                      {session.event_title ? `${session.event_title} · ` : ''}
                      {formatDateTime(session.starts_at, locale)}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      session.attendance
                        ? attendanceStyles[session.attendance]
                        : 'bg-ink/5 text-ink-soft'
                    }`}
                  >
                    {session.attendance
                      ? t(`attendance.${session.attendance}`)
                      : t('participant.notCheckedIn')}
                  </span>
                </button>

                {expanded && (
                  <dl className="grid gap-3 bg-sand/50 px-4 pb-4 pt-1 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-ink-soft">{t('event.title')}</dt>
                      <dd className="mt-0.5 font-medium">{session.event_title || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-soft">{t('session.startsAt')}</dt>
                      <dd className="mt-0.5 font-medium">
                        {formatDateTime(session.starts_at, locale)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-soft">{t('session.duration')}</dt>
                      <dd className="mt-0.5 font-medium">
                        {session.duration_minutes} {t('common.minutesUnit')}
                      </dd>
                    </div>
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </DashboardShell>
  );
}
