'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

function TokenLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('로그인 처리 중...');

  useEffect(() => {
    const email = searchParams.get('email');
    const otp = searchParams.get('otp');

    if (!email || !otp) {
      setStatus('잘못된 로그인 링크입니다.');
      return;
    }

    const supabase = createBrowserSupabaseClient();
    supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    }).then(({ data, error }) => {
      if (error) {
        setStatus(`오류: ${error.message}`);
      } else if (data.session) {
        setStatus('로그인 성공! 이동 중...');
        // Ensure profile
        fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.email?.split('@')[0],
          }),
        }).finally(() => {
          router.push('/contents');
        });
      }
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-gray-500">{status}</p>
      </div>
    </div>
  );
}

export default function TokenLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><p className="text-gray-500">로딩 중...</p></div>}>
      <TokenLoginInner />
    </Suspense>
  );
}
