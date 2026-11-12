import { useState, type FormEvent } from 'react';
import { BrandLoader } from '../components/BrandLoader';
import { useI18n } from '../i18n/I18nProvider';
import { fromInputValue, toInputValue } from '../lib/format';
import type { SessionMethod, SessionRow } from '../lib/types';
import type { SessionUpdate } from './useEvent';

export function SessionEditForm({
  session,
  onSave,
  onCancel,
}: {
  session: SessionRow;
  onSave: (input: SessionUpdate) => Promise<boolean>;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState(session.title);
  const [startsAt, setStartsAt] = useState(toInputValue(session.starts_at));
  const [duration, setDuration] = useState(String(session.duration_minutes));
  const [lateness, setLateness] = useState(String(session.allowed_lateness_minutes));
  const [method, setMethod] = useState<SessionMethod>(session.method);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(formEvent: FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError(t('session.errorTitle'));
      return;
    }

    const durationValue = Number(duration);
    if (!Number.isFinite(durationValue) || durationValue < 5 || durationValue > 480) {
      setError(t('session.errorDuration'));
      return;
    }

    const latenessValue = Number(lateness);
    if (!Number.isFinite(latenessValue) || latenessValue < 0 || latenessValue > 120) {
      setError(t('session.errorLateness'));
      return;
    }

    if (!startsAt) {
      setError(t('session.errorStartsAt'));
      return;
    }

    setBusy(true);
    const ok = await onSave({
      title: title.trim(),
      starts_at: fromInputValue(startsAt),
      duration_minutes: durationValue,
      allowed_lateness_minutes: latenessValue,
      method,
    });
    setBusy(false);
    if (!ok) setError(t('common.saveFailed'));
  }

  return (
    <form className="mt-3 space-y-4 rounded-xl bg-sand/60 p-4" onSubmit={submit} noValidate>
      <div>
        <label htmlFor="session-edit-title" className="block text-sm font-medium">
          {t('session.title')}
        </label>
        <input
          id="session-edit-title"
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          className="field mt-1.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="session-edit-starts" className="block text-sm font-medium">
            {t('session.startsAt')}
          </label>
          <input
            id="session-edit-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(changeEvent) => setStartsAt(changeEvent.target.value)}
            className="field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="session-edit-duration" className="block text-sm font-medium">
            {t('session.duration')}
          </label>
          <input
            id="session-edit-duration"
            type="number"
            min={5}
            max={480}
            value={duration}
            onChange={(changeEvent) => setDuration(changeEvent.target.value)}
            className="field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="session-edit-lateness" className="block text-sm font-medium">
            {t('session.lateness')}
          </label>
          <input
            id="session-edit-lateness"
            type="number"
            min={0}
            max={120}
            value={lateness}
            onChange={(changeEvent) => setLateness(changeEvent.target.value)}
            className="field mt-1.5"
          />
        </div>
      </div>

      <div>
        <label htmlFor="session-edit-method" className="block text-sm font-medium">
          {t('session.method')}
        </label>
        <select
          id="session-edit-method"
          value={method}
          onChange={(changeEvent) => setMethod(changeEvent.target.value as SessionMethod)}
          className="field mt-1.5"
        >
          <option value="face_to_face">{t('session.method.face_to_face')}</option>
          <option value="online">{t('session.method.online')}</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
          {busy ? <BrandLoader size="sm" /> : null}
          {busy ? t('session.saving') : t('session.save')}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
