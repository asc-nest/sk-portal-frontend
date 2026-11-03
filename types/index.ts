export type OfficialPosition = 'chairperson' | 'kagawad' | 'secretary' | 'treasurer';

export interface SkOfficialProfile {
  id: number;
  user_id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  nickname?: string | null;
  gender: 'male' | 'female' | 'other';
  birthdate?: string | null;
  contact_number?: string | null;
  position: OfficialPosition;
  committee_assigned?: string | null;
  term_start?: string | null;
  term_end?: string | null;
  is_active_term: boolean;
  bio_advocacy?: string | null;
  avatar_path?: string | null;
  avatar_url?: string | null;
  official_id_number?: string | null;
  barangay_name: string;
  purok_sitio?: string | null;
  passed_measures_count?: number;
  session_attendance_rate?: number;
  skmt_compliant?: boolean;
  full_name: string;
  position_title: string;
  measures?: OfficialMeasure[];
  session_attendances?: SessionAttendance[];
  created_at?: string;
  updated_at?: string;
}

export type AuthorshipRole = 'principal_author' | 'co_author' | 'sponsor' | 'co_sponsor';
export type MeasureStatus = 'passed' | 'adopted' | 'enacted' | 'under_review' | 'tabled';
export type SessionAttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export interface OfficialMeasure {
  id: number;
  official_profile_id: number;
  resolution_number?: string | null;
  title: string;
  category: string;
  authorship_role: AuthorshipRole;
  status: MeasureStatus;
  date_approved?: string | null;
  summary?: string | null;
  authorship_label?: string;
  status_badge?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SessionAttendance {
  id: number;
  council_session_id: number;
  official_profile_id: number;
  status: SessionAttendanceStatus;
  remarks?: string | null;
  status_label?: string;
  session_date?: string;
  session_title?: string;
  session_number?: string;
  session_type?: 'regular' | 'special';
  official?: SkOfficialProfile;
  session?: CouncilSession;
}

export interface CouncilSession {
  id: number;
  barangay_name: string;
  session_number: string;
  session_title: string;
  session_type: 'regular' | 'special';
  session_date: string;
  venue?: string | null;
  presided_by?: string | null;
  created_by?: number | null;
  notes?: string | null;
  formatted_type?: string;
  attendance_stats?: {
    total: number;
    present: number;
    absent: number;
    excused: number;
    late: number;
  };
  attendances?: SessionAttendance[];
  recorder?: {
    id: number;
    name: string;
    username: string;
  };
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  mobile_number?: string | null;
  roles: string[];
  permissions?: string[];
  profile?: SkOfficialProfile | null;
}

export interface OfficialInvitation {
  token: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  position: OfficialPosition;
  committee_assigned?: string | null;
  expires_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, any>;
  errors?: Record<string, string[]>;
  error_code?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
