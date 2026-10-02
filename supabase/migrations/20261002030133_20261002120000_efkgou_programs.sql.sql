/*
# EFKGOU Programs Table

1. New Tables
- programs: Degree programs (BS Computer Science, BS IT, etc.) linked to faculties.
  Each program has multilingual name/description, degree level, duration, credits,
  admission requirements, learning outcomes, career opportunities, and an apply link.
  Admins can add/edit programs without code changes.

2. Security
- RLS enabled, public read (anon + authenticated), writes restricted to instructors/admins.
*/

CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid REFERENCES faculties(id) ON DELETE SET NULL,
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_fa text NOT NULL,
  name_ps text NOT NULL,
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  degree_level text NOT NULL DEFAULT 'bachelor' CHECK (degree_level IN ('certificate','diploma','associate','bachelor','master','phd')),
  duration_years numeric(3,1) DEFAULT 4,
  total_credits integer DEFAULT 130,
  admission_requirements_en text DEFAULT '',
  admission_requirements_fa text DEFAULT '',
  admission_requirements_ps text DEFAULT '',
  learning_outcomes_en text DEFAULT '',
  learning_outcomes_fa text DEFAULT '',
  learning_outcomes_ps text DEFAULT '',
  career_opportunities_en text DEFAULT '',
  career_opportunities_fa text DEFAULT '',
  career_opportunities_ps text DEFAULT '',
  thumbnail text DEFAULT '',
  published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "programs_read_public" ON programs;
CREATE POLICY "programs_read_public" ON programs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "programs_write_staff" ON programs;
CREATE POLICY "programs_write_staff" ON programs FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_programs_faculty ON programs(faculty_id);
CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_published ON programs(published);
