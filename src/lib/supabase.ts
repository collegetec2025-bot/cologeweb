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

// ============================================================
// Phase 2 — New Types
// ============================================================

export type Program = {
  id: string;
  faculty_id: string | null;
  slug: string;
  name_en: string;
  name_fa: string;
  name_ps: string;
  description_en: string;
  description_fa: string;
  description_ps: string;
  degree_level: 'certificate' | 'diploma' | 'associate' | 'bachelor' | 'master' | 'phd';
  duration_years: number;
  total_credits: number;
  admission_requirements_en: string;
  admission_requirements_fa: string;
  admission_requirements_ps: string;
  learning_outcomes_en: string;
  learning_outcomes_fa: string;
  learning_outcomes_ps: string;
  career_opportunities_en: string;
  career_opportunities_fa: string;
  career_opportunities_ps: string;
  thumbnail: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  faculty?: Faculty;
};

export type Quiz = {
  id: string;
  course_id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  description_en: string;
  description_fa: string;
  description_ps: string;
  quiz_type: 'quiz' | 'exam' | 'practice';
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
  published: boolean;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_en: string;
  question_fa: string;
  question_ps: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correct_answer: string;
  points: number;
  order_index: number;
  created_at: string;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, string>;
  score: number;
  max_score: number;
  status: 'in_progress' | 'submitted' | 'graded';
  passed: boolean;
  started_at: string;
  submitted_at: string | null;
  created_at: string;
};

export type Attendance = {
  id: string;
  course_id: string;
  student_id: string;
  class_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
  recorded_by: string | null;
  created_at: string;
};

export type Certificate = {
  id: string;
  certificate_number: string;
  verification_code: string;
  student_id: string;
  course_id: string | null;
  program_id: string | null;
  student_name: string;
  course_name_en: string;
  course_name_fa: string;
  course_name_ps: string;
  issue_date: string;
  signatory_name: string;
  signatory_title: string;
  status: 'active' | 'revoked' | 'expired';
  qr_code_data: string;
  created_at: string;
};

export type LibraryCategory = {
  id: string;
  slug: string;
  name_en: string;
  name_fa: string;
  name_ps: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type LibraryItem = {
  id: string;
  category_id: string | null;
  title_en: string;
  title_fa: string;
  title_ps: string;
  author: string;
  subject: string;
  language: 'en' | 'fa' | 'ps';
  publication_year: number | null;
  publisher: string;
  isbn: string;
  tags: string[];
  description_en: string;
  description_fa: string;
  description_ps: string;
  file_url: string;
  cover_image: string;
  item_type: 'textbook' | 'ebook' | 'research_paper' | 'article' | 'journal' | 'thesis' | 'reference' | 'document' | 'video' | 'audio';
  access_level: 'public' | 'student' | 'staff';
  downloadable: boolean;
  page_count: number;
  file_size: number;
  published: boolean;
  created_at: string;
  category?: LibraryCategory;
};

export type LibraryFavorite = {
  id: string;
  user_id: string;
  library_item_id: string;
  created_at: string;
  library_item?: LibraryItem;
};

export type LibraryReadingHistory = {
  id: string;
  user_id: string;
  library_item_id: string;
  last_read_at: string;
  created_at: string;
  library_item?: LibraryItem;
};

export type ResearchProject = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  principal_investigator_id: string | null;
  team_members: string[];
  funding_source: string;
  budget: number;
  status: 'proposed' | 'active' | 'completed' | 'suspended' | 'cancelled';
  abstract_en: string;
  abstract_fa: string;
  abstract_ps: string;
  keywords: string[];
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export type ResearchPaper = {
  id: string;
  research_project_id: string | null;
  title_en: string;
  title_fa: string;
  title_ps: string;
  author: string;
  co_authors: string[];
  paper_type: 'paper' | 'journal_article' | 'conference' | 'thesis' | 'dissertation' | 'case_study' | 'report';
  abstract_en: string;
  abstract_fa: string;
  abstract_ps: string;
  keywords: string[];
  reference_list: string;
  file_url: string;
  journal_name: string;
  conference_name: string;
  publication_date: string | null;
  doi: string;
  approval_status: 'draft' | 'editor_review' | 'academic_review' | 'approved' | 'published' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  published: boolean;
  created_at: string;
};

export type Article = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  author_id: string | null;
  author_name: string;
  category: 'computer_science' | 'information_technology' | 'ai' | 'cyber_security' | 'networking' | 'business' | 'education' | 'english' | 'general_tech' | 'research';
  language: 'en' | 'fa' | 'ps';
  summary_en: string;
  summary_fa: string;
  summary_ps: string;
  content_en: string;
  content_fa: string;
  content_ps: string;
  keywords: string[];
  reference_list: string;
  cover_image: string;
  publication_date: string | null;
  approval_status: 'draft' | 'editor_review' | 'academic_review' | 'approved' | 'published' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  published: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  og_image: string;
  canonical_url: string;
  created_at: string;
};

