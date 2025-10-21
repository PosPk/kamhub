#!/usr/bin/env node
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const REGION = process.env.S3_REGION || process.env.YC_REGION || 'ru-central1';
const ENDPOINT = process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net';
const AKID = process.env.AWS_ACCESS_KEY_ID || process.env.YC_ACCESS_KEY_ID;
const SAK = process.env.AWS_SECRET_ACCESS_KEY || process.env.YC_SECRET_ACCESS_KEY;

if (!AKID || !SAK) {
  console.error('[ERROR] Missing keys');
  process.exit(2);
}

async function tryList(forcePathStyle) {
  const s3 = new S3Client({ region: REGION, endpoint: ENDPOINT, credentials: { accessKeyId: AKID, secretAccessKey: SAK }, forcePathStyle });
  const res = await s3.send(new ListBucketsCommand({}));
  return (res.Buckets || []).map(b => b.Name);
}

(async ()=>{
  for (const fps of [true, false]) {
    try {
      const buckets = await tryList(fps);
      console.log(JSON.stringify({ ok: true, forcePathStyle: fps, buckets }, null, 2));
      process.exit(0);
    } catch (e) {
      console.error(`[ERROR] ListBuckets failed (forcePathStyle=${fps})`, e?.name, e?.message);
    }
  }
  process.exit(1);
})();
