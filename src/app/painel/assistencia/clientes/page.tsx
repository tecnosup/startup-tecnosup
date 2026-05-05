"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { subscribeClientesAT, addClienteAT, updateClienteAT, deleteClienteAT, ClienteAT } from "@/lib/assistencia";
import { Plus, Pencil, Trash2, Loader2, MessageCircle } from "lucide-react";

function ClienteATModal({ cliente, onClose }: { cliente?: ClienteAT; onClose: () => void }) {
  const editing = !!cliente;
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSave() {
    if (!nome.trim()) { setErro("Nome obrigatório."); return; }
    setLoading(true);
    try {
      if (editing) await updateClienteAT(cliente.id, { nome, telefone, email });
      else await addClienteAT({ nome, telefone, email, criadoEm: new Date().toISOString() });
      onClose();
    } catch { setErro("Erro ao salvar."); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none text-[#e0e0e0]";
  const inputStyle = { background: "#030407", border: "1px solid #1f3566" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-xl border" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#1f3566" }}>
          <div>
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff]">ASSISTÊNCIA TÉCNICA</p>
            <h2 className="font-orbitron text-base font-bold text-white mt-0.5">
              {editing ? "Editar cliente" : "Novo cliente"}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors text-xl">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "NOME", value: nome, set: setNome, ph: "Nome completo", type: "text" },
            { label: "TELEFONE / WHATSAPP", value: telefone, set: setTelefone, ph: "5512999999999", type: "text" },
            { label: "E-MAIL (opcional)", value: email, set: setEmail, ph: "exemplo@email.com", type: "email" },
          ].map(({ label, value, set, ph, type }) => (
            <div key={label}>
              <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">{label}</label>
              <input type={type} value={value} onChange={(e) => set(e.target.value)}
                className={inputCls} style={inputStyle} placeholder={ph}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
            </div>
          ))}
          {erro && <p className="text-xs text-red-400">{erro}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm text-[#aaa] hover:text-white"
              style={{ border: "1px solid #1f3566" }}>Cancelar</button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 py-2.5 rounded-lg font-orbitron text-xs font-bold text-black flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)" }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : editing ? "SALVAR" : "CRIAR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientesATPage() {
  const [clientes, setClientes] = useState<ClienteAT[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; cliente?: ClienteAT }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<ClienteAT | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    return subscribeClientesAT((data) => { setClientes(data); setLoading(false); });
  }, []);

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone.includes(busca)
  );

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="flex items-end justify-between mb-6 mt-14 md:mt-0">
            <div>
              <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">ASSISTÊNCIA TÉCNICA</p>
              <h1 className="font-orbitron text-2xl font-bold text-white">Clientes</h1>
            </div>
            <button onClick={() => setModal({ open: true })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-orbitron text-xs font-bold text-black transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 20px rgba(14,179,255,0.2)" }}>
              <Plus size={14} /> NOVO CLIENTE
            </button>
          </div>

          <div className="relative mb-5 max-w-sm">
            <input value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-4 pr-3 py-2 rounded-lg text-sm outline-none text-[#e0e0e0]"
              style={{ background: "#0b1121", border: "1px solid #1f3566" }}
              placeholder="Buscar por nome ou telefone..."
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#0eb3ff]" /></div>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-[#555] py-20 text-sm">
              {clientes.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum resultado."}
            </p>
          ) : (
            <div className="rounded-xl border overflow-hidden max-w-3xl" style={{ borderColor: "#1f3566" }}>
              {filtrados.map((c, i) => (
                <div key={c.id}
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    background: "#0b1121",
                    borderBottom: i < filtrados.length - 1 ? "1px solid #1f356644" : "none",
                  }}>
                  <div>
                    <p className="text-sm font-medium text-white">{c.nome}</p>
                    <p className="text-xs text-[#555] font-mono mt-0.5">{c.telefone}</p>
                    {c.email && <p className="text-xs text-[#555]">{c.email}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {c.telefone && (
                      <a href={`https://wa.me/${c.telefone}`} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-[#555] hover:text-[#22c55e] transition-colors">
                        <MessageCircle size={15} />
                      </a>
                    )}
                    <button onClick={() => setModal({ open: true, cliente: c })}
                      className="p-1.5 text-[#555] hover:text-[#0eb3ff] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(c)}
                      className="p-1.5 text-[#555] hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {modal.open && <ClienteATModal cliente={modal.cliente} onClose={() => setModal({ open: false })} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-xl border p-6 text-center"
            style={{ background: "#0b1121", borderColor: "#1f3566" }}>
            <p className="font-orbitron text-sm font-bold text-white mb-2">Remover cliente?</p>
            <p className="text-xs text-[#aaa] mb-6">{confirmDelete.nome}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg text-sm text-[#aaa]" style={{ border: "1px solid #1f3566" }}>
                Cancelar
              </button>
              <button onClick={async () => { await deleteClienteAT(confirmDelete.id); setConfirmDelete(null); }}
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
