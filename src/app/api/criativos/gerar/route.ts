import { NextRequest, NextResponse } from 'next/server'
import { callGemini, parseGeminiJson } from '@/lib/gemini'

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { tema, tipo, tom } = await req.json()

  if (!tema || !tipo || !tom) {
    return NextResponse.json({ error: 'Campos obrigatórios: tema, tipo, tom' }, { status: 400 })
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada' }, { status: 500 })
  }

  const prompt = `
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

  let parsed: { caption: string; hashtags: string[]; promptImagem: string }
  try {
    const raw = await callGemini(prompt)
    parsed = parseGeminiJson(raw)
  } catch {
    return NextResponse.json({ error: 'Gemini retornou formato inválido' }, { status: 500 })
  }

  const imagemUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(parsed.promptImagem)}?width=1080&height=1080&nologo=true`

  return NextResponse.json({
    caption: parsed.caption,
    hashtags: parsed.hashtags,
    promptImagem: parsed.promptImagem,
    imagemUrl,
  })
}
