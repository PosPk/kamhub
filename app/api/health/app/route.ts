import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';
import { createS3Client, ensureBucketAccess } from '@/lib/storage/s3';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = new Date().toISOString();
  const result: any = { ok: true, checks: {}, startedAt };

  // DB check
  try {
    if (!process.env.DATABASE_URL) throw new Error('No DATABASE_URL');
    const ok = await testConnection();
    result.checks.db = { ok };
    if (!ok) result.ok = false;
  } catch (e: any) {
    result.checks.db = { ok: false, error: e?.message || String(e) };
    result.ok = false;
  }

  // S3 HeadBucket check
  try {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) throw new Error('No S3_BUCKET');
    const s3 = createS3Client();
    await ensureBucketAccess(s3, bucket);
    result.checks.s3 = { ok: true, bucket };
  } catch (e: any) {
    result.checks.s3 = { ok: false, error: e?.message || String(e) };
    result.ok = false;
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
