/*
# EFKGOU Content Approval Workflow & AI Content Generation

1. New Tables
- content_reviews: Generic content approval workflow tracking. Links to any
  content entity (articles, research papers, course content, syllabi, etc.)
  via entity_type + entity_id. Tracks the full workflow:
  draft -> ai_generated -> editor_review -> academic_review -> approved -> published.
  Each stage records the reviewer, review date, and review notes.
- ai_content_generations: Tracks AI-generated content requests made by admins.
  Records the content type (course outline, syllabus, lesson plan, quiz, exam,
  article, presentation, summary, translation), the prompt, the generated output,
  the requesting user, and the review status before publication.

2. Security
- content_reviews: authenticated read for own reviews; admin/instructor read all;
  admin/instructor write.
- ai_content_generations: admin/instructor read all and write.
*/

CREATE TABLE IF NOT EXISTS content_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('article','research_paper','course','lesson','syllabus','quiz','assignment','program','certificate','news_event')),
  entity_id uuid NOT NULL,
  review_stage text NOT NULL DEFAULT 'draft' CHECK (review_stage IN ('draft','ai_generated','editor_review','academic_review','approved','published','rejected')),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_name text DEFAULT '',
  review_notes text DEFAULT '',
  reviewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_read_staff" ON content_reviews;
CREATE POLICY "reviews_read_staff" ON content_reviews FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

DROP POLICY IF EXISTS "reviews_write_staff" ON content_reviews;
CREATE POLICY "reviews_write_staff" ON content_reviews FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE TABLE IF NOT EXISTS ai_content_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN (
    'course_outline','syllabus','lesson_plan','lecture_notes','textbook_chapter',
    'article','research_draft','presentation','quiz','exam','answer_key',
    'video_script','summary','translation'
  )),
  prompt text NOT NULL DEFAULT '',
  generated_content text DEFAULT '',
  target_language text DEFAULT 'en' CHECK (target_language IN ('en','fa','ps')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','approved','published','rejected')),
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_content_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aigen_read_staff" ON ai_content_generations;
CREATE POLICY "aigen_read_staff" ON ai_content_generations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

DROP POLICY IF EXISTS "aigen_write_staff" ON ai_content_generations;
CREATE POLICY "aigen_write_staff" ON ai_content_generations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_reviews_entity ON content_reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_stage ON content_reviews(review_stage);
CREATE INDEX IF NOT EXISTS idx_aigen_type ON ai_content_generations(content_type);
CREATE INDEX IF NOT EXISTS idx_aigen_status ON ai_content_generations(status);
CREATE INDEX IF NOT EXISTS idx_aigen_requested_by ON ai_content_generations(requested_by);
