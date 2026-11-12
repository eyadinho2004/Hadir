import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { homeFor, useAuth, type Role } from './AuthProvider';
import { useI18n } from '../i18n/I18nProvider';

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, role: current, loading, signOut } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16" aria-busy="true" aria-label={t('loading.page')}>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-ink/10 motion-reduce:animate-none" />
        <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded bg-ink/10 motion-reduce:animate-none" />
      </main>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (current === null) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-ink-soft">{t('auth.roleMissing')}</p>
        <button type="button" className="btn btn-outline" onClick={() => void signOut()}>
          {t('auth.signOut')}
        </button>
      </main>
    );
  }

  if (current !== role) return <Navigate to={homeFor(current)} replace />;

  return <>{children}</>;
}
