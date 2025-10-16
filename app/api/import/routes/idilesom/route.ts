import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/database'
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function absUrl(path: string) {
  if (path.startsWith('http')) return path
  return `https://idilesom.com${path}`
}

async function fetchList(): Promise<string[]> {
  const r = await fetch('https://idilesom.com/kam/places', {
    headers: { 'User-Agent': 'KamchatourHubBot/1.0 (+contact@kamchatour.ru)' },
    next: { revalidate: 3600 },
  })
  const html = await r.text()
  // ссылки вида href="/kam/places/<slug>"
  const links = Array.from(html.matchAll(/href=\"(\/kam\/places\/[^"]+)\"/g)).map(m => absUrl(m[1]))
  return Array.from(new Set(links))
}

function extractNumber(re: RegExp, text: string): number | null {
  const m = text.match(re)
  if (!m) return null
  const v = m[1].replace(',', '.')
  const num = Number(v)
  return isFinite(num) ? num : null
}

async function fetchPlace(url: string) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'KamchatourHubBot/1.0 (+contact@kamchatour.ru)' },
    next: { revalidate: 86400 },
  })
  const html = await r.text()
  const name = (html.match(/<h1[^>]*>([^<]+)<\/h1>/) || [,''])[1].trim()
  const description = (html.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/) || [,''])[1]
    .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
  const photos = Array.from(html.matchAll(/<img[^>]+src=\"([^"]+)\"[^>]*>/g)).map(m => absUrl(m[1]))

  // попытка извлечь координаты
  const lat = extractNumber(/latitude["']?\s*[:=]\s*["']?([\d\.\,\-]+)/i, html)
    ?? extractNumber(/meta itemprop=\"latitude\" content=\"([\d\.,\-]+)/i, html)
    ?? extractNumber(/data-lat=\"([\d\.,\-]+)/i, html)
  const lng = extractNumber(/longitude["']?\s*[:=]\s*["']?([\d\.\,\-]+)/i, html)
    ?? extractNumber(/meta itemprop=\"longitude\" content=\"([\d\.,\-]+)/i, html)
    ?? extractNumber(/data-lng=\"([\d\.,\-]+)/i, html)

  const lengthKm = extractNumber(/([\d\,\.]+)\s*км/i, html)
  const durationH = extractNumber(/([\d\,\.]+)\s*час/i, html)
  const durationMin = durationH ? Math.round(durationH * 60) : extractNumber(/([\d\,\.]+)\s*мин/i, html) || null

  const seasons: string[] = []
  if (/зима/i.test(html)) seasons.push('winter')
  if (/весна/i.test(html)) seasons.push('spring')
  if (/лето/i.test(html)) seasons.push('summer')
  if (/осень/i.test(html)) seasons.push('autumn')

  const tags: string[] = []
  if (/вулкан/i.test(html)) tags.push('volcano')
  if (/водопад/i.test(html)) tags.push('waterfall')
  if (/медвед/i.test(html)) tags.push('bear')
  if (/троп/i.test(html)) tags.push('trail')

  const externalId = url.split('/').filter(Boolean).pop() || ''
  const importHash = crypto.createHash('sha256').update(name + description + url).digest('hex')

  return {
    name,
    description,
    source: 'idilesom',
    sourceUrl: url,
    externalId,
    importHash,
    lengthKm,
    durationMin,
    seasons,
    tags,
    photos,
    waypoint: lat && lng ? { lat, lng } : null,
  }
}

export async function POST(req: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(req.headers)
    requirePermission(roles, 'manage_tours')

    const params = Object.fromEntries(new URL(req.url).searchParams.entries())
    const limit = Math.max(1, Math.min(200, Number(params.limit || 20)))
    const dryRun = String(params.dryRun || 'true') === 'true'
    const operatorId = req.headers.get('x-operator-id')

    // ensure route_sources record
    await query(
      `INSERT INTO route_sources (name, base_url, robots_checked) 
       VALUES ('idilesom','https://idilesom.com', false)
       ON CONFLICT DO NOTHING`
    ).catch(() => {})

    const list = (await fetchList()).slice(0, limit)
    const items = [] as any[]
    for (const url of list) {
      const item = await fetchPlace(url).catch(() => null)
      if (item) items.push(item)
      await new Promise(r => setTimeout(r, 1000)) // throttle 1 rps
    }

    if (dryRun) {
      return NextResponse.json({ success: true, data: { preview: items } })
    }

    // persist
    for (const it of items) {
      await transaction(async (client) => {
        const upsertRoute = await client.query(
          `INSERT INTO routes (operator_id, name, description, source, source_url, external_id, import_hash, length_km, duration_min, season, tags, status, moderation_status, is_published)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'paused','pending',false)
           ON CONFLICT (source_url) DO UPDATE SET 
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             length_km = EXCLUDED.length_km,
             duration_min = EXCLUDED.duration_min,
             season = EXCLUDED.season,
             tags = EXCLUDED.tags,
             import_hash = EXCLUDED.import_hash,
             updated_at = NOW()
           RETURNING id`,
          [operatorId, it.name, it.description, it.source, it.sourceUrl, it.externalId, it.importHash, it.lengthKm, it.durationMin, JSON.stringify(it.seasons || []), it.tags]
        )
        const routeId = upsertRoute.rows[0].id

        // replace waypoints
        if (it.waypoint) {
          await client.query(`DELETE FROM waypoints WHERE route_id = $1`, [routeId])
          await client.query(
            `INSERT INTO waypoints (route_id, seq, location, geom, name) VALUES ($1,1,$2,ST_SetSRID(ST_MakePoint($3,$4),4326), $5)`,
            [routeId, JSON.stringify(it.waypoint), it.waypoint.lng, it.waypoint.lat, it.name]
          )
        }

        // photos
        if (Array.isArray(it.photos)) {
          for (const url of it.photos.slice(0, 10)) {
            await client.query(
              `INSERT INTO route_photos (route_id, url, source) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
              [routeId, url, it.source]
            )
          }
          await client.query(`UPDATE routes SET photos_count = (SELECT COUNT(*) FROM route_photos WHERE route_id = $1) WHERE id = $1`, [routeId])
        }
      })
    }

    return NextResponse.json({ success: true, data: { imported: items.length } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'IMPORT_FAILED' }, { status: 500 })
  }
}
