const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

export async function callGemini(prompt: string, config?: { maxOutputTokens?: number; temperature?: number }): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY não configurada')

  const res = await fetch(`${BASE_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      ...(config ? { generationConfig: config } : {}),
    }),
  })

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}

export function parseGeminiJson<T>(raw: string): T {
  const stripped = raw.replace(/```json|```/g, '').trim()
  const match = stripped.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('no json block in gemini response')
  return JSON.parse(match[0]) as T
}
