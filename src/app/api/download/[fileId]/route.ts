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

    const [{ token, url }, metadata] = await Promise.all([
      getSignedDownloadUrl(fileId),
      getFileMetadata(fileId),
    ]);

    // Google Drive에서 스트리밍 fetch → 클라이언트로 바로 pipe
    const driveRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!driveRes.ok) {
      const errText = await driveRes.text();
      return NextResponse.json({ error: 'Drive 다운로드 실패', detail: errText }, { status: driveRes.status });
    }

    // ReadableStream을 그대로 전달 (서버 메모리에 버퍼링 안 함)
    return new NextResponse(driveRes.body, {
      headers: {
        'Content-Type': metadata.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.name || 'file')}"`,
        ...(metadata.size ? { 'Content-Length': metadata.size } : {}),
      },
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Download API error:', err);
    return NextResponse.json({ error: '다운로드 중 오류가 발생했습니다', detail: err?.message }, { status: 500 });
  }
}
