import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  let userId: string | null = null;
  let userEmail: string | null = null;

  if (code) {
    // PKCE flow (magic link)
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);
    userId = session?.user?.id || null;
    userEmail = session?.user?.email || null;
  } else if (token_hash && type) {
    // Token hash flow (invite, recovery, etc.)
    const { data: { session } } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'invite' | 'magiclink' | 'recovery' | 'email',
    });
    userId = session?.user?.id || null;
    userEmail = session?.user?.email || null;
  }

  // Auto-create profile on first login
  if (userId && userEmail) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      await adminSupabase.from('profiles').insert({
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0],
        role: 'member',
      });
    }
  }

  return NextResponse.redirect(new URL('/contents', request.url));
}
