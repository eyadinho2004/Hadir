import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BrandLoader } from '../components/BrandLoader';
import { useI18n } from '../i18n/I18nProvider';
import { parseCheckInCode } from '../lib/checkInCode';
import type { JoinResult } from './useParticipantSessions';

type Props = {
  initialCode?: string | null;
  onJoin: (code: string) => Promise<JoinResult>;
};

export function JoinCodeCard({ initialCode, onJoin }: Props) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState(initialCode ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      inputRef.current?.focus();
    }
  }, [initialCode]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;

    const normalized = parseCheckInCode(code);
    if (!normalized) {
      setMessage({ tone: 'error', text: t('participant.join.invalid') });
      inputRef.current?.focus();
      return;
    }

    setBusy(true);
    setMessage(null);
    const result = await onJoin(normalized);
    setBusy(false);

    if (result === 'joined' || result === 'already') {
      setCode('');
      setMessage({ tone: 'success', text: t(`participant.join.${result}`) });
    } else {
      setMessage({ tone: 'error', text: t(`participant.join.${result}`) });
    }
    inputRef.current?.focus();
  }

  return (
    <form className="card mt-8 p-6" onSubmit={submit} noValidate>
      <h2 className="text-lg font-semibold">{t('participant.join.title')}</h2>
      <p className="mt-1 max-w-xl text-sm text-ink-soft">{t('participant.join.lead')}</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="check-in-code" className="block text-sm font-medium">
            {t('participant.join.label')}
          </label>
          <input
            ref={inputRef}
            id="check-in-code"
            name="code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setMessage(null);
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            placeholder={t('participant.join.placeholder')}
            dir="ltr"
            className="field mt-1.5 max-w-40 text-center font-mono text-2xl tracking-[0.4em]"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy && <BrandLoader size="sm" />}
          {busy ? t('participant.join.submitting') : t('participant.join.submit')}
        </button>
      </div>

      <p
        aria-live="polite"
        className={`mt-3 text-sm ${
          message?.tone === 'success' ? 'text-jade' : 'text-red-700'
        }`}
      >
        {message?.text ?? ''}
      </p>
    </form>
  );
}
