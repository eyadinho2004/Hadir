import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../helpers/renderApp';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

describe('landing page', () => {
  it('renders the Arabic hero by default', () => {
    renderApp('/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'الحضور يُسجَّل لحظة وصولك' }),
    ).toBeInTheDocument();
  });
});
