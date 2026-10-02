/*
# EFKGOU Attendance Tracking

1. New Tables
- attendance: Student attendance records per course per date. Supports
  present, absent, late, and excused statuses. Linked to course and student.

2. Security
- attendance: owner-scoped SELECT (students see their own records);
  instructors/admins can read all and create/update/delete.
*/

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_date date NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','excused')),
  notes text DEFAULT '',
  recorded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, student_id, class_date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_select_own" ON attendance;
CREATE POLICY "attendance_select_own" ON attendance FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

DROP POLICY IF EXISTS "attendance_write_staff" ON attendance;
CREATE POLICY "attendance_write_staff" ON attendance FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(class_date);
