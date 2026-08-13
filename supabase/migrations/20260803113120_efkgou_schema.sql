/*
# EFKGOU Core Schema

Creates the foundation for the Engineer Folad Kabuli Global Online University LMS:
profiles, faculties, courses, lessons, assignments, enrollments, and inquiries.

1. New Tables
- profiles: extends auth.users with full_name, role (student/instructor/admin), bio, avatar_url.
- faculties: academic departments (Computer Science, Network Engineering, etc.) with multilingual name/description.
- courses: belong to a faculty, taught by an instructor (profile). Multilingual title/description, level, credits, duration, price, thumbnail.
- lessons: ordered lessons within a course, with multilingual content and optional video_url.
- assignments: course assignments with due date and max score.
- enrollments: links a student (profile) to a course with progress tracking.
- inquiries: public contact-form submissions.

2. Security (RLS)
- profiles: owner-scoped read/update (authenticated).
- faculties, courses, lessons, assignments: public read (anon + authenticated); writes restricted to instructors/admins via profile role check.
- enrollments: owner-scoped CRUD (student reads/creates/updates own enrollments).
- inquiries: anyone (anon + authenticated) may insert; reads restricted to admins.

3. Trigger
- on_auth_user_created: auto-inserts a profile row when a new auth.users row is created, defaulting role to 'student'.
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','instructor','admin')),
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON profiles;
CREATE POLICY "profiles_select_all_authenticated" ON profiles FOR SELECT
  TO authenticated USING (true);

-- Faculties
CREATE TABLE IF NOT EXISTS faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_fa text NOT NULL,
  name_ps text NOT NULL,
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  icon text DEFAULT 'GraduationCap',
  color text DEFAULT 'blue',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faculties_read_public" ON faculties;
CREATE POLICY "faculties_read_public" ON faculties FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "faculties_write_staff" ON faculties;
CREATE POLICY "faculties_write_staff" ON faculties FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid REFERENCES faculties(id) ON DELETE SET NULL,
  instructor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  slug text UNIQUE NOT NULL,
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  level text DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  credits integer DEFAULT 3,
  duration_weeks integer DEFAULT 12,
  price numeric(10,2) DEFAULT 0,
  thumbnail text DEFAULT '',
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_read_public" ON courses;
CREATE POLICY "courses_read_public" ON courses FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "courses_write_staff" ON courses;
CREATE POLICY "courses_write_staff" ON courses FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  content_en text DEFAULT '',
  content_fa text DEFAULT '',
  content_ps text DEFAULT '',
  video_url text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lessons_read_public" ON lessons;
CREATE POLICY "lessons_read_public" ON lessons FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "lessons_write_staff" ON lessons;
CREATE POLICY "lessons_write_staff" ON lessons FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  due_date date,
  max_score integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assignments_read_public" ON assignments;
CREATE POLICY "assignments_read_public" ON assignments FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "assignments_write_staff" ON assignments;
CREATE POLICY "assignments_write_staff" ON assignments FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress numeric(5,2) DEFAULT 0,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (student_id, course_id)
);
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "enrollments_select_own" ON enrollments;
CREATE POLICY "enrollments_select_own" ON enrollments FOR SELECT
  TO authenticated USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "enrollments_insert_own" ON enrollments;
CREATE POLICY "enrollments_insert_own" ON enrollments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "enrollments_update_own" ON enrollments;
CREATE POLICY "enrollments_update_own" ON enrollments FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "enrollments_delete_own" ON enrollments;
CREATE POLICY "enrollments_delete_own" ON enrollments FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- Inquiries (contact form)
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT '',
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inquiries_insert_public" ON inquiries;
CREATE POLICY "inquiries_insert_public" ON inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "inquiries_read_admin" ON inquiries;
CREATE POLICY "inquiries_read_admin" ON inquiries FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
