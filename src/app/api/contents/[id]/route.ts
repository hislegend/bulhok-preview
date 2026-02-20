export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { calculateUnlock } from '@/lib/timelock';
import { listFiles } from '@/lib/gdrive';

async function getSupabase(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // Get content
    const { data: content, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !content) {
      return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다' }, { status: 404 });
    }

    // Check unlock status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const { data: settingsData } = await supabase
      .from('unlock_settings')
      .select('*')
      .limit(1)
      .single();

    const settings = settingsData || {
      id: 'default',
      unlock_interval_days: 3,
      contents_per_unlock: 1,
      updated_at: new Date().toISOString(),
    };

    const unlockResult = subscription
      ? calculateUnlock(new Date(subscription.started_at), settings)
      : null;

    const isUnlocked = content.is_public || (unlockResult?.isUnlocked(content.release_order) ?? false);

    if (!isUnlocked) {
      return NextResponse.json({
        content: { ...content, unlocked: false },
        files: [],
        message: '아직 해금되지 않은 콘텐츠입니다',
      });
    }

    // Get files from DB
    const { data: dbFiles } = await supabase
      .from('content_files')
      .select('*')
      .eq('content_id', id)
      .order('filename');

    // If no DB files, try Google Drive
    let files = dbFiles || [];
    if (files.length === 0 && content.gdrive_folder_id) {
      try {
        const driveFiles = await listFiles(content.gdrive_folder_id);
        files = driveFiles.map((f: any) => ({
          id: f.id!,
          content_id: id,
          filename: f.name!,
          gdrive_file_id: f.id!,
          file_size: f.size ? parseInt(f.size) : null,
          mime_type: f.mimeType || null,
          created_at: f.createdTime || new Date().toISOString(),
        }));
      } catch (driveErr) {
        console.error('Google Drive error:', driveErr);
      }
    }

    return NextResponse.json({
      content: { ...content, unlocked: true },
      files,
    });
  } catch (err) {
    console.error('Content detail API error:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
