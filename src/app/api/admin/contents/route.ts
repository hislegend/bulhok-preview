export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { listFiles } from '@/lib/r2';

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

async function checkAdmin(request: NextRequest) {
  const supabase = await getSupabase(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') return null;
  return { supabase, user };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, r2_prefix, release_order, is_public, thumbnail_url } = body;

    if (!title || !r2_prefix || !release_order) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 });
    }

    // Create content
    const { data: content, error } = await auth.supabase
      .from('contents')
      .insert({
        title,
        description: description || null,
        category: category || null,
        r2_prefix,
        release_order: Number(release_order),
        is_public: is_public || false,
        thumbnail_url: thumbnail_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-sync files from R2
    try {
      const r2Objects = await listFiles(r2_prefix);
      if (r2Objects.length > 0) {
        const fileRecords = r2Objects
          .filter((obj) => !obj.key.endsWith('/'))
          .map((obj) => ({
            content_id: content.id,
            filename: obj.filename,
            r2_key: obj.key,
            file_size: obj.size || null,
            mime_type: null,
          }));

        if (fileRecords.length > 0) {
          await auth.supabase.from('content_files').insert(fileRecords);
        }
      }
    } catch (r2Err) {
      console.error('R2 sync error:', r2Err);
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error('Admin contents API error:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
