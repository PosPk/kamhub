import { NextRequest, NextResponse } from 'next/server';
import { runMigrations } from '@/lib/database/migrations';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    await runMigrations();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Migration failed' }, { status: 500 });
  }
}
