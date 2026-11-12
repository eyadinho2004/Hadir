import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../components/DashboardShell';
import { ArrowIcon, CalendarIcon, ClockIcon, PlusIcon, SearchIcon } from '../components/Icons';
import { BrandLoader } from '../components/BrandLoader';
import { providerNav } from '../components/roleNav';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { EventCard } from './EventCard';
import { EventForm } from './EventForm';
import { useEvents, type NewEvent } from './useEvents';
import { useSessionsIndex } from './useSessionsIndex';

export function ProviderDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { events, failed, reload, createEvent, deleteEvent } = useEvents(user?.id);
  const { sessions } = useSessionsIndex(user?.id);
  const [formOpen, setFormOpen] = useState(false);

  async function handleCreate(input: NewEvent) {
    const created = await createEvent(input);
    if (created) setFormOpen(false);
    return created;
  }

  const stats = [
    { label: t('dashboard.stats.events'), value: events ? String(events.length) : '—' },
    { label: t('dashboard.stats.sessions'), value: sessions ? String(sessions.length) : '—' },
    {
      label: t('dashboard.stats.active'),
      value: sessions ? String(sessions.filter((session) => session.status === 'active').length) : '—',
    },
    {
      label: t('dashboard.stats.public'),
      value: events ? String(events.filter((event) => event.visibility === 'public').length) : '—',
    },
  ];

  return (
    <DashboardShell badge={t('roles.provider.title')} home="/provider" nav={providerNav(t)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-jade">
            {t('dashboard.eyebrow')}
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t('provider.title')}</h1>
          <p className="mt-2 max-w-xl text-ink-soft">{t('provider.lead')}</p>
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

      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card p-5 transition-colors duration-150 hover:border-jade/30"
          >
            <dt className="text-xs text-ink-soft">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label={t('dashboard.quick')} className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            to: '/provider/events',
            label: t('dashboard.quick.events'),
            icon: <CalendarIcon className="size-5" />,
          },
          {
            to: '/provider/sessions',
            label: t('dashboard.quick.sessions'),
            icon: <ClockIcon className="size-5" />,
          },
          {
            to: '/provider/search',
            label: t('dashboard.quick.search'),
            icon: <SearchIcon className="size-5" />,
          },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group card card-interactive flex items-center gap-3 p-4"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-jade/10 text-jade transition-colors duration-150 group-hover:bg-jade group-hover:text-sand">
              {action.icon}
            </span>
            <span className="text-sm font-semibold">{action.label}</span>
            <ArrowIcon className="ms-auto size-4 text-ink-soft transition-colors group-hover:text-jade rtl:rotate-180" />
          </Link>
        ))}
      </nav>

      {formOpen && (
        <EventForm onCreate={handleCreate} onCancel={() => setFormOpen(false)} />
      )}

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

      <section className="mt-10" aria-labelledby="provider-events">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="provider-events" className="text-lg font-semibold">
            {t('dashboard.yourEvents')}
          </h2>
          <Link
            to="/provider/events"
            className="text-sm font-semibold text-jade transition-colors hover:text-jade-deep"
          >
            {t('dashboard.viewAll')}
          </Link>
        </div>

        {!failed && events?.length === 0 && (
          <div className="card mt-4 p-8 text-center">
            <h3 className="text-lg font-semibold">{t('event.empty')}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{t('event.emptyHint')}</p>
          </div>
        )}

        {!failed && events && events.length > 0 && (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onDelete={deleteEvent} />
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
