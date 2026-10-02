/*
# EFKGOU Gallery & Video Gallery

1. New Tables
- gallery_albums: Photo gallery albums with categories (University, President, Faculties,
  Classes, Students, Teachers, Events, Research, Conferences, Activities). Multilingual.
- gallery_images: Individual images within albums. Supports captions, categories, search,
  and sort order. Lightbox-ready.
- video_gallery: Video gallery with thumbnails, categories (Courses, Lectures, Tutorials,
  University Introduction, Events, Interviews, Research, Student Activities), instructor,
  language, duration, and access level.

2. Security
- All three tables: public read (anon + authenticated), writes restricted to instructors/admins.
*/

CREATE TABLE IF NOT EXISTS gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  category text NOT NULL DEFAULT 'university' CHECK (category IN (
    'university','president','faculties','classes','students','teachers',
    'events','research','conferences','activities'
  )),
  cover_image text DEFAULT '',
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "galbums_read_public" ON gallery_albums;
CREATE POLICY "galbums_read_public" ON gallery_albums FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "galbums_write_staff" ON gallery_albums;
CREATE POLICY "galbums_write_staff" ON gallery_albums FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES gallery_albums(id) ON DELETE CASCADE,
  title_en text DEFAULT '',
  title_fa text DEFAULT '',
  title_ps text DEFAULT '',
  caption_en text DEFAULT '',
  caption_fa text DEFAULT '',
  caption_ps text DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  thumbnail_url text DEFAULT '',
  category text DEFAULT 'university',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gimages_read_public" ON gallery_images;
CREATE POLICY "gimages_read_public" ON gallery_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "gimages_write_staff" ON gallery_images;
CREATE POLICY "gimages_write_staff" ON gallery_images FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE TABLE IF NOT EXISTS video_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  thumbnail_url text DEFAULT '',
  category text NOT NULL DEFAULT 'courses' CHECK (category IN (
    'courses','lectures','tutorials','university_intro','events',
    'interviews','research','student_activities'
  )),
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  instructor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  language text DEFAULT 'en' CHECK (language IN ('en','fa','ps')),
  duration_seconds integer DEFAULT 0,
  access_level text NOT NULL DEFAULT 'public' CHECK (access_level IN ('public','student','staff')),
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE video_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vgallery_read_public" ON video_gallery;
CREATE POLICY "vgallery_read_public" ON video_gallery FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "vgallery_write_staff" ON video_gallery;
CREATE POLICY "vgallery_write_staff" ON video_gallery FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE INDEX IF NOT EXISTS idx_galbums_category ON gallery_albums(category);
CREATE INDEX IF NOT EXISTS idx_gimages_album ON gallery_images(album_id);
CREATE INDEX IF NOT EXISTS idx_vgallery_category ON video_gallery(category);
CREATE INDEX IF NOT EXISTS idx_vgallery_course ON video_gallery(course_id);
CREATE INDEX IF NOT EXISTS idx_vgallery_published ON video_gallery(published);
