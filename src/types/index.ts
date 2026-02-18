export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: 'member' | 'admin';
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  started_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'cancelled';
  amount: number;
  created_at: string;
}

export interface Content {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  gdrive_folder_id: string;
  thumbnail_url: string | null;
  release_order: number;
  is_public: boolean;
  created_at: string;
}

export interface ContentFile {
  id: string;
  content_id: string;
  filename: string;
  gdrive_file_id: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface UnlockSettings {
  id: string;
  unlock_interval_days: number;
  contents_per_unlock: number;
  updated_at: string;
}

export interface DownloadLog {
  id: string;
  user_id: string;
  content_id: string;
  file_id: string;
  downloaded_at: string;
}
