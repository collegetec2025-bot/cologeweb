/*
# EFKGOU System Settings & CMS Configuration

1. New Tables
- system_settings: Key-value store for university-wide configuration.
  Stores university name, logo, WhatsApp number, email, social media links,
  president info, theme settings, AI settings, media settings, etc.
  Admin-managed. No code changes needed to update settings.
- hero_slides: CMS-managed homepage hero carousel slides. Each slide has
  multilingual title/subtitle, background image, buttons with links,
  order, and active status. Admin can add/edit/delete/reorder slides.
- president_message: CMS-managed president/founder message section.
  Stores photograph, name, title, message, and biography. Multilingual.

2. Security
- system_settings: public read (anon + authenticated), admin-only write.
- hero_slides: public read, admin-only write.
- president_message: public read, admin-only write.
*/

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text DEFAULT '',
  value_json jsonb,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general','contact','social','theme','ai','media','seo','academic')),
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_read_public" ON system_settings;
CREATE POLICY "settings_read_public" ON system_settings FOR SELECT
  TO anon, authenticated USING (is_public = true);

DROP POLICY IF EXISTS "settings_read_admin" ON system_settings;
CREATE POLICY "settings_read_admin" ON system_settings FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "settings_write_admin" ON system_settings;
CREATE POLICY "settings_write_admin" ON system_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_fa text DEFAULT '',
  title_ps text DEFAULT '',
  subtitle_en text DEFAULT '',
  subtitle_fa text DEFAULT '',
  subtitle_ps text DEFAULT '',
  background_image text DEFAULT '',
  button1_label_en text DEFAULT 'Apply Now',
  button1_label_fa text DEFAULT '',
  button1_label_ps text DEFAULT '',
  button1_link text DEFAULT 'signup',
  button2_label_en text DEFAULT 'Explore Programs',
  button2_label_fa text DEFAULT '',
  button2_label_ps text DEFAULT '',
  button2_link text DEFAULT 'programs',
  button3_label_en text DEFAULT '',
  button3_label_fa text DEFAULT '',
  button3_label_ps text DEFAULT '',
  button3_link text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hero_read_public" ON hero_slides;
CREATE POLICY "hero_read_public" ON hero_slides FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "hero_write_admin" ON hero_slides;
CREATE POLICY "hero_write_admin" ON hero_slides FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE TABLE IF NOT EXISTS president_message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  president_name text NOT NULL DEFAULT '',
  president_title_en text DEFAULT '',
  president_title_fa text DEFAULT '',
  president_title_ps text DEFAULT '',
  photo_url text DEFAULT '',
  message_en text DEFAULT '',
  message_fa text DEFAULT '',
  message_ps text DEFAULT '',
  biography_en text DEFAULT '',
  biography_fa text DEFAULT '',
  biography_ps text DEFAULT '',
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE president_message ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "president_read_public" ON president_message;
CREATE POLICY "president_read_public" ON president_message FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "president_write_admin" ON president_message;
CREATE POLICY "president_write_admin" ON president_message FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_hero_active ON hero_slides(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_order ON hero_slides(sort_order);
