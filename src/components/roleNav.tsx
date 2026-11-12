import type { Dict } from '../i18n/dictionary';
import type { ShellNavItem } from './DashboardShell';
import {
  CalendarIcon,
  ClockIcon,
  CompassIcon,
  DashboardIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
} from './Icons';

type Translate = (key: keyof Dict) => string;

export function providerNav(t: Translate): ShellNavItem[] {
  return [
    {
      to: '/provider',
      label: t('nav.dashboard'),
      icon: <DashboardIcon className="size-5" />,
      end: true,
    },
    { to: '/provider/profile', label: t('nav.profile'), icon: <UserIcon className="size-5" /> },
    { to: '/provider/events', label: t('nav.events'), icon: <CalendarIcon className="size-5" /> },
    { to: '/provider/sessions', label: t('nav.sessions'), icon: <ClockIcon className="size-5" /> },
    { to: '/provider/search', label: t('nav.search'), icon: <SearchIcon className="size-5" /> },
    {
      to: '/provider/settings',
      label: t('nav.settings'),
      icon: <SettingsIcon className="size-5" />,
    },
  ];
}

export function participantNav(t: Translate): ShellNavItem[] {
  return [
    {
      to: '/participant',
      label: t('nav.dashboard'),
      icon: <DashboardIcon className="size-5" />,
      end: true,
    },
    {
      to: '/participant/explore',
      label: t('nav.explore'),
      icon: <CompassIcon className="size-5" />,
    },
    {
      to: '/participant/events',
      label: t('nav.myEvents'),
      icon: <CalendarIcon className="size-5" />,
    },
    {
      to: '/participant/sessions',
      label: t('nav.sessions'),
      icon: <ClockIcon className="size-5" />,
    },
    { to: '/participant/search', label: t('nav.search'), icon: <SearchIcon className="size-5" /> },
    {
      to: '/participant/profile',
      label: t('nav.profile'),
      icon: <UserIcon className="size-5" />,
    },
    {
      to: '/participant/settings',
      label: t('nav.settings'),
      icon: <SettingsIcon className="size-5" />,
    },
  ];
}
