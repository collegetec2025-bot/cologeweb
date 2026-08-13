/*
# EFKGOU Enterprise Core Tables — V3.0
# UUID primary keys, soft deletes on student records, RLS on all tables
*/

-- Departments (linked to faculties)
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid REFERENCES faculties(id) ON DELETE SET NULL,
  name_en text NOT NULL,
  name_fa text NOT NULL,
  name_ps text NOT NULL,
  head_instructor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dept_read_public" ON departments;
CREATE POLICY "dept_read_public" ON departments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "dept_write_staff" ON departments;
CREATE POLICY "dept_write_staff" ON departments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Academic Calendar
CREATE TABLE IF NOT EXISTS academic_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  event_type text NOT NULL DEFAULT 'event' CHECK (event_type IN ('semester_start','semester_end','exam','holiday','event','deadline')),
  start_date date NOT NULL,
  end_date date,
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cal_read_public" ON academic_calendar;
CREATE POLICY "cal_read_public" ON academic_calendar FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "cal_write_staff" ON academic_calendar;
CREATE POLICY "cal_write_staff" ON academic_calendar FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Course Syllabi
CREATE TABLE IF NOT EXISTS syllabi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL,
  topic_en text NOT NULL,
  topic_fa text NOT NULL,
  topic_ps text NOT NULL,
  objectives_en text DEFAULT '',
  objectives_fa text DEFAULT '',
  objectives_ps text DEFAULT '',
  readings text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, week_number)
);
ALTER TABLE syllabi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "syll_read_public" ON syllabi;
CREATE POLICY "syll_read_public" ON syllabi FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "syll_write_staff" ON syllabi;
CREATE POLICY "syll_write_staff" ON syllabi FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Grades (Gradebook)
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  assignment_id uuid REFERENCES assignments(id) ON DELETE SET NULL,
  score numeric NOT NULL DEFAULT 0,
  max_score numeric NOT NULL DEFAULT 100,
  letter_grade text DEFAULT '',
  feedback_en text DEFAULT '',
  graded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "grades_read_own" ON grades;
CREATE POLICY "grades_read_own" ON grades FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));
DROP POLICY IF EXISTS "grades_write_staff" ON grades;
CREATE POLICY "grades_write_staff" ON grades FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Transcripts (soft delete)
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  semester text NOT NULL,
  cgpa numeric(3,2) NOT NULL DEFAULT 0,
  total_credits integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','deleted')),
  issued_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trans_read_own" ON transcripts;
CREATE POLICY "trans_read_own" ON transcripts FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));
DROP POLICY IF EXISTS "trans_write_staff" ON transcripts;
CREATE POLICY "trans_write_staff" ON transcripts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  due_date date,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inv_read_own" ON invoices;
CREATE POLICY "inv_read_own" ON invoices FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));
DROP POLICY IF EXISTS "inv_write_staff" ON invoices;
CREATE POLICY "inv_write_staff" ON invoices FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'card' CHECK (payment_method IN ('card','bank_transfer','cash','scholarship')),
  transaction_id text DEFAULT '',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','refunded')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pay_read_own" ON payments;
CREATE POLICY "pay_read_own" ON payments FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));
DROP POLICY IF EXISTS "pay_write_staff" ON payments;
CREATE POLICY "pay_write_staff" ON payments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Scholarships
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name_en text NOT NULL,
  name_fa text NOT NULL,
  name_ps text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','awarded','expired','revoked')),
  awarded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sch_read_own" ON scholarships;
CREATE POLICY "sch_read_own" ON scholarships FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));
DROP POLICY IF EXISTS "sch_write_staff" ON scholarships;
CREATE POLICY "sch_write_staff" ON scholarships FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tkt_read_own" ON support_tickets;
CREATE POLICY "tkt_read_own" ON support_tickets FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));
DROP POLICY IF EXISTS "tkt_write_own" ON support_tickets;
CREATE POLICY "tkt_write_own" ON support_tickets FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "tkt_write_staff" ON support_tickets;
CREATE POLICY "tkt_write_staff" ON support_tickets FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT '',
  entity_id text DEFAULT '',
  old_values jsonb,
  new_values jsonb,
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_read_admin" ON audit_logs;
CREATE POLICY "audit_read_admin" ON audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "audit_write_all" ON audit_logs;
CREATE POLICY "audit_write_all" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course ON grades(course_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tickets_student ON support_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_student ON transcripts(student_id);
CREATE INDEX IF NOT EXISTS idx_syllabi_course ON syllabi(course_id);
