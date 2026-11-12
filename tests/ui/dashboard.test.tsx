import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../helpers/renderApp';
import { resetFake } from '../helpers/fakeSupabase';
import { resetDemoData } from '../../src/demo/demoData';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

beforeEach(() => {
  resetFake();
  resetDemoData();
  localStorage.clear();
});

describe('dashboard shell', () => {
  it('moves the provider between sidebar pages', async () => {
    localStorage.setItem('hadir.demo.role', 'provider');
    renderApp('/provider');

    await userEvent.click(await screen.findByRole('link', { name: 'الجلسات' }));

    expect(await screen.findByRole('heading', { name: 'الجلسات' })).toBeInTheDocument();
    expect(await screen.findByText('الجلسة الافتتاحية')).toBeInTheDocument();
  });

  it('finds a session by title from the participant search page', async () => {
    localStorage.setItem('hadir.demo.role', 'participant');
    renderApp('/participant/search');

    expect(await screen.findByText('ابدأ بالكتابة لعرض النتائج.')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('searchbox'), 'الافتتاحية');

    expect(await screen.findByText('الجلسة الافتتاحية')).toBeInTheDocument();
  });

  it('keeps settings toggles on the device', async () => {
    localStorage.setItem('hadir.demo.role', 'participant');
    renderApp('/participant/settings');

    const toggle = await screen.findByRole('switch', { name: 'ملخّص أسبوعي' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(JSON.parse(localStorage.getItem('hadir.preferences') ?? '{}')).toMatchObject({
      weeklySummary: true,
    });
  });

  it.each([
    ['provider', '/provider/sessions', 'الجلسات'],
    ['provider', '/provider/search', 'البحث عن جلسة'],
    ['provider', '/provider/profile', 'الملف التعريفي'],
    ['participant', '/participant/explore', 'استكشف الفعاليات'],
    ['participant', '/participant/events', 'فعالياتي'],
    ['participant', '/participant/sessions', 'جلساتي'],
    ['participant', '/participant/profile', 'الملف التعريفي'],
  ])('renders %s route %s without crashing', async (role, path, heading) => {
    localStorage.setItem('hadir.demo.role', role);
    renderApp(path);

    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'التنقل الرئيسي' })).toBeInTheDocument();
  });

  it('updates the name from the profile page', async () => {
    localStorage.setItem('hadir.demo.role', 'participant');
    renderApp('/participant/profile');

    const first = await screen.findByLabelText('الاسم الأول');
    await userEvent.clear(first);
    await userEvent.type(first, 'نورة');
    const last = screen.getByLabelText('اسم العائلة');
    await userEvent.clear(last);
    await userEvent.type(last, 'الحربي');
    await userEvent.click(screen.getByRole('button', { name: 'حفظ الاسم' }));

    expect(await screen.findByText('تم تحديث الاسم.')).toBeInTheDocument();
    expect(screen.getAllByText('نورة الحربي').length).toBeGreaterThan(0);
  });
});

describe('mobile shell', () => {
  it('opens the menu as a modal dialog and returns focus to the opener', async () => {
    localStorage.setItem('hadir.demo.role', 'provider');
    renderApp('/provider');

    const opener = await screen.findByRole('button', { name: 'فتح القائمة' });
    await userEvent.click(opener);

    const dialog = await screen.findByRole('dialog', { name: 'التنقل الرئيسي' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(opener).toHaveFocus();
  });
});
