export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSignedDownloadUrl } from '@/lib/gdrive';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    if (!fileId) {
      return NextResponse.json({ error: '파일 ID가 필요합니다' }, { status: 400 });
    }

    // TODO: Supabase 연동 시 인증/구독/해금 체크 추가

    // 토큰 + URL 발급 (클라이언트에서 Bearer 헤더로 직접 다운로드)
    const { token, url } = await getSignedDownloadUrl(fileId);
    return NextResponse.json({ token, url });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Download API error:', err);
    return NextResponse.json({ error: '다운로드 중 오류가 발생했습니다', detail: err?.message }, { status: 500 });
  }
}
