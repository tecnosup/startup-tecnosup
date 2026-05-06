"use client";
import { useEffect, useState, useMemo } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import {
  subscribeOS, subscribeClientesAT, addOS, updateOS, deleteOS, addClienteAT,
  OrdemServico, ClienteAT, OSStatus,
} from "@/lib/assistencia";
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp, Search, UserPlus, X } from "lucide-react";

const statusConfig: Record<OSStatus, { label: string; color: string }> = {
  aguardando: { label: "Aguardando", color: "#ffbd2e" },
  em_andamento: { label: "Em andamento", color: "#0eb3ff" },
  concluido: { label: "Concluído", color: "#22c55e" },
  cancelado: { label: "Cancelado", color: "#ef4444" },
};

const EMPTY_OS: Omit<OrdemServico, "id"> = {
  clienteId: "", clienteNome: "", equipamento: "", problema: "",
  diagnostico: "", valor: 0, status: "aguardando",
  dataEntrada: new Date().toISOString().split("T")[0], dataSaida: null,
  criadoEm: new Date().toISOString(),
};

function OSModal({ os, clientes, onClose }: {
  os?: OrdemServico; clientes: ClienteAT[]; onClose: () => void;
}) {
  const editing = !!os;
  const [form, setForm] = useState<Omit<OrdemServico, "id">>(
    os ? { clienteId: os.clienteId, clienteNome: os.clienteNome, equipamento: os.equipamento, problema: os.problema, diagnostico: os.diagnostico, valor: os.valor, status: os.status, dataEntrada: os.dataEntrada, dataSaida: os.dataSaida, criadoEm: os.criadoEm }
      : EMPTY_OS
  );
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // criação rápida de cliente AT inline
  const [novoCliente, setNovoCliente] = useState(false);
  const [ncNome, setNcNome] = useState("");
  const [ncTelefone, setNcTelefone] = useState("");
  const [ncLoading, setNcLoading] = useState(false);

  async function handleCriarCliente() {
    if (!ncNome.trim()) return;
    setNcLoading(true);
    try {
      const id = await addClienteAT({
        nome: ncNome.trim(),
        telefone: ncTelefone.trim(),
        email: "",
        criadoEm: new Date().toISOString(),
      });
      setForm((f) => ({ ...f, clienteId: id, clienteNome: ncNome.trim() }));
      setNovoCliente(false);
      setNcNome("");
      setNcTelefone("");
    } catch { setErro("Erro ao criar cliente."); }
    finally { setNcLoading(false); }
  }

  function handleClienteChange(id: string) {
    const c = clientes.find((c) => c.id === id);
    setForm((f) => ({ ...f, clienteId: id, clienteNome: c?.nome ?? "" }));
  }

  async function handleSave() {
    if (!form.clienteId || !form.equipamento || !form.problema) {
      setErro("Preencha cliente, equipamento e problema."); return;
    }
    setLoading(true);
    try {
      if (editing) await updateOS(os.id, form);
      else await addOS({ ...form, criadoEm: new Date().toISOString() });
      onClose();
    } catch { setErro("Erro ao salvar."); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none text-[#e0e0e0]";
  const inputStyle = { background: "#030407", border: "1px solid #1f3566" };
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl rounded-xl border" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#1f3566" }}>
          <div>
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff]">ASSISTÊNCIA TÉCNICA</p>
            <h2 className="font-orbitron text-base font-bold text-white mt-0.5">
              {editing ? "Editar OS" : "Nova Ordem de Serviço"}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors text-xl">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="CLIENTE">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select value={form.clienteId} onChange={(e) => handleClienteChange(e.target.value)}
                    className={inputCls} style={{ ...inputStyle, cursor: "pointer", flex: 1 }}>
                    <option value="">Selecionar...</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <button type="button" onClick={() => setNovoCliente((v) => !v)}
                    title="Criar novo cliente"
                    className="px-2.5 rounded-lg transition-all hover:bg-[#0eb3ff11] shrink-0"
                    style={{ border: `1px solid ${novoCliente ? "#0eb3ff55" : "#1f3566"}`, color: novoCliente ? "#0eb3ff" : "#555" }}>
                    {novoCliente ? <X size={14} /> : <UserPlus size={14} />}
                  </button>
                </div>
                {novoCliente && (
                  <div className="rounded-lg p-3 space-y-2" style={{ background: "#030407", border: "1px solid #0eb3ff22" }}>
                    <p className="text-[10px] font-orbitron tracking-widest text-[#0eb3ff]">NOVO CLIENTE AT</p>
                    <input value={ncNome} onChange={(e) => setNcNome(e.target.value)}
                      className={inputCls} style={inputStyle} placeholder="Nome *"
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                    <input value={ncTelefone} onChange={(e) => setNcTelefone(e.target.value)}
                      className={inputCls} style={inputStyle} placeholder="WhatsApp (opcional)"
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                    <button onClick={handleCriarCliente} disabled={ncLoading || !ncNome.trim()}
                      className="w-full py-1.5 rounded-lg font-orbitron text-[10px] font-bold text-black flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                      style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)" }}>
                      {ncLoading ? <Loader2 size={12} className="animate-spin" /> : <><Plus size={12} /> CRIAR E SELECIONAR</>}
                    </button>
                  </div>
                )}
              </div>
            </Field>
            <Field label="STATUS">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OSStatus }))}
                className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                {(Object.keys(statusConfig) as OSStatus[]).map((s) => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="EQUIPAMENTO">
            <input value={form.equipamento} onChange={(e) => setForm((f) => ({ ...f, equipamento: e.target.value }))}
              className={inputCls} style={inputStyle} placeholder="Ex: Notebook Dell Inspiron 15"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
          </Field>
          <Field label="PROBLEMA RELATADO">
            <textarea value={form.problema} onChange={(e) => setForm((f) => ({ ...f, problema: e.target.value }))}
              rows={2} className={`${inputCls} resize-none`} style={inputStyle}
              placeholder="O que o cliente descreveu..."
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
          </Field>
          <Field label="DIAGNÓSTICO">
            <textarea value={form.diagnostico} onChange={(e) => setForm((f) => ({ ...f, diagnostico: e.target.value }))}
              rows={2} className={`${inputCls} resize-none`} style={inputStyle}
              placeholder="O que foi identificado..."
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="VALOR (R$)">
              <input type="number" value={form.valor || ""} onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))}
                className={inputCls} style={inputStyle} placeholder="0"
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
            </Field>
            <Field label="ENTRADA">
              <input type="date" value={form.dataEntrada} onChange={(e) => setForm((f) => ({ ...f, dataEntrada: e.target.value }))}
                className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }} />
            </Field>
            <Field label="SAÍDA">
              <input type="date" value={form.dataSaida ?? ""} onChange={(e) => setForm((f) => ({ ...f, dataSaida: e.target.value || null }))}
                className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }} />
            </Field>
          </div>
          {erro && <p className="text-xs text-red-400">{erro}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm text-[#aaa] hover:text-white transition-colors"
              style={{ border: "1px solid #1f3566" }}>Cancelar</button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 py-2.5 rounded-lg font-orbitron text-xs font-bold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)" }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : editing ? "SALVAR" : "CRIAR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdensPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<ClienteAT[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; os?: OrdemServico }>({ open: false });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<OSStatus | "todos">("todos");
  const [confirmDelete, setConfirmDelete] = useState<OrdemServico | null>(null);

  useEffect(() => {
    const u1 = subscribeOS((data) => { setOrdens(data); setLoading(false); });
    const u2 = subscribeClientesAT(setClientes);
    return () => { u1(); u2(); };
  }, []);

  const filtradas = useMemo(() => ordens.filter((o) => {
    const matchBusca = o.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      o.equipamento.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || o.status === filtroStatus;
    return matchBusca && matchStatus;
  }), [ordens, busca, filtroStatus]);

  const receitaOS = ordens.filter((o) => o.status === "concluido").reduce((s, o) => s + o.valor, 0);

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="flex items-end justify-between mb-6 mt-14 md:mt-0">
            <div>
              <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">ASSISTÊNCIA TÉCNICA</p>
              <h1 className="font-orbitron text-2xl font-bold text-white">Ordens de Serviço</h1>
            </div>
            <button onClick={() => setModal({ open: true })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-orbitron text-xs font-bold text-black transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 20px rgba(14,179,255,0.2)" }}>
              <Plus size={14} /> NOVA OS
            </button>
          </div>

          {/* Stats rápido */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(Object.entries(statusConfig) as [OSStatus, typeof statusConfig[OSStatus]][]).map(([key, s]) => {
              const count = ordens.filter((o) => o.status === key).length;
              return (
                <div key={key} className="rounded-lg border p-3" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                  <p className="text-[10px] font-orbitron tracking-widest mb-1" style={{ color: s.color }}>{s.label.toUpperCase()}</p>
                  <p className="font-orbitron text-xl font-bold text-white">{count}</p>
                </div>
              );
            })}
          </div>

          {receitaOS > 0 && (
            <div className="mb-4 text-sm text-[#aaa]">
              Receita de OS concluídas: <span className="text-white font-bold">R${receitaOS.toLocaleString("pt-BR")}</span>
            </div>
          )}

          {/* Busca e filtro */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none text-[#e0e0e0]"
                style={{ background: "#0b1121", border: "1px solid #1f3566" }}
                placeholder="Buscar por cliente ou equipamento..."
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["todos", ...Object.keys(statusConfig)] as (OSStatus | "todos")[]).map((s) => {
                const label = s === "todos" ? "Todos" : statusConfig[s].label;
                const color = s === "todos" ? "#0eb3ff" : statusConfig[s].color;
                const active = filtroStatus === s;
                return (
                  <button key={s} onClick={() => setFiltroStatus(s)}
                    className="px-3 py-2 rounded-lg text-xs font-orbitron transition-all"
                    style={{ background: active ? `${color}15` : "transparent", color: active ? color : "#555", border: `1px solid ${active ? color + "44" : "#1f3566"}` }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#0eb3ff]" /></div>
          ) : filtradas.length === 0 ? (
            <p className="text-center text-[#555] py-20 text-sm">Nenhuma ordem de serviço encontrada.</p>
          ) : (
            <div className="space-y-3 max-w-4xl">
              {filtradas.map((o) => {
                const s = statusConfig[o.status];
                const isOpen = expanded === o.id;
                return (
                  <div key={o.id} className="rounded-xl border overflow-hidden"
                    style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                    <div className="px-5 py-4 flex items-center justify-between">
                      <button className="flex-1 text-left" onClick={() => setExpanded(isOpen ? null : o.id)}>
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{o.equipamento}</p>
                            <p className="text-xs text-[#0eb3ff]">{o.clienteNome} · {o.dataEntrada}</p>
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-3">
                        {o.valor > 0 && <span className="text-sm text-white font-bold hidden sm:block">R${o.valor}</span>}
                        <span className="text-xs font-orbitron px-2.5 py-1 rounded-md"
                          style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}33` }}>
                          {s.label}
                        </span>
                        <button onClick={() => setModal({ open: true, os: o })}
                          className="p-1.5 text-[#555] hover:text-[#0eb3ff] transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setConfirmDelete(o)}
                          className="p-1.5 text-[#555] hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                        <button onClick={() => setExpanded(isOpen ? null : o.id)} className="text-[#555]">
                          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="border-t px-5 py-4 space-y-3 text-sm" style={{ borderColor: "#1f3566" }}>
                        <div>
                          <p className="text-[10px] font-orbitron tracking-widest text-[#555] mb-1">PROBLEMA</p>
                          <p className="text-[#aaa]">{o.problema || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-orbitron tracking-widest text-[#555] mb-1">DIAGNÓSTICO</p>
                          <p className="text-[#aaa]">{o.diagnostico || "—"}</p>
                        </div>
                        <div className="flex gap-6 text-xs text-[#555]">
                          <span>Entrada: <span className="text-[#aaa] font-mono">{o.dataEntrada}</span></span>
                          {o.dataSaida && <span>Saída: <span className="text-[#aaa] font-mono">{o.dataSaida}</span></span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {modal.open && <OSModal os={modal.os} clientes={clientes} onClose={() => setModal({ open: false })} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-xl border p-6 text-center"
            style={{ background: "#0b1121", borderColor: "#1f3566" }}>
            <p className="font-orbitron text-sm font-bold text-white mb-2">Remover OS?</p>
            <p className="text-xs text-[#aaa] mb-6">{confirmDelete.equipamento} — {confirmDelete.clienteNome}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg text-sm text-[#aaa]" style={{ border: "1px solid #1f3566" }}>
                Cancelar
              </button>
              <button onClick={async () => { await deleteOS(confirmDelete.id); setConfirmDelete(null); }}
                className="flex-1 py-2.5 rounded-lg font-orbitron text-xs font-bold"
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
