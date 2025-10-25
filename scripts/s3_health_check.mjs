#!/usr/bin/env node
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

const REGION = process.env.S3_REGION || process.env.YC_REGION || 'ru-central1';
const ENDPOINT = process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net';
const BUCKET = process.env.S3_BUCKET || process.env.YC_BUCKET;
const AKID = process.env.AWS_ACCESS_KEY_ID || process.env.YC_ACCESS_KEY_ID;
const SAK = process.env.AWS_SECRET_ACCESS_KEY || process.env.YC_SECRET_ACCESS_KEY;

const missing = [];
if (!BUCKET) missing.push('S3_BUCKET/YC_BUCKET');
if (!AKID) missing.push('AWS_ACCESS_KEY_ID/YC_ACCESS_KEY_ID');
if (!SAK) missing.push('AWS_SECRET_ACCESS_KEY/YC_SECRET_ACCESS_KEY');
if (missing.length) {
  console.error(`[ERROR] Missing ENV: ${missing.join(', ')}`);
  process.exit(2);
}

function makeClient(forcePathStyle) {
  return new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: { accessKeyId: AKID, secretAccessKey: SAK },
    forcePathStyle,
  });
}

(async () => {
  const attempts = [true, false];
  for (const fps of attempts) {
    const client = makeClient(fps);
    try {
      await client.send(new HeadBucketCommand({ Bucket: BUCKET }));
      console.log(`[OK] HeadBucket ok (forcePathStyle=${fps})`);
      process.exit(0);
    } catch (e) {
      const meta = e?.$metadata ? ` code=${e.$metadata.httpStatusCode}` : '';
      console.error(`[ERROR] HeadBucket failed (forcePathStyle=${fps})${meta}:`, e?.name || '', e?.message || e);
    }
  }
  process.exit(1);
})();
