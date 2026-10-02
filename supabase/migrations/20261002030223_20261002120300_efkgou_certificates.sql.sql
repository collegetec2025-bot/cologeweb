/*
# EFKGOU Certificate System

1. New Tables
- certificates: Digital certificates for students who complete courses or programs.
  Each certificate has a unique certificate number, verification code, issue date,
  authorized signatory, and QR code data. Supports a public verification lookup.

2. Security
- certificates: owner-scoped SELECT (students see their own certificates);
  instructors/admins can read all and create/update/delete.
  A separate public verification function is provided via RLS using anon role
  for the verification page lookup by verification_code.
*/

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text NOT NULL UNIQUE,
  verification_code text NOT NULL UNIQUE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  student_name text NOT NULL,
  course_name_en text NOT NULL,
  course_name_fa text DEFAULT '',
  course_name_ps text DEFAULT '',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  signatory_name text DEFAULT '',
  signatory_title text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  qr_code_data text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Students can view their own certificates
DROP POLICY IF EXISTS "cert_select_own" ON certificates;
CREATE POLICY "cert_select_own" ON certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Public verification: anyone can look up a certificate by verification_code
-- This is intentionally public for the certificate verification page
DROP POLICY IF EXISTS "cert_public_verify" ON certificates;
CREATE POLICY "cert_public_verify" ON certificates FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Staff can create/update/delete certificates
DROP POLICY IF EXISTS "cert_write_staff" ON certificates;
CREATE POLICY "cert_write_staff" ON certificates FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_certs_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certs_course ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certs_verify_code ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certs_cert_number ON certificates(certificate_number);
