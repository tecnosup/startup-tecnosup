"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { subscribeLeads, updateLeadStatus, updateLeadNotas } from "@/lib/leads";
import { Lead, LeadStatus } from "@/lib/types";
import {
  MapPin, Phone, Instagram, ExternalLink,
  ChevronDown, ChevronUp, Copy, Check, MessageCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  novo: { label: "Novo", color: "#555" },
  mensagem_pronta: { label: "Pronto p/ enviar", color: "#0eb3ff" },
  contato_feito: { label: "Contato feito", color: "#ffbd2e" },
  respondeu: { label: "Respondeu!", color: "#a78bfa" },
  demo_enviada: { label: "Demo enviada", color: "#f97316" },
  proposta_enviada: { label: "Proposta enviada", color: "#22d3ee" },
  fechado: { label: "Fechado", color: "#22c55e" },
  perdido: { label: "Perdido", color: "#ef4444" },
};

const FUNIL: LeadStatus[] = [
  "mensagem_pronta", "contato_feito", "respondeu",
  "demo_enviada", "proposta_enviada", "fechado", "perdido",
];

function LeadCard({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [notas, setNotas] = useState(lead.notas);

  const s = STATUS_CONFIG[lead.status];

  async function copiarMensagem() {
    if (!lead.mensagemPronta) return;
    await navigator.clipboard.writeText(lead.mensagemPronta);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
    await updateLeadStatus(lead.id, "contato_feito", "Mensagem copiada para envio");
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "#0b1121", borderColor: lead.score >= 70 ? "#0eb3ff44" : "#1f3566" }}
    >
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <button className="flex items-center gap-3 flex-1 text-left" onClick={() => setOpen((v) => !v)}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-orbitron shrink-0"
            style={{
              background: lead.score >= 70 ? "#0eb3ff22" : "#1f3566",
              color: lead.score >= 70 ? "#0eb3ff" : "#888",
              border: `1px solid ${lead.score >= 70 ? "#0eb3ff44" : "#1f356644"}`,
            }}
          >
            {lead.score}
          </div>
          <div>
            <p className="font-orbitron text-sm font-bold text-white">{lead.nome}</p>
            <p className="text-xs text-[#555] flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {lead.cidade}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[10px] font-orbitron px-2 py-0.5 rounded"
            style={{ color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}33` }}
          >
            {s.label}
          </span>
          {open ? <ChevronUp size={14} className="text-[#555]" /> : <ChevronDown size={14} className="text-[#555]" />}
        </div>
      </div>

      {open && (
        <div className="border-t px-5 py-4 space-y-4" style={{ borderColor: "#1f3566" }}>
          <div className="flex gap-3 flex-wrap">
            {lead.whatsapp && (
              <a
                href={`https://wa.me/55${lead.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "#22c55e18", color: "#22c55e", border: "1px solid #22c55e33" }}
              >
                <Phone size={11} /> {lead.whatsapp}
              </a>
            )}
            {lead.instagram && (
              <a
                href={`https://instagram.com/${lead.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "#a78bfa18", color: "#a78bfa", border: "1px solid #a78bfa33" }}
              >
                <Instagram size={11} /> @{lead.instagram}
              </a>
            )}
            {lead.googleMapsUrl && (
              <a
                href={lead.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "#0eb3ff18", color: "#0eb3ff", border: "1px solid #0eb3ff33" }}
              >
                <ExternalLink size={11} /> Google Maps
              </a>
            )}
          </div>

          {lead.mensagemPronta && (
            <div>
              <p className="text-[10px] font-orbitron text-[#555] mb-2 tracking-wider">MENSAGEM PRONTA</p>
              <div
                className="rounded-lg p-3 text-sm text-[#ccc] leading-relaxed whitespace-pre-wrap"
                style={{ background: "#0eb3ff08", border: "1px solid #0eb3ff22" }}
              >
                {lead.mensagemPronta}
              </div>
              <button
                onClick={copiarMensagem}
                className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: copiado ? "#22c55e18" : "#0eb3ff18",
                  color: copiado ? "#22c55e" : "#0eb3ff",
                  border: `1px solid ${copiado ? "#22c55e33" : "#0eb3ff33"}`,
                }}
              >
                {copiado ? <Check size={11} /> : <Copy size={11} />}
                {copiado ? "Copiado! Status atualizado" : "Copiar mensagem"}
              </button>
            </div>
          )}

          <div>
            <p className="text-[10px] font-orbitron text-[#555] mb-2 tracking-wider">MOVER NO FUNIL</p>
            <div className="flex flex-wrap gap-2">
              {FUNIL.map((st) => (
                <button
                  key={st}
                  onClick={() => updateLeadStatus(lead.id, st)}
                  className="text-[10px] px-2.5 py-1 rounded font-orbitron transition-all"
                  style={{
                    background: lead.status === st ? `${STATUS_CONFIG[st].color}22` : "#0b1121",
                    color: lead.status === st ? STATUS_CONFIG[st].color : "#555",
                    border: `1px solid ${lead.status === st ? STATUS_CONFIG[st].color + "44" : "#1f3566"}`,
                  }}
                >
                  {STATUS_CONFIG[st].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-orbitron text-[#555] mb-2 tracking-wider flex items-center gap-1">
              <MessageCircle size={10} /> NOTAS
            </p>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              onBlur={() => updateLeadNotas(lead.id, notas)}
              rows={3}
              placeholder="Observações sobre este lead..."
              className="w-full rounded-lg p-3 text-sm text-[#ccc] resize-none focus:outline-none"
              style={{ background: "#0b1121", border: "1px solid #1f3566" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<LeadStatus | "todos">("todos");

  useEffect(() => {
    const unsub = subscribeLeads((data) => {
      setLeads(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const leadsFiltrados = filtro === "todos" ? leads : leads.filter((l) => l.status === filtro);

  const contar = (st: LeadStatus) => leads.filter((l) => l.status === st).length;

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="mb-6">
            <h1 className="font-orbitron text-2xl font-bold text-white">Leads</h1>
            <p className="text-xs text-[#555] mt-1">{leads.length} leads no total</p>
          </div>

          {/* Funil resumo */}
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setFiltro("todos")}
              className="text-[10px] font-orbitron px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: filtro === "todos" ? "#0eb3ff22" : "#0b1121",
                color: filtro === "todos" ? "#0eb3ff" : "#555",
                border: `1px solid ${filtro === "todos" ? "#0eb3ff44" : "#1f3566"}`,
              }}
            >
              Todos ({leads.length})
            </button>
            {FUNIL.map((st) => (
              <button
                key={st}
                onClick={() => setFiltro(st)}
                className="text-[10px] font-orbitron px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: filtro === st ? `${STATUS_CONFIG[st].color}22` : "#0b1121",
                  color: filtro === st ? STATUS_CONFIG[st].color : "#555",
                  border: `1px solid ${filtro === st ? STATUS_CONFIG[st].color + "44" : "#1f3566"}`,
                }}
              >
                {STATUS_CONFIG[st].label} ({contar(st)})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="w-5 h-5 border-2 border-[#0eb3ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leadsFiltrados.length === 0 ? (
            <div className="text-center py-12 text-[#555]">
              <p className="text-sm">Nenhum lead encontrado.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl">
              {leadsFiltrados.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
