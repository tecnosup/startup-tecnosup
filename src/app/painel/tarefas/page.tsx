"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { subscribeClientes } from "@/lib/clientes";
import { subscribeTarefas, addTarefa, toggleTarefa, deleteTarefa, Tarefa, Responsavel } from "@/lib/tarefas";
import { Cliente } from "@/lib/types";
import { Plus, Trash2, Loader2, Calendar, User } from "lucide-react";

const prioridadeConfig = {
  alta: { label: "Alta", color: "#ef4444" },
  media: { label: "Média", color: "#ffbd2e" },
  baixa: { label: "Baixa", color: "#22c55e" },
};

const responsavelConfig: Record<Responsavel, { color: string }> = {
  Cardoso: { color: "#0eb3ff" },
  Vitor: { color: "#7000ff" },
  Ambos: { color: "#ffbd2e" },
};

function prazoLabel(prazo: string | null): string | null {
  if (!prazo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const d = new Date(prazo + "T12:00:00");
  const diff = Math.round((d.getTime() - hoje.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d atrasada`;
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  return `${diff}d`;
}

function prazoColor(prazo: string | null): string {
  if (!prazo) return "#555";
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const d = new Date(prazo + "T12:00:00");
  const diff = Math.round((d.getTime() - hoje.getTime()) / 86400000);
  if (diff < 0) return "#ef4444";
  if (diff <= 1) return "#ffbd2e";
  return "#22c55e";
}

const EMPTY_FORM = {
  texto: "",
  prioridade: "media" as Tarefa["prioridade"],
  responsavel: "Cardoso" as Responsavel,
  clienteNome: "",
  prazo: "",
};

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filtroResp, setFiltroResp] = useState<Responsavel | "Todos">("Todos");

  useEffect(() => {
    const u1 = subscribeTarefas((data) => { setTarefas(data); setLoading(false); });
    const u2 = subscribeClientes(setClientes);
    return () => { u1(); u2(); };
  }, []);

  async function handleAdd() {
    if (!form.texto.trim()) return;
    setSaving(true);
    await addTarefa({
      texto: form.texto.trim(),
      feito: false,
      prioridade: form.prioridade,
      responsavel: form.responsavel,
      clienteNome: form.clienteNome,
      prazo: form.prazo || null,
      criadoEm: new Date().toISOString(),
    });
    setForm(EMPTY_FORM);
    setSaving(false);
  }

  const tarefasFiltradas = tarefas.filter((t) =>
    filtroResp === "Todos" || t.responsavel === filtroResp
  );

  const pendentes = tarefasFiltradas.filter((t) => !t.feito).sort((a, b) => {
    if (a.prazo && b.prazo) return a.prazo.localeCompare(b.prazo);
    if (a.prazo) return -1;
    if (b.prazo) return 1;
    return 0;
  });
  const concluidas = tarefasFiltradas.filter((t) => t.feito);

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none text-[#e0e0e0]";
  const inputStyle = { background: "#030407", border: "1px solid #1f3566" };

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

            <div className="mb-3">
              <input value={form.texto} onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className={inputCls} style={inputStyle}
                placeholder="Ex: Ligar para o Ortega confirmar reunião..."
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Cliente */}
              <div>
                <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">CLIENTE (opcional)</label>
                <select value={form.clienteNome}
                  onChange={(e) => setForm((f) => ({ ...f, clienteNome: e.target.value }))}
                  className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Nenhum</option>
                  {clientes.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
              </div>
              {/* Prazo */}
              <div>
                <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">PRAZO (opcional)</label>
                <input type="date" value={form.prazo}
                  onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value }))}
                  className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
              </div>
            </div>

            <div className="flex gap-2">
              {/* Prioridade */}
              <select value={form.prioridade} onChange={(e) => setForm((f) => ({ ...f, prioridade: e.target.value as Tarefa["prioridade"] }))}
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: "#030407", border: "1px solid #1f3566", color: prioridadeConfig[form.prioridade].color, cursor: "pointer" }}>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
              {/* Responsável */}
              <select value={form.responsavel} onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value as Responsavel }))}
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: "#030407", border: "1px solid #1f3566", color: responsavelConfig[form.responsavel].color, cursor: "pointer" }}>
                <option value="Cardoso">Cardoso</option>
                <option value="Vitor">Vitor</option>
                <option value="Ambos">Ambos</option>
              </select>
              {/* Botão */}
              <button onClick={handleAdd} disabled={saving || !form.texto.trim()}
                className="px-4 py-2 rounded-lg font-orbitron text-xs font-bold text-black flex items-center gap-1.5 transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)" }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <><Plus size={13} /> ADICIONAR</>}
              </button>
            </div>
          </div>

          {/* Filtro de responsável */}
          <div className="flex gap-2 mb-5 max-w-2xl">
            {(["Todos", "Cardoso", "Vitor", "Ambos"] as const).map((r) => {
              const active = filtroResp === r;
              const color = r === "Todos" ? "#0eb3ff" : responsavelConfig[r as Responsavel]?.color ?? "#0eb3ff";
              return (
                <button key={r} onClick={() => setFiltroResp(r)}
                  className="px-3 py-1.5 rounded-lg text-xs font-orbitron transition-all"
                  style={{
                    background: active ? `${color}15` : "transparent",
                    color: active ? color : "#555",
                    border: `1px solid ${active ? color + "44" : "#1f3566"}`,
                  }}>
                  {r}
                </button>
              );
            })}
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
                      const rc = responsavelConfig[t.responsavel ?? "Cardoso"];
                      const pl = prazoLabel(t.prazo ?? null);
                      const pc = prazoColor(t.prazo ?? null);
                      return (
                        <div key={t.id}
                          className="flex items-start gap-3 px-4 py-3 rounded-lg border"
                          style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                          <button onClick={() => toggleTarefa(t.id, true)}
                            className="shrink-0 w-4 h-4 rounded-full border transition-all hover:border-[#0eb3ff] mt-0.5"
                            style={{ borderColor: "#1f3566" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#e0e0e0] break-words">{t.texto}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {t.clienteNome && (
                                <span className="text-[10px] text-[#0eb3ff] font-mono">{t.clienteNome}</span>
                              )}
                              {pl && (
                                <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: pc }}>
                                  <Calendar size={9} />{pl}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-orbitron px-2 py-0.5 rounded flex items-center gap-1"
                              style={{ color: rc.color, background: `${rc.color}15`, border: `1px solid ${rc.color}33` }}>
                              <User size={8} />{t.responsavel ?? "Cardoso"}
                            </span>
                            <span className="text-[10px] font-orbitron px-2 py-0.5 rounded"
                              style={{ color: p.color, background: `${p.color}15`, border: `1px solid ${p.color}33` }}>
                              {p.label}
                            </span>
                            <button onClick={() => deleteTarefa(t.id)}
                              className="text-[#444] hover:text-red-400 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
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
                        {t.clienteNome && (
                          <span className="text-[10px] text-[#444] font-mono shrink-0">{t.clienteNome}</span>
                        )}
                        <button onClick={() => deleteTarefa(t.id)}
                          className="text-[#333] hover:text-red-400 transition-colors shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tarefasFiltradas.length === 0 && (
                <p className="text-center text-[#555] text-sm py-12">
                  {filtroResp === "Todos" ? "Nenhuma tarefa. Aproveite!" : `Nenhuma tarefa para ${filtroResp}.`}
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
