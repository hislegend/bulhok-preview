import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(key: string, body: Buffer, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return { key, size: body.length, contentType };
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function listFiles(prefix: string) {
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix.endsWith('/') ? prefix : `${prefix}/`,
    })
  );
  return (result.Contents || []).map((obj) => ({
    key: obj.Key!,
    size: obj.Size || 0,
    lastModified: obj.LastModified?.toISOString() || new Date().toISOString(),
    filename: obj.Key!.split('/').pop()!,
  }));
}

export async function deleteFile(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export async function getFileMetadata(key: string) {
  const result = await s3.send(
    new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
  return {
    key,
    size: result.ContentLength || 0,
    contentType: result.ContentType || 'application/octet-stream',
    lastModified: result.LastModified?.toISOString(),
  };
}
