import { NextRequest, NextResponse } from 'next/server'
import { completeJSON } from '@/lib/ai/provider'
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(req.headers)
    requirePermission(roles, 'manage_tours')

    const body = await req.json()
    const { route, weather, hazards } = body || {}
    const prompt = `Проанализируй маршрут с учетом погоды и опасностей. Верни JSON: {"risk":"low|medium|high|critical","reasons":string[],"actions":string[],"gear":string[]}`
      + `\nМаршрут: ${JSON.stringify(route)}\nПогода: ${JSON.stringify(weather)}\nОпасности: ${JSON.stringify(hazards)}`

    const res = await completeJSON<{ risk: string; reasons: string[]; actions: string[]; gear: string[] }>({
      prompt,
      maxTokens: 800,
      temperature: 0.2,
    })

    if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 })
    return NextResponse.json({ success: true, data: res.json })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'AI failed' }, { status: 500 })
  }
}
