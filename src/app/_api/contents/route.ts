import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase(request);
    const { data: { user } } = await supabase.auth.getUser();

    // Get subscription (only if logged in)
    let subscription = null;
    if (user) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      subscription = sub;
    }

    // Get unlock settings
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

    // Get all contents
    const { data: contents, error } = await supabase
      .from('contents')
      .select('*, content_files(count)')
      .order('release_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const unlockResult = subscription
      ? calculateUnlock(new Date(subscription.started_at), settings, contents?.length || 0)
      : null;

    const contentsWithStatus = (contents || []).map((content) => ({
      ...content,
      unlocked: content.is_public || (unlockResult?.isUnlocked(content.release_order) ?? false),
      file_count: content.content_files?.[0]?.count || 0,
    }));

    return NextResponse.json({
      contents: contentsWithStatus,
      subscription: subscription ? { started_at: subscription.started_at, expires_at: subscription.expires_at } : null,
      unlockInfo: unlockResult ? {
        unlockedCount: unlockResult.unlockedCount,
        nextUnlockDate: unlockResult.nextUnlockDate,
      } : null,
    });
  } catch (err) {
    console.error('Contents API error:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
