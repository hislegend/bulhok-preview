'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export default function AdminUploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [releaseOrder, setReleaseOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
      .filter(f => f.size > 0 && !f.name.startsWith('.'))
      .map(file => ({ file, progress: 0, status: 'pending' as const }));
    setFiles(prev => [...prev, ...fileArray]);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const uploadFile = async (contentId: string, uploadFile: UploadFile, index: number) => {
    const r2Key = `${contentId}/${uploadFile.file.name}`;

    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading', progress: 5 } : f));

    try {
      // 1. Get presigned URL from our API
      const presignRes = await fetch('/api/admin/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: r2Key, contentType: uploadFile.file.type || 'application/octet-stream' }),
      });
      if (!presignRes.ok) throw new Error('서명 URL 생성 실패');
      const { url } = await presignRes.json();

      // 2. Upload directly to R2 via presigned URL (bypasses Netlify size limits)
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: pct } : f));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`R2 업로드 실패: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('네트워크 오류'));
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', uploadFile.file.type || 'application/octet-stream');
        xhr.send(uploadFile.file);
      });

      // 3. Register file in DB
      await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          filename: uploadFile.file.name,
          r2Key,
          fileSize: uploadFile.file.size,
          mimeType: uploadFile.file.type || null,
        }),
      });

      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'done', progress: 100 } : f));
    } catch (err) {
      setFiles(prev => prev.map((f, i) => i === index
        ? { ...f, status: 'error', error: err instanceof Error ? err.message : '업로드 실패' }
        : f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('파일을 최소 1개 이상 추가해주세요');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. 콘텐츠 등록
      const res = await fetch('/api/admin/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          r2_prefix: `${title.replace(/[^a-zA-Z0-9가-힣-_]/g, '_')}`,
          release_order: releaseOrder,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '콘텐츠 등록 실패');
      }

      const { content } = await res.json();

      // 2. 파일들 업로드 (순차)
      for (let i = 0; i < files.length; i++) {
        if (files[i].status === 'done') continue;
        await uploadFile(content.id, files[i], i);
      }

      // 3. 완료 확인
      const allDone = files.every(f => f.status === 'done');
      if (allDone) {
        router.push('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '콘텐츠 등록에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const uploadedCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">콘텐츠 업로드</h1>
        <p className="text-gray-500">새로운 영상 소스 콘텐츠를 등록합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
        )}

        <Input
          label="콘텐츠 제목"
          placeholder="예: 서울 야경 시네마틱 4K"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">설명</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            placeholder="콘텐츠에 대한 상세 설명을 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="카테고리"
            placeholder="예: 도시, 자연, 음식"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            label="해금 순서"
            type="number"
            placeholder="1"
            value={releaseOrder}
            onChange={(e) => setReleaseOrder(e.target.value)}
            required
          />
        </div>

        {/* 파일 업로드 영역 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">파일 업로드</label>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 font-medium">파일을 드래그하거나 클릭하여 선택</p>
            <p className="text-gray-400 text-sm mt-1">영상, 이미지 등 모든 파일 형식 지원</p>
            
            <div className="flex gap-3 justify-center mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                📄 파일 선택
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
              >
                📁 폴더 선택
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error webkitdirectory is not in React types
            webkitdirectory=""
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />

          {/* 파일 목록 */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{files.length}개 파일 ({formatSize(totalSize)})</span>
                {uploadedCount > 0 && <span className="text-green-600">{uploadedCount}/{files.length} 완료</span>}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50">
                    <span className="flex-shrink-0">
                      {f.status === 'done' ? '✅' : f.status === 'error' ? '❌' : f.status === 'uploading' ? '⏳' : '📄'}
                    </span>
                    <span className="flex-1 truncate text-gray-700">{f.file.name}</span>
                    <span className="text-gray-400 flex-shrink-0">{formatSize(f.file.size)}</span>
                    {f.status === 'uploading' && (
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${f.progress}%` }} />
                      </div>
                    )}
                    {f.status === 'pending' && (
                      <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={loading} size="lg" className="flex-1">
            {files.length > 0 ? `콘텐츠 등록 + ${files.length}개 파일 업로드` : '콘텐츠 등록'}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
