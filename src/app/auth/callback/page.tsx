'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserSupabaseClient();
      const params = new URLSearchParams(window.location.search);
      const token_hash = params.get('token_hash');
      const type = params.get('type');

      try {
        if (token_hash && type) {
          // Invite or magic link via token_hash
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'invite' | 'magiclink' | 'recovery' | 'email',
          });
          if (error) throw error;
        } else {
          // PKCE flow - check if session already exists from URL hash
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            // Try exchanging code
            const code = params.get('code');
            if (code) {
              const { error } = await supabase.auth.exchangeCodeForSession(code);
              if (error) throw error;
            }
          }
        }

        // Ensure profile exists
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!profile) {
            // Create profile via API (service role needed)
            await fetch('/api/auth/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.email?.split('@')[0],
              }),
            });
          }
        }

        router.push('/contents');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.';
        setError(message);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">인증 오류</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
            다시 로그인하기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-500">로그인 처리 중...</p>
      </div>
    </div>
  );
}
