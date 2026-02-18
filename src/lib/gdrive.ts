import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { Readable } from 'stream';

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');

  const parsed = JSON.parse(credentials);
  return new GoogleAuth({
    credentials: parsed,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

function getDrive() {
  return google.drive({ version: 'v3', auth: getAuth() });
}

export async function listFiles(folderId: string) {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id,name,size,mimeType,createdTime)',
    orderBy: 'name',
  });
  return res.data.files || [];
}

export async function listFolders(parentId: string) {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id,name,createdTime)',
    orderBy: 'name',
  });
  return res.data.files || [];
}

export async function getDownloadUrl(fileId: string): Promise<string> {
  // Generate a short-lived download URL via proxy
  return `/api/download/${fileId}`;
}

export async function downloadFileStream(fileId: string) {
  const drive = getDrive();
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );
  return res.data as Readable;
}

export async function getFileMetadata(fileId: string) {
  const drive = getDrive();
  const res = await drive.files.get({
    fileId,
    fields: 'id,name,size,mimeType',
  });
  return res.data;
}

export async function uploadFile(folderId: string, filename: string, mimeType: string, body: Readable | Buffer) {
  const drive = getDrive();
  const readable = Buffer.isBuffer(body) ? Readable.from(body) : body;
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: readable,
    },
    fields: 'id,name,size,mimeType',
  });
  return res.data;
}
