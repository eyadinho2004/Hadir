# Demo accounts

The sign-in and sign-up pages both show two demo buttons: **Demo sign in as provider** and
**Demo sign in as participant**.

They work in two modes:

1. **Real Supabase accounts** — when the credentials below are set in `.env`, the button signs in
   with that account and the app reads the real project data.
2. **Local demo** — when the credentials are missing, or the sign-in fails, the button opens a
   local demo session with built-in sample events, sessions and attendance
   (`src/demo/demoData.ts`). Nothing is written to Supabase and the demo role is remembered in
   `localStorage` until sign-out.

The local demo signs in as **عبدالله القحطاني** (provider) and **محمد العتيبي** (participant);
editing the name on the profile page is kept in `localStorage` per role.

```
VITE_DEMO_PROVIDER_EMAIL=demo-provider@example.com
VITE_DEMO_PROVIDER_PASSWORD=...
VITE_DEMO_PARTICIPANT_EMAIL=demo-participant@example.com
VITE_DEMO_PARTICIPANT_PASSWORD=...
```

## Creating the real demo accounts

1. In the Supabase dashboard, open **Authentication → Users → Add user**.
2. Create the provider account with email and password, and set **User Metadata**
   `{"role": "provider", "full_name": "..."}`.
3. Create the participant account the same way with `{"role": "participant"}`.
4. If email confirmation is on, confirm both users from the dashboard.
5. Put the two pairs of credentials into `.env` and restart `npm run dev`.

The role is copied into `app_metadata` by the `set_user_role` trigger in
`supabase/migrations/0002_role_and_rls.sql`, and the profile row is created by
`handle_new_user`.

These credentials ship in the client bundle. Use demo accounts on a throwaway project with
sample data only, never on a project holding real registrations.
