import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../components/DashboardShell';
import { ArrowIcon, SearchIcon } from '../components/Icons';
import { BrandLoader } from '../components/BrandLoader';
import { providerNav } from '../components/roleNav';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { formatDateTime } from '../lib/format';
import { useSessionsIndex } from './useSessionsIndex';

export function ProviderSearchPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { sessions, failed, reload } = useSessionsIndex(user?.id);
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      needle === ''
        ? []
        : (sessions ?? []).filter(
            (session) =>
              session.title.toLowerCase().includes(needle) ||
              session.event_title.toLowerCase().includes(needle),
          ),
    [sessions, needle],
  );

  return (
    <DashboardShell badge={t('roles.provider.title')} home="/provider" nav={providerNav(t)}>
      <h1 className="text-2xl font-bold sm:text-3xl">{t('search.title')}</h1>
      <p className="mt-2 max-w-xl text-ink-soft">{t('search.lead')}</p>

      <div className="relative mt-6">
        <SearchIcon className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.placeholder')}
          className="field py-3.5 ps-12"
        />
      </div>

      {failed && (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-ink-soft">{t('common.loadFailed')}</p>
          <button type="button" className="btn btn-outline" onClick={() => void reload()}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {!failed && sessions === null && (
        <div className="mt-8 flex justify-center">
          <BrandLoader size="lg" delay={300} />
        </div>
      )}

      {!failed && sessions && needle === '' && (
        <p className="mt-8 rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink-soft">
          {t('search.hint')}
        </p>
      )}

      {!failed && needle !== '' && (
        <section className="mt-8" aria-labelledby="search-results">
          <h2 id="search-results" className="text-sm font-semibold text-ink-soft">
            {t('search.results')} ({results.length})
          </h2>

          {results.length === 0 && (
            <div className="card mt-4 p-8 text-center text-sm text-ink-soft">
              {t('search.noResults')}
            </div>
          )}

          {results.length > 0 && (
            <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              {results.map((session) => (
                <li key={session.id}>
                  <Link
                    to={`/provider/sessions/${session.id}`}
                    className="group flex flex-wrap items-center gap-3 p-4 transition-colors duration-150 hover:bg-sand/70"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium transition-colors group-hover:text-jade">
                        {session.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-ink-soft">
                        {session.event_title ? `${session.event_title} · ` : ''}
                        {formatDateTime(session.starts_at, locale)}
                      </p>
                    </div>
                    <span className="rounded-full bg-sand-deep px-2.5 py-0.5 text-xs font-semibold">
                      {t(`session.status.${session.status}`)}
                    </span>
                    <ArrowIcon className="size-4 text-ink-soft transition-colors group-hover:text-jade rtl:rotate-180" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </DashboardShell>
  );
}
