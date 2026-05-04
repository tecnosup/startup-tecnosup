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
  { num: "01", title: "Demo ao vivo", desc: "Você vê o sistema funcionando antes de qualquer decisão." },
  { num: "02", title: "Contrato assinado", desc: "Documento claro, sem surpresas. Tudo registrado." },
  { num: "03", title: "7 dias de build", desc: "Desenvolvemos com a identidade do seu negócio." },
  { num: "04", title: "No ar + treinamento", desc: "Entregamos com domínio, hospedagem e te ensinamos." },
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
        <div className="text-center mb-12 md:mb-16 reveal">
          <p className="font-orbitron text-[10px] md:text-xs tracking-[0.3em] text-[#0eb3ff] mb-3">
            SISTEMAS WEB
          </p>
          <h2 className="font-orbitron text-2xl md:text-4xl font-bold text-white mb-4">
            Sites que trabalham por você
          </h2>
          <p className="text-[#aaa] max-w-2xl mx-auto text-sm md:text-base">
            Sistemas completos com agendamento online e painel admin. Toda a infraestrutura fica no seu nome — você é dono de tudo.
          </p>
        </div>

        {/* Features + Terminal */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-start mb-16 md:mb-20">
          <div className="reveal-left">
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

          {/* Terminal */}
          <div className="reveal-right">
            <div className="rounded-xl overflow-hidden border"
              style={{ borderColor: "#1f3566", boxShadow: "0 30px 60px rgba(0,0,0,0.5), 0 0 30px rgba(14,179,255,0.08)" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                <span className="ml-3 text-xs text-[#aaa] font-mono">admin@tecnosup — sistema-cliente</span>
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed" style={{ background: "#030407", minHeight: 220 }}>
                <p style={{ color: "#0eb3ff" }}>$ tecnosup deploy --client ortega-barber</p>
                <p className="text-[#aaa] mt-2">Verificando configurações...</p>
                <p style={{ color: "#00ff88" }} className="mt-1">✓ Firebase configurado</p>
                <p style={{ color: "#00ff88" }}>✓ Cloudinary conectado</p>
                <p style={{ color: "#00ff88" }}>✓ Domínio ortegabarber.com.br ativo</p>
                <p style={{ color: "#00ff88" }}>✓ Deploy na Vercel concluído</p>
                <p className="text-[#aaa] mt-3">Build concluído em 23s</p>
                <p className="mt-2" style={{ color: "#0eb3ff" }}>$ _<span className="cursor-blink">|</span></p>
              </div>
            </div>
            <p className="text-xs text-[#aaa] text-center mt-3">
              Domínio, hospedagem e dados ficam na conta do cliente.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-10 reveal">
          <h3 className="font-orbitron text-lg md:text-xl font-bold text-white text-center mb-10">
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
              <p className="font-orbitron text-sm font-bold text-white">Pronto para começar?</p>
              <p className="text-sm text-[#aaa] mt-1">Site no ar em 7 dias ou a gente te avisa o motivo.</p>
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
        <div className="grid md:grid-cols-2 gap-6 reveal-stagger">
          {/* Setup */}
          <div className="relative rounded-xl border p-6 md:p-8 overflow-hidden"
            style={{ background: "#0b1121", borderColor: "#0eb3ff44", boxShadow: "0 0 40px rgba(14,179,255,0.06)" }}>
            <div className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: "linear-gradient(90deg, #0eb3ff, #7000ff)" }} />
            <p className="font-orbitron text-[10px] tracking-widest text-[#0eb3ff] mb-1">SETUP INICIAL</p>
            <p className="font-orbitron text-4xl font-black text-white mb-1">
              R$ 1.500
              <span className="text-lg text-[#aaa] font-normal"> – 2.000</span>
            </p>
            <p className="text-sm text-[#aaa] mb-6">50% no início · 50% na entrega</p>
            <div className="space-y-2 mb-6">
              {inclusoSetup.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check size={14} style={{ color: "#0eb3ff" }} />
                  <span className="text-sm text-white">{item}</span>
                </div>
              ))}
            </div>
            <a
              href="#contato"
              className="block w-full text-center py-3.5 font-orbitron text-sm font-bold rounded-lg text-black transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 24px rgba(14,179,255,0.3)" }}
            >
              QUERO MEU SITE AGORA →
            </a>
          </div>

          {/* Mensalidade */}
          <div className="rounded-xl border p-6 md:p-8 flex flex-col justify-between"
            style={{ background: "#070b15", borderColor: "#1f3566" }}>
            <div>
              <p className="font-orbitron text-[10px] tracking-widest text-[#aaa] mb-1">APÓS 1 ANO</p>
              <p className="font-orbitron text-4xl font-black text-white mb-1">
                R$ 129
                <span className="text-lg text-[#aaa] font-normal">/mês</span>
              </p>
              <p className="text-sm text-[#aaa] mb-6">Manutenção + suporte contínuo</p>
              <div className="p-4 rounded-xl border mb-6"
                style={{ borderColor: "#0eb3ff22", background: "rgba(14,179,255,0.04)" }}>
                <p className="text-xs text-[#aaa] mb-1">Custo de infraestrutura</p>
                <p className="font-orbitron text-3xl font-black" style={{ color: "#00ff88" }}>R$ 0</p>
                <p className="text-xs text-[#aaa] mt-1">por mês — infra na conta do cliente</p>
              </div>
            </div>
            <a
              href="#contato"
              className="block w-full text-center py-3.5 font-orbitron text-xs font-bold rounded-lg border border-[#0eb3ff] text-[#0eb3ff] hover:bg-[#0eb3ff] hover:text-black transition-all duration-200"
            >
              FALAR SOBRE MENSALIDADE →
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
