import { Check, LayoutDashboard, Globe, MessageCircle, BarChart3, Shield, Code } from "lucide-react";

const features = [
  { icon: LayoutDashboard, title: "Landing page", desc: "Com agendamento online" },
  { icon: Shield, title: "Painel admin", desc: "Gerencie pelo celular" },
  { icon: Globe, title: "Domínio .com.br", desc: "No seu nome" },
  { icon: Code, title: "Hospedagem", desc: "Na sua conta" },
  { icon: MessageCircle, title: "WhatsApp", desc: "Com notificações" },
  { icon: BarChart3, title: "Analytics", desc: "Google Analytics" },
  { icon: Check, title: "1 ano de suporte", desc: "Acompanhamento" },
  { icon: Code, title: "Código 100% seu", desc: "Sem dependência" },
];

const steps = [
  { num: "01", title: "Demo ao vivo", desc: "Você testa o sistema antes de assinar qualquer coisa." },
  { num: "02", title: "Contrato simples", desc: "Um documento direto. Sem letras miúdas, sem armadilha." },
  { num: "03", title: "Site no ar em 7 dias", desc: "Construído com a cara do seu negócio. Do zero, em uma semana." },
  { num: "04", title: "Entregue e funcionando", desc: "Domínio, hospedagem e treinamento — tudo no seu nome." },
];

const inclusoSetup = [
  "Landing page profissional com agendamento online",
  "Painel admin completo",
  "Domínio .com.br registrado no seu nome",
  "Firebase + Cloudinary na sua conta",
  "Google Analytics incluso",
  "Suporte por 1 ano",
];

