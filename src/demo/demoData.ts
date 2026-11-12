import type {
  AttendanceRecord,
  AttendanceStatus,
  EventRow,
  RegistrationRow,
  SessionRow,
} from '../lib/types';

export const DEMO_PROVIDER_ID = 'demo-provider';
export const DEMO_PARTICIPANT_ID = 'demo-participant';

export function isDemoUser(id: string | null | undefined): boolean {
  return id === DEMO_PROVIDER_ID || id === DEMO_PARTICIPANT_ID;
}

function at(dayOffset: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export type DemoData = {
  events: EventRow[];
  sessions: SessionRow[];
  attendance: AttendanceRecord[];
  registrations: RegistrationRow[];
  names: Record<string, string>;
};

function seed(): DemoData {
  const created = at(-7, 10);

  const events: EventRow[] = [
    {
      id: 'demo-event-1',
      provider_id: DEMO_PROVIDER_ID,
      title: 'ورشة تصميم الخدمات',
      description: 'ورشة تطبيقية على بناء رحلة المستخدم وتحسين نقاط التلامس.',
      category: 'ورشة',
      location: 'قاعة التدريب — الرياض',
      visibility: 'private',
      event_code: '884210',
      capacity: 30,
      registration_deadline: at(0, 8),
      starts_at: at(0, 9),
      ends_at: at(0, 12),
      created_at: created,
    },
    {
      id: 'demo-event-2',
      provider_id: DEMO_PROVIDER_ID,
      title: 'لقاء المنتج الشهري',
      description: 'مراجعة خارطة الطريق وملاحظات المشاركين.',
      category: 'لقاء',
      location: null,
      visibility: 'public',
      event_code: '551903',
      capacity: 100,
      registration_deadline: null,
      starts_at: at(3, 18),
      ends_at: at(3, 20),
      created_at: created,
    },
  ];

  const sessions: SessionRow[] = [
    {
      id: 'demo-session-1',
      event_id: 'demo-event-1',
      provider_id: DEMO_PROVIDER_ID,
      title: 'الجلسة الافتتاحية',
      method: 'face_to_face',
      starts_at: at(0, 9),
      duration_minutes: 90,
      allowed_lateness_minutes: 15,
      check_in_code: '4821',
      qr_string: 'HADIR:JOIN:4821',
      status: 'active',
      closes_at: at(0, 10, 30),
    },
    {
      id: 'demo-session-2',
      event_id: 'demo-event-1',
      provider_id: DEMO_PROVIDER_ID,
      title: 'ورشة المجموعات',
      method: 'face_to_face',
      starts_at: at(0, 11),
      duration_minutes: 60,
      allowed_lateness_minutes: 10,
      check_in_code: '7310',
      qr_string: 'HADIR:JOIN:7310',
      status: 'scheduled',
      closes_at: at(0, 12),
    },
    {
      id: 'demo-session-3',
      event_id: 'demo-event-2',
      provider_id: DEMO_PROVIDER_ID,
      title: 'عرض خارطة الطريق',
      method: 'online',
      starts_at: at(3, 18, 30),
      duration_minutes: 45,
      allowed_lateness_minutes: 15,
      check_in_code: '2059',
      qr_string: 'HADIR:JOIN:2059',
      status: 'scheduled',
      closes_at: at(3, 19, 15),
    },
  ];

  const attendance: AttendanceRecord[] = [
    {
      id: 'demo-attendance-1',
      session_id: 'demo-session-1',
      participant_id: DEMO_PARTICIPANT_ID,
      status: 'present',
      checked_in_at: at(0, 9, 3),
    },
    {
      id: 'demo-attendance-2',
      session_id: 'demo-session-1',
      participant_id: 'demo-peer-1',
      status: 'present',
      checked_in_at: at(0, 9, 6),
    },
    {
      id: 'demo-attendance-3',
      session_id: 'demo-session-1',
      participant_id: 'demo-peer-2',
      status: 'late',
      checked_in_at: at(0, 9, 21),
    },
  ];

  const registrations: RegistrationRow[] = [
    {
      id: 'demo-registration-1',
      event_id: 'demo-event-1',
      participant_id: DEMO_PARTICIPANT_ID,
      registered_at: at(-4, 13),
    },
  ];

  return {
    events,
    sessions,
    attendance,
    registrations,
    names: {
      [DEMO_PARTICIPANT_ID]: 'محمد العتيبي',
      'demo-peer-1': 'خالد الحربي',
      'demo-peer-2': 'سلطان القحطاني',
    },
  };
}

export const demoData: DemoData = seed();

export function resetDemoData() {
  Object.assign(demoData, seed());
}

export function demoAttendanceFor(sessionId: string): AttendanceRecord[] {
  return demoData.attendance
    .filter((record) => record.session_id === sessionId)
    .sort((left, right) => left.checked_in_at.localeCompare(right.checked_in_at));
}

export function demoNameFor(participantId: string): string {
  return demoData.names[participantId] ?? '';
}

export function demoStatusFor(participantId: string): AttendanceStatus | null {
  return (
    demoData.attendance.find((record) => record.participant_id === participantId)?.status ?? null
  );
}
