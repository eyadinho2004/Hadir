import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../helpers/renderApp';
import { resetFake, setUser } from '../helpers/fakeSupabase';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

beforeEach(() => {
  resetFake();
  localStorage.clear();
});

describe('role guard', () => {
  it('sends an anonymous visitor from /provider to /auth', async () => {
    renderApp('/provider');
    expect(await screen.findByRole('heading', { name: 'تسجيل الدخول' })).toBeInTheDocument();
  });

  it('sends a participant away from /provider', async () => {
    setUser({ id: 'u1', email: 'participant@hadir.test', app_metadata: { role: 'participant' } });
    renderApp('/provider');
    expect(await screen.findByRole('heading', { name: 'لوحة المشارك' })).toBeInTheDocument();
  });

  it('lets a provider into /provider', async () => {
    setUser({ id: 'p1', email: 'provider@hadir.test', app_metadata: { role: 'provider' } });
    renderApp('/provider');
    expect(await screen.findByRole('heading', { name: 'لوحة المنظم' })).toBeInTheDocument();
  });
});
