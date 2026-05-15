'use client'

import { useState } from 'react'
import { Sparkles, Copy, Download, Loader2 } from 'lucide-react'
import AuthGuard from '@/components/painel/AuthGuard'
import Sidebar from '@/components/painel/Sidebar'

interface CriativoResult {
  caption: string
  hashtags: string[]
  promptImagem: string
  imagemUrl: string | null
}

export default function CriativosPage() {
  const [tema, setTema] = useState('')
  const [tipo, setTipo] = useState('portfólio de cliente')
  const [tom, setTom] = useState('profissional')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<CriativoResult | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function gerar() {
    if (!tema.trim()) return
    setLoading(true)
    setErro(null)
    setResultado(null)

    try {
      const res = await fetch('/api/criativos/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema, tipo, tom }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar criativo')
      setResultado(data)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  async function copiarCaption() {
    if (!resultado) return
    const texto = `${resultado.caption}\n\n${resultado.hashtags.map(h => `#${h}`).join(' ')}`
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: '#030407' }}>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-semibold text-white">Criativos Instagram</h1>
            </div>

            <div className="space-y-4 bg-zinc-900 rounded-xl p-5 border border-zinc-800">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Tema do post</label>
                <input
                  type="text"
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  placeholder="Ex: mostrar o sistema de agendamento do Ortega"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Tipo</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option>portfólio de cliente</option>
                    <option>educativo</option>
                    <option>bastidores</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Tom</label>
                  <select
                    value={tom}
                    onChange={e => setTom(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option>profissional</option>
                    <option>descontraído</option>
                  </select>
                </div>
              </div>

              <button
                onClick={gerar}
                disabled={loading || !tema.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : 'Gerar criativo'}
              </button>
            </div>

            {erro && (
              <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">{erro}</div>
            )}

            {resultado && (
              <div className="space-y-4">
                {resultado.imagemUrl && (
                  <div className="relative">
                    <img src={resultado.imagemUrl} alt="Criativo gerado" className="w-full rounded-xl" />
                    <a
                      href={resultado.imagemUrl}
                      download="criativo.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Baixar
                    </a>
                  </div>
                )}

                <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 uppercase tracking-wide">Caption</span>
                    <button
                      onClick={copiarCaption}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> {copiado ? 'Copiado!' : 'Copiar tudo'}
                    </button>
                  </div>
                  <p className="text-zinc-200 text-sm whitespace-pre-line">{resultado.caption}</p>
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-zinc-800">
                    {resultado.hashtags.map(h => (
                      <span key={h} className="text-xs text-blue-400">#{h}</span>
                    ))}
                  </div>
                </div>

                {resultado.promptImagem && (
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Prompt de imagem</p>
                    <p className="text-zinc-400 text-xs">{resultado.promptImagem}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
