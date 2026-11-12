import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { DEMO_PARTICIPANT_ID, DEMO_PROVIDER_ID } from '../demo/demoData';
import { demoAccounts } from './demoAccounts';

export type Role = 'provider' | 'participant';

export type SignUpResult = { error: string | null; needsConfirmation: boolean; role: Role | null };
export type ProfileNames = { firstName: string; lastName: string };
export type SignUpInput = ProfileNames & { email: string; password: string; role: Role };

export type AuthValue = {
  user: User | null;
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role: Role | null }>;
  signInDemo: (role: Role) => Promise<{ error: string | null; role: Role | null }>;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  updateProfile: (names: ProfileNames) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function readRole(user: User | null): Role | null {
  const claimed = user?.app_metadata?.['role'] ?? user?.user_metadata?.['role'];
  return claimed === 'provider' || claimed === 'participant' ? claimed : null;
}

export function homeFor(role: Role | null): string {
  return role === 'provider' ? '/provider' : '/participant';
}

const DEMO_KEY = 'hadir.demo.role';
const DEMO_NAMES_KEY = 'hadir.demo.names';

type DemoName = { first_name: string; last_name: string };

const demoDefaults: Record<Role, DemoName> = {
  provider: { first_name: 'عبدالله', last_name: 'القحطاني' },
  participant: { first_name: 'محمد', last_name: 'العتيبي' },
};

function storedDemoNames(): Partial<Record<Role, DemoName>> {
  try {
    const raw = localStorage.getItem(DEMO_NAMES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Record<Role, DemoName>>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function demoUser(role: Role): User {
  const names = storedDemoNames()[role] ?? demoDefaults[role];
  return {
    id: role === 'provider' ? DEMO_PROVIDER_ID : DEMO_PARTICIPANT_ID,
    email: `${role}@demo.hadir`,
    app_metadata: { role },
    user_metadata: { role, ...names },
    aud: 'authenticated',
    created_at: new Date(0).toISOString(),
  } as unknown as User;
}

function storedDemoRole(): Role | null {
  const stored = localStorage.getItem(DEMO_KEY);
  return stored === 'provider' || stored === 'participant' ? stored : null;
}

export function namesOf(user: User | null): { first: string; last: string; full: string } {
  const meta = user?.user_metadata ?? {};
  const first = typeof meta['first_name'] === 'string' ? meta['first_name'].trim() : '';
  const last = typeof meta['last_name'] === 'string' ? meta['last_name'].trim() : '';
  return { first, last, full: [first, last].filter(Boolean).join(' ') };
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const demo = storedDemoRole();
      setUser(data.session?.user ?? (demo ? demoUser(demo) : null));
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, role: null };
    return { error: null, role: readRole(data.user) };
  }, []);

  const signInDemo = useCallback(async (role: Role) => {
    const account = demoAccounts()[role];
    if (account) {
      const { data, error } = await supabase.auth.signInWithPassword(account);
      if (!error && data.user) {
        localStorage.removeItem(DEMO_KEY);
        return { error: null, role: readRole(data.user) ?? role };
      }
    }
    localStorage.setItem(DEMO_KEY, role);
    setUser(demoUser(role));
    return { error: null, role };
  }, []);

  const signUp = useCallback(
    async ({ email, password, role, firstName, lastName }: SignUpInput) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, first_name: firstName.trim(), last_name: lastName.trim() },
        },
      });
      if (error) return { error: error.message, needsConfirmation: false, role: null };
      if (!data.session) return { error: null, needsConfirmation: true, role: null };
      return { error: null, needsConfirmation: false, role: readRole(data.user) ?? role };
    },
    [],
  );

  const updateProfile = useCallback(
    async ({ firstName, lastName }: ProfileNames) => {
      const names: DemoName = { first_name: firstName.trim(), last_name: lastName.trim() };
      if (user && (user.id === DEMO_PROVIDER_ID || user.id === DEMO_PARTICIPANT_ID)) {
        const role = readRole(user);
        const stored = role ? { ...storedDemoNames(), [role]: names } : storedDemoNames();
        try {
          localStorage.setItem(DEMO_NAMES_KEY, JSON.stringify(stored));
        } catch {
          // Demo names stay in memory when storage is unavailable.
        }
        setUser({ ...user, user_metadata: { ...user.user_metadata, ...names } });
        return { error: null };
      }
      const { data, error } = await supabase.auth.updateUser({ data: names });
      if (error) return { error: error.message };
      const fullName = [names.first_name, names.last_name].filter(Boolean).join(' ');
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .update({ full_name: fullName })
          .eq('id', data.user.id);
        if (profileError) return { error: profileError.message };
        setUser(data.user);
      }
      return { error: null };
    },
    [user],
  );

  const signOut = useCallback(async () => {
    localStorage.removeItem(DEMO_KEY);
    localStorage.removeItem(DEMO_NAMES_KEY);
    setUser(null);
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      role: readRole(user),
      loading,
      signIn,
      signInDemo,
      signUp,
      updateProfile,
      signOut,
    }),
    [user, loading, signIn, signInDemo, signUp, updateProfile, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
