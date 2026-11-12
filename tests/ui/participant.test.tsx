import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../helpers/renderApp';
import { fake, resetFake, seed, tables } from '../helpers/fakeSupabase';
import { demoData, DEMO_PARTICIPANT_ID, resetDemoData } from '../../src/demo/demoData';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

beforeEach(() => {
  resetFake();
  resetDemoData();
  localStorage.clear();
  localStorage.clear();
  fake.user = {
    id: 'participant-1',
    email: 'sara@hadir.test',
    app_metadata: { role: 'participant' },
  };
});

function eventRow(overrides: {
  id: string;
  title: string;
  visibility?: 'public' | 'private';
  starts_at?: string;
}) {
  return {
    provider_id: 'provider-1',
    description: 'وصف الفعالية',
    category: 'مؤتمر',
    location: 'الرياض',
    visibility: 'public',
    event_code: '100200',
    capacity: 50,
    registration_deadline: null,
    starts_at: '2026-12-20T09:00:00.000Z',
    ends_at: '2026-12-20T12:00:00.000Z',
    created_at: '2026-11-01T09:00:00.000Z',
    ...overrides,
  };
}

describe('participant dashboard', () => {
  it('shows empty attendance and registration states', async () => {
    renderApp('/participant');
    expect(await screen.findByText('لم تسجّل حضورك في أي جلسة بعد.')).toBeInTheDocument();
    expect(screen.getByText('لم تسجّل في أي فعالية بعد.')).toBeInTheDocument();
  });

  it('counts present and late records in the summary', async () => {
    seed('sessions', [
      { id: 's1', title: 'الجلسة الأولى', starts_at: '2026-12-01T09:00:00.000Z' },
      { id: 's2', title: 'الجلسة الثانية', starts_at: '2026-12-01T11:00:00.000Z' },
      { id: 's3', title: 'الجلسة الثالثة', starts_at: '2026-12-01T13:00:00.000Z' },
    ]);
    seed('attendance_records', [
      {
        id: 'a1',
        session_id: 's1',
        participant_id: 'participant-1',
        status: 'present',
        checked_in_at: '2026-12-01T09:02:00.000Z',
      },
      {
        id: 'a2',
        session_id: 's2',
        participant_id: 'participant-1',
        status: 'late',
        checked_in_at: '2026-12-01T11:30:00.000Z',
      },
    ]);

    renderApp('/participant');

    expect(await screen.findByText('الجلسة الأولى')).toBeInTheDocument();
    expect(screen.getByText('الجلسة الثانية')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
  });
});

describe('participant event discovery', () => {
  it('shows explore and my events in the navigation instead of a single events item', async () => {
    renderApp('/participant');

    const exploreLinks = await screen.findAllByRole('link', { name: 'استكشف الفعاليات' });
    expect(exploreLinks.length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'فعالياتي' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'الفعاليات' })).not.toBeInTheDocument();
  });

  it('lists only published events on the explore page', async () => {
    seed('events', [
      eventRow({ id: 'e-public', title: 'مؤتمر التقنية' }),
      eventRow({ id: 'e-private', title: 'لقاء داخلي', visibility: 'private' }),
    ]);

    renderApp('/participant/explore');

    expect(await screen.findByRole('heading', { name: 'مؤتمر التقنية' })).toBeInTheDocument();
    expect(screen.queryByText('لقاء داخلي')).not.toBeInTheDocument();
  });

  it('lists only registered events on the my events page', async () => {
    seed('events', [
      eventRow({ id: 'e-joined', title: 'ورشة مسجّلة' }),
      eventRow({ id: 'e-open', title: 'ورشة غير مسجّلة' }),
    ]);
    seed('registrations', [
      {
        id: 'r1',
        event_id: 'e-joined',
        participant_id: 'participant-1',
        registered_at: '2026-11-02T09:00:00.000Z',
      },
    ]);

    renderApp('/participant/events');

    expect(await screen.findByText('ورشة مسجّلة')).toBeInTheDocument();
    expect(screen.queryByText('ورشة غير مسجّلة')).not.toBeInTheDocument();
  });

  it('registers for an event from its detail page', async () => {
    seed('events', [eventRow({ id: 'e1', title: 'مؤتمر التقنية' })]);

    renderApp('/participant/events/e1');

    await userEvent.click(await screen.findByRole('button', { name: 'تسجيل' }));

    expect(await screen.findByText('أنت مسجّل في هذه الفعالية.')).toBeInTheDocument();
    expect(tables.registrations).toHaveLength(1);
  });
});

describe('participant check-in by code', () => {
  beforeEach(() => {
    fake.user = null;
    localStorage.setItem('hadir.demo.role', 'participant');
  });

  it('checks in to an active session with its four digit code', async () => {
    const session = demoData.sessions.find((row) => row.id === 'demo-session-2');
    if (session) {
      session.status = 'active';
      session.starts_at = new Date(Date.now() - 5 * 60_000).toISOString();
      session.closes_at = new Date(Date.now() + 60 * 60_000).toISOString();
    }

    renderApp('/participant/sessions');

    await userEvent.type(
      await screen.findByLabelText('رمز الجلسة'),
      '7310',
    );
    await userEvent.click(screen.getByRole('button', { name: 'تسجيل الحضور' }));

    expect(await screen.findByText('تم تسجيل حضورك.')).toBeInTheDocument();
    expect(
      demoData.attendance.some(
        (record) =>
          record.session_id === 'demo-session-2' &&
          record.participant_id === DEMO_PARTICIPANT_ID,
      ),
    ).toBe(true);
  });

  it('reports a code that belongs to no session', async () => {
    renderApp('/participant/sessions');

    await userEvent.type(await screen.findByLabelText('رمز الجلسة'), '0000');
    await userEvent.click(screen.getByRole('button', { name: 'تسجيل الحضور' }));

    expect(
      await screen.findByText('الرمز غير صحيح. تحقق منه وحاول مرة أخرى.'),
    ).toBeInTheDocument();
  });

  it('reports a session that is not open for check-in', async () => {
    renderApp('/participant/sessions');

    await userEvent.type(await screen.findByLabelText('رمز الجلسة'), '2059');
    await userEvent.click(screen.getByRole('button', { name: 'تسجيل الحضور' }));

    expect(
      await screen.findByText('تسجيل الحضور غير مفتوح لهذه الجلسة الآن.'),
    ).toBeInTheDocument();
  });
});
