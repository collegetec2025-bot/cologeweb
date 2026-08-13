/*
# News & Events table for EFKGOU

1. New Tables
- news_events: stores university news, events, and announcements with multilingual content, cover images, dates, and categories.
2. Security
- RLS enabled, public read (anon + authenticated), writes restricted to instructors/admins.
*/

CREATE TABLE IF NOT EXISTS news_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  content_en text DEFAULT '',
  content_fa text DEFAULT '',
  content_ps text DEFAULT '',
  category text NOT NULL DEFAULT 'news' CHECK (category IN ('news','event','announcement')),
  cover_image text DEFAULT '',
  event_date date,
  location text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE news_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_read_public" ON news_events;
CREATE POLICY "news_read_public" ON news_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "news_write_staff" ON news_events;
CREATE POLICY "news_write_staff" ON news_events FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_news_events_category ON news_events(category);
CREATE INDEX IF NOT EXISTS idx_news_events_date ON news_events(event_date);
