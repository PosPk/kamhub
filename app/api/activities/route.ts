import { NextResponse } from 'next/server'
import { Client } from 'pg'

export const runtime = 'nodejs'

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json({ error: 'NO_DATABASE_URL' }, { status: 500 })
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const res = await client.query(
      `select id, key, title, icon_url, created_at
         from activities
        order by created_at desc
        limit 200`
    )
    return NextResponse.json({ activities: res.rows })
  } catch (e: any) {
    return NextResponse.json({ error: 'DB_QUERY_FAILED', message: e?.message }, { status: 500 })
  } finally {
    try { await client.end() } catch {}
  }
}
