"use client";
import { useEffect, useState, useMemo } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { subscribeClientes } from "@/lib/clientes";
import { subscribePagamentos } from "@/lib/pagamentos";
import { Cliente, Pagamento } from "@/lib/types";
import {
  LucideIcon, TrendingUp, Users, DollarSign, AlertCircle,
  Clock, CheckCircle, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: LucideIcon; label: string; value: string; sub?: string; accent?: string;
}) {
  const color = accent ?? "#0eb3ff";
  return (
    <div className="rounded-xl border p-5 flex items-start gap-4"
      style={{ background: "#0b1121", borderColor: "#1f3566" }}>
      <div className="p-2.5 rounded-lg shrink-0"
        style={{ background: `${color}12`, border: `1px solid ${color}22` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-orbitron tracking-widest text-[#555] mb-1">{label}</p>
        <p className="font-orbitron text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-[#777] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  ativo: { label: "Ativo", color: "#22c55e", icon: CheckCircle },
  dev: { label: "Em desenvolvimento", color: "#ffbd2e", icon: Clock },
  inadimplente: { label: "Inadimplente", color: "#ef4444", icon: AlertCircle },
};

function buildChartData(pagamentos: Pagamento[]) {
  const hoje = new Date();
  const dias: { label: string; key: string; total: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    dias.push({ key, label, total: 0 });
  }

  for (const p of pagamentos) {
    const idx = dias.findIndex((d) => d.key === p.data.slice(0, 10));
    if (idx !== -1) dias[idx].total += p.valor;
  }

  // acumulado
  let acc = 0;
  return dias.map((d) => {
    acc += d.total;
    return { label: d.label, acumulado: acc, diario: d.total };
  });
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border px-3 py-2 text-xs"
      style={{ background: "#0b1121", borderColor: "#1f3566" }}>
      <p className="text-[#555] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-orbitron text-white">
          R$ {p.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  const hoje = new Date();
  const diaSemana = hoje.toLocaleDateString("pt-BR", { weekday: "long" });
  const dataFormatada = hoje.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const dataLabel = `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dataFormatada}`;

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
  const mrr = clientes.filter((c) => c.status === "ativo").reduce((s, c) => s + (c.plano ?? 0), 0);

  const mesAtual = hoje.toISOString().slice(0, 7);
  const receitaMes = pagamentos.filter((p) => p.data.startsWith(mesAtual)).reduce((s, p) => s + p.valor, 0);

  const melhorDia = useMemo(() => {
    const por_dia: Record<string, number> = {};
    for (const p of pagamentos) {
      const d = p.data.slice(0, 10);
      por_dia[d] = (por_dia[d] ?? 0) + p.valor;
    }
    let max = 0, maxDia = "";
    for (const [d, v] of Object.entries(por_dia)) {
      if (v > max) { max = v; maxDia = d; }
    }
    if (!maxDia) return null;
    const [, m, dia] = maxDia.split("-");
    return { label: `${dia}/${m}`, valor: max };
  }, [pagamentos]);

  const proximasRenovacoes = clientes.filter((c) => {
    if (!c.renovacao) return false;
    const diff = (new Date(c.renovacao).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  const chartData = useMemo(() => buildChartData(pagamentos), [pagamentos]);
  const receitaAcumulada = chartData[chartData.length - 1]?.acumulado ?? 0;

  const clientesRecentes = [...clientes].slice(0, 6);

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs text-[#555] mb-0.5">{dataLabel}</p>
            <h1 className="font-orbitron text-2xl font-bold text-white">Dashboard</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard icon={DollarSign} label="MRR" value={mrr > 0 ? `R$ ${mrr.toLocaleString("pt-BR")}` : "—"} sub="receita recorrente mensal" />
            <StatCard icon={Users} label="CLIENTES ATIVOS" value={String(ativos)} sub={`${emDev} em desenvolvimento`} accent="#22c55e" />
            <StatCard
              icon={TrendingUp}
              label="RECEBIDO ESTE MÊS"
              value={receitaMes > 0 ? `R$ ${receitaMes.toLocaleString("pt-BR")}` : "—"}
              sub={melhorDia ? `Melhor dia: ${melhorDia.label} · R$ ${melhorDia.valor.toLocaleString("pt-BR")}` : "nenhum pagamento"}
              accent="#7000ff"
            />
            <StatCard
              icon={AlertCircle}
              label="INADIMPLENTES"
              value={String(inadimplentes)}
              sub={inadimplentes > 0 ? "atenção necessária" : "tudo em dia"}
              accent={inadimplentes > 0 ? "#ef4444" : "#0eb3ff"}
            />
          </div>

          {/* Gráfico + Clientes */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Gráfico */}
            <div className="lg:col-span-2 rounded-xl border overflow-hidden"
              style={{ background: "#0b1121", borderColor: "#1f3566" }}>
              <div className="px-5 py-4 border-b flex items-start justify-between"
                style={{ borderColor: "#1f3566" }}>
                <div>
                  <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-0.5">FATURAMENTO (ÚLTIMOS 30 DIAS)</p>
                  <p className="text-xs text-[#555]">Receita acumulada</p>
                  <p className="font-orbitron text-2xl font-bold text-white mt-1">
                    R$ {receitaAcumulada.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  {melhorDia && (
                    <p className="text-xs mt-0.5" style={{ color: "#0eb3ff" }}>
                      Melhor dia: {melhorDia.label} · R$ {melhorDia.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
              <div className="px-2 pt-4 pb-2" style={{ height: 220 }}>
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-[#0eb3ff] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0eb3ff" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0eb3ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#1f356633" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#444", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval={6}
                      />
                      <YAxis
                        tick={{ fill: "#444", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `R$${v}`}
                        width={52}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="acumulado"
                        stroke="#0eb3ff"
                        strokeWidth={2}
                        fill="url(#grad)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#0eb3ff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Coluna direita */}
            <div className="space-y-4">
              {/* Clientes recentes */}
              <div className="rounded-xl border overflow-hidden" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#1f3566" }}>
                  <p className="font-orbitron text-[10px] tracking-widest text-[#555]">CLIENTES RECENTES</p>
                  <a href="/painel/clientes" className="flex items-center gap-1 text-xs text-[#0eb3ff] hover:underline">
                    Ver todos <ArrowUpRight size={11} />
                  </a>
                </div>
                {loading ? (
                  <div className="py-8 flex justify-center">
                    <span className="w-5 h-5 border-2 border-[#0eb3ff] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : clientesRecentes.length === 0 ? (
                  <p className="py-8 text-center text-[#555] text-sm">Nenhum cliente ainda.</p>
                ) : (
                  clientesRecentes.map((c, i) => {
                    const s = statusConfig[c.status] ?? statusConfig.dev;
                    const StatusIcon = s.icon;
                    return (
                      <div key={c.id}
                        className="flex items-center justify-between px-5 py-3"
                        style={{ borderBottom: i < clientesRecentes.length - 1 ? "1px solid #1f356633" : "none" }}>
                        <div className="min-w-0 mr-2">
                          <p className="text-sm text-white font-medium truncate">{c.nome}</p>
                          <p className="text-xs text-[#555] truncate">{c.plano ? `R$ ${c.plano}/mês` : "—"}</p>
                        </div>
                        <span className="text-[10px] font-orbitron px-2 py-1 rounded-md flex items-center gap-1 shrink-0"
                          style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}33` }}>
                          <StatusIcon size={9} />{s.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Renovações */}
              {proximasRenovacoes.length > 0 && (
                <div className="rounded-xl border p-4"
                  style={{ background: "rgba(255,189,46,0.04)", borderColor: "rgba(255,189,46,0.2)" }}>
                  <p className="font-orbitron text-[10px] text-[#ffbd2e] mb-3 tracking-wider">RENOVAÇÕES EM 30 DIAS</p>
                  <div className="space-y-2">
                    {proximasRenovacoes.map((c) => (
                      <div key={c.id} className="flex justify-between text-sm">
                        <span className="text-white">{c.nome}</span>
                        <span className="text-[#ffbd2e] text-xs font-mono">{c.renovacao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inadimplentes > 0 && (
                <div className="rounded-xl border p-4"
                  style={{ background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.2)" }}>
                  <p className="font-orbitron text-[10px] text-red-400 mb-3 tracking-wider">INADIMPLENTES</p>
                  <div className="space-y-2">
                    {clientes.filter((c) => c.status === "inadimplente").map((c) => (
                      <div key={c.id} className="flex justify-between text-sm">
                        <span className="text-white">{c.nome}</span>
                        <span className="text-red-400 text-xs">{c.plano ? `R$ ${c.plano}/mês` : "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
