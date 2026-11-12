import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { homeFor, useAuth } from './AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { BrandLoader } from '../components/BrandLoader';
import { Logo } from '../components/Logo';
import { BackLink } from '../components/BackLink';
import { DemoSignIn } from './DemoSignIn';

export function AuthPage() {
  const { t } = useI18n();
  const { user, role, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={homeFor(role)} replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const result = await signIn(email, password);
    if (result.error) {
      setError(
        result.error.includes('Invalid login') ? t('auth.errorInvalid') : t('auth.errorGeneric'),
      );
      setBusy(false);
      return;
    }
    navigate(homeFor(result.role), { replace: true });
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <BackLink to="/" label={t('auth.back')} />

          <div className="mt-10 flex justify-center">
            <Logo />
          </div>

          <h1 className="mt-8 text-2xl font-bold sm:text-3xl">{t('auth.title')}</h1>
          <p className="mt-2 text-sm text-ink-soft">{t('auth.subtitle')}</p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby={error ? 'auth-error' : undefined}
                aria-invalid={error ? true : undefined}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-3 text-start outline-none transition-colors focus:border-jade"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={error ? 'auth-error' : undefined}
                aria-invalid={error ? true : undefined}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-3 outline-none transition-colors focus:border-jade"
              />
            </div>

            {error && (
              <p id="auth-error" role="alert" className="text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={busy} aria-busy={busy}>
              {busy ? <BrandLoader size="sm" /> : null}
              {busy ? t('auth.submitting') : t('auth.submit')}
            </button>
          </form>

          <DemoSignIn onError={setError} />
          <p className="mt-6 text-sm text-ink-soft">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="font-semibold text-jade hover:underline">
              {t('auth.createAccount')}
            </Link>
          </p>
        </div>
      </div>

      <aside className="hero-surface hidden items-center justify-center p-12 text-sand lg:flex">
        <div className="relative max-w-sm">
          <p className="text-3xl font-bold leading-snug">{t('hero.title')}</p>
          <p className="mt-4 text-sm leading-relaxed text-sand/75">{t('hero.subtitle')}</p>
        </div>
      </aside>
    </div>
  );
}
