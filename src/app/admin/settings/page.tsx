'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const [intervalDays, setIntervalDays] = useState('3');
  const [contentsPerUnlock, setContentsPerUnlock] = useState('1');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase
      .from('unlock_settings')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettingsId(data.id);
          setIntervalDays(String(data.unlock_interval_days));
          setContentsPerUnlock(String(data.contents_per_unlock));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const supabase = createBrowserSupabaseClient();
      const payload = {
        unlock_interval_days: Number(intervalDays),
        contents_per_unlock: Number(contentsPerUnlock),
        updated_at: new Date().toISOString(),
      };

      if (settingsId) {
        await supabase.from('unlock_settings').update(payload).eq('id', settingsId);
      } else {
        const { data } = await supabase.from('unlock_settings').insert(payload).select().single();
        if (data) setSettingsId(data.id);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const days30Count = Math.floor(30 / Number(intervalDays || 1)) * Number(contentsPerUnlock || 1);
  const days90Count = Math.floor(90 / Number(intervalDays || 1)) * Number(contentsPerUnlock || 1);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">해금 주기 설정</h1>
        <p className="text-gray-500">타임락 콘텐츠 해금 규칙을 설정합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
        {saved && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            설정이 저장되었습니다.
          </div>
        )}

        <Input
          label="해금 간격 (일)"
          type="number"
          min="1"
          value={intervalDays}
          onChange={(e) => setIntervalDays(e.target.value)}
          required
        />

        <Input
          label="회당 해금 콘텐츠 수"
          type="number"
          min="1"
          value={contentsPerUnlock}
          onChange={(e) => setContentsPerUnlock(e.target.value)}
          required
        />

        <div className="bg-orange-50 rounded-xl p-5">
          <h3 className="font-medium text-gray-900 mb-3">📊 해금 시뮬레이션</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">해금 규칙</span>
              <span className="font-medium text-gray-900">{intervalDays}일마다 {contentsPerUnlock}개 해금</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">1개월 (30일) 구독 시</span>
              <span className="font-medium text-orange-600">{days30Count}개 콘텐츠 이용 가능</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">3개월 (90일) 구독 시</span>
              <span className="font-medium text-orange-600">{days90Count}개 콘텐츠 이용 가능</span>
            </div>
          </div>
        </div>

        <Button type="submit" loading={loading} size="lg" className="w-full">
          설정 저장
        </Button>
      </form>
    </div>
  );
}
