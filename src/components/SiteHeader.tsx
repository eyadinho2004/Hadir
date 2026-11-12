import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-sand/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
          <span className="hidden text-xs text-ink-soft sm:inline">{t('brand.tagline')}</span>
        </Link>

        <nav aria-label={t('nav.label')} className="hidden items-center gap-6 text-sm md:flex">
          <a href="#features" className="text-ink-soft transition-colors hover:text-jade">
            {t('nav.features')}
          </a>
          <a href="#how" className="text-ink-soft transition-colors hover:text-jade">
            {t('nav.how')}
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link to="/auth" className="btn btn-outline px-4 text-sm">
            {t('nav.signIn')}
          </Link>
          <Link to="/signup" className="btn btn-primary hidden px-4 text-sm sm:inline-flex">
            {t('nav.start')}
          </Link>
        </div>
      </div>
    </header>
  );
}
