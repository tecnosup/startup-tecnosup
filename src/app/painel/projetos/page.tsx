'use client'

import { useEffect, useState } from 'react'
import { Globe, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import AuthGuard from '@/components/painel/AuthGuard'
import Sidebar from '@/components/painel/Sidebar'

interface ProjetoSaude {
  nome: string
  url: string
  cliente: string
  status: 'ok' | 'erro'
  httpStatus: number
  tempoMs: number
  problemas: string[]
  verificadoEm: string
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<ProjetoSaude[]>([])
  const [loading, setLoading] = useState(false)
  const [ultimaVerificacao, setUltimaVerificacao] = useState<string | null>(null)

  async function verificar() {
    setLoading(true)
    try {
      const res = await fetch('/api/projetos/saude')
      const data = await res.json()
      setProjetos(data)
      setUltimaVerificacao(new Date().toLocaleTimeString('pt-BR'))
    } catch {
      console.error('Erro ao verificar projetos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { verificar() }, [])

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: '#030407' }}>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h1 className="text-xl font-semibold text-white">Saúde dos Projetos</h1>
              </div>
              <div className="flex items-center gap-3">
                {ultimaVerificacao && (
                  <span className="text-xs text-zinc-500">Última: {ultimaVerificacao}</span>
                )}
                <button
                  onClick={verificar}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Verificar agora
                </button>
              </div>
            </div>

            {loading && projetos.length === 0 && (
              <div className="flex items-center justify-center py-12 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Verificando projetos...
              </div>
            )}

            <div className="space-y-3">
              {projetos.map(p => (
                <div key={p.nome} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {p.status === 'ok' && p.problemas.length === 0
                          ? <CheckCircle className="w-4 h-4 text-green-400" />
                          : <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        }
                        <span className="text-white font-medium">{p.nome}</span>
                      </div>
                      <span className="text-xs text-zinc-500 ml-6">{p.cliente}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === 'ok' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
                    }`}>
                      {p.status === 'ok' ? `${p.tempoMs}ms` : `HTTP ${p.httpStatus}`}
                    </span>
                  </div>

                  {p.problemas.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {p.problemas.map(prob => (
                        <div key={prob} className="flex items-center gap-1.5 text-xs text-yellow-400">
                          <span>•</span> Contém &quot;{prob}&quot; no HTML
                        </div>
                      ))}
                    </div>
                  )}

                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-6 text-xs text-zinc-500 hover:text-blue-400 transition-colors block"
                  >
                    {p.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
