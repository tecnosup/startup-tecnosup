"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { subscribeClientes } from "@/lib/clientes";
import { subscribePagamentos } from "@/lib/pagamentos";
import { Cliente, Pagamento } from "@/lib/types";
import { LucideIcon, TrendingUp, Users, DollarSign, AlertCircle, Clock, CheckCircle } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: LucideIcon; label: string; value: string; sub?: string; accent?: string;
}) {
  const color = accent ?? "#0eb3ff";
  return (
    <div className="rounded-xl border p-5 flex items-start gap-4"
      style={{ background: "#0b1121", borderColor: "#1f3566" }}>
      <div className="p-2.5 rounded-lg"
        style={{ background: `${color}12`, border: `1px solid ${color}22` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-orbitron tracking-widest text-[#555] mb-1">{label}</p>
        <p className="font-orbitron text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-[#aaa] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  ativo: { label: "Ativo", color: "#22c55e", icon: CheckCircle },
  dev: { label: "Em desenvolvimento", color: "#ffbd2e", icon: Clock },
  inadimplente: { label: "Inadimplente", color: "#ef4444", icon: AlertCircle },
};

export default function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false, p = false;
    const done = () => { if (c && p) setLoading(false); };
    const u1 = subscribeClientes((data) => { setClientes(data); c = true; done(); });
    const u2 = subscribePagamentos((data) => { setPagamentos(data); p = true; done(); });
    return () => { u1(); u2(); };
  }, []);

  const ativos = clientes.filter((c) => c.status === "ativo").length;
  const emDev = clientes.filter((c) => c.status === "dev").length;
  const inadimplentes = clientes.filter((c) => c.status === "inadimplente").length;
  const receitaMensal = clientes
    .filter((c) => c.status === "ativo")
    .reduce((s, c) => s + (c.plano ?? 0), 0);

  const hoje = new Date();
  const proximasRenovacoes = clientes.filter((c) => {
    if (!c.renovacao) return false;
    const diff = (new Date(c.renovacao).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  const mesAtual = hoje.toISOString().slice(0, 7);
  const receitaMes = pagamentos
    .filter((p) => p.data.startsWith(mesAtual))
    .reduce((s, p) => s + p.valor, 0);

  const ultimosPagamentos = pagamentos.slice(0, 5);

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="mb-8">
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">PAINEL</p>
            <h1 className="font-orbitron text-2xl font-bold text-white">Dashboard</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="CLIENTES ATIVOS" value={String(ativos)} />
            <StatCard icon={TrendingUp} label="EM DESENVOLVIMENTO" value={String(emDev)} accent="#ffbd2e" />
            <StatCard
              icon={DollarSign}
              label="RECEITA RECORRENTE"
              value={receitaMensal > 0 ? `R$${receitaMensal}/mês` : "—"}
              sub="mensalidades ativas"
            />
            <StatCard
              icon={AlertCircle}
              label="INADIMPLENTES"
              value={String(inadimplentes)}
              accent={inadimplentes > 0 ? "#ef4444" : "#0eb3ff"}
              sub={inadimplentes > 0 ? "atenção necessária" : "tudo certo"}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Clientes */}
            <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ borderColor: "#1f3566" }}>
              <div className="px-5 py-4 border-b flex items-center justify-between"
                style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                <p className="font-orbitron text-[10px] tracking-widest text-[#555]">CLIENTES</p>
                <span className="text-xs text-[#555]">{clientes.length} total</span>
              </div>
              <div style={{ background: "#0b1121" }}>
                {loading ? (
                  <div className="py-12 flex justify-center">
                    <span className="w-5 h-5 border-2 border-[#0eb3ff] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : clientes.length === 0 ? (
                  <p className="py-12 text-center text-[#555] text-sm">Nenhum cliente cadastrado.</p>
                ) : (
                  clientes.map((c, i) => {
                    const s = statusConfig[c.status] ?? statusConfig.dev;
                    const StatusIcon = s.icon;
                    return (
                      <div key={c.id}
                        className="flex items-center justify-between px-5 py-3.5"
                        style={{ borderBottom: i < clientes.length - 1 ? "1px solid #1f356644" : "none" }}>
                        <div>
                          <p className="text-sm text-white font-medium">{c.nome}</p>
                          <p className="text-xs text-[#555]">{c.segmento}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[#aaa]">
                            {c.plano ? `R$${c.plano}/mês` : "—"}
                          </span>
                          <span className="text-xs font-orbitron px-2 py-1 rounded-md flex items-center gap-1.5"
                            style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}33` }}>
                            <StatusIcon size={10} />{s.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Coluna direita */}
            <div className="space-y-4">
              {/* Receita do mês */}
              <div className="rounded-xl border p-5" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-1">RECEBIDO ESTE MÊS</p>
                <p className="font-orbitron text-2xl font-bold text-white">
                  {receitaMes > 0 ? `R$${receitaMes.toLocaleString("pt-BR")}` : "—"}
                </p>
                {ultimosPagamentos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {ultimosPagamentos.map((p) => (
                      <div key={p.id} className="flex justify-between text-xs">
                        <span className="text-[#aaa]">{p.clienteNome}</span>
                        <span className="text-white">R${p.valor}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Renovações */}
              {proximasRenovacoes.length > 0 && (
                <div className="rounded-xl border p-5"
                  style={{ background: "rgba(255,189,46,0.04)", borderColor: "rgba(255,189,46,0.2)" }}>
                  <p className="font-orbitron text-[10px] text-[#ffbd2e] mb-3 tracking-wider">
                    RENOVAÇÕES EM 30 DIAS
                  </p>
                  {proximasRenovacoes.map((c) => (
                    <div key={c.id} className="flex justify-between text-sm">
                      <span className="text-white">{c.nome}</span>
                      <span className="text-[#ffbd2e] text-xs font-mono">{c.renovacao}</span>
                    </div>
                  ))}
                </div>
              )}

              {inadimplentes > 0 && (
                <div className="rounded-xl border p-5"
                  style={{ background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.2)" }}>
                  <p className="font-orbitron text-[10px] text-red-400 mb-3 tracking-wider">INADIMPLENTES</p>
                  {clientes.filter((c) => c.status === "inadimplente").map((c) => (
                    <div key={c.id} className="flex justify-between text-sm">
                      <span className="text-white">{c.nome}</span>
                      <span className="text-red-400 text-xs">
                        {c.plano ? `R$${c.plano}/mês` : "—"}
                      </span>
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
