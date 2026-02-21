CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  billing_key TEXT,
  amount INTEGER DEFAULT 250000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  gdrive_folder_id TEXT NOT NULL,
  thumbnail_url TEXT,
  release_order INTEGER NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.content_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.contents(id),
  filename TEXT NOT NULL,
  gdrive_file_id TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.unlock_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unlock_interval_days INTEGER DEFAULT 3,
  contents_per_unlock INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.download_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  content_id UUID REFERENCES public.contents(id),
  file_id UUID REFERENCES public.content_files(id),
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_contents_order ON public.contents(release_order);
CREATE INDEX idx_content_files_content ON public.content_files(content_id);
CREATE INDEX idx_download_logs_user ON public.download_logs(user_id);

INSERT INTO public.unlock_settings (unlock_interval_days, contents_per_unlock) VALUES (3, 1);
