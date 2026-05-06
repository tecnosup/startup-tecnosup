"use client";
import { useEffect, useState, useMemo } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { subscribeClientes } from "@/lib/clientes";
import { subscribePagamentos } from "@/lib/pagamentos";
import { Cliente, Pagamento } from "@/lib/types";
import {
  AlertTriangle, CheckCircle, XCircle,
  ChevronRight, Activity, MessageCircle, Loader2,
} from "lucide-react";

type Severidade = "critico" | "atencao" | "ok";

interface Alerta {
  clienteId: string;
  clienteNome: string;
  whatsapp: string | null;
  tipo: string;
  detalhe: string;
  severidade: Severidade;
  mensagemWpp?: string;
}

const sevConfig: Record<Severidade, { label: string; color: string; bg: string; border: string; icon: typeof AlertTriangle }> = {
  critico: { label: "Crítico", color: "#ef4444", bg: "rgba(239,68,68,0.06)",  border: "rgba(239,68,68,0.2)",  icon: XCircle },
  atencao: { label: "Atenção", color: "#ffbd2e", bg: "rgba(255,189,46,0.06)", border: "rgba(255,189,46,0.2)", icon: AlertTriangle },
  ok:      { label: "OK",      color: "#22c55e", bg: "rgba(34,197,94,0.06)",  border: "rgba(34,197,94,0.2)",  icon: CheckCircle },
};

