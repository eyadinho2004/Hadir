import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../helpers/renderApp';
import { resetFake } from '../helpers/fakeSupabase';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

beforeEach(() => {
  resetFake();
  localStorage.clear();
});

describe('language switcher', () => {
  it('switches the document to LTR and translates the hero', async () => {
    renderApp('/');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');

    await userEvent.click(screen.getByRole('button', { name: 'تغيير اللغة: العربية' }));

    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Attendance is recorded the moment you arrive',
    );
  });

  it('restores a saved locale on mount', () => {
    localStorage.setItem('hadir.locale', 'en');
    renderApp('/');
    expect(screen.getByRole('button', { name: 'Change language: English' })).toHaveTextContent(
      'English',
    );
  });
});
