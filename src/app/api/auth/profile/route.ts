import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { id, email, name } = await request.json();
  if (!id || !email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    await adminSupabase.from('profiles').insert({
      id,
      email,
      name: name || email.split('@')[0],
      role: 'member',
    });
  }

  return NextResponse.json({ success: true });
}
