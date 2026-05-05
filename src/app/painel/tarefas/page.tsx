"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { subscribeTarefas, addTarefa, toggleTarefa, deleteTarefa, Tarefa } from "@/lib/tarefas";
import { Plus, Trash2, Loader2 } from "lucide-react";

const prioridadeConfig = {
  alta: { label: "Alta", color: "#ef4444" },
  media: { label: "Média", color: "#ffbd2e" },
  baixa: { label: "Baixa", color: "#22c55e" },
};

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [prioridade, setPrioridade] = useState<Tarefa["prioridade"]>("media");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return subscribeTarefas((data) => { setTarefas(data); setLoading(false); });
  }, []);

  async function handleAdd() {
    if (!texto.trim()) return;
    setSaving(true);
    await addTarefa({
      texto: texto.trim(),
      feito: false,
      prioridade,
      criadoEm: new Date().toISOString(),
    });
    setTexto("");
    setSaving(false);
  }

  const pendentes = tarefas.filter((t) => !t.feito);
  const concluidas = tarefas.filter((t) => t.feito);

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="mb-8 mt-14 md:mt-0">
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">PAINEL</p>
            <h1 className="font-orbitron text-2xl font-bold text-white">Tarefas</h1>
            <p className="text-sm text-[#555] mt-1">Pendências internas da Tecnosup</p>
          </div>

          {/* Input nova tarefa */}
          <div className="rounded-xl border p-5 mb-6 max-w-2xl"
            style={{ background: "#0b1121", borderColor: "#1f3566" }}>
            <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3">NOVA TAREFA</p>
            <div className="flex gap-2 mb-3">
              <input value={texto} onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none text-[#e0e0e0]"
                style={{ background: "#030407", border: "1px solid #1f3566" }}
                placeholder="Ex: Ligar para o Ortega confirmar reunião..."
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
              <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as Tarefa["prioridade"])}
                className="px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: "#030407", border: "1px solid #1f3566", color: prioridadeConfig[prioridade].color, cursor: "pointer" }}>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
              <button onClick={handleAdd} disabled={saving || !texto.trim()}
                className="px-4 py-2 rounded-lg font-orbitron text-xs font-bold text-black flex items-center gap-1.5 transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)" }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <><Plus size={13} /> ADICIONAR</>}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[#0eb3ff]" />
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              {/* Pendentes */}
              {pendentes.length > 0 && (
                <div>
                  <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3">
                    PENDENTES — {pendentes.length}
                  </p>
                  <div className="space-y-2">
                    {pendentes.map((t) => {
                      const p = prioridadeConfig[t.prioridade];
                      return (
                        <div key={t.id}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                          style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                          <button onClick={() => toggleTarefa(t.id, true)}
                            className="shrink-0 w-4 h-4 rounded-full border transition-all hover:border-[#0eb3ff]"
                            style={{ borderColor: "#1f3566" }} />
                          <span className="flex-1 text-sm text-[#e0e0e0]">{t.texto}</span>
                          <span className="text-[10px] font-orbitron px-2 py-0.5 rounded shrink-0"
                            style={{ color: p.color, background: `${p.color}15`, border: `1px solid ${p.color}33` }}>
                            {p.label}
                          </span>
                          <button onClick={() => deleteTarefa(t.id)}
                            className="text-[#444] hover:text-red-400 transition-colors shrink-0">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Concluídas */}
              {concluidas.length > 0 && (
                <div>
                  <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3">
                    CONCLUÍDAS — {concluidas.length}
                  </p>
                  <div className="space-y-2">
                    {concluidas.map((t) => (
                      <div key={t.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg border opacity-50"
                        style={{ background: "#0b1121", borderColor: "#1f356644" }}>
                        <button onClick={() => toggleTarefa(t.id, false)}
                          className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: "#22c55e22", border: "1px solid #22c55e" }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                        </button>
                        <span className="flex-1 text-sm text-[#555] line-through">{t.texto}</span>
                        <button onClick={() => deleteTarefa(t.id)}
                          className="text-[#333] hover:text-red-400 transition-colors shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tarefas.length === 0 && (
                <p className="text-center text-[#555] text-sm py-12">Nenhuma tarefa. Aproveite!</p>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
