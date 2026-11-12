import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowIcon, PencilIcon, TrashIcon } from '../components/Icons';
import { useI18n } from '../i18n/I18nProvider';
import { formatDate } from '../lib/format';
import type { EventWithCount } from './useEvents';

export function EventCard({
  event,
  onDelete,
}: {
  event: EventWithCount;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const { t, locale } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    await onDelete(event.id);
    setBusy(false);
    setConfirming(false);
  }

  return (
    <li className="card card-interactive group relative flex flex-col p-5">
      <Link
        to={`/provider/events/${event.id}`}
        aria-label={`${event.title} — ${t('event.details')}`}
        className="absolute inset-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{event.title}</h3>
          <p className="mt-1 text-xs text-ink-soft">
            {formatDate(event.starts_at, locale)} — {formatDate(event.ends_at, locale)}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full bg-jade/10 px-2.5 py-0.5 text-xs font-semibold text-jade"
          dir="ltr"
        >
          {event.event_code}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
        <span className="rounded-full bg-sand-deep px-2.5 py-1 font-medium">{event.category}</span>
        <span>
          {event.session_count} {t('common.sessionsUnit')}
        </span>
        <span aria-hidden="true">·</span>
        <span>{event.visibility === 'public' ? t('event.public') : t('event.private')}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-jade">
          {t('event.details')}
          <ArrowIcon className="size-4 rtl:rotate-180" />
        </span>
        <div className="relative z-10 flex items-center gap-2">
          <Link
            to={`/provider/events/${event.id}?edit=1`}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-jade/40 hover:bg-jade/10 hover:text-jade"
          >
            <PencilIcon className="size-3.5" />
            {t('common.edit')}
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
            onClick={() => setConfirming(true)}
          >
            <TrashIcon className="size-3.5" />
            {t('common.delete')}
          </button>
        </div>
      </div>

      {confirming && (
        <div className="relative z-10 mt-3 rounded-xl bg-red-50 p-3">
          <p className="text-sm text-red-800">{t('event.deleteConfirm')}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn btn-primary bg-red-700 hover:bg-red-800"
              onClick={() => void handleDelete()}
              disabled={busy}
              aria-busy={busy}
            >
              {t('common.deleteConfirm')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
