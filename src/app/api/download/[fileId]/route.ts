import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { calculateUnlock } from '@/lib/timelock';
import { downloadFileStream, getFileMetadata } from '@/lib/gdrive';

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
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const supabase = await getSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // Find file in DB to get content_id
    const { data: fileRecord } = await supabase
      .from('content_files')
      .select('*, contents(*)')
      .eq('gdrive_file_id', fileId)
      .single();

    if (!fileRecord) {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다' }, { status: 404 });
    }

    const content = fileRecord.contents;

    // Check unlock
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

      const unlockResult = calculateUnlock(new Date(subscription.started_at), settings);
      if (!unlockResult.isUnlocked(content.release_order)) {
        return NextResponse.json({ error: '아직 해금되지 않은 콘텐츠입니다' }, { status: 403 });
      }
    }

    // Log download
    await supabase.from('download_logs').insert({
      user_id: user.id,
      content_id: content.id,
      file_id: fileRecord.id,
    });

    // Get file metadata and stream from Google Drive
    const metadata = await getFileMetadata(fileId);
    const stream = await downloadFileStream(fileId);

    // Convert Node readable to web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err: Error) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': metadata.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.name || 'file')}"`,
        ...(metadata.size ? { 'Content-Length': metadata.size } : {}),
      },
    });
  } catch (err) {
    console.error('Download API error:', err);
    return NextResponse.json({ error: '다운로드 중 오류가 발생했습니다' }, { status: 500 });
  }
}
