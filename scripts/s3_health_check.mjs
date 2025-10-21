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

const s3 = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: AKID,
    secretAccessKey: SAK,
  },
  forcePathStyle: true,
});

(async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
    console.log('[OK] S3 HeadBucket succeeded');
    process.exit(0);
  } catch (e) {
    console.error('[ERROR] S3 HeadBucket failed:', e?.message || e);
    process.exit(1);
  }
})();
