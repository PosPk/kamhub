import { NextRequest, NextResponse } from 'next/server'
import { completeJSON } from '@/lib/ai/provider'
import { getRequestRolesFromHeaders, requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const roles = getRequestRolesFromHeaders(req.headers)
    requirePermission(roles, 'manage_notifications')

    const body = await req.json()
    const { type, audience, context } = body || {}
    const prompt = `Составь шаблон оповещения типа ${type} для аудитории ${audience}. Верни JSON: {"subject":string,"channels":string[],"message":string}`
      + `\nКонтекст: ${JSON.stringify(context)}`

    const res = await completeJSON<{ subject: string; channels: string[]; message: string }>({
      prompt,
      maxTokens: 400,
      temperature: 0.3,
    })

    if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 })
    return NextResponse.json({ success: true, data: res.json })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'AI failed' }, { status: 500 })
  }
}
