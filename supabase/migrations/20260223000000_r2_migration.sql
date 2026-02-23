-- Migrate from Google Drive to Cloudflare R2
-- Rename gdrive_folder_id → r2_prefix in contents table
ALTER TABLE public.contents RENAME COLUMN gdrive_folder_id TO r2_prefix;

-- Rename gdrive_file_id → r2_key in content_files table
ALTER TABLE public.content_files RENAME COLUMN gdrive_file_id TO r2_key;
