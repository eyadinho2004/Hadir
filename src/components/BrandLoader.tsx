import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { BrandMark } from './BrandMark';

const SIZES = {
  sm: 'size-5',
  md: 'size-16',
  lg: 'size-24',
} as const;

export function BrandLoader({
  size = 'sm',
  delay = 0,
  tone = 'navy',
  className = '',
}: {
  size?: keyof typeof SIZES;
  delay?: number;
  tone?: 'navy' | 'white';
  className?: string;
}) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(delay <= 0);

  useEffect(() => {
    if (delay <= 0) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={t('common.loading')}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <BrandMark animated tone={tone} className={SIZES[size]} />
    </span>
  );
}
