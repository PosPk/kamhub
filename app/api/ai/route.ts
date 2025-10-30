import { NextRequest, NextResponse } from 'next/server'

// Для Timeweb Cloud Apps можно использовать nodejs runtime
// Edge runtime работает только на некоторых PaaS платформах
export const runtime = 'nodejs'

async function callGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b',
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        { role: 'system', content: 'Кратко и по делу. Я туристический ассистент Камчатки.' },
        { role: 'user', content: prompt },
      ],
    }),
  })
  if (!r.ok) return null
  const data = await r.json()
  const content = data?.choices?.[0]?.message?.content || ''
  return content
}

async function callDeepseek(prompt: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return null
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        { role: 'system', content: 'Кратко и по делу. Я туристический ассистент Камчатки.' },
        { role: 'user', content: prompt },
      ],
    }),
  })
  if (!r.ok) return null
  const data = await r.json()
  const content = data?.choices?.[0]?.message?.content || ''
  return content
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData().catch(async () => await req.json().catch(() => null))
    const prompt = typeof (body as any)?.prompt === 'string' ? (body as any).prompt : (typeof (body as any)?.input === 'string' ? (body as any).input : '')
    const q = String(prompt || '').slice(0, 800)
    if (!q) return NextResponse.json({ error: 'EMPTY' }, { status: 400 })

    let answer = await callGroq(q)
    if (!answer) answer = await callDeepseek(q)
    if (!answer) answer = 'Сейчас не могу ответить. Попробуйте позже.'

    return NextResponse.json({ ok: true, answer })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'AI_FAILED' }, { status: 200 })
  }
}