export default function SistemasWeb() {
  return (
    <section id="sistemas" className="relative z-10 py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="reveal font-orbitron text-[10px] md:text-xs tracking-[0.3em] text-[#0eb3ff] mb-3">
            SISTEMAS WEB
          </p>
          <h2 className="reveal title-drift font-orbitron text-2xl md:text-4xl font-bold text-white mb-4">
            Sites que trabalham por você
          </h2>
          <p className="reveal text-[#aaa] max-w-2xl mx-auto text-sm md:text-base">
            Sistemas completos com agendamento online e painel admin. Toda a infraestrutura fica no seu nome — você é dono de tudo.
          </p>
        </div>

        {/* Features + Terminal */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center mb-16 md:mb-20">
          <div className="reveal-left scale-in">
            <h3 className="font-orbitron text-lg font-bold text-white mb-5">
              O que está incluso
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: "#0b1121", borderColor: "#1f3566" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(14,179,255,0.1)", border: "1px solid #0eb3ff33" }}>
                    <f.icon size={14} style={{ color: "#0eb3ff" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white leading-tight">{f.title}</p>
                    <p className="text-[11px] text-[#aaa] leading-tight mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="#contato"
              className="flex items-center justify-center sm:inline-flex gap-2 px-7 py-3.5 font-orbitron text-xs md:text-sm font-bold rounded-lg text-black transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0eb3ff, #7000ff)",
                boxShadow: "0 0 24px rgba(14,179,255,0.35)",
              }}
            >
              QUERO VER UMA DEMO AO VIVO →
            </a>
            <p className="text-xs text-[#aaa] mt-3">Sem compromisso. Você vê funcionando antes de decidir.</p>
          </div>

          {/* Browser mockup */}
          <div className="reveal-right scale-in">
            <div className="rounded-xl overflow-hidden border"
              style={{ borderColor: "#1f3566", boxShadow: "0 30px 60px rgba(0,0,0,0.5), 0 0 30px rgba(14,179,255,0.08)" }}>
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                <div className="flex-1 mx-3 px-3 py-1 rounded-md flex items-center gap-2"
                  style={{ background: "#070b15", border: "1px solid #1f3566" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-[11px] text-[#aaa] font-mono">seunegocio.com.br/admin</span>
                </div>
              </div>
              {/* Admin panel */}
              <div style={{ background: "#0a0a0a" }}>
                {/* Top bar */}
                <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#666]">Quinta-feira, 15 de Maio</p>
                    <p className="text-base font-bold text-white leading-tight mt-0.5">Seu Negócio</p>
                    <p className="text-[10px] text-[#555]">Painel ativo · 14 agendamentos</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                    <span className="text-[10px] font-bold" style={{ color: "#00ff88" }}>Online</span>
                  </div>
                </div>

                {/* CTA button */}
                <div className="px-4 pb-3">
                  <div className="w-full py-2 rounded-lg border text-center text-xs font-bold text-white"
                    style={{ borderColor: "#333", background: "#141414" }}>
                    + NOVO AGENDAMENTO
                  </div>
                </div>

                {/* Alert */}
                <div className="mx-4 mb-3 px-3 py-2 rounded-lg flex items-center justify-between"
                  style={{ background: "rgba(255,189,46,0.06)", border: "1px solid rgba(255,189,46,0.25)" }}>
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#ffbd2e" }}>⚠</span>
                    <span className="text-[11px]" style={{ color: "#ffbd2e" }}>2 agendamentos aguardando confirmação</span>
                  </div>
                  <span className="text-[11px]" style={{ color: "#ffbd2e" }}>→</span>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-2 px-4 mb-3">
                  {[
                    { label: "FATURAMENTO ESTE MÊS", value: "R$ 3.840", sub: "28 atendimentos", color: "#00ff88" },
                    { label: "AGENDAMENTOS HOJE", value: "8", sub: "3 confirmados", color: "#0eb3ff" },
                    { label: "TICKET MÉDIO", value: "R$ 137", sub: "↑ 12% vs mês anterior", color: "#00ff88" },
                    { label: "CLIENTES NOVOS", value: "11", sub: "este mês", color: "#0eb3ff" },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-lg" style={{ background: "#141414", border: "1px solid #1e1e1e" }}>
                      <p className="text-[9px] text-[#555] mb-1 leading-tight">{m.label}</p>
                      <p className="text-base font-bold leading-none" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[9px] text-[#444] mt-1">{m.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Mini chart */}
                <div className="mx-4 mb-3 p-3 rounded-lg" style={{ background: "#141414", border: "1px solid #1e1e1e" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] text-[#555]">FATURAMENTO — ÚLTIMOS 6 MESES</p>
                    <p className="text-[9px]" style={{ color: "#0eb3ff" }}>VER TUDO →</p>
                  </div>
                  <p className="text-sm font-bold text-white mb-0.5">R$ 3.840</p>
                  <p className="text-[9px] text-[#444] mb-2">Melhor mês: Mar · R$ 4.210</p>
                  <svg viewBox="0 0 200 40" className="w-full" style={{ height: 36 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0eb3ff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0eb3ff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,35 C20,30 40,20 70,15 C100,10 120,8 150,5 C170,3 185,12 200,18" fill="none" stroke="#0eb3ff" strokeWidth="1.5" />
                    <path d="M0,35 C20,30 40,20 70,15 C100,10 120,8 150,5 C170,3 185,12 200,18 L200,40 L0,40 Z" fill="url(#chartGrad)" />
                  </svg>
                </div>

                {/* Bottom nav */}
                <div className="grid grid-cols-4 border-t" style={{ borderColor: "#1e1e1e", background: "#0a0a0a" }}>
                  {[
                    { icon: LayoutDashboard, label: "Painel", active: true },
                    { icon: BarChart3, label: "Financeiro", active: false },
                    { icon: MessageCircle, label: "WhatsApp", active: false },
                    { icon: Globe, label: "Site", active: false },
                  ].map((n) => (
                    <div key={n.label} className="flex flex-col items-center py-2 gap-0.5">
                      <n.icon size={14} style={{ color: n.active ? "#0eb3ff" : "#444" }} />
                      <span className="text-[9px]" style={{ color: n.active ? "#0eb3ff" : "#444" }}>{n.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-[#aaa] text-center mt-3">
              Domínio, hospedagem e dados ficam na conta do cliente.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-10">
          <h3 className="reveal title-drift font-orbitron text-lg md:text-xl font-bold text-white text-center mb-10">
            Como funciona
          </h3>
          <div className="reveal-stagger grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center p-4 rounded-xl border"
                style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px"
                    style={{ background: "linear-gradient(90deg, #0eb3ff33, transparent)" }} />
                )}
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ border: "2px solid #0eb3ff33", background: "rgba(14,179,255,0.08)" }}>
                  <span className="font-orbitron text-sm font-bold" style={{ color: "#0eb3ff" }}>{s.num}</span>
                </div>
                <h4 className="font-orbitron text-xs font-bold text-white mb-1">{s.title}</h4>
                <p className="text-[11px] text-[#aaa] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border"
            style={{ background: "rgba(14,179,255,0.04)", borderColor: "#0eb3ff22" }}>
            <div className="text-center sm:text-left">
              <p className="font-orbitron text-sm font-bold text-white">Pronto para ver funcionando?</p>
              <p className="text-sm text-[#aaa] mt-1">Site no ar em 7 dias. Se atrasar, você é o primeiro a saber.</p>
            </div>
            <a
              href="#contato"
              className="flex-shrink-0 px-6 py-3 font-orbitron text-xs font-bold rounded-lg border border-[#0eb3ff] text-[#0eb3ff] hover:bg-[#0eb3ff] hover:text-black transition-all duration-200 whitespace-nowrap"
            >
              FALAR COM A TECNOSUP →
            </a>
          </div>
        </div>

        {/* Pricing */}
        <div className="reveal scale-in max-w-xl mx-auto w-full">
          <div className="relative rounded-xl border p-6 md:p-8 overflow-hidden flex flex-col"
            style={{ background: "#0b1121", borderColor: "#0eb3ff44", boxShadow: "0 0 40px rgba(14,179,255,0.08)" }}>
            <div className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: "linear-gradient(90deg, #0eb3ff, #7000ff)" }} />
            <p className="font-orbitron text-[10px] tracking-widest text-[#0eb3ff] mb-1">SETUP INICIAL</p>
            <p className="font-orbitron text-4xl font-black text-white mb-1">
              R$ 1.500
              <span className="text-lg text-[#aaa] font-normal"> – 2.000</span>
            </p>
            <p className="text-sm text-[#aaa] mb-6">50% no início · 50% na entrega</p>
            <div className="space-y-2 mb-6 flex-1">
              {inclusoSetup.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check size={14} style={{ color: "#0eb3ff" }} />
                  <span className="text-sm text-white">{item}</span>
                </div>
              ))}
            </div>
            <a
              href="#contato"
              className="block w-full text-center py-3.5 font-orbitron text-sm font-bold rounded-lg text-black transition-all duration-200 hover:scale-[1.02] mt-auto"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 24px rgba(14,179,255,0.3)" }}
            >
              QUERO MEU SITE AGORA →
            </a>
            <p className="text-xs text-[#666] text-center mt-3">
              Após 1 ano: manutenção + suporte contínuo por R$ 89,90/mês
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
