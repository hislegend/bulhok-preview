'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import TimeLockBadge from '@/components/TimeLockBadge';
import { Content, ContentFile } from '@/types';

function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [content, setContent] = useState<(Content & { unlocked: boolean }) | null>(null);
  const [files, setFiles] = useState<ContentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/contents/${id}`)
      .then(async (res) => {
        if (res.status === 401) { router.push('/login'); return; }
        if (res.status === 404) { router.push('/contents'); return; }
        const data = await res.json();
        setContent(data.content);
        setFiles(data.files || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDownload = async (fileId: string, filename: string) => {
    setDownloading(fileId);
    try {
      const res = await fetch(`/api/download/${fileId}`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || '다운로드 실패');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('다운로드 중 오류가 발생했습니다');
    } finally {
      setDownloading(null);
    }
  };

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
        <p className="text-gray-500">콘텐츠를 찾을 수 없습니다.</p>
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
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
        {content.thumbnail_url ? (
          <img src={content.thumbnail_url} alt={content.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">미리보기</p>
          </div>
        )}
      </div>

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
                      {file.mime_type?.startsWith('video') ? (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                      {file.file_size && (
                        <p className="text-xs text-gray-400">{formatFileSize(file.file_size)}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={downloading === file.gdrive_file_id}
                    onClick={() => handleDownload(file.gdrive_file_id, file.filename)}
                  >
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
