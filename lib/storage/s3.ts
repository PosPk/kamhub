import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

export interface S3UploadResult {
  bucket: string;
  key: string;
  url: string;
}

function getEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function createS3Client() {
  const region = process.env.S3_REGION || process.env.YC_REGION || 'ru-central1';
  const endpoint = process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.YC_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.YC_SECRET_ACCESS_KEY || '';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('S3 credentials are not set');
  }

  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

export async function ensureBucketAccess(client: S3Client, bucket: string) {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
}

export async function uploadBuffer(
  client: S3Client,
  params: { bucket: string; key: string; body: Buffer; contentType?: string; aclPublic?: boolean }
): Promise<S3UploadResult> {
  const { bucket, key, body, contentType } = params;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType || 'application/octet-stream',
    })
  );
  const base = (process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net').replace(/\/$/, '');
  const url = `${base}/${bucket}/${encodeURIComponent(key)}`;
  return { bucket, key, url };
}
