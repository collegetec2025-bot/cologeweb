/*
# Media Auto-Scanner table for EFKGOU
# Files following naming conventions IMG_001..100, VID_001..100, DOC_001..100, NET_001..100, COD_001..100
# Auto-registration with thumbnail generation, DB indexing, and UI rendering
*/

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('IMG','VID','DOC','NET','COD')),
  file_number integer NOT NULL,
  file_url text DEFAULT '',
  thumbnail_url text DEFAULT '',
  title_en text DEFAULT '',
  title_fa text DEFAULT '',
  title_ps text DEFAULT '',
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  category text DEFAULT 'general',
  file_size bigint DEFAULT 0,
  mime_type text DEFAULT '',
  uploaded_by uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(file_type, file_number)
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_read_public" ON media_assets;
CREATE POLICY "media_read_public" ON media_assets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "media_write_staff" ON media_assets;
CREATE POLICY "media_write_staff" ON media_assets FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_media_type ON media_assets(file_type);
CREATE INDEX IF NOT EXISTS idx_media_category ON media_assets(category);
