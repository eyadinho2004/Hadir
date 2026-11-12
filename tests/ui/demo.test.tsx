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
  vi.unstubAllEnvs();
});

describe('demo access', () => {
  it('signs in as the demo provider from the sign in page', async () => {
    renderApp('/auth');

    await userEvent.click(await screen.findByRole('button', { name: 'دخول تجريبي كمنظم' }));

    expect(await screen.findByRole('heading', { name: 'لوحة المنظم' })).toBeInTheDocument();
    expect(await screen.findByText('ورشة تصميم الخدمات')).toBeInTheDocument();
  });

  it('signs in as the demo participant from the sign up page', async () => {
    renderApp('/signup');

    await userEvent.click(await screen.findByRole('button', { name: 'دخول تجريبي كمشارك' }));

    expect(await screen.findByRole('heading', { name: 'لوحة المشارك' })).toBeInTheDocument();
  });

  it('keeps the demo session on the next visit', async () => {
    renderApp('/auth');
    await userEvent.click(await screen.findByRole('button', { name: 'دخول تجريبي كمنظم' }));
    await screen.findByRole('heading', { name: 'لوحة المنظم' });

    renderApp('/provider');

    expect(await screen.findByRole('heading', { name: 'لوحة المنظم' })).toBeInTheDocument();
  });
});

describe('demo data', () => {
  it('opens a demo event with its sessions', async () => {
    localStorage.setItem('hadir.demo.role', 'provider');
    renderApp('/provider/events/demo-event-1');

    expect(
      await screen.findByRole('heading', { name: 'ورشة تصميم الخدمات' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('الجلسة الافتتاحية')).toBeInTheDocument();
  });

  it('creates an event inside the demo account', async () => {
    localStorage.setItem('hadir.demo.role', 'provider');
    renderApp('/provider');

    await userEvent.click(await screen.findByRole('button', { name: 'فعالية جديدة' }));
    await userEvent.type(screen.getByLabelText('عنوان الفعالية'), 'ملتقى الابتكار');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الفعالية' }));

    expect(await screen.findByText('ملتقى الابتكار')).toBeInTheDocument();
  });

  it('shows the demo participant attendance', async () => {
    localStorage.setItem('hadir.demo.role', 'participant');
    renderApp('/participant');

    expect(await screen.findByText('الجلسة الافتتاحية')).toBeInTheDocument();
  });
});

describe('demo names', () => {
  it.each([
    ['provider', 'عبدالله القحطاني'],
    ['participant', 'محمد العتيبي'],
  ])('shows the demo %s under his own name', async (role, name) => {
    localStorage.setItem('hadir.demo.role', role);
    renderApp(`/${role}`);

    expect((await screen.findAllByText(name)).length).toBeGreaterThan(0);
  });
});
