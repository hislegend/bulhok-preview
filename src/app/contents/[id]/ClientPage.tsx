'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import TimeLockBadge from '@/components/TimeLockBadge';
import { Content, ContentFile } from '@/types';
import { DUMMY_CONTENTS, DUMMY_FILES } from '@/lib/dummyData';

const CATEGORY_STYLES: Record<string, { gradient: string; icon: string }> = {
  '도시/야경': { gradient: 'from-indigo-600 via-purple-600 to-blue-800', icon: '🌃' },
  '자연/풍경': { gradient: 'from-emerald-500 via-teal-500 to-cyan-600', icon: '🏔️' },
  '라이프스타일': { gradient: 'from-amber-500 via-orange-400 to-yellow-500', icon: '☕' },
  '패션/뷰티': { gradient: 'from-pink-500 via-rose-400 to-fuchsia-500', icon: '👗' },
  '푸드': { gradient: 'from-red-500 via-orange-500 to-amber-500', icon: '🍽️' },
  '비즈니스': { gradient: 'from-slate-600 via-gray-500 to-zinc-600', icon: '💼' },
  '건축/인테리어': { gradient: 'from-stone-500 via-amber-600 to-orange-700', icon: '🏛️' },
  '스포츠/건강': { gradient: 'from-green-500 via-lime-500 to-emerald-500', icon: '💪' },
};

const DEFAULT_STYLE = { gradient: 'from-gray-600 via-gray-500 to-gray-700', icon: '🎬' };

function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function ClientPage({ id }: { id: string }) {
  const [content, setContent] = useState<(Content & { unlocked: boolean }) | null>(null);
  const [files, setFiles] = useState<ContentFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contents/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('API unavailable');
        const data = await res.json();
        setContent(data.content);
        setFiles(data.files || []);
      })
      .catch(() => {
        // 더미 데이터 폴백
        const dummy = DUMMY_CONTENTS.find((c) => c.id === id);
        if (dummy) {
          setContent(dummy as Content & { unlocked: boolean });
          setFiles((DUMMY_FILES[id] || []) as ContentFile[]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">콘텐츠를 찾을 수 없습니다.</p>
        <Link href="/contents" className="text-orange-500 hover:text-orange-600 font-medium">← 콘텐츠 목록</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/contents" className="hover:text-gray-900">콘텐츠</Link>
        <span>/</span>
        <span className="text-gray-900">{content.title}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
              <TimeLockBadge unlocked={content.unlocked} releaseOrder={content.release_order} />
            </div>
            {content.category && (
              <span className="inline-block bg-orange-50 text-orange-600 text-sm px-3 py-1 rounded-lg">
                {content.category}
              </span>
            )}
          </div>
        </div>
        {content.description && (
          <p className="text-gray-600 leading-relaxed">{content.description}</p>
        )}
      </div>

      {/* Thumbnail */}
      {(() => {
        const style = CATEGORY_STYLES[content.category || ''] || DEFAULT_STYLE;
        return (
          <div className={`aspect-video bg-gradient-to-br ${style.gradient} rounded-2xl mb-8 flex items-center justify-center overflow-hidden`}>
            {content.thumbnail_url ? (
              <img src={content.thumbnail_url} alt={content.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-white/70">
                <span className="text-6xl block mb-3">{style.icon}</span>
                <p className="text-sm font-medium tracking-wider uppercase">{content.category || '미리보기'}</p>
              </div>
            )}
          </div>
        );
      })()}

      {!content.unlocked ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-500 mb-4">아직 해금되지 않은 콘텐츠입니다</p>
          <Link href="/pricing" className="text-orange-500 hover:text-orange-600 font-medium">
            구독하고 해금하기 →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              파일 목록
              <span className="text-sm text-gray-400 font-normal ml-2">{files.length}개</span>
            </h2>
          </div>
          {files.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              등록된 파일이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {files.map((file) => (
                <div key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                      {file.file_size && (
                        <p className="text-xs text-gray-400">{formatFileSize(file.file_size)}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => alert('프리뷰 모드에서는 다운로드할 수 없습니다')}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    다운로드
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
