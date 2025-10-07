#!/usr/bin/env node
const { Client } = require('pg')

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    // Enable pgcrypto for gen_random_uuid()
    try {
      await client.query('create extension if not exists pgcrypto;')
      console.log('pgcrypto extension ensured')
    } catch (e) {
      console.warn('pgcrypto extension not created (insufficient privileges or not needed):', e.message)
    }

    await client.query(`
      create table if not exists activities (
        id uuid primary key default gen_random_uuid(),
        key text unique not null,
        title text not null,
        icon_bytes bytea,
        icon_mime text,
        icon_sha256 text,
        icon_url text,
        created_at timestamptz default now()
      );
    `)
    console.log('activities table ensured')

    await client.query(`
      create table if not exists partners (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        category text not null check (category in ('operator','guide','transfer','stay','souvenir','gear','cars','restaurant')),
        logo_bytes bytea,
        logo_mime text,
        logo_sha256 text,
        logo_url text,
        created_at timestamptz default now()
      );
    `)
    console.log('partners table ensured')

    await client.query(`
      create table if not exists assets (
        id uuid primary key default gen_random_uuid(),
        key text unique not null,
        bytes bytea not null,
        mime text,
        sha256 text,
        source_url text,
        created_at timestamptz default now()
      );
    `)
    console.log('assets table ensured')

    // Partner applications table
    await client.query(`
      create table if not exists partner_applications (
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
      );
    `)
    console.log('partner_applications table ensured')
  } finally {
    await client.end()
  }
}

main().then(() => {
  console.log('Migration completed')
}).catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
})
