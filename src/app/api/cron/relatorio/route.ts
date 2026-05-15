import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
    ?? req.headers.get('authorization')?.replace('Bearer ', '')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Buscar leads criados na última semana
  const umaSemanaAtras = new Date()
  umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7)

  const leadsRef = db.collection('leads')
  const snap = await leadsRef.get()
  const todos = snap.docs.map(d => d.data())

  const recentes = todos.filter(l => {
    const criadoEm = l.criadoEm?.toDate?.() ?? new Date(l.criadoEm)
    return criadoEm >= umaSemanaAtras
  })

  const contar = (status: string) => recentes.filter(l => l.status === status).length

  // Verificar saúde dos projetos
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const saudeRes = await fetch(`${appUrl}/api/projetos/saude`)
  const projetos = await saudeRes.json() as Array<{ nome: string; tempoMs: number; status: string; problemas: string[] }>

  const projetosTexto = projetos.map(p =>
    `- ${p.nome}: ${p.status === 'ok' && p.problemas.length === 0 ? '🟢 ok' : '🔴 problema'} (${p.tempoMs}ms)`
  ).join('\n')

  const semana = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  const mensagem = `📊 *Relatório Tecnosup — semana de ${semana}*

🎯 *Leads (últimos 7 dias):*
- Novos encontrados: ${recentes.length}
- Mensagem pronta: ${contar('mensagem_pronta')}
- Contato feito: ${contar('contato_feito')}
- Responderam: ${contar('respondeu')}
- Em proposta: ${contar('proposta_enviada')}
- Fechados: ${contar('fechado')}

🖥️ *Projetos:*
${projetosTexto}

🚀 _Cron de prospecção roda em instantes._`

  const numeros = [
    process.env.TECNOSUP_WHATSAPP ?? '5512991037897',
    process.env.VITOR_WHATSAPP ?? '5512998085873',
  ]

  for (const phone of numeros) {
    await fetch(`${appUrl}/api/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message: mensagem }),
    })
  }

  return NextResponse.json({ ok: true, leadsRecentes: recentes.length, mensagem })
}
