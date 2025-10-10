import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export const runtime = 'nodejs'

function normalizeCategories(input: unknown): string[] {
  if (Array.isArray(input)) return input.map(String).map((s) => s.trim()).filter(Boolean)
  if (typeof input === 'string') return input.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return NextResponse.json({ ok: false, error: 'NO_DATABASE_URL' }, { status: 500 })

  const body = await req.json().catch(() => ({} as any))
  const userEmail = String(body?.user_email || body?.email || '').trim().slice(0, 200)
  const name = String(body?.name || '').trim().slice(0, 200)
  const categories = normalizeCategories(body?.categories)
  const phone = String(body?.phone || '').trim().slice(0, 50)
  const website = String(body?.website || '').trim().slice(0, 200)
  const description = String(body?.description || '').trim().slice(0, 2000)

  if (!userEmail || !name || categories.length === 0) {
    return NextResponse.json({ ok: false, error: 'VALIDATION', fields: { user_email: !!userEmail, name: !!name, categories: categories.length > 0 } }, { status: 400 })
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    await client.query(
      `create table if not exists partner_applications (
        id uuid primary key default gen_random_uuid(),
        user_email text not null,
        name text not null,
        categories text[] not null,
        phone text,
        website text,
        description text,
        status text not null default 'pending' check (status in ('pending','approved','rejected')),
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );`
    )

    const result = await client.query(
      `insert into partner_applications(user_email, name, categories, phone, website, description)
       values ($1,$2,$3,$4,$5,$6)
       returning id, status, created_at`,
      [userEmail, name, categories, phone || null, website || null, description || null]
    )

    const row = result.rows?.[0]
    return NextResponse.json({ ok: true, application: row })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'DB_ERROR', message: e?.message }, { status: 500 })
  } finally {
    try { await client.end() } catch {}
  }
}
