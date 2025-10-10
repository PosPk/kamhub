import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return NextResponse.json({ ok: false, error: 'NO_DATABASE_URL' }, { status: 500 })
  const token = req.cookies.get('session_token')?.value || ''
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    if (token) await client.query(`delete from sessions where token=$1`, [token])
    const res = NextResponse.json({ ok: true })
    res.cookies.set('session_token', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'DB_ERROR', message: e?.message }, { status: 500 })
  } finally {
    try { await client.end() } catch {}
  }
}
