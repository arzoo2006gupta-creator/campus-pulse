-- =================================================================
-- CAMPUS PULSE - INITIAL DATABASE SCHEMA & ROW LEVEL SECURITY
-- =================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  year TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  notification_preferences JSONB NOT NULL DEFAULT '{"email_announcements": true, "email_events": true, "email_reminders": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper function: check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Trigger to prevent non-admins from escalating their role
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can modify roles.';
  END IF;
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_profile_update ON public.profiles;
CREATE TRIGGER tr_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_update();

-- Automatic profile creation on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, department, year, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Undeclared'),
    COALESCE(NEW.raw_user_meta_data->>'year', 'Freshman'),
    'student', -- Always defaults strictly to student
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('General', 'Academic', 'Campus Life', 'Urgent', 'Career', 'Sports')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  publish_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_announcements_publish_date ON public.announcements(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON public.announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_is_published ON public.announcements(is_published);

-- 4. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('General', 'Academic', 'Workshop', 'Cultural', 'Sports', 'Career')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  organizer TEXT NOT NULL,
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time ASC);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events(is_published);

-- 5. ACADEMIC CALENDAR TABLE
CREATE TABLE IF NOT EXISTS public.academic_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_type TEXT NOT NULL DEFAULT 'Activity' CHECK (event_type IN ('Exam', 'Holiday', 'Deadline', 'Activity', 'Registration')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_calendar_start_date ON public.academic_calendar(start_date ASC);
CREATE INDEX IF NOT EXISTS idx_calendar_event_type ON public.academic_calendar(event_type);

-- 6. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('Academic', 'Administrative', 'Library', 'Campus Support', 'Career & Tech', 'General')),
  resource_type TEXT NOT NULL DEFAULT 'link' CHECK (resource_type IN ('link', 'file')),
  link_url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size_bytes BIGINT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);

-- 7. CLUBS & SOCIETIES TABLE
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('Tech & Innovation', 'Arts & Culture', 'Sports & Fitness', 'Academic & Career', 'Social & Community', 'General')),
  contact_email TEXT,
  website_url TEXT,
  logo_url TEXT,
  meeting_info TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_clubs_category ON public.clubs(category);

-- 8. BOOKMARKS TABLES (Separate tables for referential integrity & type safety)
CREATE TABLE IF NOT EXISTS public.announcement_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_announcement UNIQUE(user_id, announcement_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_bookmarks_user ON public.announcement_bookmarks(user_id);

CREATE TABLE IF NOT EXISTS public.event_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_event UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_bookmarks_user ON public.event_bookmarks(user_id);


-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookmarks ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ANNOUNCEMENTS POLICIES
CREATE POLICY "Anyone authenticated can view published announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can insert announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update announcements"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete announcements"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- EVENTS POLICIES
CREATE POLICY "Anyone authenticated can view published events"
  ON public.events FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ACADEMIC CALENDAR POLICIES
CREATE POLICY "Anyone authenticated can view published calendar events"
  ON public.academic_calendar FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can insert calendar events"
  ON public.academic_calendar FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update calendar events"
  ON public.academic_calendar FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete calendar events"
  ON public.academic_calendar FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- RESOURCES POLICIES
CREATE POLICY "Anyone authenticated can view published resources"
  ON public.resources FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can insert resources"
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update resources"
  ON public.resources FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete resources"
  ON public.resources FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- CLUBS POLICIES
CREATE POLICY "Anyone authenticated can view published clubs"
  ON public.clubs FOR SELECT
  TO authenticated
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can insert clubs"
  ON public.clubs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update clubs"
  ON public.clubs FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete clubs"
  ON public.clubs FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- BOOKMARKS POLICIES
CREATE POLICY "Users can view their own announcement bookmarks"
  ON public.announcement_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create announcement bookmarks"
  ON public.announcement_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own announcement bookmarks"
  ON public.announcement_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own event bookmarks"
  ON public.event_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create event bookmarks"
  ON public.event_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event bookmarks"
  ON public.event_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- STORAGE BUCKET CONFIGURATION
-- Note: Create bucket 'campus-assets' in Supabase dashboard or via Storage API
INSERT INTO storage.buckets (id, name, public)
VALUES ('campus-assets', 'campus-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for campus-assets
CREATE POLICY "Public Assets Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campus-assets');

CREATE POLICY "Authenticated users or admins can upload assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'campus-assets');

CREATE POLICY "Admins can update or delete assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'campus-assets' AND public.is_admin());
