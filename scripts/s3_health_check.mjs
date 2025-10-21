#!/usr/bin/env node
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

const required = ['S3_REGION', 'S3_ENDPOINT', 'S3_BUCKET', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[ERROR] Missing ENV: ${missing.join(', ')}`);
  process.exit(2);
}

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

(async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: process.env.S3_BUCKET }));
    console.log('[OK] S3 HeadBucket succeeded');
    process.exit(0);
  } catch (e) {
    console.error('[ERROR] S3 HeadBucket failed:', e?.message || e);
    process.exit(1);
  }
})();
