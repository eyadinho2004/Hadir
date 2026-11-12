import { useI18n } from '../i18n/I18nProvider';
import { BrandMark } from './BrandMark';

export function Logo({
  tone = 'navy',
  className = '',
}: {
  tone?: 'navy' | 'white';
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark tone={tone} className="h-9 w-auto shrink-0" />
      <span
        className={`text-xl font-semibold leading-none ${
          tone === 'white' ? 'text-white' : 'text-ink'
        }`}
      >
        {t('brand.name')}
      </span>
    </span>
  );
}