function calcAlertas(clientes: Cliente[], pagamentos: Pagamento[]): Alerta[] {
  const alertas: Alerta[] = [];
  const hoje = new Date();
  const mesAtual = hoje.toISOString().slice(0, 7);

  for (const c of clientes) {
    if (c.status !== "ativo" && c.status !== "dev") continue;

    // renovação vencida
    if (c.renovacao && c.status === "ativo") {
      const diff = (new Date(c.renovacao).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
      if (diff < 0) {
        alertas.push({
          clienteId: c.id, clienteNome: c.nome, whatsapp: c.whatsapp,
          tipo: "Mensalidade vencida",
          detalhe: `Renovação era ${c.renovacao} — ${Math.abs(Math.round(diff))} dias em atraso`,
          severidade: "critico",
          mensagemWpp: `Olá ${c.nome}! 👋\n\nPassamos para informar que sua mensalidade da Tecnosup está em aberto desde ${c.renovacao}.\n\nQualquer dúvida, estamos à disposição! 😊`,
        });
      } else if (diff <= 7) {
        alertas.push({
          clienteId: c.id, clienteNome: c.nome, whatsapp: c.whatsapp,
          tipo: "Renovação em breve",
          detalhe: `Vence em ${Math.round(diff)} dia${Math.round(diff) !== 1 ? "s" : ""} (${c.renovacao})`,
          severidade: "atencao",
          mensagemWpp: `Olá ${c.nome}! 👋\n\nSua mensalidade da Tecnosup vence em ${Math.round(diff)} dia${Math.round(diff) !== 1 ? "s" : ""} (${c.renovacao}).\n\nQualquer dúvida, estamos à disposição! 😊`,
        });
      }
    }

    // sem renovação cadastrada
    if (!c.renovacao && c.status === "ativo") {
      alertas.push({
        clienteId: c.id, clienteNome: c.nome, whatsapp: c.whatsapp,
        tipo: "Sem data de renovação",
        detalhe: "Cadastre a data para monitorar a inadimplência",
        severidade: "atencao",
      });
    }

    // sem pagamento no mês
    const pagouMes = pagamentos.some((p) => p.clienteId === c.id && p.data.startsWith(mesAtual));
    if (!pagouMes && c.status === "ativo") {
      alertas.push({
        clienteId: c.id, clienteNome: c.nome, whatsapp: c.whatsapp,
        tipo: "Sem pagamento este mês",
        detalhe: `Nenhum pagamento registrado em ${mesAtual}`,
        severidade: "atencao",
        mensagemWpp: `Olá ${c.nome}! 👋\n\nAinda não identificamos seu pagamento referente a este mês na Tecnosup.\n\nQualquer dúvida, fale com a gente! 😊`,
      });
    }

    // checklist incompleto
    if (c.checklist && c.checklist.length > 0) {
      const pendentes = c.checklist.filter((t) => !t.feito).length;
      if (pendentes > 0) {
        alertas.push({
          clienteId: c.id, clienteNome: c.nome, whatsapp: c.whatsapp,
          tipo: "Onboarding incompleto",
          detalhe: `${pendentes} tarefa${pendentes !== 1 ? "s" : ""} pendente${pendentes !== 1 ? "s" : ""} no checklist`,
          severidade: "atencao",
        });
      }
    }

    // sem WhatsApp
    if (!c.whatsapp && c.status === "ativo") {
      alertas.push({
        clienteId: c.id, clienteNome: c.nome, whatsapp: null,
        tipo: "Sem WhatsApp cadastrado",
        detalhe: "Necessário para notificações automáticas",
        severidade: "atencao",
      });
    }
  }

  const ordem: Severidade[] = ["critico", "atencao", "ok"];
  return alertas.sort((a, b) => ordem.indexOf(a.severidade) - ordem.indexOf(b.severidade));
}

async function enviarWhatsapp(phone: string, message: string): Promise<boolean> {
  try {
    const res = await fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function AlertaRow({ alerta }: { alerta: Alerta }) {
  const s = sevConfig[alerta.severidade];
  const Icon = s.icon;
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState(false);

  async function handleEnviar() {
    if (!alerta.whatsapp || !alerta.mensagemWpp) return;
    setEnviando(true);
    setErro(false);
    const ok = await enviarWhatsapp(alerta.whatsapp, alerta.mensagemWpp);
    setEnviando(false);
    if (ok) { setEnviado(true); setTimeout(() => setEnviado(false), 4000); }
    else setErro(true);
  }

  const podeMensagem = !!alerta.whatsapp && !!alerta.mensagemWpp;

  return (
    <div className="rounded-xl border px-5 py-4 flex items-center gap-4"
      style={{ background: s.bg, borderColor: s.border }}>
      <Icon size={16} style={{ color: s.color }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-orbitron font-bold" style={{ color: s.color }}>{alerta.tipo}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-orbitron"
            style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}33` }}>
            {alerta.clienteNome}
          </span>
        </div>
        <p className="text-xs text-[#777] mt-0.5">{alerta.detalhe}</p>
        {erro && <p className="text-xs text-red-400 mt-1">Falha ao enviar. Verifique a Z-API.</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {podeMensagem && (
          <button onClick={handleEnviar} disabled={enviando || enviado}
            title="Enviar aviso via WhatsApp"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-orbitron font-bold transition-all disabled:opacity-60"
            style={{
              background: enviado ? "rgba(34,197,94,0.15)" : "rgba(37,211,102,0.1)",
              border: `1px solid ${enviado ? "#22c55e55" : "#25d36633"}`,
              color: enviado ? "#22c55e" : "#25d366",
            }}>
            {enviando ? <Loader2 size={11} className="animate-spin" /> : <MessageCircle size={11} />}
            {enviado ? "ENVIADO" : "AVISAR"}
          </button>
        )}
        <a href="/painel/clientes" className="text-[#555] hover:text-white transition-colors">
          <ChevronRight size={15} />
        </a>
      </div>
    </div>
  );
}

export default function SaudePage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false, p = false;
    const done = () => { if (c && p) setLoading(false); };
    const u1 = subscribeClientes((d) => { setClientes(d); c = true; done(); });
    const u2 = subscribePagamentos((d) => { setPagamentos(d); p = true; done(); });
    return () => { u1(); u2(); };
  }, []);

  const alertas = useMemo(() => calcAlertas(clientes, pagamentos), [clientes, pagamentos]);

  const criticos = alertas.filter((a) => a.severidade === "critico").length;
  const atencoes = alertas.filter((a) => a.severidade === "atencao").length;
  const scoreTotal = clientes.filter((c) => c.status === "ativo" || c.status === "dev").length;
  const scoreProblemas = new Set(alertas.filter((a) => a.severidade === "critico").map((a) => a.clienteId)).size;
  const score = scoreTotal === 0 ? 100 : Math.round(((scoreTotal - scoreProblemas) / scoreTotal) * 100);
  const scoreColor = score >= 80 ? "#22c55e" : score >= 50 ? "#ffbd2e" : "#ef4444";

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">

          <div className="mb-8 mt-14 md:mt-0">
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">PAINEL</p>
            <h1 className="font-orbitron text-2xl font-bold text-white">Saúde dos Clientes</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-32">
              <span className="w-6 h-6 border-2 border-[#0eb3ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Score */}
                <div className="rounded-xl border p-5 flex items-center gap-4"
                  style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                  <div className="relative w-14 h-14 shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#1f3566" strokeWidth="5" />
                      <circle cx="28" cy="28" r="22" fill="none" stroke={scoreColor} strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 22}`}
                        strokeDashoffset={`${2 * Math.PI * 22 * (1 - score / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-orbitron text-sm font-bold"
                      style={{ color: scoreColor }}>{score}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-orbitron tracking-widest text-[#555] mb-0.5">SCORE</p>
                    <p className="text-sm text-white font-medium">
                      {score >= 80 ? "Saudável" : score >= 50 ? "Atenção" : "Crítico"}
                    </p>
                    <p className="text-xs text-[#555]">{scoreTotal} clientes</p>
                  </div>
                </div>

                <div className="rounded-xl border p-5" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle size={14} color="#ef4444" />
                    <p className="text-[10px] font-orbitron tracking-widest text-[#555]">CRÍTICOS</p>
                  </div>
                  <p className="font-orbitron text-3xl font-bold" style={{ color: criticos > 0 ? "#ef4444" : "#22c55e" }}>{criticos}</p>
                  <p className="text-xs text-[#555] mt-1">alertas críticos</p>
                </div>

                <div className="rounded-xl border p-5" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} color="#ffbd2e" />
                    <p className="text-[10px] font-orbitron tracking-widest text-[#555]">ATENÇÃO</p>
                  </div>
                  <p className="font-orbitron text-3xl font-bold" style={{ color: atencoes > 0 ? "#ffbd2e" : "#22c55e" }}>{atencoes}</p>
                  <p className="text-xs text-[#555] mt-1">pontos de atenção</p>
                </div>

                <div className="rounded-xl border p-5" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={14} color="#0eb3ff" />
                    <p className="text-[10px] font-orbitron tracking-widest text-[#555]">SEM ALERTA</p>
                  </div>
                  <p className="font-orbitron text-3xl font-bold text-[#22c55e]">{scoreTotal - scoreProblemas}</p>
                  <p className="text-xs text-[#555] mt-1">clientes OK</p>
                </div>
              </div>

              {alertas.length === 0 ? (
                <div className="rounded-xl border p-12 text-center"
                  style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                  <CheckCircle size={32} className="mx-auto mb-3" color="#22c55e" />
                  <p className="font-orbitron text-sm text-white mb-1">Tudo em ordem</p>
                  <p className="text-xs text-[#555]">Nenhum alerta encontrado.</p>
                </div>
              ) : (
                <div className="space-y-2 max-w-3xl">
                  {alertas.map((a, i) => <AlertaRow key={i} alerta={a} />)}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
