import { Pool, PoolClient } from 'pg'

const supabaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || ''

if (!supabaseUrl) {
  // eslint-disable-next-line no-console
  console.warn('SUPABASE_DATABASE_URL is not set; supabase DB features will be disabled.')
}

export const supabasePool = new Pool({
  connectionString: supabaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export async function supabaseQuery<T = any>(text: string, params?: any[]) {
  const client = await supabasePool.connect()
  try {
    const res = await client.query(text, params)
    return res as any as { rows: T[]; rowCount: number | null; command: string }
  } finally {
    client.release()
  }
}

export async function supabaseTransaction<T>(cb: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await supabasePool.connect()
  try {
    await client.query('BEGIN')
    const result = await cb(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
