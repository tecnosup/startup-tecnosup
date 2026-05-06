"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { subscribeClientes, updateCliente, addHistorico } from "@/lib/clientes";
import { subscribePagamentos, addPagamento, deletePagamento } from "@/lib/pagamentos";
import { Cliente, Pagamento } from "@/lib/types";
import { LucideIcon, Plus, Trash2, Loader2, DollarSign, TrendingUp, Calendar, Download } from "lucide-react";

const TIPOS = ["mensalidade", "setup", "avulso"] as const;
const tipoLabel: Record<string, string> = {
  mensalidade: "Mensalidade",
  setup: "Setup",
  avulso: "Avulso",
};
const tipoColor: Record<string, string> = {
  mensalidade: "#0eb3ff",
  setup: "#7000ff",
  avulso: "#22c55e",
};

function StatCard({ icon: Icon, label, value, sub }: {
  icon: LucideIcon; label: string; value: string; sub?: string;
}) {
  return (
    <div className="rounded-xl border p-5 flex items-start gap-4"
      style={{ background: "#0b1121", borderColor: "#1f3566" }}>
      <div className="p-2.5 rounded-lg" style={{ background: "rgba(14,179,255,0.08)", border: "1px solid #0eb3ff22" }}>
        <Icon size={18} style={{ color: "#0eb3ff" }} />
      </div>
      <div>
        <p className="text-[10px] font-orbitron tracking-widest text-[#555] mb-1">{label}</p>
        <p className="font-orbitron text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-[#aaa] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function FinanceiroPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    clienteId: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    descricao: "",
    tipo: "mensalidade" as Pagamento["tipo"],
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const u1 = subscribePagamentos((p) => { setPagamentos(p); setLoading(false); });
    const u2 = subscribeClientes(setClientes);
    return () => { u1(); u2(); };
  }, []);

  const mesAtual = new Date().toISOString().slice(0, 7);
  const receitaMes = pagamentos
    .filter((p) => p.data.startsWith(mesAtual))
    .reduce((s, p) => s + p.valor, 0);
  const receitaTotal = pagamentos.reduce((s, p) => s + p.valor, 0);
  const receitaRecorrente = clientes
    .filter((c) => c.status === "ativo")
    .reduce((s, c) => s + (c.plano ?? 0), 0);

  async function handleAdd() {
    if (!form.clienteId || !form.valor || !form.data) {
      setErro("Preencha cliente, valor e data.");
      return;
    }
    setSaving(true);
    setErro("");
    const cliente = clientes.find((c) => c.id === form.clienteId);
    try {
      await addPagamento({
        clienteId: form.clienteId,
        clienteNome: cliente?.nome ?? "",
        valor: Number(form.valor),
        data: form.data,
        descricao: form.descricao.trim(),
        tipo: form.tipo,
      });

      // vínculo automático: mensalidade paga → ativa cliente e avança renovação 1 mês
      if (form.tipo === "mensalidade" && cliente) {
        const novaRenovacao = new Date(form.data);
        novaRenovacao.setMonth(novaRenovacao.getMonth() + 1);
        const renovacaoStr = novaRenovacao.toISOString().split("T")[0];
        await updateCliente(cliente.id, { status: "ativo", renovacao: renovacaoStr });
        await addHistorico(cliente.id, {
          acao: `Mensalidade paga (R$${Number(form.valor).toLocaleString("pt-BR")}) — renovação atualizada para ${renovacaoStr}`,
          data: new Date().toISOString(),
        });
      }

      setForm((f) => ({ ...f, clienteId: "", valor: "", descricao: "" }));
    } catch {
      setErro("Erro ao registrar pagamento.");
    } finally {
      setSaving(false);
    }
  }

  function exportarCSV() {
    const header = "Data,Cliente,Tipo,Descrição,Valor\n";
    const rows = pagamentos.map((p) =>
      `${p.data},"${p.clienteNome}","${p.tipo}","${p.descricao}",${p.valor}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro-tecnosup-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all text-[#e0e0e0]";
  const inputStyle = { background: "#030407", border: "1px solid #1f3566" };

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="flex items-end justify-between mb-8 mt-14 md:mt-0">
            <div>
              <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">PAINEL</p>
              <h1 className="font-orbitron text-2xl font-bold text-white">Financeiro</h1>
            </div>
            {pagamentos.length > 0 && (
              <button onClick={exportarCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-orbitron text-[#0eb3ff] transition-all hover:bg-[#0eb3ff11]"
                style={{ border: "1px solid #0eb3ff33" }}>
                <Download size={13} /> EXPORTAR CSV
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={DollarSign} label="RECEITA ESTE MÊS"
              value={receitaMes > 0 ? `R$${receitaMes.toLocaleString("pt-BR")}` : "—"} />
            <StatCard icon={TrendingUp} label="RECEITA RECORRENTE"
              value={receitaRecorrente > 0 ? `R$${receitaRecorrente}/mês` : "—"}
              sub="mensalidades ativas" />
            <StatCard icon={Calendar} label="RECEITA TOTAL"
              value={receitaTotal > 0 ? `R$${receitaTotal.toLocaleString("pt-BR")}` : "—"}
              sub="histórico completo" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Formulário */}
            <div className="rounded-xl border p-5" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
              <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-4">REGISTRAR PAGAMENTO</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">CLIENTE</label>
                  <select value={form.clienteId} onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}
                    className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Selecionar...</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">TIPO</label>
                  <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as Pagamento["tipo"] }))}
                    className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                    {TIPOS.map((t) => <option key={t} value={t}>{tipoLabel[t]}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">VALOR (R$)</label>
                    <input type="number" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                      className={inputCls} style={inputStyle} placeholder="129"
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">DATA</label>
                    <input type="date" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                      className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">DESCRIÇÃO (opcional)</label>
                  <input value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                    className={inputCls} style={inputStyle} placeholder="Ex: Maio 2026"
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                </div>
                {erro && <p className="text-xs text-red-400">{erro}</p>}
                <button onClick={handleAdd} disabled={saving}
                  className="w-full py-2.5 rounded-lg font-orbitron text-xs font-bold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 20px rgba(14,179,255,0.2)" }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> REGISTRAR</>}
                </button>
              </div>
            </div>

            {/* Histórico */}
            <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ borderColor: "#1f3566" }}>
              <div className="px-5 py-4 border-b" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                <p className="font-orbitron text-[10px] tracking-widest text-[#555]">HISTÓRICO</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-16" style={{ background: "#0b1121" }}>
                  <Loader2 size={20} className="animate-spin text-[#0eb3ff]" />
                </div>
              ) : pagamentos.length === 0 ? (
                <div className="py-16 text-center" style={{ background: "#0b1121" }}>
                  <p className="text-[#555] text-sm">Nenhum pagamento registrado.</p>
                </div>
              ) : (
                <div style={{ background: "#0b1121" }}>
                  {pagamentos.map((p, i) => (
                    <div key={p.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.01] transition-colors"
                      style={{ borderBottom: i < pagamentos.length - 1 ? "1px solid #1f356644" : "none" }}>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-orbitron px-2 py-0.5 rounded"
                          style={{ color: tipoColor[p.tipo], background: `${tipoColor[p.tipo]}15`, border: `1px solid ${tipoColor[p.tipo]}33` }}>
                          {tipoLabel[p.tipo]}
                        </span>
                        <div>
                          <p className="text-sm text-white">{p.clienteNome}</p>
                          {p.descricao && <p className="text-xs text-[#555]">{p.descricao}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">R${p.valor.toLocaleString("pt-BR")}</p>
                          <p className="text-xs text-[#555] font-mono">{p.data}</p>
                        </div>
                        <button onClick={() => deletePagamento(p.id)}
                          className="text-[#444] hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
