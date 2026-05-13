import { NextResponse } from 'next/server'

const PROJETOS = [
  { nome: 'Ortega Barber', url: 'https://ortega.vercel.app', cliente: 'Igor Ortega' },
  { nome: 'NYX.', url: 'https://nyx-bice.vercel.app', cliente: 'Giovana' },
]

const PROBLEMAS_CONHECIDOS = ['lorem ipsum', 'placeholder', 'undefined', 'NaN', 'TODO', 'FIXME']

export async function GET() {
  const resultados = await Promise.all(
    PROJETOS.map(async (projeto) => {
      const inicio = Date.now()
      try {
        const res = await fetch(projeto.url, { next: { revalidate: 0 } })
        const tempo = Date.now() - inicio
        const html = await res.text()

        const problemasEncontrados = PROBLEMAS_CONHECIDOS.filter(p =>
          html.toLowerCase().includes(p.toLowerCase())
        )

        return {
          nome: projeto.nome,
          url: projeto.url,
          cliente: projeto.cliente,
          status: res.ok ? 'ok' : 'erro',
          httpStatus: res.status,
          tempoMs: tempo,
          problemas: problemasEncontrados,
          verificadoEm: new Date().toISOString(),
        }
      } catch {
        return {
          nome: projeto.nome,
          url: projeto.url,
          cliente: projeto.cliente,
          status: 'erro',
          httpStatus: 0,
          tempoMs: Date.now() - inicio,
          problemas: ['Site inacessível'],
          verificadoEm: new Date().toISOString(),
        }
      }
    })
  )

  return NextResponse.json(resultados)
}
