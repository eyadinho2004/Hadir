import { useMemo, useState } from 'react';
import { DashboardShell } from '../components/DashboardShell';
import { PlusIcon, SearchIcon } from '../components/Icons';
import { BrandLoader } from '../components/BrandLoader';
import { providerNav } from '../components/roleNav';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { Visibility } from '../lib/types';
import { EventCard } from './EventCard';
import { EventForm } from './EventForm';
import { useEvents, type NewEvent } from './useEvents';

type VisibilityFilter = 'all' | Visibility;

export function EventsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { events, failed, reload, createEvent, deleteEvent } = useEvents(user?.id);
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<VisibilityFilter>('all');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (events ?? []).filter((event) => {
      const matchesVisibility = visibility === 'all' || event.visibility === visibility;
      const matchesQuery =
        needle === '' ||
        event.title.toLowerCase().includes(needle) ||
        event.event_code.toLowerCase().includes(needle);
      return matchesVisibility && matchesQuery;
    });
  }, [events, query, visibility]);

  async function handleCreate(input: NewEvent) {
    const created = await createEvent(input);
    if (created) setFormOpen(false);
    return created;
  }

  return (
    <DashboardShell badge={t('roles.provider.title')} home="/provider" nav={providerNav(t)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t('provider.events.title')}</h1>
          <p className="mt-2 max-w-xl text-ink-soft">{t('provider.events.lead')}</p>
        </div>
        {!formOpen && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFormOpen(true)}
          >
            <PlusIcon className="size-4" />
            {t('event.new')}
          </button>
        )}
      </div>

      {formOpen && <EventForm onCreate={handleCreate} onCancel={() => setFormOpen(false)} />}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('provider.events.search')}
            aria-label={t('provider.events.search')}
            className="field ps-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', t('common.all')],
              ['public', t('event.public')],
              ['private', t('event.private')],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setVisibility(value)}
              aria-pressed={visibility === value}
              className={`chip ${visibility === value ? 'chip-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {failed && (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-ink-soft">{t('common.loadFailed')}</p>
          <button type="button" className="btn btn-outline" onClick={() => void reload()}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {!failed && events === null && (
        <div className="mt-8 flex justify-center">
          <BrandLoader size="lg" delay={300} />
        </div>
      )}

      {!failed && events?.length === 0 && (
        <div className="card mt-8 p-8 text-center">
          <h2 className="text-lg font-semibold">{t('event.empty')}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{t('event.emptyHint')}</p>
        </div>
      )}

      {!failed && events && events.length > 0 && filtered.length === 0 && (
        <div className="card mt-8 p-8 text-center text-sm text-ink-soft">
          {t('provider.events.noResults')}
        </div>
      )}

      {!failed && filtered.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} onDelete={deleteEvent} />
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
