import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

async function fetchList(): Promise<string[]> {
  const r = await fetch('https://visitkamchatka.ru/route-passports/', {
    headers: { 'User-Agent': 'KamchatourHubBot/1.0 (+contact@kamchatour.ru)' },
    next: { revalidate: 3600 },
  })
  const html = await r.text()
  const links = Array.from(html.matchAll(/href=\"(https:\/\/visitkamchatka\.ru\/route-passports\/[^"]+)\"/g)).map(m => m[1])
  return Array.from(new Set(links))
}

async function fetchRoute(url: string) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'KamchatourHubBot/1.0 (+contact@kamchatour.ru)' },
    next: { revalidate: 86400 },
  })
  const html = await r.text()
  const name = (html.match(/<h1[^>]*>([^<]+)<\/h1>/) || [,''])[1].trim()
  const description = (html.match(/<div class=\"route-description\">([\s\S]*?)<\/div>/) || [,''])[1]
    .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
  const slug = url.split('/').filter(Boolean).pop() || name.toLowerCase().replace(/\s+/g,'-')
  return { name, description, slug, sourceUrl: url }
}

export async function POST(req: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(req.headers)
    requirePermission(roles, 'manage_tours')

    const { limit = 10, dryRun = true } = Object.fromEntries(new URL(req.url).searchParams.entries())
    const max = Math.max(1, Math.min(100, Number(limit)))

    const list = (await fetchList()).slice(0, max)
    const items: any[] = []
    for (const url of list) {
      try {
        const item = await fetchRoute(url)
        items.push(item)
      } catch (e) {
        // skip
      }
    }

    if (String(dryRun) === 'true') {
      return NextResponse.json({ success: true, data: { preview: items } })
    }

    // идемпотентная запись в routes с source_url
    for (const r of items) {
      const upsert = `INSERT INTO routes (operator_id, name, description, status)
                      VALUES ($1,$2,$3,'paused')
                      ON CONFLICT DO NOTHING
                      RETURNING id`
      // operator_id можно передать в заголовке x-operator-id
      const operatorId = req.headers.get('x-operator-id')
      const res = await query(upsert, [operatorId, r.name, r.description])
      // можно сохранить source_url в operator_settings.settings как временно, либо добавить колонку в routes при следующей миграции
    }

    return NextResponse.json({ success: true, data: { imported: items.length } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'IMPORT_FAILED' }, { status: 500 })
  }
}
