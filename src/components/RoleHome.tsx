import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { Logo } from './Logo';

export function RoleHome({ title, lead, badge }: { title: string; lead: string; badge: string }) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="rounded-full bg-jade/10 px-2.5 py-0.5 text-xs font-semibold text-jade">
              {badge}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-ink-soft sm:inline" dir="ltr">
              {user?.email}
            </span>
            <button type="button" className="btn btn-outline" onClick={handleSignOut}>
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-xl text-ink-soft">{lead}</p>
        <div className="card mt-8 p-6">
          <p className="text-sm text-ink-soft">{t('home.nextStep')}</p>
        </div>
      </main>
    </div>
  );
}
