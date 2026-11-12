import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { Role } from '../auth/AuthProvider';
import { DashboardShell } from './DashboardShell';
import { LanguageSwitcher } from './LanguageSwitcher';
import { participantNav, providerNav } from './roleNav';

type Preferences = {
  emailNotifications: boolean;
  weeklySummary: boolean;
};

const storageKey = 'hadir.preferences';
const defaults: Preferences = { emailNotifications: true, weeklySummary: false };

function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function Switch({
  id,
  checked,
  label,
  hint,
  onChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  hint: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-medium">
          {label}
        </p>
        <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
          checked ? 'bg-jade' : 'bg-ink/20'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute start-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-150 ${
            checked ? 'translate-x-5 rtl:-translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPage({ role }: { role: Role }) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);

  const isProvider = role === 'provider';
  const badge = isProvider ? t('roles.provider.title') : t('roles.participant.title');
  const home = isProvider ? '/provider' : '/participant';

  function update(key: keyof Preferences, value: boolean) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Preferences stay in memory when storage is unavailable.
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <DashboardShell
      badge={badge}
      home={home}
      nav={isProvider ? providerNav(t) : participantNav(t)}
    >
      <h1 className="text-2xl font-bold sm:text-3xl">{t('settings.title')}</h1>
      <p className="mt-2 max-w-xl text-ink-soft">{t('settings.lead')}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-6" aria-labelledby="settings-language">
          <h2 id="settings-language" className="text-lg font-semibold">
            {t('settings.language')}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{t('settings.languageHint')}</p>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </section>

        <section className="card p-6" aria-labelledby="settings-account">
          <h2 id="settings-account" className="text-lg font-semibold">
            {t('settings.account')}
          </h2>
          <dl className="mt-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 py-2">
              <dt className="text-ink-soft">{t('profile.email')}</dt>
              <dd className="font-medium" dir="ltr">
                {user?.email}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-2">
              <dt className="text-ink-soft">{t('profile.role')}</dt>
              <dd className="font-medium">{badge}</dd>
            </div>
          </dl>
          <button type="button" className="btn btn-outline mt-4" onClick={handleSignOut}>
            {t('auth.signOut')}
          </button>
        </section>

        <section className="card p-6 lg:col-span-2" aria-labelledby="settings-preferences">
          <h2 id="settings-preferences" className="text-lg font-semibold">
            {t('settings.preferences')}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{t('settings.preferencesHint')}</p>
          <div className="mt-2 divide-y divide-ink/10">
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              label={t('settings.emailNotifications')}
              hint={t('settings.emailNotificationsHint')}
              onChange={(value) => update('emailNotifications', value)}
            />
            <Switch
              id="weekly-summary"
              checked={preferences.weeklySummary}
              label={t('settings.weeklySummary')}
              hint={t('settings.weeklySummaryHint')}
              onChange={(value) => update('weeklySummary', value)}
            />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
