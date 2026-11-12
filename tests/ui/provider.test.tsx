import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../helpers/renderApp';
import { fake, resetFake, seed, tables } from '../helpers/fakeSupabase';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

beforeEach(() => {
  resetFake();
  localStorage.clear();
  fake.user = {
    id: 'provider-1',
    email: 'ahmed@hadir.test',
    app_metadata: { role: 'provider' },
  };
});

const event = {
  id: 'e1',
  provider_id: 'provider-1',
  title: 'فعالية قديمة',
  description: null,
  category: 'ورشة',
  location: null,
  visibility: 'private',
  event_code: 'EV-ABC123',
  capacity: null,
  registration_deadline: null,
  starts_at: '2026-12-01T09:00:00.000Z',
  ends_at: '2026-12-01T12:00:00.000Z',
  created_at: '2026-11-01T09:00:00.000Z',
};

describe('provider events dashboard', () => {
  it('shows an empty state when the provider has no events', async () => {
    renderApp('/provider');
    expect(await screen.findByText('لا توجد فعاليات بعد')).toBeInTheDocument();
  });

  it('marks the new event button with a plus icon', async () => {
    renderApp('/provider');

    const button = await screen.findByRole('button', { name: 'فعالية جديدة' });

    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('marks the new session button with a plus icon', async () => {
    seed('events', [richEvent]);
    renderApp('/provider/sessions');

    const button = await screen.findByRole('button', { name: 'جلسة جديدة' });

    expect(button.querySelector('svg')).not.toBeNull();
  });


  it('creates an event and lists it with its code', async () => {
    renderApp('/provider');
    await userEvent.click(await screen.findByRole('button', { name: 'فعالية جديدة' }));
    await userEvent.type(screen.getByLabelText('عنوان الفعالية'), 'ورشة تصميم الخدمات');
    await userEvent.clear(screen.getByLabelText('تاريخ البداية'));
    await userEvent.type(screen.getByLabelText('تاريخ البداية'), '2026-12-01T09:00');
    await userEvent.clear(screen.getByLabelText('تاريخ النهاية'));
    await userEvent.type(screen.getByLabelText('تاريخ النهاية'), '2026-12-01T12:00');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الفعالية' }));

    expect(await screen.findByText('ورشة تصميم الخدمات')).toBeInTheDocument();
    expect(screen.getByText(/EV-/)).toBeInTheDocument();
    expect(tables.events).toHaveLength(1);
  });

  it('saves the event type picked from the category cards', async () => {
    renderApp('/provider');
    await userEvent.click(await screen.findByRole('button', { name: 'فعالية جديدة' }));
    await userEvent.type(screen.getByLabelText('عنوان الفعالية'), 'مؤتمر الحضور');
    await userEvent.click(screen.getByRole('radio', { name: 'مؤتمر' }));
    await userEvent.clear(screen.getByLabelText('تاريخ البداية'));
    await userEvent.type(screen.getByLabelText('تاريخ البداية'), '2026-12-01T09:00');
    await userEvent.clear(screen.getByLabelText('تاريخ النهاية'));
    await userEvent.type(screen.getByLabelText('تاريخ النهاية'), '2026-12-01T12:00');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الفعالية' }));

    await waitFor(() => expect(tables.events).toHaveLength(1));
    expect(tables.events?.[0]?.category).toBe('مؤتمر');
  });

  it('rejects a title shorter than three characters without saving', async () => {
    renderApp('/provider');
    await userEvent.click(await screen.findByRole('button', { name: 'فعالية جديدة' }));
    await userEvent.type(screen.getByLabelText('عنوان الفعالية'), 'ور');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الفعالية' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('أدخل عنوانًا من ٣ أحرف على الأقل.');
    expect(tables.events).toHaveLength(0);
  });

  it('deletes an event after the second confirming click', async () => {
    seed('events', [event]);
    renderApp('/provider');
    await userEvent.click(await screen.findByRole('button', { name: 'حذف' }));
    await userEvent.click(screen.getByRole('button', { name: 'تأكيد الحذف' }));

    await waitFor(() => expect(tables.events).toHaveLength(0));
    expect(await screen.findByText('لا توجد فعاليات بعد')).toBeInTheDocument();
  });

  it('opens the event details when any part of the card is clicked', async () => {
    seed('events', [event]);
    renderApp('/provider');
    await userEvent.click(await screen.findByRole('link', { name: 'فعالية قديمة — التفاصيل' }));

    expect(await screen.findByRole('heading', { name: 'فعالية قديمة' })).toBeInTheDocument();
  });

  it('adds a session inside an event', async () => {
    seed('events', [event]);
    renderApp('/provider/events/e1');
    expect(await screen.findByRole('heading', { name: 'فعالية قديمة' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'جلسة جديدة' }));
    await userEvent.type(screen.getByLabelText('عنوان الجلسة'), 'ورشة أولى');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الجلسة' }));

    expect(await screen.findByText('ورشة أولى')).toBeInTheDocument();
    expect(tables.sessions).toHaveLength(1);
  });
});

const richEvent = {
  ...event,
  description: 'ورشة تطبيقية على رحلة المستخدم.',
  location: 'قاعة التدريب',
  capacity: 30,
};

const session = {
  id: 's1',
  event_id: 'e1',
  provider_id: 'provider-1',
  title: 'ورشة أولى',
  method: 'face_to_face',
  starts_at: '2026-12-01T09:00:00.000Z',
  duration_minutes: 60,
  allowed_lateness_minutes: 15,
  qr_string: 'hadir://check-in/s1',
  check_in_code: '4821',
  status: 'scheduled',
  closes_at: '2026-12-01T10:00:00.000Z',
};

describe('provider event details', () => {
  it('shows the event information and its registrants', async () => {
    seed('events', [richEvent]);
    seed('users', [
      { id: 'p1', full_name: 'سارة العتيبي', email: 'sara@hadir.test', role: 'participant' },
    ]);
    seed('registrations', [
      {
        id: 'r1',
        event_id: 'e1',
        participant_id: 'p1',
        registered_at: '2026-11-02T09:00:00.000Z',
      },
    ]);
    renderApp('/provider/events/e1');

    expect(await screen.findByText('ورشة تطبيقية على رحلة المستخدم.')).toBeInTheDocument();
    expect(screen.getByText('قاعة التدريب')).toBeInTheDocument();
    expect(await screen.findByText('سارة العتيبي')).toBeInTheDocument();
  });

  it('updates the event when the edit form is saved', async () => {
    seed('events', [richEvent]);
    renderApp('/provider/events/e1');
    await userEvent.click(await screen.findByRole('button', { name: 'تعديل الفعالية' }));
    const title = screen.getByLabelText('عنوان الفعالية');
    await userEvent.clear(title);
    await userEvent.type(title, 'فعالية محدثة');
    const location = screen.getByLabelText('المكان');
    await userEvent.clear(location);
    await userEvent.type(location, 'قاعة جديدة');
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التعديلات' }));

    await waitFor(() => expect(tables.events?.[0]?.title).toBe('فعالية محدثة'));
    expect(tables.events?.[0]?.location).toBe('قاعة جديدة');
    expect(await screen.findByRole('heading', { name: 'فعالية محدثة' })).toBeInTheDocument();
  });

  it('updates a session when its edit form is saved', async () => {
    seed('events', [richEvent]);
    seed('sessions', [session]);
    renderApp('/provider/events/e1');
    await userEvent.click(await screen.findByRole('button', { name: 'تعديل' }));
    const title = screen.getByLabelText('عنوان الجلسة');
    await userEvent.clear(title);
    await userEvent.type(title, 'ورشة محدثة');
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التعديلات' }));

    await waitFor(() => expect(tables.sessions?.[0]?.title).toBe('ورشة محدثة'));
    expect(await screen.findByText('ورشة محدثة')).toBeInTheDocument();
  });

  it('lists the attendance of a session', async () => {
    seed('events', [richEvent]);
    seed('sessions', [session]);
    seed('users', [
      { id: 'p1', full_name: 'خالد الحربي', email: 'khaled@hadir.test', role: 'participant' },
    ]);
    seed('attendance_records', [
      {
        id: 'a1',
        session_id: 's1',
        participant_id: 'p1',
        status: 'late',
        checked_in_at: '2026-12-01T09:20:00.000Z',
      },
    ]);
    renderApp('/provider/events/e1');
    await userEvent.click(await screen.findByRole('button', { name: /^الحضور/ }));

    expect(await screen.findByText('خالد الحربي')).toBeInTheDocument();
    expect(screen.getByText('متأخر')).toBeInTheDocument();
  });

  it('exports the event registrants as CSV', async () => {
    seed('events', [richEvent]);
    seed('users', [
      { id: 'p1', full_name: 'سارة العتيبي', email: 'sara@hadir.test', role: 'participant' },
    ]);
    seed('registrations', [
      {
        id: 'r1',
        event_id: 'e1',
        participant_id: 'p1',
        registered_at: '2026-11-02T09:00:00.000Z',
      },
    ]);

    const createObjectURL = vi.fn((_blob: Blob) => 'blob:registrants');
    const revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    Object.assign(URL, { createObjectURL, revokeObjectURL });

    try {
      renderApp('/provider/events/e1');
      await userEvent.click(
        await screen.findByRole('button', { name: 'تصدير المسجلين إلى ملف CSV' }),
      );

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      const blob = createObjectURL.mock.calls[0]![0];
      const contents = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsText(blob);
      });
      expect(contents).toContain('سارة العتيبي');
      expect(click).toHaveBeenCalled();
    } finally {
      Object.assign(URL, { createObjectURL: originalCreate, revokeObjectURL: originalRevoke });
      click.mockRestore();
    }
  });

  it('disables the registrants export when there is no one registered', async () => {
    seed('events', [richEvent]);
    renderApp('/provider/events/e1');

    expect(
      await screen.findByRole('button', { name: 'تصدير المسجلين إلى ملف CSV' }),
    ).toBeDisabled();
  });

  it('gives every session control the same shape and an expanded state', async () => {
    seed('events', [richEvent]);
    seed('sessions', [session]);
    seed('users', [
      { id: 'p1', full_name: 'خالد الحربي', email: 'khaled@hadir.test', role: 'participant' },
    ]);
    seed('attendance_records', [
      {
        id: 'a1',
        session_id: 's1',
        participant_id: 'p1',
        status: 'present',
        checked_in_at: '2026-12-01T09:00:00.000Z',
      },
    ]);
    renderApp('/provider/events/e1');

    const edit = await screen.findByRole('button', { name: 'تعديل' });
    const attendance = screen.getByRole('button', { name: /^الحضور/ });
    const open = screen.getByRole('link', { name: 'فتح الجلسة' });

    for (const control of [edit, attendance, open]) {
      expect(control.className).toContain('btn');
    }
    expect(edit.className).toContain('btn-outline');
    expect(attendance.className).toContain('btn-outline');
    expect(open.className).toContain('btn-primary');
    expect(attendance).toHaveAccessibleName('الحضور 1');
    expect(edit).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(attendance);

    expect(attendance).toHaveAttribute('aria-expanded', 'true');
    expect(attendance).toHaveAttribute('aria-controls', 'session-attendance-s1');
    expect(document.getElementById('session-attendance-s1')).toContainElement(
      screen.getByText('خالد الحربي'),
    );
  });

  it('stacks the session controls on mobile with the primary action first', async () => {
    seed('events', [richEvent]);
    seed('sessions', [session]);
    renderApp('/provider/events/e1');

    const open = await screen.findByRole('link', { name: 'فتح الجلسة' });
    const actions = open.parentElement;

    expect(actions?.className).toContain('grid-cols-2');
    expect(actions?.className).toContain('w-full');
    expect(open.className).toContain('col-span-2');
    expect(actions?.firstElementChild).toBe(open);
    expect(
      within(actions as HTMLElement)
        .getAllByRole('button')
        .map((control) => control.textContent?.replace(/\s+/g, '')),
    ).toEqual(['تعديل', 'الحضور0']);
  });

  it('shows the check-in code and barcode for a session', async () => {
    seed('events', [richEvent]);
    seed('sessions', [session]);

    renderApp('/provider/sessions/s1');

    expect(await screen.findByText('4821')).toBeInTheDocument();
    expect(screen.getByLabelText('باركود تسجيل الحضور')).toBeInTheDocument();
  });
  });

  it('opens the event edit form from the event card', async () => {
    seed('events', [richEvent]);
    renderApp('/provider');
    await userEvent.click(await screen.findByRole('link', { name: 'تعديل' }));

    expect(await screen.findByLabelText('عنوان الفعالية')).toBeInTheDocument();
  });

  it('deletes the event from its details page and returns to the dashboard', async () => {
    seed('events', [richEvent]);
    renderApp('/provider/events/e1');
    await userEvent.click(await screen.findByRole('button', { name: 'حذف' }));
    await userEvent.click(screen.getByRole('button', { name: 'تأكيد الحذف' }));

    expect(await screen.findByText('لا توجد فعاليات بعد')).toBeInTheDocument();
    expect(tables.events).toHaveLength(0);
  });

