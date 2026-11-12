import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { dictionaries, dirFor, isLocale, type Dict, type Locale } from './dictionary';

type I18nValue = {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  t: (key: keyof Dict) => string;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = 'hadir.locale';
const I18nContext = createContext<I18nValue | null>(null);

function initialLocale(): Locale {
  const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : 'ar';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const dir = dirFor(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale, dir]);

  const t = useCallback((key: keyof Dict) => dictionaries[locale][key], [locale]);
  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);

  const value = useMemo(() => ({ locale, dir, t, setLocale }), [locale, dir, t, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
