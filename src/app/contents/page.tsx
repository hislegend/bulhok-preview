'use client';

import { useState, useEffect } from 'react';
import ContentGrid from '@/components/ContentGrid';
// import AuthGuard from '@/components/AuthGuard'; // 최종 검토 후 복원
import { Content } from '@/types';
import { DUMMY_CONTENTS } from '@/lib/dummyData';

interface ContentWithStatus extends Content {
  unlocked: boolean;
  file_count: number;
}

function ContentsPageInner() {
  const [contents, setContents] = useState<ContentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [subscription, setSubscription] = useState<{ started_at: string; expires_at: string } | null>(null);
  const [unlockInfo, setUnlockInfo] = useState<{ unlockedCount: number; nextUnlockDate: string | null } | null>(null);

  useEffect(() => {
    fetch('/api/contents')
      .then(async (res) => {
        if (!res.ok) throw new Error('API unavailable');
        const data = await res.json();
        const apiContents = data.contents || [];
        if (apiContents.length === 0) throw new Error('No data');
        setContents(apiContents);
        setSubscription(data.subscription);
        setUnlockInfo(data.unlockInfo);
      })
      .catch(() => {
        // 정적 배포 시 API 없음 → 더미 데이터 사용
        setContents(DUMMY_CONTENTS as ContentWithStatus[]);
        setSubscription(null);
        setUnlockInfo({ unlockedCount: 3, nextUnlockDate: '2026-02-21T00:00:00Z' });
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(contents.map(c => c.category).filter(Boolean)));

  const filtered = contents.filter(c => {
    if (filter === 'unlocked') return c.unlocked;
    if (filter === 'locked') return !c.unlocked;
    return true;
  });

  const unlockedCount = contents.filter(c => c.unlocked).length;
  const lockedCount = contents.filter(c => !c.unlocked).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">콘텐츠를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">콘텐츠 라이브러리</h1>
        <p className="text-gray-500">
          {subscription
            ? '구독 기간에 따라 순차적으로 해금됩니다'
            : '구독을 시작하면 콘텐츠가 순차적으로 해금됩니다'}
        </p>
      </div>

      {!subscription && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">아직 구독 중이 아닙니다</p>
            <p className="text-sm text-gray-500">구독을 시작하고 프리미엄 콘텐츠를 이용하세요</p>
          </div>
          <a href="/pricing" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
            구독 시작
          </a>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {([
          { key: 'all' as const, label: '전체' },
          { key: 'unlocked' as const, label: '해금됨' },
          { key: 'locked' as const, label: '잠김' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
        {categories.length > 0 && (
          <>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            {categories.map((cat) => (
              <span key={cat} className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-sm">
                {cat}
              </span>
            ))}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{unlockedCount}</div>
          <div className="text-sm text-green-600">해금됨</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">{lockedCount}</div>
          <div className="text-sm text-gray-400">잠김</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{contents.length}</div>
          <div className="text-sm text-orange-500">전체</div>
        </div>
      </div>

      {unlockInfo?.nextUnlockDate && (
        <div className="bg-blue-50 rounded-xl p-4 mb-8 text-sm text-blue-700">
          ⏰ 다음 해금일: {new Date(unlockInfo.nextUnlockDate).toLocaleDateString('ko-KR')}
        </div>
      )}

      <ContentGrid contents={filtered} />
    </div>
  );
}

export default function ContentsPage() {
  return <ContentsPageInner />; // TODO: 최종 검토 후 AuthGuard 복원
}
