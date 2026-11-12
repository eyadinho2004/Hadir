import type { Role } from './AuthProvider';

export type DemoAccount = { email: string; password: string };

export type DemoAccounts = Record<Role, DemoAccount | null>;

function readAccount(email: string | undefined, password: string | undefined): DemoAccount | null {
  if (!email || !password) return null;
  return { email, password };
}

export function demoAccounts(): DemoAccounts {
  return {
    provider: readAccount(
      import.meta.env.VITE_DEMO_PROVIDER_EMAIL,
      import.meta.env.VITE_DEMO_PROVIDER_PASSWORD,
    ),
    participant: readAccount(
      import.meta.env.VITE_DEMO_PARTICIPANT_EMAIL,
      import.meta.env.VITE_DEMO_PARTICIPANT_PASSWORD,
    ),
  };
}
