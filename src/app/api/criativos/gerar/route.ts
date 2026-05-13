import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { tema, tipo, tom } = await req.json()

  if (!tema || !tipo || !tom) {
    return NextResponse.json({ error: 'Campos obrigatórios: tema, tipo, tom' }, { status: 400 })
  }

  const geminiKey = process.env.GEMINI_API_KEY
  const recraftKey = process.env.RECRAFT_API_KEY

  if (!geminiKey || !recraftKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY ou RECRAFT_API_KEY não configuradas' }, { status: 500 })
  }

  // Gerar copy e prompt de imagem via Gemini
  const promptGemini = `
Você é um especialista em marketing digital para pequenos negócios locais no Brasil.
A Tecnosup é uma agência digital de Cruzeiro-SP que desenvolve sites, sistemas de agendamento e e-commerces para barbearias e lojas de roupa.

Gere um post para o Instagram da Tecnosup com as seguintes especificações:
- Tema: ${tema}
- Tipo: ${tipo}
- Tom: ${tom}

Retorne APENAS um JSON válido com esta estrutura (sem markdown, sem explicações):
{
  "caption": "texto do post em português, máximo 150 palavras, com quebras de linha naturais, sem hashtags",
  "hashtags": ["hashtag1", "hashtag2", ...] (exatamente 10 hashtags relevantes para agência digital em Cruzeiro-SP),
  "promptImagem": "prompt em inglês para gerar uma imagem profissional que represente o tema, estilo fotorrealista ou editorial"
}
`

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptGemini }] }] }),
    }
  )

  const geminiData = await geminiRes.json()
  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  let parsed: { caption: string; hashtags: string[]; promptImagem: string }
  try {
    const clean = rawText.replace(/```json|```/g, '').trim()
    parsed = JSON.parse(clean)
  } catch {
    return NextResponse.json({ error: 'Gemini retornou formato inválido', raw: rawText }, { status: 500 })
  }

  // Gerar imagem via Recraft
  const recraftRes = await fetch('https://external.api.recraft.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${recraftKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: parsed.promptImagem,
      style: 'realistic_image',
      width: 1080,
      height: 1080,
    }),
  })

  const recraftData = await recraftRes.json()
  const imagemUrl = recraftData.data?.[0]?.url ?? null

  return NextResponse.json({
    caption: parsed.caption,
    hashtags: parsed.hashtags,
    promptImagem: parsed.promptImagem,
    imagemUrl,
  })
}
