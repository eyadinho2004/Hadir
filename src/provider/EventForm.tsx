import { useState, type FormEvent } from 'react';
import { BrandLoader } from '../components/BrandLoader';
import { useI18n } from '../i18n/I18nProvider';
import { defaultEnd, defaultStart, fromInputValue } from '../lib/format';
import type { Visibility } from '../lib/types';
import { eventCategories as categories } from './eventCategories';
import type { NewEvent } from './useEvents';

export function EventForm({
  onCreate,
  onCancel,
}: {
  onCreate: (input: NewEvent) => Promise<boolean>;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(categories[0].value);
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [endsAt, setEndsAt] = useState(defaultEnd);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError(t('event.errorTitle'));
      return;
    }

    const start = fromInputValue(startsAt);
    const end = fromInputValue(endsAt);
    if (new Date(end) <= new Date(start)) {
      setError(t('event.errorDates'));
      return;
    }

    setBusy(true);
    const ok = await onCreate({
      title: title.trim(),
      category,
      visibility,
      starts_at: start,
      ends_at: end,
    });
    setBusy(false);
    if (!ok) setError(t('common.saveFailed'));
  }

  return (
    <form className="card mt-6 space-y-5 p-6" onSubmit={submit} noValidate>
      <div>
        <label htmlFor="event-title" className="block text-sm font-medium">
          {t('event.title')}
        </label>
        <input
          id="event-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="field mt-1.5"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">{t('event.category')}</legend>
        <div className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map(({ value, Icon }) => {
            const selected = category === value;
            return (
              <label
                key={value}
                className={`group flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-jade ${
                  selected
                    ? 'border-jade bg-jade/5'
                    : 'border-ink/15 hover:border-ink/30 hover:bg-sand/40'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={value}
                  checked={selected}
                  onChange={() => setCategory(value)}
                  className="sr-only"
                />
                <span
                  className={`grid size-10 place-items-center rounded-xl transition-colors ${
                    selected
                      ? 'bg-jade text-sand'
                      : 'bg-sand-deep text-ink-soft group-hover:text-ink'
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold leading-snug">{value}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">{t('event.visibility')}</legend>
        <div className="mt-2 flex gap-4 text-sm">
          {(
            [
              ['private', t('event.private')],
              ['public', t('event.public')],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                value={value}
                checked={visibility === value}
                onChange={() => setVisibility(value)}
                className="size-4 accent-jade"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-starts" className="block text-sm font-medium">
            {t('event.startsAt')}
          </label>
          <input
            id="event-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            className="field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="event-ends" className="block text-sm font-medium">
            {t('event.endsAt')}
          </label>
          <input
            id="event-ends"
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            className="field mt-1.5"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
          {busy ? <BrandLoader size="sm" /> : null}
          {busy ? t('event.creating') : t('event.create')}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
