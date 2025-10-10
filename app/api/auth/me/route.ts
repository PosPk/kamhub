import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return NextResponse.json({ ok: false, error: 'NO_DATABASE_URL' }, { status: 500 })
  const token = req.cookies.get('session_token')?.value || ''
  if (!token) return NextResponse.json({ ok: false, user: null }, { status: 200 })

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const q = await client.query(
      `select u.id, u.email, u.name from sessions s join users u on u.id=s.user_id where s.token=$1 and s.expires_at>now()`,
      [token]
    )
    const user = q.rows?.[0] || null
    return NextResponse.json({ ok: true, user })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'DB_ERROR', message: e?.message }, { status: 500 })
  } finally {
    try { await client.end() } catch {}
  }
}
