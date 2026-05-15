"use client";
import { useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { Download, FileText } from "lucide-react";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const NAO_INCLUSOS = [
  "Integração com sistemas de pagamento online (Stripe, PagSeguro, Mercado Pago)",
  "Aplicativo nativo para iOS ou Android",
  "Múltiplos usuários administradores",
  "Relatórios exportáveis em PDF ou Excel",
  "Envio automático de notificações por SMS ou WhatsApp aos clientes",
  "Integração com sistemas externos (ERPs, CRMs, plataformas de delivery)",
  "Criação de conteúdo (textos, fotos, vídeos) para o sistema",
];

const MATERIAIS_CLIENTE = [
  "Logotipo em boa resolução (PNG ou SVG)",
  "Fotos do estabelecimento e dos profissionais (se houver)",
  "Lista de serviços com nome, descrição, preço e duração",
  "Lista de produtos com nome, descrição e preço (se aplicável)",
  "Número de WhatsApp para contato",
  "Referências de cores ou identidade visual desejada",
  "Acesso às contas de infraestrutura (Firebase, Vercel, Cloudinary) após criação conjunta",
];

export default function ContratoPage() {
  const [form, setForm] = useState({
    clienteNome: "",
    clienteCpfCnpj: "",
    clienteTelefone: "",
    clienteEmail: "",
    clienteEndereco: "",
    clienteSegmento: "",
    clienteCidade: "",
    valorTotal: "1500",
    valorMensalidade: "129",
    prazoEntrega: "10",
    dataInicio: "",
    formaPagamento: "Pix",
    features: "Site público (landing page) com identidade visual personalizada\nFluxo de agendamento online em até 3 etapas\nPágina de status para o cliente consultar agendamentos\nPainel administrativo com dashboard, gestão de agendamentos e módulo financeiro\nInfraestrutura dedicada (Firebase, Vercel, Cloudinary, domínio .com.br)",
  });

  function gerarHTML() {
    const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const dataInicioStr = form.dataInicio
      ? new Date(form.dataInicio + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      : "a definir";

    const valorTotal = Number(form.valorTotal);
    const parcela = valorTotal / 2;
    const parcelaStr = parcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    const valorTotalStr = valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    const valorMensalidadeStr = Number(form.valorMensalidade).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    const valorExtenso = valorTotal === 1500 ? "um mil e quinhentos" : valorTotal === 2000 ? "dois mil" : "";

    const featuresList = form.features
      .split("\n").filter((f) => f.trim()).map((f) => `<li>${f.trim()}</li>`).join("");

    const naoInclusosList = NAO_INCLUSOS.map((t) => `<li>${t}</li>`).join("");
    const materiaisList = MATERIAIS_CLIENTE.map((t) => `<li>${t}</li>`).join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Contrato — ${form.clienteNome}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Times New Roman', serif; background: #fff; color: #1a1a1a; padding: 56px 64px; max-width: 800px; margin: 0 auto; font-size: 13px; line-height: 1.75; }
  .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #0eb3ff; }
  .brand { font-family: monospace; font-size: 22px; font-weight: 900; letter-spacing: 0.2em; color: #0eb3ff; margin-bottom: 3px; }
  .brand-sub { font-size: 11px; color: #aaa; letter-spacing: 0.1em; font-family: monospace; }
  .titulo { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 16px; }
  .subtitulo { font-size: 12px; color: #777; margin-top: 3px; }
  .partes { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 28px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0; }
  .parte-titulo { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; color: #aaa; text-transform: uppercase; margin-bottom: 8px; font-family: monospace; }
  .parte-dado { font-size: 13px; color: #1a1a1a; margin-bottom: 2px; }
  .parte-label { font-size: 11px; color: #777; margin-bottom: 1px; }
  h2 { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #1a1a1a; margin: 24px 0 8px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0; font-family: monospace; }
  p { margin-bottom: 8px; text-align: justify; }
  ul { padding-left: 18px; margin-bottom: 10px; }
  li { margin-bottom: 3px; }
  .num { font-weight: 700; }
  .pricing { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 12px 0; }
  .price-card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 14px; }
  .price-card.hl { border-color: #0eb3ff; background: #f0faff; }
  .price-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #aaa; font-family: monospace; }
  .price-value { font-size: 20px; font-weight: 900; color: #0eb3ff; margin: 3px 0; }
  .price-desc { font-size: 11px; color: #777; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
  th { background: #f0f0f0; padding: 6px 10px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; font-family: monospace; }
  td { padding: 6px 10px; border-bottom: 1px solid #f0f0f0; }
  .assinatura { margin-top: 56px; display: grid; grid-template-columns: 1fr 1fr; gap: 56px; }
  .assinatura-campo { border-top: 1px solid #ccc; padding-top: 8px; font-size: 12px; color: #777; line-height: 1.6; }
  .assinatura-nome { font-size: 13px; color: #1a1a1a; font-weight: 600; margin-top: 4px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 11px; color: #aaa; font-family: monospace; }
  .aprovacao { margin-top: 28px; padding: 16px 20px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 12px; }
  @media print { body { padding: 32px 40px; } }
</style>
</head>
<body>

<div class="header">
  <div class="brand">TECNOSUP</div>
  <div class="brand-sub">TECNOLOGIA QUE RESOLVE DE VERDADE</div>
  <div class="titulo">Contrato de Prestação de Serviços</div>
  <div class="subtitulo">Desenvolvimento e Manutenção de Sistema Web — ${form.clienteSegmento || "Estabelecimento Comercial"}</div>
</div>

<div class="partes">
  <div>
    <p class="parte-titulo">Contratada</p>
    <p class="parte-dado"><strong>Tecnosup — Suporte Técnico e Soluções Digitais</strong></p>
    <p class="parte-label">Representada por Abraão Cardoso e Vitor</p>
    <p class="parte-label">Cruzeiro — SP</p>
    <p class="parte-label">Contato: (12) 99103-7897</p>
  </div>
  <div>
    <p class="parte-titulo">Contratante</p>
    <p class="parte-dado"><strong>${form.clienteNome || "_______________________________________________"}</strong></p>
    <p class="parte-label">CPF/CNPJ: ${form.clienteCpfCnpj || "_______________________________________________"}</p>
    ${form.clienteEndereco ? `<p class="parte-label">${form.clienteEndereco}</p>` : `<p class="parte-label">Endereço: _______________________________________________</p>`}
    ${form.clienteCidade ? `<p class="parte-label">${form.clienteCidade}</p>` : ""}
    ${form.clienteTelefone ? `<p class="parte-label">Tel: ${form.clienteTelefone}</p>` : `<p class="parte-label">Telefone: _______________________________________________</p>`}
    ${form.clienteEmail ? `<p class="parte-label">E-mail: ${form.clienteEmail}</p>` : `<p class="parte-label">E-mail: _______________________________________________</p>`}
  </div>
</div>

<p>As partes acima identificadas celebram o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições a seguir.</p>

<h2>Cláusula 1 — Objeto do Contrato</h2>
<p><span class="num">1.1.</span> A <strong>Contratada</strong> compromete-se a desenvolver, implantar e dar suporte a sistema web personalizado para a empresa contratante, composto pelos seguintes módulos:</p>
<ul>${featuresList}</ul>

<p><span class="num">1.2.</span> <strong>O que NÃO está incluído neste contrato</strong> (demanda orçamento separado):</p>
<ul>${naoInclusosList}</ul>

<p><span class="num">1.3.</span> Personalizações incluídas sem custo adicional: identidade visual (cores e tipografia) conforme referência fornecida pelo contratante; cadastro inicial de até 10 serviços e 10 produtos; configuração de número de WhatsApp e textos da página inicial.</p>

<h2>Cláusula 2 — Infraestrutura e Propriedade</h2>
<p><span class="num">2.1.</span> Toda a infraestrutura será configurada nas contas do próprio contratante: Firebase (banco de dados e autenticação), Cloudinary (armazenamento de imagens), Vercel (hospedagem) e domínio registrado em nome do contratante no Registro.br.</p>
<p><span class="num">2.2.</span> Após a entrega, o contratante é responsável pela manutenção das credenciais de acesso às plataformas listadas. A Tecnosup não se responsabiliza por perda de acesso causada pelo contratante.</p>
<p><span class="num">2.3.</span> A autoria intelectual do sistema permanece com a Tecnosup. A posse e o uso são do contratante. Todos os dados inseridos no sistema pertencem exclusivamente ao contratante.</p>
<p><span class="num">2.4.</span> A Tecnosup não acessa, armazena, compartilha ou comercializa dados dos clientes do contratante. O acesso técnico é restrito à manutenção do sistema e realizado somente mediante necessidade comprovada, respeitando a LGPD (Lei 13.709/2018).</p>

<h2>Cláusula 3 — Prazo de Entrega e Materiais</h2>
<p><span class="num">3.1.</span> O sistema será entregue em até <strong>${form.prazoEntrega} (${form.prazoEntrega}) dias úteis</strong> contados a partir da data de início ${form.dataInicio ? `(<strong>${dataInicioStr}</strong>)` : "(a definir)"} e do recebimento do pagamento da 1ª parcela <strong>e</strong> de todos os materiais listados em 3.2.</p>
<p><span class="num">3.2.</span> O contratante deverá fornecer em até <strong>3 (três) dias úteis</strong> após a assinatura:</p>
<ul>${materiaisList}</ul>
<p><span class="num">3.3.</span> O prazo da cláusula 3.1 ficará suspenso enquanto o contratante não entregar os materiais listados em 3.2. A Tecnosup não poderá ser responsabilizada por atrasos decorrentes da ausência desses materiais.</p>
<p><span class="num">3.4.</span> Após a entrega, o contratante terá <strong>3 (três) dias úteis</strong> para aprovar o sistema ou solicitar ajustes dentro do escopo. Decorrido esse prazo sem manifestação, o sistema será considerado aprovado e a 2ª parcela passará a ser devida.</p>

<h2>Cláusula 4 — Valores e Forma de Pagamento</h2>
<div class="pricing">
  <div class="price-card hl">
    <p class="price-label">SETUP TOTAL</p>
    <p class="price-value">R$${valorTotalStr}</p>
    <p class="price-desc">Desenvolvimento + infra + domínio + suporte 1 ano</p>
  </div>
  <div class="price-card">
    <p class="price-label">1ª PARCELA — 50%</p>
    <p class="price-value">R$${parcelaStr}</p>
    <p class="price-desc">Na assinatura deste contrato</p>
  </div>
  <div class="price-card">
    <p class="price-label">2ª PARCELA — 50%</p>
    <p class="price-value">R$${parcelaStr}</p>
    <p class="price-desc">Na entrega e aprovação do sistema</p>
  </div>
</div>
<p><span class="num">4.1.</span> O valor total do setup é de <strong>R$${valorTotalStr} (${valorExtenso || valorTotalStr + " reais"})</strong>, pago em duas parcelas via <strong>${form.formaPagamento}</strong>, conforme tabela acima.</p>
<p><span class="num">4.2.</span> O atraso no pagamento da 2ª parcela por mais de <strong>5 (cinco) dias úteis</strong> após a entrega e aprovação do sistema poderá suspender o suporte técnico até regularização.</p>

<h2>Cláusula 5 — Suporte Técnico (Incluso no Setup)</h2>
<p><span class="num">5.1.</span> O setup inclui <strong>12 (doze) meses</strong> de suporte técnico, contados da data de entrega do sistema, compreendendo: (a) correção de bugs e falhas de funcionamento; (b) suporte para dúvidas sobre o painel administrativo; (c) atualizações de segurança a critério da Tecnosup.</p>
<p><span class="num">5.2.</span> Não está incluído no suporte: desenvolvimento de novas funcionalidades; alterações de escopo; criação ou edição de conteúdo; suporte a problemas causados por alterações feitas pelo contratante na infraestrutura.</p>
<p><span class="num">5.3.</span> O suporte será prestado via WhatsApp em horário comercial (seg–sex, 9h–18h), com prazo de resposta de até <strong>24 horas úteis</strong>.</p>

<h2>Cláusula 6 — Plano de Manutenção Após 12 Meses</h2>
<p><span class="num">6.1.</span> Após os primeiros 12 meses, a continuidade do suporte e hospedagem ativa estará condicionada ao pagamento de mensalidade no valor de <strong>R$${valorMensalidadeStr}/mês</strong>.</p>
<p><span class="num">6.2.</span> A mensalidade poderá ser reajustada anualmente, limitada à variação do IPCA, mediante comunicação prévia de 30 dias.</p>
<p><span class="num">6.3.</span> Em caso de inadimplência da mensalidade por mais de 30 dias: o domínio personalizado não será renovado; o suporte técnico será suspenso. O sistema permanecerá funcional, pois a infraestrutura está nas contas do próprio contratante.</p>

<h2>Cláusula 7 — Cancelamento</h2>
<p><span class="num">7.1.</span> <strong>Antes da entrega:</strong> caso o contratante deseje cancelar após a assinatura e pagamento da 1ª parcela, o valor pago não será devolvido, pois remunera o trabalho de desenvolvimento já iniciado e os custos de infraestrutura.</p>
<p><span class="num">7.2.</span> <strong>Após a entrega:</strong> não há vínculo de permanência mínima. O contratante pode encerrar o plano de manutenção a qualquer momento, assumindo a gestão independente da infraestrutura.</p>
<p><span class="num">7.3.</span> A Tecnosup poderá cancelar este contrato em caso de inadimplência superior a 60 dias ou uso do sistema para fins ilegais ou que violem os termos das plataformas de infraestrutura utilizadas.</p>

<h2>Cláusula 8 — Disposições Gerais</h2>
<p><span class="num">8.1.</span> Qualquer funcionalidade não prevista na Cláusula 1 solicitada após a assinatura será tratada como novo serviço, com orçamento separado e aprovação prévia por escrito.</p>
<p><span class="num">8.2.</span> As partes se comprometem a manter sigilo sobre as informações técnicas, comerciais e operacionais trocadas durante a vigência deste contrato.</p>
<p><span class="num">8.3.</span> A eventual invalidade de qualquer cláusula não afeta a validade das demais.</p>

<h2>Cláusula 9 — Foro</h2>
<p>Fica eleito o foro da Comarca de <strong>Cruzeiro — SP</strong> para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>

<div class="aprovacao">
  <strong>Aprovação do sistema:</strong> após a entrega, o contratante terá 3 dias úteis para aprovar ou solicitar ajustes dentro do escopo. Decorrido esse prazo sem manifestação, o sistema será considerado aprovado e a 2ª parcela passará a ser devida.
</div>

<p style="margin-top:28px;">Este contrato é celebrado em 2 (duas) vias de igual teor e forma.</p>
<p>Cruzeiro — SP, ${hoje}.</p>

<div class="assinatura">
  <div class="assinatura-campo">
    Contratante<br>
    <span class="assinatura-nome">${form.clienteNome || "_______________________________________________"}</span><br>
    CPF/CNPJ: ${form.clienteCpfCnpj || "___________________________"}
  </div>
  <div class="assinatura-campo">
    Contratada — Tecnosup<br>
    <span class="assinatura-nome">Abraão Cardoso</span><br><br>
    <span class="assinatura-nome">Vitor</span>
  </div>
</div>

<div class="footer">
  <span>Tecnosup — Cruzeiro, SP — (12) 99103-7897</span>
  <span>Contrato de Prestação de Serviços</span>
</div>

</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato-${form.clienteNome.toLowerCase().replace(/\s+/g, "-") || "tecnosup"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none text-[#e0e0e0]";
  const inputStyle = { background: "#030407", border: "1px solid #1f3566" };
  const fo = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = "#0eb3ff55"),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.currentTarget.style.borderColor = "#1f3566"),
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="mb-8 mt-14 md:mt-0">
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">PAINEL</p>
            <h1 className="font-orbitron text-2xl font-bold text-white">Gerador de Contrato</h1>
            <p className="text-sm text-[#555] mt-1">Preencha os dados — cláusulas, parcelamento e materiais são gerados automaticamente</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
            {/* Coluna esquerda — contratante */}
            <div className="rounded-xl border p-5 space-y-4" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
              <p className="font-orbitron text-[10px] tracking-widest text-[#555]">DADOS DO CONTRATANTE</p>
              <Field label="NOME / RAZÃO SOCIAL *">
                <input value={form.clienteNome} onChange={(e) => setForm((f) => ({ ...f, clienteNome: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="Ex: Ortega Barber" {...fo} />
              </Field>
              <Field label="CPF / CNPJ">
                <input value={form.clienteCpfCnpj} onChange={(e) => setForm((f) => ({ ...f, clienteCpfCnpj: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="000.000.000-00" {...fo} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="TELEFONE">
                  <input value={form.clienteTelefone} onChange={(e) => setForm((f) => ({ ...f, clienteTelefone: e.target.value }))}
                    className={inputCls} style={inputStyle} placeholder="(12) 99999-9999" {...fo} />
                </Field>
                <Field label="SEGMENTO">
                  <input value={form.clienteSegmento} onChange={(e) => setForm((f) => ({ ...f, clienteSegmento: e.target.value }))}
                    className={inputCls} style={inputStyle} placeholder="Ex: Barbearia" {...fo} />
                </Field>
              </div>
              <Field label="E-MAIL">
                <input type="email" value={form.clienteEmail} onChange={(e) => setForm((f) => ({ ...f, clienteEmail: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="email@exemplo.com" {...fo} />
              </Field>
              <Field label="ENDEREÇO">
                <input value={form.clienteEndereco} onChange={(e) => setForm((f) => ({ ...f, clienteEndereco: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="Rua, número, bairro" {...fo} />
              </Field>
              <Field label="CIDADE / UF">
                <input value={form.clienteCidade} onChange={(e) => setForm((f) => ({ ...f, clienteCidade: e.target.value }))}
                  className={inputCls} style={inputStyle} placeholder="Ex: Cruzeiro, SP" {...fo} />
              </Field>
            </div>

            {/* Coluna direita — projeto */}
            <div className="rounded-xl border p-5 space-y-4" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
              <p className="font-orbitron text-[10px] tracking-widest text-[#555]">DADOS DO PROJETO</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="VALOR TOTAL DO SETUP (R$)">
                  <input type="number" value={form.valorTotal} onChange={(e) => setForm((f) => ({ ...f, valorTotal: e.target.value }))}
                    className={inputCls} style={inputStyle} {...fo} />
                </Field>
                <Field label="MENSALIDADE APÓS 1 ANO (R$)">
                  <input type="number" value={form.valorMensalidade} onChange={(e) => setForm((f) => ({ ...f, valorMensalidade: e.target.value }))}
                    className={inputCls} style={inputStyle} {...fo} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="PRAZO (dias úteis)">
                  <input type="number" value={form.prazoEntrega} onChange={(e) => setForm((f) => ({ ...f, prazoEntrega: e.target.value }))}
                    className={inputCls} style={inputStyle} {...fo} />
                </Field>
                <Field label="DATA DE INÍCIO">
                  <input type="date" value={form.dataInicio} onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))}
                    className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }} />
                </Field>
              </div>
              <Field label="FORMA DE PAGAMENTO DO SETUP">
                <select value={form.formaPagamento} onChange={(e) => setForm((f) => ({ ...f, formaPagamento: e.target.value }))}
                  className={inputCls} style={{ ...inputStyle, cursor: "pointer" }} {...fo}>
                  <option>Pix</option>
                  <option>Transferência bancária</option>
                  <option>Dinheiro</option>
                  <option>Cartão de crédito</option>
                </select>
              </Field>
              <Field label="MÓDULOS / FUNCIONALIDADES (uma por linha)">
                <textarea value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                  rows={7} className={`${inputCls} resize-none`} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
              </Field>
            </div>
          </div>

          {/* Preview parcelas */}
          {form.valorTotal && (
            <div className="mt-4 max-w-4xl rounded-lg border px-5 py-3 flex gap-6 items-center"
              style={{ background: "#0b1121", borderColor: "#1f3566" }}>
              <div className="text-xs text-[#555] font-orbitron tracking-widest">PARCELAMENTO</div>
              <div className="text-sm text-white">
                1ª entrada: <span className="text-[#0eb3ff] font-bold">R${(Number(form.valorTotal) / 2).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                <span className="text-[#555] mx-3">+</span>
                2ª na entrega: <span className="text-[#0eb3ff] font-bold">R${(Number(form.valorTotal) / 2).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          <div className="mt-6 max-w-4xl">
            <button onClick={gerarHTML} disabled={!form.clienteNome.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-orbitron text-sm font-bold text-black transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 24px rgba(14,179,255,0.25)" }}>
              <Download size={16} /> GERAR CONTRATO
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
