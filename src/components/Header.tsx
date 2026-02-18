'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { Profile } from '@/types';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
          .then(({ data }) => {
            setUser(data);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isLoggedIn = !!user;
  // 프리뷰 모드: Supabase 연결 안 되면 어드민 포함 전체 접근 허용
  const isPreviewMode = !loading && !user;
  const isAdmin = user?.role === 'admin' || isPreviewMode;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">불</span>
            </div>
            <span className="text-xl font-bold text-gray-900">불혹청년</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/contents" className="text-gray-600 hover:text-gray-900 font-medium">
              콘텐츠
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
              요금제
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">
                관리자
              </Link>
            )}
            {!loading && (
              isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{user.name || user.email}</span>
                  <button onClick={handleSignOut} className="text-gray-600 hover:text-gray-900 font-medium">
                    로그아웃
                  </button>
                </div>
              ) : isPreviewMode ? (
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">🔧 프리뷰 모드</span>
              ) : (
                <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  로그인
                </Link>
              )
            )}
          </nav>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/contents" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">콘텐츠</Link>
            <Link href="/pricing" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">요금제</Link>
            {isAdmin && (
              <Link href="/admin" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">관리자</Link>
            )}
            {isLoggedIn ? (
              <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50">로그아웃</button>
            ) : (
              <Link href="/login" className="block px-3 py-2 rounded-lg bg-orange-500 text-white text-center">로그인</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
