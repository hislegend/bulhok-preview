import { GoogleAuth } from 'google-auth-library';
import { Readable } from 'stream';

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_SA_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(raw.replace(/\\n/g, '\n'));
  }
}

function getAuth() {
  return new GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

async function getAccessToken() {
  const auth = getAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token!;
}

async function driveApi(path: string, token: string) {
  const res = await fetch(`https://www.googleapis.com/drive/v3${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive API error: ${res.status} ${await res.text()}`);
  return res;
}

export async function listFiles(folderId: string) {
  const token = await getAccessToken();
  const res = await driveApi(`/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,size,mimeType,createdTime)&orderBy=name`, token);
  const data = await res.json();
  return data.files || [];
}

export async function listFolders(parentId: string) {
  const token = await getAccessToken();
  const res = await driveApi(`/files?q='${parentId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name,createdTime)&orderBy=name`, token);
  const data = await res.json();
  return data.files || [];
}

export async function getSignedDownloadUrl(fileId: string): Promise<string> {
  const token = await getAccessToken();
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${token}`;
}

export async function downloadFileStream(fileId: string) {
  const token = await getAccessToken();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  
  // Web ReadableStream → Node Readable
  const reader = res.body!.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) { this.push(null); return; }
      this.push(Buffer.from(value));
    }
  });
}

export async function getFileMetadata(fileId: string) {
  const token = await getAccessToken();
  const res = await driveApi(`/files/${fileId}?fields=id,name,size,mimeType`, token);
  return res.json();
}

export async function uploadFile(folderId: string, filename: string, mimeType: string, body: Readable | Buffer) {
  const token = await getAccessToken();
  const metadata = JSON.stringify({ name: filename, parents: [folderId] });
  const boundary = 'bulhok_upload_boundary';
  
  const bufData = Buffer.isBuffer(body) ? body : await new Promise<Buffer>((resolve) => {
    const chunks: Buffer[] = [];
    body.on('data', (c) => chunks.push(c));
    body.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const multipart = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
  ].join('');

  const payload = Buffer.concat([
    Buffer.from(multipart),
    bufData,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,mimeType', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: payload,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}
