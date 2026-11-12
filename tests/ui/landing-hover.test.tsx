import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../helpers/renderApp';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

describe('landing hero grid', () => {
  it('follows the pointer with a light spot while hovered', async () => {
    const { container } = renderApp('/');
    const hero = container.querySelector<HTMLElement>('.hero-surface');
    expect(hero).not.toBeNull();

    fireEvent.pointerEnter(hero!);
    expect(hero).toHaveAttribute('data-pointer', 'on');

    hero!.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 120, clientY: 90 }));

    await waitFor(() => {
      expect(hero!.style.getPropertyValue('--pointer-x')).toBe('120px');
    });
    expect(hero!.style.getPropertyValue('--pointer-y')).toBe('90px');

    fireEvent.pointerLeave(hero!);
    expect(hero).toHaveAttribute('data-pointer', 'off');
  });
});
