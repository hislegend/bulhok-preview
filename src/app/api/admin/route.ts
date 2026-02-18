export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

export async function GET(request: NextRequest) {
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

    // Get stats
    const [
      { count: totalUsers },
      { count: activeSubscriptions },
      { count: totalContents },
      { count: monthlyDownloads },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('contents').select('*', { count: 'exact', head: true }),
      supabase.from('download_logs').select('*', { count: 'exact', head: true })
        .gte('downloaded_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ]);

    // Recent downloads
    const { data: recentDownloads } = await supabase
      .from('download_logs')
      .select('*, profiles(name, email), contents(title)')
      .order('downloaded_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalContents: totalContents || 0,
        monthlyDownloads: monthlyDownloads || 0,
      },
      recentDownloads: recentDownloads || [],
    });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
