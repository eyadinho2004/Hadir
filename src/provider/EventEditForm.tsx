import { useState, type FormEvent } from 'react';
import { BrandLoader } from '../components/BrandLoader';
import { useI18n } from '../i18n/I18nProvider';
import { fromInputValue, toInputValue } from '../lib/format';
import type { EventRow, Visibility } from '../lib/types';
import { eventCategories } from './eventCategories';
import type { EventUpdate } from './useEvent';

export function EventEditForm({
  event,
  onSave,
  onCancel,
}: {
  event: EventRow;
  onSave: (input: EventUpdate) => Promise<boolean>;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? '');
  const [category, setCategory] = useState(event.category);
  const [location, setLocation] = useState(event.location ?? '');
  const [capacity, setCapacity] = useState(event.capacity ? String(event.capacity) : '');
  const [deadline, setDeadline] = useState(
    event.registration_deadline ? toInputValue(event.registration_deadline) : '',
  );
  const [visibility, setVisibility] = useState<Visibility>(event.visibility);
  const [startsAt, setStartsAt] = useState(toInputValue(event.starts_at));
  const [endsAt, setEndsAt] = useState(toInputValue(event.ends_at));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const categories = eventCategories.some((item) => item.value === category)
    ? eventCategories.map((item) => item.value)
    : [category, ...eventCategories.map((item) => item.value)];

  async function submit(formEvent: FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError(t('event.errorTitle'));
      return;
    }
    if (!startsAt || !endsAt) {
      setError(t('event.errorDates'));
      return;
    }

    const start = fromInputValue(startsAt);
    const end = fromInputValue(endsAt);
    if (new Date(end) <= new Date(start)) {
      setError(t('event.errorDates'));
      return;
    }
    if (deadline && new Date(fromInputValue(deadline)) >= new Date(start)) {
      setError(t('event.errorDeadline'));
      return;
    }

    const capacityValue = capacity.trim() === '' ? null : Number(capacity);
    if (capacityValue !== null && (!Number.isFinite(capacityValue) || capacityValue <= 0)) {
      setError(t('event.errorCapacity'));
      return;
    }

    setBusy(true);
    const ok = await onSave({
      title: title.trim(),
      description: description.trim() === '' ? null : description.trim(),
      category,
      location: location.trim() === '' ? null : location.trim(),
      visibility,
      capacity: capacityValue,
      registration_deadline: deadline ? fromInputValue(deadline) : null,
      starts_at: start,
      ends_at: end,
    });
    setBusy(false);
    if (!ok) setError(t('common.saveFailed'));
  }

  return (
    <form className="card mt-4 space-y-5 p-6" onSubmit={submit} noValidate>
      <div>
        <label htmlFor="event-edit-title" className="block text-sm font-medium">
          {t('event.title')}
        </label>
        <input
          id="event-edit-title"
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          className="field mt-1.5"
        />
      </div>

      <div>
        <label htmlFor="event-edit-description" className="block text-sm font-medium">
          {t('event.description')}
        </label>
        <textarea
          id="event-edit-description"
          value={description}
          onChange={(changeEvent) => setDescription(changeEvent.target.value)}
          rows={3}
          className="field mt-1.5 resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-edit-category" className="block text-sm font-medium">
            {t('event.category')}
          </label>
          <select
            id="event-edit-category"
            value={category}
            onChange={(changeEvent) => setCategory(changeEvent.target.value)}
            className="field mt-1.5"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="event-edit-location" className="block text-sm font-medium">
            {t('event.location')}
          </label>
          <input
            id="event-edit-location"
            value={location}
            onChange={(changeEvent) => setLocation(changeEvent.target.value)}
            className="field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="event-edit-capacity" className="block text-sm font-medium">
            {t('event.capacity')}
          </label>
          <input
            id="event-edit-capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(changeEvent) => setCapacity(changeEvent.target.value)}
            className="field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="event-edit-deadline" className="block text-sm font-medium">
            {t('event.registrationDeadline')}
          </label>
          <input
            id="event-edit-deadline"
            type="datetime-local"
            value={deadline}
            onChange={(changeEvent) => setDeadline(changeEvent.target.value)}
            className="field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="event-edit-starts" className="block text-sm font-medium">
            {t('event.startsAt')}
          </label>
          <input
            id="event-edit-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(changeEvent) => setStartsAt(changeEvent.target.value)}
            className="field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="event-edit-ends" className="block text-sm font-medium">
            {t('event.endsAt')}
          </label>
          <input
            id="event-edit-ends"
            type="datetime-local"
            value={endsAt}
            onChange={(changeEvent) => setEndsAt(changeEvent.target.value)}
            className="field mt-1.5"
          />
        </div>
      </div>

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
                name="event-edit-visibility"
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

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
          {busy ? <BrandLoader size="sm" /> : null}
          {busy ? t('event.saving') : t('event.save')}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
