import { NextRequest, NextResponse } from 'next/server'
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

function makeUrl(req: NextRequest, path: string, params: Record<string, any> = {}) {
  const u = new URL(path, req.url)
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, String(v)))
  return u.toString()
}

async function callSource(req: NextRequest, path: string, params: Record<string, any>) {
  const url = makeUrl(req, path, params)
  const headers: Record<string, string> = {}
  const roles = req.headers.get('x-roles')
  const operatorId = req.headers.get('x-operator-id')
  if (roles) headers['x-roles'] = roles
  if (operatorId) headers['x-operator-id'] = operatorId
  headers['Content-Type'] = 'application/json'
  const r = await fetch(url, { method: 'POST', headers, next: { revalidate: 0 } })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, data }
}

export async function POST(req: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(req.headers)
    requirePermission(roles, 'manage_tours')

    const body = await req.json().catch(() => ({} as any))
    const sources: string[] = body.sources || ['visitkamchatka', 'idilesom']
    const limits = body.limits || { visitkamchatka: 50, idilesom: 50 }
    const dryRun = body.dryRun !== undefined ? Boolean(body.dryRun) : false

    const results: Record<string, any> = {}
    for (const src of sources) {
      if (src === 'visitkamchatka') {
        results.visitkamchatka = await callSource(req, '/api/import/routes/visitkamchatka', { limit: limits.visitkamchatka ?? 50, dryRun })
      } else if (src === 'idilesom') {
        results.idilesom = await callSource(req, '/api/import/routes/idilesom', { limit: limits.idilesom ?? 50, dryRun })
      }
    }

    return NextResponse.json({ success: true, data: results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'RUN_IMPORT_FAILED' }, { status: 500 })
  }
}
