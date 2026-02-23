export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { uploadFile } from '@/lib/r2';

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';

    let contentId: string;
    let filename: string;
    let r2Key: string;
    let fileSize: number | null = null;
    let mimeType: string | null = null;

    if (contentType.includes('application/json')) {
      // JSON mode: file already uploaded to R2 via presigned URL, just register in DB
      const body = await request.json();
      contentId = body.contentId;
      filename = body.filename;
      r2Key = body.r2Key;
      fileSize = body.fileSize || null;
      mimeType = body.mimeType || null;

      if (!contentId || !filename || !r2Key) {
        return NextResponse.json({ error: 'contentId, filename, r2Key 필요' }, { status: 400 });
      }
    } else {
      // FormData mode: upload to R2 (legacy, small files only)
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const cid = formData.get('contentId') as string | null;

      if (!file || !cid) {
        return NextResponse.json({ error: '파일과 콘텐츠 ID가 필요합니다' }, { status: 400 });
      }

      contentId = cid;
      filename = file.name;
      r2Key = `${contentId}/${file.name}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadFile(r2Key, buffer, file.type);
      fileSize = uploaded.size;
      mimeType = uploaded.contentType;
    }

    // Register in DB
    const { data: dbFile, error: dbError } = await supabase.from('content_files').insert({
      content_id: contentId,
      filename,
      r2_key: r2Key,
      file_size: fileSize,
      mime_type: mimeType,
    }).select().single();

    if (dbError) {
      return NextResponse.json({ error: 'DB 등록 오류: ' + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ file: dbFile });
  } catch (err) {
    console.error('Upload API error:', err);
    return NextResponse.json({ error: '업로드 중 오류가 발생했습니다' }, { status: 500 });
  }
}
