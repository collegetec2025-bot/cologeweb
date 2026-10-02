/*
# EFKGOU Quiz & Exam System

1. New Tables
- quizzes: Quizzes and exams linked to a course. Supports time limits, passing scores,
  multiple attempts, and publication status.
- quiz_questions: Individual questions within a quiz. Supports multiple choice,
  true/false, and short answer. Stores options as JSONB and correct answer.
- quiz_attempts: Student attempt records with score, status, and answers as JSONB.
  Tracks start/submit times and pass/fail.

2. Security
- quizzes, quiz_questions: public read (anon + authenticated), writes restricted to instructors/admins.
- quiz_attempts: owner-scoped CRUD — students can create/view their own attempts.
  Instructors/admins can read all attempts for grading.
*/

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  quiz_type text NOT NULL DEFAULT 'quiz' CHECK (quiz_type IN ('quiz','exam','practice')),
  time_limit_minutes integer DEFAULT 0,
  passing_score numeric(5,2) DEFAULT 60,
  max_attempts integer DEFAULT 1,
  published boolean DEFAULT false,
  available_from timestamptz,
  available_until timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quizzes_read_public" ON quizzes;
CREATE POLICY "quizzes_read_public" ON quizzes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "quizzes_write_staff" ON quizzes;
CREATE POLICY "quizzes_write_staff" ON quizzes FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_en text NOT NULL,
  question_fa text NOT NULL,
  question_ps text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice','true_false','short_answer')),
  options jsonb DEFAULT '[]',
  correct_answer text NOT NULL DEFAULT '',
  points numeric(5,2) DEFAULT 1,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_read_public" ON quiz_questions;
CREATE POLICY "questions_read_public" ON quiz_questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "questions_write_staff" ON quiz_questions;
CREATE POLICY "questions_write_staff" ON quiz_questions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  answers jsonb DEFAULT '{}',
  score numeric(5,2) DEFAULT 0,
  max_score numeric(5,2) DEFAULT 100,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','graded')),
  passed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attempts_select_own" ON quiz_attempts;
CREATE POLICY "attempts_select_own" ON quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

DROP POLICY IF EXISTS "attempts_insert_own" ON quiz_attempts;
CREATE POLICY "attempts_insert_own" ON quiz_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "attempts_update_own" ON quiz_attempts;
CREATE POLICY "attempts_update_own" ON quiz_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

DROP POLICY IF EXISTS "attempts_delete_staff" ON quiz_attempts;
CREATE POLICY "attempts_delete_staff" ON quiz_attempts FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON quiz_attempts(quiz_id);
