export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;

  if (!fileId) {
    return NextResponse.json({ error: '파일 ID가 필요합니다' }, { status: 400 });
  }

  // TODO: Supabase 연동 시 인증/구독/해금 체크 추가

  // Google Drive 직접 다운로드 링크로 리다이렉트 (파일이 "링크가 있는 모든 사용자" 공유일 때 동작)
  const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  return NextResponse.redirect(driveUrl);
}
