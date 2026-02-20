import type { Context } from "@netlify/functions";
import { google } from "googleapis";

// 허용된 파일 ID 화이트리스트 (나중에 Supabase DB로 교체)
const ALLOWED_FILE_IDS = new Set([
  "1YT4OID5jDJWIbZwkSyP1zovyckbXJseI",
  "1NFTyRfE3QK_gqYXQQ1kS6hxJBNFaQad5",
]);

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const fileId = url.searchParams.get("fileId");

  if (!fileId) {
    return new Response(JSON.stringify({ error: "fileId 파라미터가 필요합니다" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 화이트리스트 체크 (나중에 구독/해금 체크로 교체)
  if (!ALLOWED_FILE_IDS.has(fileId)) {
    return new Response(JSON.stringify({ error: "허용되지 않은 파일입니다" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 서비스 계정 인증
    const credentials = JSON.parse(process.env.GOOGLE_SA_KEY || "{}");
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const accessToken = await auth.getAccessToken();

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "인증 실패" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 파일 메타데이터 가져오기 (파일명용)
    const drive = google.drive({ version: "v3", auth });
    const meta = await drive.files.get({ fileId, fields: "name,size,mimeType" });

    // 직접 다운로드 URL 생성 (access_token 포함)
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    // 서버가 스트리밍 프록시 (access_token 노출 없이)
    const fileResponse = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!fileResponse.ok) {
      return new Response(JSON.stringify({ error: "파일 다운로드 실패" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileName = meta.data.name || "download";

    return new Response(fileResponse.body, {
      headers: {
        "Content-Type": meta.data.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        ...(meta.data.size ? { "Content-Length": meta.data.size } : {}),
      },
    });
  } catch (err: any) {
    console.error("Download error:", err);
    return new Response(JSON.stringify({ error: "다운로드 중 오류 발생", detail: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
