import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'
import crypto from 'node:crypto'

export const runtime = 'nodejs'

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return NextResponse.json({ ok: false, error: 'NO_DATABASE_URL' }, { status: 500 })

  const body = await req.json().catch(() => ({} as any))
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 200)
  const password = String(body?.password || '').slice(0, 200)
  const name = String(body?.name || '').trim().slice(0, 200) || null
  if (!email || !password) return NextResponse.json({ ok: false, error: 'VALIDATION' }, { status: 400 })

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    await client.query(`create extension if not exists pgcrypto;`)
    await client.query(`
      create table if not exists users (
        id uuid primary key default gen_random_uuid(),
        email text unique not null,
        password_hash text not null,
        name text,
        created_at timestamptz default now(),
        last_login_at timestamptz
      );
    `)

    const passHash = hashPassword(password)
    const res = await client.query(
      `insert into users(email, password_hash, name) values($1,$2,$3)
       on conflict(email) do nothing returning id, email, name, created_at`,
      [email, passHash, name]
    )
    if (!res.rows?.length) return NextResponse.json({ ok: false, error: 'EMAIL_TAKEN' }, { status: 409 })

    return NextResponse.json({ ok: true, user: res.rows[0] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'DB_ERROR', message: e?.message }, { status: 500 })
  } finally {
    try { await client.end() } catch {}
  }
}
