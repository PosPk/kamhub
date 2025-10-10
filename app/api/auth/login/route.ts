import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'
import crypto from 'node:crypto'

export const runtime = 'nodejs'

function verifyPassword(password: string, stored: string): boolean {
  const [algo, salt, hash] = stored.split('$')
  if (algo !== 'scrypt' || !salt || !hash) return false
  const check = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'))
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return NextResponse.json({ ok: false, error: 'NO_DATABASE_URL' }, { status: 500 })

  const body = await req.json().catch(() => ({} as any))
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 200)
  const password = String(body?.password || '').slice(0, 200)
  if (!email || !password) return NextResponse.json({ ok: false, error: 'VALIDATION' }, { status: 400 })

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const u = await client.query(`select id, email, password_hash from users where email=$1`, [email])
    const user = u.rows?.[0]
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ ok: false, error: 'INVALID_CREDENTIALS' }, { status: 401 })
    }

    await client.query(`create table if not exists sessions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      token text unique not null,
      expires_at timestamptz not null,
      created_at timestamptz default now()
    );`)

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30d
    await client.query(`insert into sessions(user_id, token, expires_at) values ($1,$2,$3)`, [user.id, token, expiresAt])

    const res = NextResponse.json({ ok: true })
    res.cookies.set('session_token', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'DB_ERROR', message: e?.message }, { status: 500 })
  } finally {
    try { await client.end() } catch {}
  }
}
