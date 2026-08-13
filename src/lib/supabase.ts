import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin';
  bio: string;
  avatar_url: string;
  created_at: string;
};

export type Faculty = {
  id: string;
  slug: string;
  name_en: string;
  name_fa: string;
  name_ps: string;
  description_en: string;
  description_fa: string;
  description_ps: string;
  icon: string;
  color: string;
  created_at: string;
};

export type Course = {
  id: string;
  faculty_id: string | null;
  instructor_id: string | null;
  slug: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  description_en: string;
  description_fa: string;
  description_ps: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  credits: number;
  duration_weeks: number;
  price: number;
  thumbnail: string;
  published: boolean;
  created_at: string;
  faculty?: Faculty;
  instructor?: Profile | null;
};

export type Lesson = {
  id: string;
  course_id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  content_en: string;
  content_fa: string;
  content_ps: string;
  video_url: string;
  order_index: number;
  created_at: string;
};

export type Assignment = {
  id: string;
  course_id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  description_en: string;
  description_fa: string;
  description_ps: string;
  due_date: string | null;
  max_score: number;
  created_at: string;
};

export type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  course?: Course;
};

export type NewsEvent = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  content_en: string;
  content_fa: string;
  content_ps: string;
  category: 'news' | 'event' | 'announcement';
  cover_image: string;
  event_date: string | null;
  location: string;
  created_at: string;
};

export type MediaAsset = {
  id: string;
  file_name: string;
  file_type: 'IMG' | 'VID' | 'DOC' | 'NET' | 'COD';
  file_number: number;
  file_url: string;
  thumbnail_url: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  description_en: string;
  category: string;
  created_at: string;
};

export type Department = {
  id: string;
  faculty_id: string | null;
  name_en: string;
  name_fa: string;
  name_ps: string;
  head_instructor_id: string | null;
  created_at: string;
};

export type CalendarEvent = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  event_type: 'semester_start' | 'semester_end' | 'exam' | 'holiday' | 'event' | 'deadline';
  start_date: string;
  end_date: string | null;
  description_en: string;
  description_fa: string;
  description_ps: string;
  created_at: string;
};

export type Syllabus = {
  id: string;
  course_id: string;
  week_number: number;
  topic_en: string;
  topic_fa: string;
  topic_ps: string;
  objectives_en: string;
  objectives_fa: string;
  objectives_ps: string;
  readings: string;
  created_at: string;
};

export type Grade = {
  id: string;
  student_id: string;
  course_id: string;
  assignment_id: string | null;
  score: number;
  max_score: number;
  letter_grade: string;
  feedback_en: string;
  graded_by: string | null;
  created_at: string;
  course?: Course;
  assignment?: Assignment;
};

export type Transcript = {
  id: string;
  student_id: string;
  semester: string;
  cgpa: number;
  total_credits: number;
  status: 'active' | 'archived' | 'deleted';
  issued_at: string;
  deleted_at: string | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  student_id: string;
  amount: number;
  description_en: string;
  description_fa: string;
  description_ps: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  invoice_id: string;
  student_id: string;
  amount: number;
  payment_method: 'card' | 'bank_transfer' | 'cash' | 'scholarship';
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  invoice?: Invoice;
};

export type Scholarship = {
  id: string;
  student_id: string;
  name_en: string;
  name_fa: string;
  name_ps: string;
  amount: number;
  status: 'active' | 'awarded' | 'expired' | 'revoked';
  awarded_at: string;
  created_at: string;
};

export type SupportTicket = {
  id: string;
  ticket_number: string;
  student_id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
};
