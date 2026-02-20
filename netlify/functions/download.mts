import type { Context } from "@netlify/functions";
import { google } from "googleapis";

// 허용된 파일 ID 화이트리스트 (나중에 Supabase DB로 교체)
const ALLOWED_FILE_IDS = new Set([
  "1YT4OID5jDJWIbZwkSyP1zovyckbXJseI",
  "1NFTyRfE3QK_gqYXQQ1kS6hxJBNFaQad5",
]);

function parseServiceAccountKey() {
  const raw = process.env.GOOGLE_SA_KEY || "";
  if (!raw) throw new Error("GOOGLE_SA_KEY 환경변수가 설정되지 않았습니다");

  try {
    // Netlify 환경변수에서 이스케이프된 줄바꿈 처리
    const fixed = raw.replace(/\\n/g, "\n");
    return JSON.parse(fixed);
  } catch {
    // 이미 올바른 JSON인 경우
    return JSON.parse(raw);
  }
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const fileId = url.searchParams.get("fileId");

  if (!fileId) {
    return new Response(JSON.stringify({ error: "fileId 파라미터가 필요합니다" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!ALLOWED_FILE_IDS.has(fileId)) {
    return new Response(JSON.stringify({ error: "허용되지 않은 파일입니다" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const credentials = parseServiceAccountKey();

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const accessToken = await auth.getAccessToken();
    if (!accessToken) throw new Error("access_token 발급 실패");

    const drive = google.drive({ version: "v3", auth });
    const meta = await drive.files.get({ fileId, fields: "name,size,mimeType" });

    // 구글 드라이브에서 직접 스트리밍
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const fileResponse = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!fileResponse.ok) {
      const errText = await fileResponse.text();
      return new Response(JSON.stringify({ error: "파일 다운로드 실패", detail: errText }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileName = meta.data.name || "download";

    return new Response(fileResponse.body as any, {
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
