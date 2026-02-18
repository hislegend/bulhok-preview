export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { downloadFileStream, getFileMetadata } from '@/lib/gdrive';

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
    // 현재 프리뷰 모드: Drive 파일 ID로 바로 다운로드

    // Get file metadata and stream from Google Drive
    const metadata = await getFileMetadata(fileId);
    const stream = await downloadFileStream(fileId);

    // Convert Node readable to web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err: Error) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': metadata.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.name || 'file')}"`,
        ...(metadata.size ? { 'Content-Length': metadata.size } : {}),
      },
    });
  } catch (err) {
    console.error('Download API error:', err);
    return NextResponse.json({ error: '다운로드 중 오류가 발생했습니다' }, { status: 500 });
  }
}
