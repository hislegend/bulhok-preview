export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getPresignedDownloadUrl } from '@/lib/r2';
import { calculateUnlock } from '@/lib/timelock';

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
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;

  if (!fileId) {
    return NextResponse.json({ error: '파일 ID가 필요합니다' }, { status: 400 });
  }

  try {
    const supabase = await getSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // Get file info
    const { data: file, error: fileError } = await supabase
      .from('content_files')
      .select('*, contents(*)')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다' }, { status: 404 });
    }

    const content = file.contents;

    // Check unlock status (skip for public content)
    if (!content.is_public) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        return NextResponse.json({ error: '구독이 필요합니다' }, { status: 403 });
      }

      const { data: settings } = await supabase
        .from('unlock_settings')
        .select('*')
        .limit(1)
        .single();

      const unlockResult = calculateUnlock(
        new Date(subscription.started_at),
        settings || { unlock_interval_days: 3, contents_per_unlock: 1 }
      );

      if (!unlockResult.isUnlocked(content.release_order)) {
        return NextResponse.json({ error: '아직 해금되지 않은 콘텐츠입니다' }, { status: 403 });
      }
    }

    // Generate presigned URL from R2
    const url = await getPresignedDownloadUrl(file.r2_key, 3600);

    // Log download
    await supabase.from('download_logs').insert({
      user_id: user.id,
      content_id: content.id,
      file_id: fileId,
    });

    return NextResponse.redirect(url);
  } catch (err) {
    console.error('Download API error:', err);
    return NextResponse.json({ error: '다운로드 중 오류가 발생했습니다' }, { status: 500 });
  }
}
