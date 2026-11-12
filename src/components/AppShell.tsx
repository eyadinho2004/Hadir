import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';

type NavItem = { to: string; label: string };

export function AppShell({
  badge,
  home,
  nav = [],
  children,
}: {
  badge: string;
  home: string;
  nav?: NavItem[];
  children: ReactNode;
}) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-sand/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to={home}>
              <Logo />
            </Link>
            <span className="rounded-full bg-jade/10 px-2.5 py-0.5 text-xs font-semibold text-jade">
              {badge}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {nav.length > 0 && (
              <nav aria-label={t('nav.label')} className="hidden items-center gap-4 text-sm md:flex">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-ink-soft transition-colors hover:text-jade"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
            <LanguageSwitcher />
            <span className="hidden max-w-48 truncate text-sm text-ink-soft lg:inline" dir="ltr">
              {user?.email}
            </span>
            <button type="button" className="btn btn-outline" onClick={handleSignOut}>
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