export type Application = {
  id: string;
  application_number: string;
  user_id: string | null;
  full_name: string;
  father_name: string;
  date_of_birth: string | null;
  country: string;
  phone: string;
  email: string;
  education_background: string;
  program_id: string | null;
  program_name: string;
  previous_institution: string;
  document_urls: string[];
  photo_url: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'enrolled';
  admin_notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  program?: Program;
};

export type Notification = {
  id: string;
  user_id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  message_en: string;
  message_fa: string;
  message_ps: string;
  notification_type: 'general' | 'academic' | 'finance' | 'admission' | 'system' | 'assignment' | 'grade' | 'certificate' | 'event';
  link: string;
  is_read: boolean;
  created_at: string;
};

export type SystemSetting = {
  id: string;
  key: string;
  value: string;
  value_json: Record<string, unknown> | null;
  description: string;
  category: 'general' | 'contact' | 'social' | 'theme' | 'ai' | 'media' | 'seo' | 'academic';
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type HeroSlide = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  subtitle_en: string;
  subtitle_fa: string;
  subtitle_ps: string;
  background_image: string;
  button1_label_en: string;
  button1_label_fa: string;
  button1_label_ps: string;
  button1_link: string;
  button2_label_en: string;
  button2_label_fa: string;
  button2_label_ps: string;
  button2_link: string;
  button3_label_en: string;
  button3_label_fa: string;
  button3_label_ps: string;
  button3_link: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type PresidentMessage = {
  id: string;
  president_name: string;
  president_title_en: string;
  president_title_fa: string;
  president_title_ps: string;
  photo_url: string;
  message_en: string;
  message_fa: string;
  message_ps: string;
  biography_en: string;
  biography_fa: string;
  biography_ps: string;
  is_active: boolean;
  updated_at: string;
  created_at: string;
};

export type GalleryAlbum = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  description_en: string;
  description_fa: string;
  description_ps: string;
  category: 'university' | 'president' | 'faculties' | 'classes' | 'students' | 'teachers' | 'events' | 'research' | 'conferences' | 'activities';
  cover_image: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type GalleryImage = {
  id: string;
  album_id: string | null;
  title_en: string;
  title_fa: string;
  title_ps: string;
  caption_en: string;
  caption_fa: string;
  caption_ps: string;
  image_url: string;
  thumbnail_url: string;
  category: string;
  sort_order: number;
  created_at: string;
};

export type VideoGalleryItem = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  description_en: string;
  description_fa: string;
  description_ps: string;
  video_url: string;
  thumbnail_url: string;
  category: 'courses' | 'lectures' | 'tutorials' | 'university_intro' | 'events' | 'interviews' | 'research' | 'student_activities';
  course_id: string | null;
  lesson_id: string | null;
  instructor_id: string | null;
  language: 'en' | 'fa' | 'ps';
  duration_seconds: number;
  access_level: 'public' | 'student' | 'staff';
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type EmployeeTask = {
  id: string;
  assigned_to: string;
  assigned_by: string | null;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmployeeRequest = {
  id: string;
  request_number: string;
  employee_id: string;
  request_type: 'leave' | 'equipment' | 'document' | 'access' | 'general';
  subject: string;
  description: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string;
  created_at: string;
  updated_at: string;
};

export type EmployeeDocument = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  description_en: string;
  description_fa: string;
  description_ps: string;
  file_url: string;
  document_type: 'handbook' | 'policy' | 'form' | 'template' | 'general';
  access_level: 'public' | 'authenticated' | 'staff';
  sort_order: number;
  created_at: string;
};

export type ContentReview = {
  id: string;
  entity_type: 'article' | 'research_paper' | 'course' | 'lesson' | 'syllabus' | 'quiz' | 'assignment' | 'program' | 'certificate' | 'news_event';
  entity_id: string;
  review_stage: 'draft' | 'ai_generated' | 'editor_review' | 'academic_review' | 'approved' | 'published' | 'rejected';
  reviewer_id: string | null;
  reviewer_name: string;
  review_notes: string;
  reviewed_at: string;
  created_at: string;
};

export type AIContentGeneration = {
  id: string;
  requested_by: string;
  content_type: 'course_outline' | 'syllabus' | 'lesson_plan' | 'lecture_notes' | 'textbook_chapter' | 'article' | 'research_draft' | 'presentation' | 'quiz' | 'exam' | 'answer_key' | 'video_script' | 'summary' | 'translation';
  prompt: string;
  generated_content: string;
  target_language: 'en' | 'fa' | 'ps';
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
};
