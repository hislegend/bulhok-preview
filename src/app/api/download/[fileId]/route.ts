export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSignedDownloadUrl, getFileMetadata } from '@/lib/gdrive';

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

    // 임시 다운로드 URL 발급 (1시간 유효)
    // 사용자가 Google 서버에서 직접 다운로드 → 서버 부하 없음
    const downloadUrl = await getSignedDownloadUrl(fileId);
    const metadata = await getFileMetadata(fileId);

    return NextResponse.json({
      downloadUrl,
      filename: metadata.name,
      size: metadata.size,
      mimeType: metadata.mimeType,
    });
  } catch (err) {
    console.error('Download API error:', err);
    return NextResponse.json({ error: '다운로드 URL 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
}