describe('provider sessions page', () => {
  it('creates a session linked to an existing event', async () => {
    seed('events', [richEvent]);
    renderApp('/provider/sessions');

    await userEvent.click(await screen.findByRole('button', { name: 'جلسة جديدة' }));
    await userEvent.selectOptions(screen.getByLabelText('الفعالية'), 'e1');
    await userEvent.type(screen.getByLabelText('عنوان الجلسة'), 'ورشة عبر الجلسات');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الجلسة' }));

    await waitFor(() => expect(tables.sessions).toHaveLength(1));
    expect(tables.sessions?.[0]?.event_id).toBe('e1');
    expect(await screen.findByText('ورشة عبر الجلسات')).toBeInTheDocument();
    expect(screen.getByText(/فعالية قديمة/)).toBeInTheDocument();
  });

  it('refuses to create a session without an event', async () => {
    seed('events', [richEvent]);
    renderApp('/provider/sessions');

    await userEvent.click(await screen.findByRole('button', { name: 'جلسة جديدة' }));
    await userEvent.type(screen.getByLabelText('عنوان الجلسة'), 'ورشة بلا فعالية');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الجلسة' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('اختر فعالية لهذه الجلسة.');
    expect(tables.sessions).toHaveLength(0);
  });

  it('points to event creation when the provider has no events', async () => {
    renderApp('/provider/sessions');

    expect(await screen.findByText('أنشئ فعالية أولًا ثم أضف جلساتها.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'جلسة جديدة' })).not.toBeInTheDocument();
  });
});
