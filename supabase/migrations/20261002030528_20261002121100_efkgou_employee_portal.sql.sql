/*
# EFKGOU Employee Portal & Tasks

1. New Tables
- employee_tasks: Tasks assigned to employees. Supports title, description,
  priority, status, due date, assigned by, and completion tracking.
- employee_requests: Internal requests from employees (leave, equipment,
  document requests, etc.) with approval workflow.
- employee_documents: Internal resource documents for employees (handbooks,
  policies, forms, templates). Access level controlled.

2. Security
- employee_tasks: owner-scoped SELECT (employee sees their own tasks);
  admins/managers can read all and assign tasks.
- employee_requests: owner-scoped SELECT; admins can read all and update status.
- employee_documents: public read for authenticated users; admin-only write.
*/

CREATE TABLE IF NOT EXISTS employee_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employee_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emptasks_select_own" ON employee_tasks;
CREATE POLICY "emptasks_select_own" ON employee_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = assigned_to OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "emptasks_write_admin" ON employee_tasks;
CREATE POLICY "emptasks_write_admin" ON employee_tasks FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "emptasks_update_own" ON employee_tasks;
CREATE POLICY "emptasks_update_own" ON employee_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = assigned_to)
  WITH CHECK (auth.uid() = assigned_to);

CREATE TABLE IF NOT EXISTS employee_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text NOT NULL UNIQUE,
  employee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type text NOT NULL DEFAULT 'general' CHECK (request_type IN ('leave','equipment','document','access','general')),
  subject text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','approved','rejected')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employee_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "empreq_select_own" ON employee_requests;
CREATE POLICY "empreq_select_own" ON employee_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = employee_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "empreq_insert_own" ON employee_requests;
CREATE POLICY "empreq_insert_own" ON employee_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = employee_id);

DROP POLICY IF EXISTS "empreq_update_admin" ON employee_requests;
CREATE POLICY "empreq_update_admin" ON employee_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE TABLE IF NOT EXISTS employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_fa text DEFAULT '',
  title_ps text DEFAULT '',
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  document_type text NOT NULL DEFAULT 'general' CHECK (document_type IN ('handbook','policy','form','template','general')),
  access_level text NOT NULL DEFAULT 'authenticated' CHECK (access_level IN ('public','authenticated','staff')),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "empdocs_read_auth" ON employee_documents;
CREATE POLICY "empdocs_read_auth" ON employee_documents FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "empdocs_write_admin" ON employee_documents;
CREATE POLICY "empdocs_write_admin" ON employee_documents FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_emptasks_assigned ON employee_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_emptasks_status ON employee_tasks(status);
CREATE INDEX IF NOT EXISTS idx_empreq_employee ON employee_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_empreq_status ON employee_requests(status);
CREATE INDEX IF NOT EXISTS idx_empdocs_type ON employee_documents(document_type);
