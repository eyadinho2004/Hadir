import type { Locale } from '../i18n/dictionary';

const ARABIC_DIGITS = 'ar-SA-u-ca-gregory-nu-latn';

export function formatDateTime(value: string, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ar' ? ARABIC_DIGITS : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(value: string, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ar' ? ARABIC_DIGITS : 'en-GB', {
    dateStyle: 'medium',
  }).format(date);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function fromInputValue(value: string): string {
  return new Date(value).toISOString();
}

export function defaultStart(): string {
  const date = new Date(Date.now() + 60 * 60_000);
  date.setMinutes(0, 0, 0);
  return toInputValue(date.toISOString());
}

export function defaultEnd(): string {
  const start = new Date(defaultStart());
  start.setHours(start.getHours() + 2);
  return toInputValue(start.toISOString());
}
