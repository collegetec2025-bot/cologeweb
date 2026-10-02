/*
# EFKGOU Research Center

1. New Tables
- research_projects: University research projects with title, principal investigator,
  team members, funding, status, abstract, and keywords.
- research_papers: Published/unpublished research papers, journal articles, conference
  papers, theses, dissertations, case studies, and research reports. Each has author,
  abstract, keywords, references, file URL, publication type, and approval workflow status.

2. Security
- Both tables: public read (anon + authenticated), writes restricted to instructors/admins.
*/

CREATE TABLE IF NOT EXISTS research_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  principal_investigator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  team_members text[] DEFAULT '{}',
  funding_source text DEFAULT '',
  budget numeric(12,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','active','completed','suspended','cancelled')),
  abstract_en text DEFAULT '',
  abstract_fa text DEFAULT '',
  abstract_ps text DEFAULT '',
  keywords text[] DEFAULT '{}',
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "research_proj_read_public" ON research_projects;
CREATE POLICY "research_proj_read_public" ON research_projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "research_proj_write_staff" ON research_projects;
CREATE POLICY "research_proj_write_staff" ON research_projects FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE TABLE IF NOT EXISTS research_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_project_id uuid REFERENCES research_projects(id) ON DELETE SET NULL,
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  author text NOT NULL DEFAULT '',
  co_authors text[] DEFAULT '{}',
  paper_type text NOT NULL DEFAULT 'paper' CHECK (paper_type IN ('paper','journal_article','conference','thesis','dissertation','case_study','report')),
  abstract_en text DEFAULT '',
  abstract_fa text DEFAULT '',
  abstract_ps text DEFAULT '',
  keywords text[] DEFAULT '{}',
  reference_list text DEFAULT '',
  file_url text DEFAULT '',
  journal_name text DEFAULT '',
  conference_name text DEFAULT '',
  publication_date date,
  doi text DEFAULT '',
  approval_status text NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft','editor_review','academic_review','approved','published','rejected')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "research_papers_read_public" ON research_papers;
CREATE POLICY "research_papers_read_public" ON research_papers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "research_papers_write_staff" ON research_papers;
CREATE POLICY "research_papers_write_staff" ON research_papers FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_research_proj_pi ON research_projects(principal_investigator_id);
CREATE INDEX IF NOT EXISTS idx_research_proj_status ON research_projects(status);
CREATE INDEX IF NOT EXISTS idx_research_papers_project ON research_papers(research_project_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_type ON research_papers(paper_type);
CREATE INDEX IF NOT EXISTS idx_research_papers_approval ON research_papers(approval_status);
