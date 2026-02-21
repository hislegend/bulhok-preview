'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // Supabase client automatically detects auth params from URL hash
    // Just wait for the auth state to change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Ensure profile exists
        fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email?.split('@')[0],
          }),
        }).finally(() => {
          router.push('/contents');
        });
      }
    });

    // Also try to handle code exchange (PKCE flow)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        if (err) setError(err.message);
      });
    }

    // Check hash fragment (implicit flow)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // Supabase client should auto-detect this
      // Give it a moment
      setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            router.push('/contents');
          } else {
            setError('세션을 찾을 수 없습니다.');
          }
        });
      }, 1000);
    }

    // Fallback: if no auth params at all, check if already logged in
    if (!code && !hash.includes('access_token')) {
      setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            router.push('/contents');
          } else {
            setError('인증 정보가 없습니다.');
          }
        });
      }, 2000);
    }

    return () => subscription.unsubscribe();
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
          <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium">다시 로그인하기</a>
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
