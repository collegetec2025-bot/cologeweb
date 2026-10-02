/*
# EFKGOU Online Application System

1. New Tables
- applications: Online admission applications. Tracks full name, father name, date of birth,
  country, contact, email, education background, desired program, previous institution,
  document URLs, photo URL, and application status. Generates a unique application number.
  Admin can review and update status. Notification workflow supported via notifications table.

2. Security
- applications: anyone (anon + authenticated) can submit an application (INSERT).
  Authenticated users can read their own applications (by email match or user_id).
  Admins can read all and update status.
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  father_name text DEFAULT '',
  date_of_birth date,
  country text DEFAULT '',
  phone text DEFAULT '',
  email text NOT NULL,
  education_background text DEFAULT '',
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  program_name text DEFAULT '',
  previous_institution text DEFAULT '',
  document_urls text[] DEFAULT '{}',
  photo_url text DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','approved','rejected','enrolled')),
  admin_notes text DEFAULT '',
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
DROP POLICY IF EXISTS "apps_insert_public" ON applications;
CREATE POLICY "apps_insert_public" ON applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Authenticated users can read their own applications (matched by user_id or email)
DROP POLICY IF EXISTS "apps_select_own" ON applications;
CREATE POLICY "apps_select_own" ON applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can read all applications
DROP POLICY IF EXISTS "apps_select_admin" ON applications;
CREATE POLICY "apps_select_admin" ON applications FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Admins can update application status
DROP POLICY IF EXISTS "apps_update_admin" ON applications;
CREATE POLICY "apps_update_admin" ON applications FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_apps_number ON applications(application_number);
CREATE INDEX IF NOT EXISTS idx_apps_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_apps_program ON applications(program_id);
