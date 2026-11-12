import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homeFor, useAuth, type Role } from './AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { BrandLoader } from '../components/BrandLoader';
import { BackLink } from '../components/BackLink';
import { Logo } from '../components/Logo';
import { DemoSignIn } from './DemoSignIn';

type Errors = Partial<
  Record<'role' | 'firstName' | 'lastName' | 'email' | 'password' | 'confirm' | 'form', string>
>;

export function SignUpPage() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const options: { id: Role; title: string; body: string }[] = [
    { id: 'provider', title: t('roles.provider.title'), body: t('roles.provider.body') },
    { id: 'participant', title: t('roles.participant.title'), body: t('roles.participant.body') },
  ];

  function validate(): Errors {
    const found: Errors = {};
    if (!role) found.role = t('signup.errorRole');
    if (firstName.trim().length < 2) found.firstName = t('signup.errorFirstName');
    if (lastName.trim().length < 2) found.lastName = t('signup.errorLastName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) found.email = t('signup.errorEmail');
    if (password.length < 8) found.password = t('signup.errorPassword');
    if (confirm !== password) found.confirm = t('signup.errorMismatch');
    return found;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !role) return;

    setBusy(true);
    const result = await signUp({ email, password, role, firstName, lastName });
    if (result.error) {
      setErrors({
        form: result.error.toLowerCase().includes('already registered')
          ? t('signup.errorEmailTaken')
          : t('signup.errorGeneric'),
      });
      setBusy(false);
      return;
    }
    if (result.needsConfirmation) {
      setSentTo(email);
      setBusy(false);
      return;
    }
    navigate(homeFor(result.role), { replace: true });
  }

  if (sentTo) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
        <h1 className="text-2xl font-bold">{t('signup.checkEmailTitle')}</h1>
        <p className="mt-3 text-sm text-ink-soft">{t('signup.checkEmailBody')}</p>
        <p className="mt-1 font-semibold" dir="ltr">
          {sentTo}
        </p>
        <Link to="/auth" className="btn btn-primary mt-8">
          {t('signup.backToSignIn')}
        </Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <BackLink to="/" label={t('auth.back')} />

        <div className="mt-10 flex justify-center">
          <Logo />
        </div>

        <h1 className="mt-8 text-2xl font-bold sm:text-3xl">{t('signup.title')}</h1>
        <p className="mt-2 text-sm text-ink-soft">{t('signup.subtitle')}</p>

        <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
          <fieldset aria-describedby={errors.role ? 'role-error' : 'role-hint'}>
            <legend className="text-sm font-medium">{t('signup.roleLegend')}</legend>
            <p id="role-hint" className="mt-1 text-xs text-ink-soft">
              {t('signup.roleHint')}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {options.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                    role === option.id
                      ? 'border-jade bg-jade/5 ring-1 ring-jade'
                      : 'border-ink/15 hover:border-ink/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.id}
                    checked={role === option.id}
                    onChange={() => setRole(option.id)}
                    className="mt-1 size-4 accent-jade"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{option.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink-soft">
                      {option.body}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {errors.role && (
              <p id="role-error" role="alert" className="mt-2 text-sm font-medium text-red-700">
                {errors.role}
              </p>
            )}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium">
                {t('signup.firstName')}
              </label>
              <input
                id="first-name"
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                aria-invalid={errors.firstName ? true : undefined}
                aria-describedby={errors.firstName ? 'first-name-error' : undefined}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-3 outline-none transition-colors focus:border-jade"
              />
              {errors.firstName && (
                <p id="first-name-error" className="mt-1.5 text-sm text-red-700">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="last-name" className="block text-sm font-medium">
                {t('signup.lastName')}
              </label>
              <input
                id="last-name"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                aria-invalid={errors.lastName ? true : undefined}
                aria-describedby={errors.lastName ? 'last-name-error' : undefined}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-3 outline-none transition-colors focus:border-jade"
              />
              {errors.lastName && (
                <p id="last-name-error" className="mt-1.5 text-sm text-red-700">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {t('signup.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-3 text-start outline-none transition-colors focus:border-jade"
            />
            {errors.email && (
              <p id="email-error" className="mt-1.5 text-sm text-red-700">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              {t('signup.password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-3 outline-none transition-colors focus:border-jade"
            />
            {errors.password ? (
              <p id="password-error" className="mt-1.5 text-sm text-red-700">
                {errors.password}
              </p>
            ) : (
              <p id="password-hint" className="mt-1.5 text-xs text-ink-soft">
                {t('signup.passwordHint')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium">
              {t('signup.confirm')}
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              aria-invalid={errors.confirm ? true : undefined}
              aria-describedby={errors.confirm ? 'confirm-error' : undefined}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-3 outline-none transition-colors focus:border-jade"
            />
            {errors.confirm && (
              <p id="confirm-error" className="mt-1.5 text-sm text-red-700">
                {errors.confirm}
              </p>
            )}
          </div>

          {errors.form && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {errors.form}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={busy} aria-busy={busy}>
            {busy ? <BrandLoader size="sm" /> : null}
            {busy ? t('signup.submitting') : t('signup.submit')}
          </button>
        </form>

        <DemoSignIn onError={(message) => setErrors({ form: message })} />

        <p className="mt-6 text-sm text-ink-soft">
          {t('auth.haveAccount')}{' '}
          <Link to="/auth" className="font-semibold text-jade hover:underline">
            {t('auth.signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
