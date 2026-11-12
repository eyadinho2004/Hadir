import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../helpers/renderApp';
import { fake, resetFake } from '../helpers/fakeSupabase';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

beforeEach(() => {
  resetFake();
  localStorage.clear();
});

async function submitCredentials(email: string, password: string) {
  await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), email);
  await userEvent.type(screen.getByLabelText('كلمة المرور'), password);
  await userEvent.click(screen.getByRole('button', { name: 'دخول' }));
}

describe('auth', () => {
  it('sends a provider to /provider after sign in', async () => {
    fake.signIn.user = {
      id: 'p1',
      email: 'provider@hadir.test',
      app_metadata: { role: 'provider' },
    };
    renderApp('/auth');

    await submitCredentials('provider@hadir.test', 'secret123');

    expect(await screen.findByRole('heading', { name: 'لوحة المنظم' })).toBeInTheDocument();
  });

  it('sends a participant to /participant after sign in', async () => {
    fake.signIn.user = {
      id: 'u1',
      email: 'participant@hadir.test',
      app_metadata: { role: 'participant' },
    };
    renderApp('/auth');

    await submitCredentials('participant@hadir.test', 'secret123');

    expect(await screen.findByRole('heading', { name: 'لوحة المشارك' })).toBeInTheDocument();
  });

  it('shows a human error for wrong credentials', async () => {
    fake.signIn.error = { message: 'Invalid login credentials' };
    renderApp('/auth');

    await submitCredentials('participant@hadir.test', 'wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    );
  });

describe('demo sign in', () => {
  it('signs a provider in with the demo button', async () => {
    vi.stubEnv('VITE_DEMO_PROVIDER_EMAIL', 'demo-provider@hadir.test');
    vi.stubEnv('VITE_DEMO_PROVIDER_PASSWORD', 'demo-pass');
    fake.signIn.user = {
      id: 'dp',
      email: 'demo-provider@hadir.test',
      app_metadata: { role: 'provider' },
    };
    renderApp('/auth');

    await userEvent.click(await screen.findByRole('button', { name: 'دخول تجريبي كمنظم' }));

    expect(await screen.findByRole('heading', { name: 'لوحة المنظم' })).toBeInTheDocument();
    expect(fake.lastSignIn).toEqual({
      email: 'demo-provider@hadir.test',
      password: 'demo-pass',
    });
    vi.unstubAllEnvs();
  });

  it('signs a participant in with the demo button', async () => {
    vi.stubEnv('VITE_DEMO_PARTICIPANT_EMAIL', 'demo-participant@hadir.test');
    vi.stubEnv('VITE_DEMO_PARTICIPANT_PASSWORD', 'demo-pass');
    fake.signIn.user = {
      id: 'du',
      email: 'demo-participant@hadir.test',
      app_metadata: { role: 'participant' },
    };
    renderApp('/auth');

    await userEvent.click(await screen.findByRole('button', { name: 'دخول تجريبي كمشارك' }));

    expect(await screen.findByRole('heading', { name: 'لوحة المشارك' })).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('uses the configured demo account instead of local demo data', async () => {
    vi.stubEnv('VITE_DEMO_PARTICIPANT_EMAIL', 'demo-participant@hadir.test');
    vi.stubEnv('VITE_DEMO_PARTICIPANT_PASSWORD', 'demo-pass');
    fake.signIn.user = {
      id: 'du',
      email: 'demo-participant@hadir.test',
      app_metadata: { role: 'participant' },
    };
    renderApp('/auth');

    await userEvent.click(await screen.findByRole('button', { name: 'دخول تجريبي كمشارك' }));

    expect(await screen.findByRole('heading', { name: 'لوحة المشارك' })).toBeInTheDocument();
    expect(localStorage.getItem('hadir.demo.role')).toBeNull();
    vi.unstubAllEnvs();
  });
});
});
