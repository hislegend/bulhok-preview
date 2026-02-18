// 프리뷰 모드 인증 — Supabase 없이 localStorage 기반 더미 로그인

import { Profile } from '@/types';

const STORAGE_KEY = 'bulhok_preview_user';

const PREVIEW_USER: Profile = {
  id: 'preview-admin',
  email: 'admin@bulhok.com',
  name: '세효 (관리자)',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
};

export function previewSignIn(): Profile {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PREVIEW_USER));
  }
  return PREVIEW_USER;
}

export function previewSignOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getPreviewUser(): Profile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function isPreviewMode(): boolean {
  // Supabase URL이 없거나 빈 문자열이면 프리뷰 모드
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}
