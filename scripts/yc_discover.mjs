#!/usr/bin/env node
import fs from 'node:fs/promises';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const BASE = 'https://resource-manager.api.cloud.yandex.net/resource-manager/v1';

async function api(token, path) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} ${t}`);
  }
  return res.json();
}

async function main() {
  const token = process.env.YC_IAM_TOKEN || process.env.YC_TOKEN || '';
  if (!token) {
    console.error('[ERROR] YC_IAM_TOKEN is required to query Resource Manager');
  }
  const out = { clouds: [], buckets: [] };

  if (token) {
    try {
      const clouds = await api(token, '/clouds');
      out.clouds = clouds.clouds || [];
      for (const c of out.clouds) {
        const folders = await api(token, `/folders?cloudId=${encodeURIComponent(c.id)}`);
        c.folders = folders.folders || [];
      }
    } catch (e) {
      console.error('[WARN] Resource Manager query failed:', e.message);
    }
  }

  const AKID = process.env.AWS_ACCESS_KEY_ID || process.env.YC_ACCESS_KEY_ID;
  const SAK = process.env.AWS_SECRET_ACCESS_KEY || process.env.YC_SECRET_ACCESS_KEY;
  const REGION = process.env.S3_REGION || process.env.YC_REGION || 'ru-central1';
  const ENDPOINT = process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net';

  if (AKID && SAK) {
    try {
      const s3 = new S3Client({
        region: REGION,
        endpoint: ENDPOINT,
        credentials: { accessKeyId: AKID, secretAccessKey: SAK },
        forcePathStyle: true,
      });
      const res = await s3.send(new ListBucketsCommand({}));
      out.buckets = (res.Buckets || []).map(b => b.Name);
    } catch (e) {
      console.error('[WARN] S3 ListBuckets failed:', e.message);
    }
  } else {
    console.error('[INFO] No S3 keys found, skipping buckets list');
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch(e => { console.error('[FATAL]', e); process.exit(1); });
