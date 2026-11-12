export type Visibility = 'private' | 'public';
export type SessionMethod = 'face_to_face' | 'online';
export type SessionStatus = 'scheduled' | 'active' | 'closed';
export type AttendanceStatus = 'present' | 'late' | 'absent';

export type EventRow = {
  id: string;
  provider_id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  visibility: Visibility;
  event_code: string;
  capacity: number | null;
  registration_deadline: string | null;
  starts_at: string;
  ends_at: string;
  created_at: string;
};

export type SessionRow = {
  id: string;
  event_id: string | null;
  provider_id: string;
  title: string;
  method: SessionMethod;
  starts_at: string;
  duration_minutes: number;
  allowed_lateness_minutes: number;
  check_in_code: string;
  qr_string: string;
  status: SessionStatus;
  closes_at: string;
};

export type AttendanceRecord = {
  id: string;
  session_id: string;
  participant_id: string;
  status: AttendanceStatus;
  checked_in_at: string;
};

export type RegistrationRow = {
  id: string;
  event_id: string;
  participant_id: string;
  registered_at: string;
};
