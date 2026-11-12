import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { namesOf, useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n/I18nProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CloseIcon, LogoutIcon, MenuIcon } from './Icons';
import { Logo } from './Logo';

export type ShellNavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
};

export function DashboardShell({
  badge,
  home,
  nav,
  children,
}: {
  badge: string;
  home: string;
  nav: ShellNavItem[];
  children: ReactNode;
}) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [open]);

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  const names = namesOf(user);
  const initial = (
    names.first.slice(0, 1) ||
    user?.email?.slice(0, 1) ||
    t('brand.name').slice(0, 1)
  ).toUpperCase();

  const sidebar = (close?: () => void) => (
    <div className="flex h-full flex-col gap-8 overflow-y-auto p-5">
      <div className="flex items-center justify-between gap-2">
        <Link to={home} onClick={close} className="flex flex-col items-start gap-1">
          <Logo />
          <span className="text-[11px] text-ink-soft">{badge}</span>
        </Link>
        {close && (
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={t('nav.closeMenu')}
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink lg:hidden"
          >
            <CloseIcon className="size-5" />
          </button>
        )}
      </div>

      <nav aria-label={t('nav.label')} className="space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={close}
            className={({ isActive }) =>
              `nav-item group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-jade-deep hover:text-white ${
                isActive ? 'bg-jade/10 text-jade-deep' : 'text-ink-soft'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`transition-colors duration-150 group-hover:text-white ${
                    isActive ? 'text-jade' : 'text-ink-soft/75'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                <span
                  aria-hidden="true"
                  className={`ms-auto size-1.5 rounded-full transition-colors duration-150 ${
                    isActive ? 'bg-jade group-hover:bg-white' : 'bg-transparent'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-ink/10 bg-sand/70 p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-jade/10 text-sm font-bold text-jade">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink">
              {names.full || user?.email}
            </p>
            <p className="text-[11px] text-ink-soft">{badge}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-sand">
      <a href="#dashboard-main" className="skip-link">
        {t('nav.skip')}
      </a>

      <aside className="fixed inset-y-0 start-0 z-30 hidden w-72 border-e border-ink/10 bg-white lg:block">
        {sidebar()}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label={t('nav.closeMenu')}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div
            id="mobile-nav"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.label')}
            className="absolute inset-y-0 start-0 w-72 max-w-[85vw] border-e border-ink/10 bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl"
          >
            {sidebar(() => setOpen(false))}
          </div>
        </div>
      )}

      <div className="lg:ps-72">
        <header className="sticky top-0 z-20 border-b border-ink/10 bg-sand/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              ref={openerRef}
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={t('nav.openMenu')}
              className="grid size-10 place-items-center rounded-full border border-ink/15 text-ink-soft transition-colors hover:bg-white hover:text-ink lg:hidden"
            >
              <MenuIcon className="size-5" />
            </button>
            <span className="text-sm font-semibold text-ink-soft">{badge}</span>
            <div className="ms-auto flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              <span className="hidden max-w-48 truncate text-sm text-ink-soft xl:inline">
                {names.full || user?.email}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleSignOut}
                aria-label={t('auth.signOut')}
              >
                <LogoutIcon className="size-4" />
                <span className="hidden sm:inline">{t('auth.signOut')}</span>
              </button>
            </div>
          </div>
        </header>

        <main
          id="dashboard-main"
          className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
