'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { DUMMY_CONTENTS } from '@/lib/dummyData';

interface AdminContent {
  id: string;
  title: string;
  category: string | null;
  release_order: number;
  is_public: boolean;
  file_count: number;
}

export default function AdminContentsPage() {
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contents')
      .then(async (res) => {
        if (!res.ok) throw new Error('API unavailable');
        const data = await res.json();
        setContents(data.contents || []);
      })
      .catch(() => {
        setContents(DUMMY_CONTENTS as AdminContent[]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">콘텐츠 관리</h1>
          <p className="text-gray-500">등록된 콘텐츠를 확인하고 관리합니다</p>
        </div>
        <Link href="/admin/upload">
          <Button>+ 새 콘텐츠</Button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">불러오는 중...</div>
        ) : contents.length === 0 ? (
          <div className="p-8 text-center text-gray-400">등록된 콘텐츠가 없습니다</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">순서</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">카테고리</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">파일 수</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">공개</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contents.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded">#{content.release_order}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{content.title}</td>
                  <td className="px-6 py-4">
                    {content.category && (
                      <span className="bg-orange-50 text-orange-600 text-sm px-2 py-0.5 rounded">{content.category}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{content.file_count || 0}개</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${content.is_public ? 'text-green-600' : 'text-gray-400'}`}>
                      {content.is_public ? '공개' : '비공개'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
