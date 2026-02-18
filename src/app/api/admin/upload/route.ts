export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { uploadFile } from '@/lib/gdrive';

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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderId = formData.get('folderId') as string | null;
    const contentId = formData.get('contentId') as string | null;

    if (!file || !folderId) {
      return NextResponse.json({ error: '파일과 폴더 ID가 필요합니다' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadFile(folderId, file.name, file.type, buffer);

    // Register in DB if contentId provided
    if (contentId && uploaded.id) {
      await supabase.from('content_files').insert({
        content_id: contentId,
        filename: uploaded.name!,
        gdrive_file_id: uploaded.id,
        file_size: uploaded.size ? parseInt(uploaded.size) : null,
        mime_type: uploaded.mimeType || null,
      });
    }

    return NextResponse.json({ file: uploaded });
  } catch (err) {
    console.error('Upload API error:', err);
    return NextResponse.json({ error: '업로드 중 오류가 발생했습니다' }, { status: 500 });
  }
}
