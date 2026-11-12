/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_DEMO_PROVIDER_EMAIL?: string;
  readonly VITE_DEMO_PROVIDER_PASSWORD?: string;
  readonly VITE_DEMO_PARTICIPANT_EMAIL?: string;
  readonly VITE_DEMO_PARTICIPANT_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
