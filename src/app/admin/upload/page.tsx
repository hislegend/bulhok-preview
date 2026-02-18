'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminUploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [gdriveFolderId, setGdriveFolderId] = useState('');
  const [releaseOrder, setReleaseOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          gdrive_folder_id: gdriveFolderId,
          release_order: releaseOrder,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '등록 실패');
      }

      router.push('/admin/contents');
    } catch (err) {
      setError(err instanceof Error ? err.message : '콘텐츠 등록에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

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
            rows={4}
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

        <Input
          label="Google Drive 폴더 ID"
          placeholder="폴더 URL에서 ID를 복사하세요"
          value={gdriveFolderId}
          onChange={(e) => setGdriveFolderId(e.target.value)}
          required
        />

        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">💡 Google Drive 연동 안내</p>
          <p>Google Drive에 폴더를 만들고 영상 파일을 업로드한 뒤, 폴더 ID를 입력하세요. 파일 목록은 자동으로 가져옵니다.</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={loading} size="lg" className="flex-1">
            콘텐츠 등록
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
