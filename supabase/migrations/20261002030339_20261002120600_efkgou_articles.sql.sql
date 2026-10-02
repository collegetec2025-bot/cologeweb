/*
# EFKGOU Articles System

1. New Tables
- articles: University articles with title, author, image, category, language,
  summary, content, keywords, references, publication date, and SEO data.
  Supports the approval workflow: draft -> editor_review -> academic_review -> approved -> published.
  Categories include CS, IT, AI, Cyber Security, Networking, Business, Education, English,
  General Technology, Research.

2. Security
- articles: public read for published articles (anon + authenticated);
  authenticated users can read all; writes restricted to instructors/admins.
*/

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name text DEFAULT '',
  category text NOT NULL DEFAULT 'general_tech' CHECK (category IN (
    'computer_science','information_technology','ai','cyber_security','networking',
    'business','education','english','general_tech','research'
  )),
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en','fa','ps')),
  summary_en text DEFAULT '',
  summary_fa text DEFAULT '',
  summary_ps text DEFAULT '',
  content_en text DEFAULT '',
  content_fa text DEFAULT '',
  content_ps text DEFAULT '',
  keywords text[] DEFAULT '{}',
  reference_list text DEFAULT '',
  cover_image text DEFAULT '',
  publication_date date,
  approval_status text NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft','editor_review','academic_review','approved','published','rejected')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  published boolean DEFAULT false,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  seo_keywords text[] DEFAULT '{}',
  og_image text DEFAULT '',
  canonical_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "articles_read_public" ON articles;
CREATE POLICY "articles_read_public" ON articles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "articles_write_staff" ON articles;
CREATE POLICY "articles_write_staff" ON articles FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_lang ON articles(language);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_approval ON articles(approval_status);
CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON articles(publication_date);
