import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../src/auth/AuthProvider';
import { resetFake, seed, setUser, tables } from '../helpers/fakeSupabase';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

beforeEach(() => {
  resetFake();
  localStorage.clear();
});

describe('profile name', () => {
  it('keeps the public profile row in step with the auth name', async () => {
    setUser({
      id: 'user-1',
      email: 'm@hadir.test',
      app_metadata: { role: 'participant' },
      user_metadata: { first_name: 'محمد', last_name: 'العتيبي' },
    });
    seed('users', [
      { id: 'user-1', full_name: 'محمد العتيبي', email: 'm@hadir.test', role: 'participant' },
    ]);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    await act(async () => {
      const outcome = await result.current.updateProfile({
        firstName: 'سلطان',
        lastName: 'الحربي',
      });
      expect(outcome.error).toBeNull();
    });

    expect(tables.users?.[0]?.full_name).toBe('سلطان الحربي');
  });
});
