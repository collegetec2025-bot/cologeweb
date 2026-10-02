/*
# EFKGOU Digital Library System

1. New Tables
- library_categories: Categories for library items (Textbooks, Ebooks, Research Papers,
  Articles, Journals, Theses, References, Educational Documents, Videos, Audio).
  Multilingual names, admin-managed.
- library_items: Individual library resources with title, author, subject, language,
  year, tags, file URL, cover image, access level, download permission, and SEO metadata.
  Supports search by category, author, subject, language, year, and tags.
- library_favorites: User bookmarks for library items (owner-scoped).
- library_reading_history: Tracks when a user reads/opens a library item (owner-scoped).

2. Security
- library_categories: public read, staff write.
- library_items: public read (with access_level filtering at app layer), staff write.
- library_favorites: owner-scoped CRUD.
- library_reading_history: owner-scoped CRUD.
*/

CREATE TABLE IF NOT EXISTS library_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_fa text NOT NULL,
  name_ps text NOT NULL,
  icon text DEFAULT 'BookOpen',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE library_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "libcat_read_public" ON library_categories;
CREATE POLICY "libcat_read_public" ON library_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "libcat_write_staff" ON library_categories;
CREATE POLICY "libcat_write_staff" ON library_categories FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE TABLE IF NOT EXISTS library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES library_categories(id) ON DELETE SET NULL,
  title_en text NOT NULL,
  title_fa text NOT NULL,
  title_ps text NOT NULL,
  author text DEFAULT '',
  subject text DEFAULT '',
  language text DEFAULT 'en' CHECK (language IN ('en','fa','ps')),
  publication_year integer,
  publisher text DEFAULT '',
  isbn text DEFAULT '',
  tags text[] DEFAULT '{}',
  description_en text DEFAULT '',
  description_fa text DEFAULT '',
  description_ps text DEFAULT '',
  file_url text DEFAULT '',
  cover_image text DEFAULT '',
  item_type text NOT NULL DEFAULT 'ebook' CHECK (item_type IN ('textbook','ebook','research_paper','article','journal','thesis','reference','document','video','audio')),
  access_level text NOT NULL DEFAULT 'public' CHECK (access_level IN ('public','student','staff')),
  downloadable boolean DEFAULT true,
  page_count integer DEFAULT 0,
  file_size bigint DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "libitems_read_public" ON library_items;
CREATE POLICY "libitems_read_public" ON library_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "libitems_write_staff" ON library_items;
CREATE POLICY "libitems_write_staff" ON library_items FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('instructor','admin')));

CREATE TABLE IF NOT EXISTS library_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  library_item_id uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, library_item_id)
);

ALTER TABLE library_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "libfav_select_own" ON library_favorites;
CREATE POLICY "libfav_select_own" ON library_favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "libfav_insert_own" ON library_favorites;
CREATE POLICY "libfav_insert_own" ON library_favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "libfav_delete_own" ON library_favorites;
CREATE POLICY "libfav_delete_own" ON library_favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS library_reading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  library_item_id uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, library_item_id)
);

ALTER TABLE library_reading_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "libhist_select_own" ON library_reading_history;
CREATE POLICY "libhist_select_own" ON library_reading_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "libhist_insert_own" ON library_reading_history;
CREATE POLICY "libhist_insert_own" ON library_reading_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "libhist_update_own" ON library_reading_history;
CREATE POLICY "libhist_update_own" ON library_reading_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "libhist_delete_own" ON library_reading_history;
CREATE POLICY "libhist_delete_own" ON library_reading_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_libitems_category ON library_items(category_id);
CREATE INDEX IF NOT EXISTS idx_libitems_type ON library_items(item_type);
CREATE INDEX IF NOT EXISTS idx_libitems_lang ON library_items(language);
CREATE INDEX IF NOT EXISTS idx_libitems_published ON library_items(published);
CREATE INDEX IF NOT EXISTS idx_libfav_user ON library_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_libhist_user ON library_reading_history(user_id);
