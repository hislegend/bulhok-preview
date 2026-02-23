'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DUMMY_STATS } from '@/lib/dummyData';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalContents: number;
  monthlyDownloads: number;
}

const navItems = [
  { href: '/admin/upload', label: '콘텐츠 업로드', desc: '새로운 영상 소스를 등록합니다', icon: '📤' },
  { href: '/admin/contents', label: '콘텐츠 관리', desc: '등록된 콘텐츠를 관리합니다', icon: '🎬' },
  { href: '/admin/users', label: '유저/구독 관리', desc: '회원 및 구독 현황을 관리합니다', icon: '👥' },
  { href: '/admin/settings', label: '해금 설정', desc: '타임락 해금 주기를 설정합니다', icon: '⚙️' },
];

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>(DUMMY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then(async (res) => {
        if (!res.ok) throw new Error('API unavailable');
        const data = await res.json();
        setStats(data.stats);
      })
      .catch(() => {
        // 정적 배포 시 더미 데이터 유지
      })
      .finally(() => setLoading(false));
  }, []);

  const statItems = [
    { label: '총 회원', value: stats.totalUsers, icon: '👥' },
    { label: '활성 구독', value: stats.activeSubscriptions, icon: '💳' },
    { label: '총 콘텐츠', value: stats.totalContents, icon: '🎬' },
    { label: '이번달 다운로드', value: stats.monthlyDownloads, icon: '📥' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
        <p className="text-gray-500">불혹청년 미디어킷 서비스 운영 현황</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statItems.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '—' : stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">관리 메뉴</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all"
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{item.label}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
