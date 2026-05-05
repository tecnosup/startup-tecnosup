"use client";
import { useEffect, useState, useMemo } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import ClienteModal from "@/components/painel/ClienteModal";
import { subscribeClientes, deleteCliente, updateChecklist, updateNotas } from "@/lib/clientes";
import { Cliente, ChecklistItem } from "@/lib/types";
import {
  LucideIcon, ExternalLink, ChevronDown, ChevronUp,
  MessageCircle, Globe, Database, Cloud, CheckCircle, Clock, AlertCircle,
  Plus, Pencil, Trash2, Loader2, Search, StickyNote, History,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  ativo: { label: "Ativo", color: "#22c55e", icon: CheckCircle },
  dev: { label: "Em desenvolvimento", color: "#ffbd2e", icon: Clock },
  inadimplente: { label: "Inadimplente", color: "#ef4444", icon: AlertCircle },
};

function isInadimplente(cliente: Cliente): boolean {
  if (cliente.status !== "ativo" || !cliente.renovacao) return false;
  return new Date(cliente.renovacao) < new Date();
}

function ClienteCard({ cliente, onEdit, onDelete }: {
  cliente: Cliente; onEdit: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"info" | "notas" | "historico">("info");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(cliente.checklist);
  const [notas, setNotas] = useState(cliente.notas ?? "");
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [savingNotas, setSavingNotas] = useState(false);
  const [notasTimer, setNotasTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setChecklist(cliente.checklist); }, [cliente.checklist]);
  useEffect(() => { setNotas(cliente.notas ?? ""); }, [cliente.notas]);

  const inadimplente = isInadimplente(cliente);
  const statusKey = inadimplente ? "inadimplente" : cliente.status;
  const s = statusConfig[statusKey] ?? statusConfig.dev;
  const StatusIcon = s.icon;
  const progresso = checklist.filter((t) => t.feito).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((progresso / total) * 100) : 0;

  async function toggleItem(i: number) {
    const updated = checklist.map((t, idx) => idx === i ? { ...t, feito: !t.feito } : t);
    setChecklist(updated);
    setSavingChecklist(true);
    await updateChecklist(cliente.id, updated);
    setSavingChecklist(false);
  }

  function handleNotasChange(val: string) {
    setNotas(val);
    if (notasTimer) clearTimeout(notasTimer);
    setSavingNotas(true);
    setNotasTimer(setTimeout(async () => {
      await updateNotas(cliente.id, val);
      setSavingNotas(false);
    }, 800));
  }

  const links: { label: string; url: string | null; icon: LucideIcon }[] = [
    { label: "Site", url: cliente.site, icon: Globe },
    { label: "Vercel", url: cliente.vercel, icon: ExternalLink },
    { label: "Firebase", url: cliente.firebase, icon: Database },
    { label: "Cloudinary", url: cliente.cloudinary, icon: Cloud },
    { label: "WhatsApp", url: cliente.whatsapp ? `https://wa.me/${cliente.whatsapp}` : null, icon: MessageCircle },
  ];

  return (
    <div className="rounded-xl border overflow-hidden transition-all"
      style={{ background: "#0b1121", borderColor: inadimplente ? "#ef444433" : "#1f3566" }}>

      <div className="px-6 py-5 flex items-center justify-between">
        <button className="flex items-center gap-4 flex-1 text-left" onClick={() => setOpen((v) => !v)}>
          <div>
            <h3 className="font-orbitron text-base font-bold text-white">{cliente.nome}</h3>
            <p className="text-xs text-[#0eb3ff] mt-0.5">{cliente.segmento}</p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          {inadimplente && (
            <span className="text-[10px] font-orbitron px-2 py-0.5 rounded hidden sm:block"
              style={{ color: "#ef4444", background: "#ef444415", border: "1px solid #ef444433" }}>
              VENCIDO
            </span>
          )}
          <span className="text-xs font-orbitron px-2.5 py-1 rounded-md flex items-center gap-1.5"
            style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}33` }}>
            <StatusIcon size={11} />{s.label}
          </span>
          <button onClick={onEdit}
            className="p-1.5 rounded-lg text-[#555] hover:text-[#0eb3ff] transition-colors" title="Editar">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg text-[#555] hover:text-red-400 transition-colors" title="Remover">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setOpen((v) => !v)} className="text-[#555]">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t" style={{ borderColor: "#1f3566" }}>
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: "#1f3566" }}>
            {([
              { key: "info", label: "Info", icon: Globe },
              { key: "notas", label: "Notas", icon: StickyNote },
              { key: "historico", label: "Histórico", icon: History },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className="flex items-center gap-1.5 px-5 py-3 text-xs font-orbitron tracking-wide transition-all border-b-2"
                style={{
                  color: tab === key ? "#0eb3ff" : "#555",
                  borderColor: tab === key ? "#0eb3ff" : "transparent",
                  background: "transparent",
                }}>
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          <div className="px-6 py-5">
            {/* Tab: Info */}
            {tab === "info" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3">INFORMAÇÕES</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#aaa]">Mensalidade</span>
                        <span className="text-white">{cliente.plano ? `R$${cliente.plano}/mês` : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#aaa]">Renovação</span>
                        <span className="font-mono text-xs"
                          style={{ color: inadimplente ? "#ef4444" : "#e0e0e0" }}>
                          {cliente.renovacao ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3">LINKS RÁPIDOS</p>
                    <div className="flex flex-wrap gap-2">
                      {links.map(({ label, url, icon: Icon }) =>
                        url ? (
                          <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:text-white"
                            style={{ background: "rgba(14,179,255,0.06)", color: "#0eb3ff", border: "1px solid #0eb3ff22" }}>
                            <Icon size={12} />{label}
                          </a>
                        ) : (
                          <span key={label}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                            style={{ background: "rgba(255,255,255,0.03)", color: "#444", border: "1px solid #1f356633" }}>
                            <Icon size={12} />{label}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-orbitron text-[10px] tracking-widest text-[#555]">ONBOARDING</p>
                    <div className="flex items-center gap-2">
                      {savingChecklist && <Loader2 size={11} className="animate-spin text-[#0eb3ff]" />}
                      <span className="text-xs font-mono" style={{ color: pct === 100 ? "#22c55e" : "#ffbd2e" }}>
                        {progresso}/{total} — {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full mb-4" style={{ background: "#1f3566" }}>
                    <div className="h-1 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: pct === 100 ? "#22c55e" : "linear-gradient(90deg, #0eb3ff, #7000ff)" }} />
                  </div>
                  <div className="space-y-2">
                    {checklist.map((t, i) => (
                      <button key={i} onClick={() => toggleItem(i)}
                        className="flex items-center gap-3 text-sm w-full text-left hover:opacity-80 transition-opacity">
                        <div className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all"
                          style={{ background: t.feito ? "#22c55e22" : "transparent", border: `1px solid ${t.feito ? "#22c55e" : "#1f3566"}` }}>
                          {t.feito && <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />}
                        </div>
                        <span style={{ color: t.feito ? "#555" : "#e0e0e0", textDecoration: t.feito ? "line-through" : "none" }}>
                          {t.tarefa}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Notas */}
            {tab === "notas" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-orbitron text-[10px] tracking-widest text-[#555]">NOTAS INTERNAS</p>
                  {savingNotas && (
                    <span className="text-[10px] text-[#0eb3ff] flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> salvando...
                    </span>
                  )}
                </div>
                <textarea
                  value={notas}
                  onChange={(e) => handleNotasChange(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-all text-[#e0e0e0]"
                  style={{ background: "#030407", border: "1px solid #1f3566" }}
                  placeholder="Observações, combinados, histórico de contato..."
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")}
                />
              </div>
            )}

            {/* Tab: Histórico */}
            {tab === "historico" && (
              <div>
                <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-4">HISTÓRICO DE ALTERAÇÕES</p>
                {(!cliente.historico || cliente.historico.length === 0) ? (
                  <p className="text-sm text-[#555]">Nenhum registro ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {[...cliente.historico].reverse().map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b"
                        style={{ borderColor: "#1f356644" }}>
                        <span className="text-[#e0e0e0]">{h.acao}</span>
                        <span className="text-xs text-[#555] font-mono">
                          {new Date(h.data).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; cliente?: Cliente }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<Cliente | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "dev" | "inadimplente">("todos");

  useEffect(() => {
    const unsub = subscribeClientes((data) => {
      // marca inadimplentes automaticamente
      const processados = data.map((c) => isInadimplente(c) ? { ...c, status: "inadimplente" as const } : c);
      setClientes(processados);
      setLoading(false);
    });
    return unsub;
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.segmento.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [clientes, busca, filtroStatus]);

  async function handleDelete(cliente: Cliente) {
    await deleteCliente(cliente.id);
    setConfirmDelete(null);
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="flex items-end justify-between mb-6 mt-14 md:mt-0">
            <div>
              <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">PAINEL</p>
              <h1 className="font-orbitron text-2xl font-bold text-white">Clientes</h1>
            </div>
            <button onClick={() => setModal({ open: true })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-orbitron text-xs font-bold text-black transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 20px rgba(14,179,255,0.2)" }}>
              <Plus size={14} /> NOVO CLIENTE
            </button>
          </div>

          {/* Busca e filtro */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none text-[#e0e0e0]"
                style={{ background: "#0b1121", border: "1px solid #1f3566" }}
                placeholder="Buscar cliente..."
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
            </div>
            <div className="flex gap-2">
              {(["todos", "ativo", "dev", "inadimplente"] as const).map((s) => {
                const labels = { todos: "Todos", ativo: "Ativos", dev: "Em dev", inadimplente: "Inadimplentes" };
                const colors = { todos: "#0eb3ff", ativo: "#22c55e", dev: "#ffbd2e", inadimplente: "#ef4444" };
                const active = filtroStatus === s;
                return (
                  <button key={s} onClick={() => setFiltroStatus(s)}
                    className="px-3 py-2 rounded-lg text-xs font-orbitron transition-all"
                    style={{
                      background: active ? `${colors[s]}15` : "transparent",
                      color: active ? colors[s] : "#555",
                      border: `1px solid ${active ? colors[s] + "44" : "#1f3566"}`,
                    }}>
                    {labels[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[#0eb3ff]" />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#555] font-orbitron text-sm">
                {clientes.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum resultado encontrado."}
              </p>
              {clientes.length === 0 && (
                <button onClick={() => setModal({ open: true })}
                  className="mt-4 text-[#0eb3ff] text-xs hover:underline">
                  Adicionar primeiro cliente →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {clientesFiltrados.map((c) => (
                <ClienteCard key={c.id} cliente={c}
                  onEdit={() => setModal({ open: true, cliente: c })}
                  onDelete={() => setConfirmDelete(c)} />
              ))}
            </div>
          )}
        </main>
      </div>

      {modal.open && (
        <ClienteModal cliente={modal.cliente} onClose={() => setModal({ open: false })} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-xl border p-6 text-center"
            style={{ background: "#0b1121", borderColor: "#1f3566" }}>
            <p className="font-orbitron text-sm font-bold text-white mb-2">Remover cliente?</p>
            <p className="text-xs text-[#aaa] mb-6">
              <span className="text-white">{confirmDelete.nome}</span> será removido permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg text-sm text-[#aaa] hover:text-white transition-colors"
                style={{ border: "1px solid #1f3566" }}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-lg font-orbitron text-xs font-bold transition-all hover:scale-[1.02]"
                style={{ background: "#ef444422", border: "1px solid #ef444444", color: "#ef4444" }}>
                REMOVER
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
