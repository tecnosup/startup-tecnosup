"use client";
import { useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { Download, FileText } from "lucide-react";

const CHECKLIST_PADRAO = [
  "Fechar contrato com cliente",
  "Criar conta Firebase no nome do cliente",
  "Criar conta Cloudinary no nome do cliente",
  "Registrar domínio no Registro.br",
  "Configurar env vars de produção",
  "Deploy na Vercel (conta do cliente)",
  "Criar usuário admin no Firebase",
];

export default function PropostaPage() {
  const [form, setForm] = useState({
    clienteNome: "",
    clienteSegmento: "",
    clienteCidade: "",
    valorSetup: "1500",
    valorMensalidade: "129",
    prazoEntrega: "30",
    features: "Agendamento online\nPainel administrativo\nGaleria de fotos\nCatálogo de serviços\nWhatsApp integrado",
    dataValidade: "",
  });

  function gerarHTML() {
    const hoje = new Date().toLocaleDateString("pt-BR");
    const validadeStr = form.dataValidade
      ? new Date(form.dataValidade).toLocaleDateString("pt-BR")
      : "—";

    const featuresList = form.features
      .split("\n")
      .filter((f) => f.trim())
      .map((f) => `<li>${f.trim()}</li>`)
      .join("");

    const checklistItems = CHECKLIST_PADRAO
      .map((t) => `<li>☐ ${t}</li>`)
      .join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Proposta — ${form.clienteNome}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1a1a1a; padding: 48px; max-width: 760px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid #0eb3ff; }
  .brand { font-family: monospace; }
  .brand h1 { font-size: 22px; font-weight: 900; letter-spacing: 0.2em; color: #0eb3ff; }
  .brand p { font-size: 11px; color: #aaa; letter-spacing: 0.1em; }
  .meta { text-align: right; font-size: 12px; color: #777; }
  .meta strong { display: block; font-size: 14px; color: #1a1a1a; }
  h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .seg { color: #0eb3ff; font-size: 13px; margin-bottom: 32px; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; color: #aaa; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
  ul { padding-left: 20px; }
  li { margin-bottom: 6px; font-size: 14px; color: #333; }
  .pricing { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .price-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
  .price-card.highlight { border-color: #0eb3ff; background: #f0faff; }
  .price-label { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #aaa; margin-bottom: 6px; }
  .price-value { font-size: 28px; font-weight: 900; color: #0eb3ff; }
  .price-desc { font-size: 12px; color: #777; margin-top: 4px; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 12px; color: #aaa; }
  .assinatura { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .assinatura-campo { border-top: 1px solid #ccc; padding-top: 8px; font-size: 12px; color: #777; }
</style>
</head>
<body>
<div class="header">
  <div class="brand">
    <h1>TECNOSUP</h1>
    <p>TECNOLOGIA QUE RESOLVE DE VERDADE</p>
  </div>
  <div class="meta">
    <strong>PROPOSTA COMERCIAL</strong>
    Emitida em ${hoje}<br>
    Válida até ${validadeStr}
  </div>
</div>

<h2>${form.clienteNome}</h2>
<p class="seg">${form.clienteSegmento}${form.clienteCidade ? ` · ${form.clienteCidade}` : ""}</p>

<div class="section">
  <p class="section-title">O que está incluído</p>
  <ul>${featuresList}</ul>
</div>

<div class="section">
  <p class="section-title">Infraestrutura dedicada</p>
  <ul>
    <li>Domínio .com.br registrado no seu nome (Registro.br)</li>
    <li>Firebase — banco de dados e autenticação na sua conta</li>
    <li>Cloudinary — armazenamento de imagens na sua conta</li>
    <li>Deploy na Vercel — hospedagem no seu perfil</li>
    <li>Suporte técnico por 12 meses incluído</li>
  </ul>
</div>

<div class="section">
  <p class="section-title">Investimento</p>
  <div class="pricing">
    <div class="price-card highlight">
      <p class="price-label">SETUP ÚNICO</p>
      <p class="price-value">R$${Number(form.valorSetup).toLocaleString("pt-BR")}</p>
      <p class="price-desc">Domínio + infra + desenvolvimento + suporte 1 ano</p>
    </div>
    <div class="price-card">
      <p class="price-label">APÓS 1 ANO</p>
      <p class="price-value">R$${form.valorMensalidade}/mês</p>
      <p class="price-desc">Manutenção, hospedagem e suporte contínuo</p>
    </div>
  </div>
</div>

<div class="section">
  <p class="section-title">Prazo de entrega</p>
  <p style="font-size:14px;color:#333;">${form.prazoEntrega} dias úteis após aprovação e pagamento do setup.</p>
</div>

<div class="section">
  <p class="section-title">Checklist de onboarding</p>
  <ul>${checklistItems}</ul>
</div>

<div class="assinatura">
  <div class="assinatura-campo">Assinatura do cliente<br><br>${form.clienteNome}</div>
  <div class="assinatura-campo">Assinatura Tecnosup<br><br>Cardoso / Vitor</div>
</div>

<div class="footer">
  <span>Tecnosup — Cruzeiro, SP</span>
  <span>contato via WhatsApp</span>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposta-${form.clienteNome.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
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
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="mb-8 mt-14 md:mt-0">
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">PAINEL</p>
            <h1 className="font-orbitron text-2xl font-bold text-white">Gerador de Proposta</h1>
            <p className="text-sm text-[#555] mt-1">Gera um arquivo HTML pronto para imprimir ou enviar como PDF</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
            <div className="rounded-xl border p-5 space-y-4" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
              <p className="font-orbitron text-[10px] tracking-widest text-[#555]">DADOS DO CLIENTE</p>
              <Field label="NOME / EMPRESA">
                <input value={form.clienteNome} onChange={(e) => setForm((f) => ({ ...f, clienteNome: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="Ex: Ortega Barber"
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
              </Field>
              <Field label="SEGMENTO">
                <input value={form.clienteSegmento} onChange={(e) => setForm((f) => ({ ...f, clienteSegmento: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="Ex: Barbearia"
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
              </Field>
              <Field label="CIDADE">
                <input value={form.clienteCidade} onChange={(e) => setForm((f) => ({ ...f, clienteCidade: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="Ex: Cruzeiro, SP"
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
              </Field>
              <Field label="VALIDADE DA PROPOSTA">
                <input type="date" value={form.dataValidade} onChange={(e) => setForm((f) => ({ ...f, dataValidade: e.target.value }))}
                  className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }} />
              </Field>
            </div>

            <div className="rounded-xl border p-5 space-y-4" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
              <p className="font-orbitron text-[10px] tracking-widest text-[#555]">VALORES E PRAZO</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="SETUP (R$)">
                  <input type="number" value={form.valorSetup} onChange={(e) => setForm((f) => ({ ...f, valorSetup: e.target.value }))}
                    className={inputCls} style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                </Field>
                <Field label="MENSALIDADE (R$)">
                  <input type="number" value={form.valorMensalidade} onChange={(e) => setForm((f) => ({ ...f, valorMensalidade: e.target.value }))}
                    className={inputCls} style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                </Field>
              </div>
              <Field label="PRAZO (dias úteis)">
                <input type="number" value={form.prazoEntrega} onChange={(e) => setForm((f) => ({ ...f, prazoEntrega: e.target.value }))}
                  className={inputCls} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
              </Field>
              <Field label="FUNCIONALIDADES (uma por linha)">
                <textarea value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                  rows={6} className={`${inputCls} resize-none`} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
              </Field>
            </div>
          </div>

          <div className="mt-6 max-w-4xl">
            <button onClick={gerarHTML} disabled={!form.clienteNome.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-orbitron text-sm font-bold text-black transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 24px rgba(14,179,255,0.25)" }}>
              <Download size={16} /> GERAR PROPOSTA
            </button>
            <p className="text-xs text-[#555] mt-3 flex items-center gap-1.5">
              <FileText size={11} />
              Abre como arquivo HTML — abra no navegador e use Ctrl+P para salvar como PDF.
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
