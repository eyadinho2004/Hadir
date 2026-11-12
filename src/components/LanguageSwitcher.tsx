import { useI18n } from '../i18n/I18nProvider';
import { GlobeIcon } from './Icons';

const labels = { ar: 'العربية', en: 'English' } as const;

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const next = locale === 'ar' ? 'en' : 'ar';

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={`${t('nav.langLabel')}: ${labels[locale]}`}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-3 text-xs font-semibold text-ink-soft transition-colors hover:border-jade/40 hover:bg-jade/10 hover:text-jade"
    >
      <GlobeIcon className="size-4" />
      <span lang={locale}>{labels[locale]}</span>
    </button>
  );
}
