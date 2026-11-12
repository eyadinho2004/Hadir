import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { homeFor, useAuth, type Role } from './AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { BrandLoader } from '../components/BrandLoader';

const ROLES: Role[] = ['provider', 'participant'];

export function DemoSignIn({ onError }: { onError?: (message: string) => void }) {
  const { t } = useI18n();
  const { signInDemo } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<Role | null>(null);

  async function enter(role: Role) {
    setBusy(role);
    const result = await signInDemo(role);
    setBusy(null);
    if (result.error) {
      onError?.(t('auth.demoFailed'));
      return;
    }
    navigate(homeFor(result.role), { replace: true });
  }

  return (
    <div className="mt-8 border-t border-ink/10 pt-6">
      <p className="text-xs font-semibold text-ink-soft">{t('auth.demoTitle')}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            className="btn btn-outline"
            disabled={busy !== null}
            aria-busy={busy === role}
            onClick={() => void enter(role)}
          >
            {busy === role ? <BrandLoader size="sm" /> : null}
            {t(role === 'provider' ? 'auth.demoProvider' : 'auth.demoParticipant')}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">{t('auth.demoHint')}</p>
    </div>
  );
}
