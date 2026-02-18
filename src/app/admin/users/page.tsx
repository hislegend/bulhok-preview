'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { createBrowserSupabaseClient } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  created_at: string;
  subscription?: {
    status: string;
    started_at: string;
    expires_at: string;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*, subscriptions(*)')
        .order('created_at', { ascending: false });

      if (profiles && profiles.length > 0) {
        setUsers(profiles.map((p) => ({
          ...p,
          subscription: p.subscriptions?.[0] || null,
        })));
        setLoading(false);
        return;
      }
    } catch {
      // Supabase 연결 실패 시 더미 데이터
    }
    // 프리뷰 모드 더미 유저
    setUsers([
      { id: '1', name: '세효 (관리자)', email: 'admin@bulhok.com', role: 'admin', created_at: '2026-01-01T00:00:00Z', subscription: { status: 'active', started_at: '2026-01-01T00:00:00Z', expires_at: '2026-12-31T00:00:00Z' } },
      { id: '2', name: '김영상', email: 'kim@example.com', role: 'member', created_at: '2026-01-15T00:00:00Z', subscription: { status: 'active', started_at: '2026-01-15T00:00:00Z', expires_at: '2026-02-15T00:00:00Z' } },
      { id: '3', name: '박크리', email: 'park@example.com', role: 'member', created_at: '2026-02-01T00:00:00Z', subscription: null },
      { id: '4', name: '이편집', email: 'lee@example.com', role: 'member', created_at: '2026-02-10T00:00:00Z', subscription: { status: 'active', started_at: '2026-02-10T00:00:00Z', expires_at: '2026-03-10T00:00:00Z' } },
    ]);
    setLoading(false);
  };

  const toggleSubscription = async (userId: string, hasActive: boolean) => {
    const supabase = createBrowserSupabaseClient();

    if (hasActive) {
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');
    } else {
      const now = new Date();
      const expires = new Date(now);
      expires.setMonth(expires.getMonth() + 1);

      await supabase.from('subscriptions').insert({
        user_id: userId,
        started_at: now.toISOString(),
        expires_at: expires.toISOString(),
        status: 'active',
        amount: 250000,
      });
    }

    loadUsers();
  };

  const activeCount = users.filter(u => u.subscription?.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">유저/구독 관리</h1>
        <p className="text-gray-500">회원 목록 및 구독 현황</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-500">전체 회원</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-gray-500">활성 구독</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-red-500">{users.length - activeCount}</div>
          <div className="text-sm text-gray-500">비구독</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">불러오는 중...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">이름</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">이메일</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">역할</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">구독 상태</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const isActive = user.subscription?.status === 'active';
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'admin' ? '관리자' : '회원'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isActive ? '활성' : '없음'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant={isActive ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => toggleSubscription(user.id, isActive)}
                      >
                        {isActive ? '구독 해제' : '구독 부여'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
