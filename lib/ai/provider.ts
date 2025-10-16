import { config } from '@/lib/config'

export type AIModel = 'groq' | 'deepseek'

export interface AIRequest {
  system?: string
  prompt: string
  maxTokens?: number
  temperature?: number
}

export interface AIResponse<T = unknown> {
  success: boolean
  text?: string
  json?: T
  provider?: AIModel
  error?: string
}

async function callGroq(req: AIRequest): Promise<AIResponse> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return { success: false, error: 'GROQ_API_KEY missing' }
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.ai.groq.model,
      temperature: req.temperature ?? 0.2,
      max_tokens: req.maxTokens ?? 800,
      response_format: { type: 'text' },
      messages: [
        { role: 'system', content: req.system || 'Ты помощник-оператор Kamchatour.' },
        { role: 'user', content: req.prompt },
      ],
    }),
  })
  if (!r.ok) return { success: false, error: `groq ${r.status}` }
  const data = await r.json()
  const text = data?.choices?.[0]?.message?.content || ''
  return { success: true, text, provider: 'groq' }
}

async function callDeepseek(req: AIRequest): Promise<AIResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return { success: false, error: 'DEEPSEEK_API_KEY missing' }
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.ai.deepseek.model,
      temperature: req.temperature ?? 0.2,
      max_tokens: req.maxTokens ?? 800,
      messages: [
        { role: 'system', content: req.system || 'Ты помощник-оператор Kamchatour.' },
        { role: 'user', content: req.prompt },
      ],
    }),
  })
  if (!r.ok) return { success: false, error: `deepseek ${r.status}` }
  const data = await r.json()
  const text = data?.choices?.[0]?.message?.content || ''
  return { success: true, text, provider: 'deepseek' }
}

export async function complete(req: AIRequest, prefer: AIModel[] = ['groq', 'deepseek']): Promise<AIResponse> {
  const providers: Record<AIModel, (r: AIRequest) => Promise<AIResponse>> = {
    groq: callGroq,
    deepseek: callDeepseek,
  }
  for (const p of prefer) {
    const res = await providers[p](req)
    if (res.success) return res
  }
  return { success: false, error: 'no providers available' }
}

export async function completeJSON<T = unknown>(req: AIRequest, schemaHint?: string): Promise<AIResponse<T>> {
  const system = `${req.system || 'Ты помощник-оператор Kamchatour.'} Отвечай ТОЛЬКО валидным JSON. ${schemaHint || ''}`
  const res = await complete({ ...req, system })
  if (!res.success) return res as AIResponse<T>
  try {
    const json = JSON.parse(res.text || '{}') as T
    return { ...res, json } as AIResponse<T>
  } catch {
    return { success: false, error: 'invalid json', provider: res.provider }
  }
}
