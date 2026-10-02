/*
# EFKGOU Notifications System

1. New Tables
- notifications: User-specific notifications with title, message, type, link,
  and read status. Supports multilingual content. Owner-scoped per user.

2. Security
- notifications: owner-scoped CRUD. Each user can read, update (mark read),
  and delete their own notifications. System (admin) can insert notifications
  for any user via service role.
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_fa text DEFAULT '',
  title_ps text DEFAULT '',
  message_en text DEFAULT '',
  message_fa text DEFAULT '',
  message_ps text DEFAULT '',
  notification_type text NOT NULL DEFAULT 'general' CHECK (notification_type IN ('general','academic','finance','admission','system','assignment','grade','certificate','event')),
  link text DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_own" ON notifications;
CREATE POLICY "notif_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_insert_own" ON notifications;
CREATE POLICY "notif_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_update_own" ON notifications;
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_delete_own" ON notifications;
CREATE POLICY "notif_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notif_type ON notifications(notification_type);
