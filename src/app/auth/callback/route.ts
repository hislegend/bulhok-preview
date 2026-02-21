import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      // Auto-create profile on first login
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const adminSupabase = createClient(supabaseUrl, serviceKey);

      const { data: existingProfile } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (!existingProfile) {
        await adminSupabase.from('profiles').insert({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email!.split('@')[0],
          role: 'member',
        });
      }
    }
  }

  return NextResponse.redirect(new URL('/contents', request.url));
}
