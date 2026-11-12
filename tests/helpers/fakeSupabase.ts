import { vi } from 'vitest';

export type FakeUser = {
  id: string;
  email: string;
  app_metadata: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};
type Listener = (user: FakeUser | null) => void;

const listeners = new Set<Listener>();

export type Row = Record<string, unknown>;

export const tables: Record<string, Row[]> = {
  users: [],
  events: [],
  sessions: [],
  registrations: [],
  attendance_records: [],
};

type QueryResult = { data: unknown; error: { message: string; code?: string } | null };
const defaultsFor = (table: string): Row => {
  if (table === 'events') {
    return { event_code: `EV-TEST${(tables.events?.length ?? 0) + 1}` };
  }
  if (table === 'sessions') {
    return {
      qr_string: `hadir://check-in/test-${(tables.sessions?.length ?? 0) + 1}`,
      status: 'scheduled',
      closes_at: new Date().toISOString(),
    };
  }
  return {};
};

class Query implements PromiseLike<QueryResult> {
  private filters: [string, unknown][] = [];
  private lists: [string, unknown[]][] = [];
  private ordering: { column: string; ascending: boolean } | null = null;
  private mode: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: Row | Row[] | null = null;
  private singleRow = false;

  constructor(private readonly table: string) {}

  select() {
    return this;
  }

  insert(payload: Row | Row[]) {
    this.mode = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
    this.mode = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.mode = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push([column, value]);
    return this;
  }

  in(column: string, values: unknown[]) {
    this.lists.push([column, values]);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.ordering = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit() {
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  maybeSingle() {
    this.singleRow = true;
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }

  private matches(row: Row) {
    return (
      this.filters.every(([column, value]) => row[column] === value) &&
      this.lists.every(([column, values]) => values.includes(row[column]))
    );
  }

  private async run(): Promise<QueryResult> {
    const rows = (tables[this.table] ??= []);
    if (fake.failQuery) {
      return { data: null, error: { message: 'boom', code: '42501' } };
    }

    if (this.mode === 'insert') {
      const input = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      const created = input.map((row, index) => ({
        ...defaultsFor(this.table),
        id: (row.id as string) ?? `row-${rows.length + index + 1}`,
        created_at: new Date().toISOString(),
        ...row,
      }));
      rows.push(...created);
      return { data: this.singleRow ? created[0] : created, error: null };
    }

    if (this.mode === 'update') {
      const updated = rows.filter((row) => this.matches(row));
      updated.forEach((row) => Object.assign(row, this.payload));
      return { data: this.singleRow ? (updated[0] ?? null) : updated, error: null };
    }

    if (this.mode === 'delete') {
      tables[this.table] = rows.filter((row) => !this.matches(row));
      return { data: null, error: null };
    }

    let result = rows.filter((row) => this.matches(row));
    if (this.ordering) {
      const { column, ascending } = this.ordering;
      result = [...result].sort((a, b) => {
        const left = String(a[column] ?? '');
        const right = String(b[column] ?? '');
        return ascending ? left.localeCompare(right) : right.localeCompare(left);
      });
    }
    return { data: this.singleRow ? (result[0] ?? null) : result, error: null };
  }
}

export function from(table: string) {
  return new Query(table);
}

export function seed(table: string, rows: Row[]) {
  tables[table] = rows.map((row) => ({ ...row }));
}

export const fake: {
  user: FakeUser | null;
  signIn: { error: { message: string } | null; user: FakeUser | null };
  signUp: { error: { message: string } | null; session: boolean };
  lastSignUpRole: string | null;
  lastSignUpData: Record<string, unknown> | null;
  lastSignIn: { email: string; password: string } | null;
  failQuery: boolean;
} = {
  user: null,
  signIn: { error: null, user: null },
  signUp: { error: null, session: true },
  lastSignUpRole: null,
  lastSignUpData: null,
  lastSignIn: null,
  failQuery: false,
};

export const supabase = {
  from,
  auth: {
    getSession: vi.fn(async () => ({
      data: { session: fake.user ? { user: fake.user } : null },
    })),
    onAuthStateChange: vi.fn(
      (cb: (event: string, session: { user: FakeUser } | null) => void) => {
        const listener: Listener = (user) => cb('SIGNED_IN', user ? { user } : null);
        listeners.add(listener);
        return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } };
      },
    ),
    signInWithPassword: vi.fn(async (args: { email: string; password: string }) => {
      fake.lastSignIn = { email: args.email, password: args.password };
      if (fake.signIn.error) {
        return { data: { user: null, session: null }, error: fake.signIn.error };
      }
      fake.user = fake.signIn.user;
      listeners.forEach((listener) => listener(fake.user));
      return { data: { user: fake.user, session: { user: fake.user } }, error: null };
    }),
    signUp: vi.fn(
      async (args: { email: string; options?: { data?: Record<string, unknown> } }) => {
        const data = args.options?.data ?? {};
        const role = typeof data.role === 'string' ? data.role : undefined;
        fake.lastSignUpRole = role ?? null;
        fake.lastSignUpData = data;
        if (fake.signUp.error) {
          return { data: { user: null, session: null }, error: fake.signUp.error };
        }
        const user = {
          id: 'new-user',
          email: args.email,
          app_metadata: role ? { role } : {},
          user_metadata: data,
        };
        if (!fake.signUp.session) return { data: { user, session: null }, error: null };
        fake.user = user;
        listeners.forEach((listener) => listener(user));
        return { data: { user, session: { user } }, error: null };
      },
    ),
    updateUser: vi.fn(async (args: { data?: Record<string, unknown> }) => {
      if (!fake.user) return { data: { user: null }, error: { message: 'No user' } };
      fake.user = {
        ...fake.user,
        user_metadata: { ...fake.user.user_metadata, ...args.data },
      };
      listeners.forEach((listener) => listener(fake.user));
      return { data: { user: fake.user }, error: null };
    }),
    signOut: vi.fn(async () => {
      fake.user = null;
      listeners.forEach((listener) => listener(null));
      return { error: null };
    }),
  },
};

export function setUser(user: FakeUser | null) {
  fake.user = user;
}

export function resetFake() {
  fake.user = null;
  fake.signIn = { error: null, user: null };
  fake.signUp = { error: null, session: true };
  fake.lastSignUpRole = null;
  fake.lastSignUpData = null;
  fake.lastSignIn = null;
  fake.failQuery = false;
  Object.keys(tables).forEach((table) => {
    tables[table] = [];
  });
  listeners.clear();
}
