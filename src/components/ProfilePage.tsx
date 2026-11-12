import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { namesOf, useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { formatDate } from '../lib/format';
import type { Role } from '../auth/AuthProvider';
import { useEvents } from '../provider/useEvents';
import { useSessionsIndex } from '../provider/useSessionsIndex';
import { useParticipantData } from '../participant/useParticipantData';
import { DashboardShell } from './DashboardShell';
import { ArrowIcon } from './Icons';
import { participantNav, providerNav } from './roleNav';

export function ProfilePage({ role }: { role: Role }) {
  const { t, locale } = useI18n();
  const { user, updateProfile } = useAuth();
  const isProvider = role === 'provider';

  const names = namesOf(user);
  const [firstName, setFirstName] = useState(names.first);
  const [lastName, setLastName] = useState(names.last);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const { events } = useEvents(isProvider ? user?.id : undefined);
  const { sessions } = useSessionsIndex(isProvider ? user?.id : undefined);
  const { summary } = useParticipantData(isProvider ? undefined : user?.id);

  const stats = isProvider
    ? [
        [t('dashboard.stats.events'), events ? String(events.length) : '—'],
        [t('dashboard.stats.sessions'), sessions ? String(sessions.length) : '—'],
        [
          t('dashboard.stats.active'),
          sessions ? String(sessions.filter((session) => session.status === 'active').length) : '—',
        ],
      ]
    : [
        [t('participant.totalSessions'), String(summary.total)],
        [t('participant.attended'), String(summary.present + summary.late)],
        [t('participant.rate'), `${summary.rate}%`],
      ];

  const badge = isProvider ? t('roles.provider.title') : t('roles.participant.title');
  const home = isProvider ? '/provider' : '/participant';
  const initial = (names.first.slice(0, 1) || user?.email?.slice(0, 1) || '—').toUpperCase();

  async function saveNames(event: FormEvent) {
    event.preventDefault();
    const first = firstName.trim();
    const last = lastName.trim();
    setStatus('idle');
    setError(null);

    if (first.length < 2) {
      setError(t('signup.errorFirstName'));
      setStatus('error');
      return;
    }
    if (last.length < 2) {
      setError(t('signup.errorLastName'));
      setStatus('error');
      return;
    }

    setStatus('saving');
    const result = await updateProfile({ firstName: first, lastName: last });
    if (result.error) {
      setError(t('profile.saveFailed'));
      setStatus('error');
      return;
    }
    setStatus('saved');
  }

  return (
    <DashboardShell
      badge={badge}
      home={home}
      nav={isProvider ? providerNav(t) : participantNav(t)}
    >
      <h1 className="text-2xl font-bold sm:text-3xl">{t('profile.title')}</h1>
      <p className="mt-2 max-w-xl text-ink-soft">{t('profile.lead')}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="card p-6">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-jade/10 text-xl font-bold text-jade">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {names.full || user?.email || t('profile.unknown')}
              </p>
              <p className="mt-0.5 truncate text-sm text-ink-soft" dir="ltr">
                {user?.email}
              </p>
              <span className="mt-1.5 inline-flex rounded-full bg-sand-deep px-2.5 py-0.5 text-xs font-semibold">
                {badge}
              </span>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-ink/10 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 py-3">
              <dt className="text-ink-soft">{t('profile.name')}</dt>
              <dd className="font-medium">{names.full || t('profile.unknown')}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3">
              <dt className="text-ink-soft">{t('profile.email')}</dt>
              <dd className="font-medium" dir="ltr">
                {user?.email ?? t('profile.unknown')}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3">
              <dt className="text-ink-soft">{t('profile.role')}</dt>
              <dd className="font-medium">{badge}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-3">
              <dt className="text-ink-soft">{t('profile.memberSince')}</dt>
              <dd className="font-medium">
                {user?.created_at ? formatDate(user.created_at, locale) : t('profile.unknown')}
              </dd>
            </div>
          </dl>

          <Link
            to={`${home}/settings`}
            className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-jade transition-colors hover:text-jade-deep"
          >
            {t('nav.settings')}
            <ArrowIcon className="size-4 rtl:rotate-180" />
          </Link>
        </section>

        <section className="card p-6" aria-labelledby="profile-summary">
          <h2 id="profile-summary" className="text-lg font-semibold">
            {t('profile.summary')}
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            {stats.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-ink/10 bg-sand/40 p-4 transition-colors duration-150 hover:border-jade/30"
              >
                <dt className="text-xs text-ink-soft">{label}</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="card mt-4 p-6" aria-labelledby="profile-edit-name">
        <h2 id="profile-edit-name" className="text-lg font-semibold">
          {t('profile.editName')}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">{t('profile.nameHint')}</p>

        <form className="mt-4" onSubmit={saveNames} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-first-name" className="block text-sm font-medium">
                {t('signup.firstName')}
              </label>
              <input
                id="profile-first-name"
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setStatus('idle');
                }}
                className="field mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="profile-last-name" className="block text-sm font-medium">
                {t('signup.lastName')}
              </label>
              <input
                id="profile-last-name"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setStatus('idle');
                }}
                className="field mt-1.5"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'saving'}
              aria-busy={status === 'saving'}
            >
              {status === 'saving' ? t('profile.saving') : t('profile.save')}
            </button>
            {status === 'saved' && (
              <p role="status" className="text-sm font-medium text-jade">
                {t('profile.saved')}
              </p>
            )}
            {status === 'error' && error && (
              <p role="alert" className="text-sm font-medium text-red-700">
                {error}
              </p>
            )}
          </div>
        </form>
      </section>
    </DashboardShell>
  );
}
