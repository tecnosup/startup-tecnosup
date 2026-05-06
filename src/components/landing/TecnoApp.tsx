import { Flame, Zap, Wrench, Gamepad2 } from "lucide-react";

const modulos = [
  {
    icon: Flame,
    label: "LIMPEZA",
    color: "#0eb3ff",
    desc: "Remove arquivos temporários, lixo do sistema e libera GBs de espaço automaticamente.",
  },
  {
    icon: Zap,
    label: "OTIMIZAÇÃO",
    color: "#0eb3ff",
    desc: "Desativa processos desnecessários e ajusta configurações para máxima performance.",
  },
  {
    icon: Wrench,
    label: "REPAROS",
    color: "#0eb3ff",
    desc: "Diagnóstico e correção automática de erros do Windows, registro e arquivos corrompidos.",
  },
  {
    icon: Gamepad2,
    label: "MODO GAMER",
    color: "#7000ff",
    desc: "Ativa perfil de alta performance para jogos: prioridade de CPU, GPU e rede.",
    gradient: true,
  },
];

export default function TecnoApp() {
  return (
    <section id="tecnoapp" className="relative z-10 py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <span
            className="reveal inline-block font-orbitron text-[10px] md:text-xs tracking-[0.3em] px-3 py-1 rounded-full border mb-4"
            style={{ color: "#0eb3ff", borderColor: "#0eb3ff33", background: "rgba(14,179,255,0.08)" }}
          >
            EM DESENVOLVIMENTO ATIVO
          </span>
          <h2 className="reveal title-drift font-orbitron text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            TecnoApp —{" "}
            <span style={{ color: "#0eb3ff" }}>otimização automática</span>
            <br />
            para Windows
          </h2>
          <p className="reveal text-[#aaa] max-w-xl mx-auto">
            Software exclusivo Tecnosup. Limpeza, otimização, reparos e Modo Gamer em um único
            painel. Produto desenvolvido internamente, em versão final.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* App mockup — hidden on mobile, too small to be useful */}
          <div className="hidden md:block reveal-left scale-in">
            <div
              className="rounded-lg overflow-hidden border"
              style={{
                borderColor: "#1f3566",
                boxShadow: "0 30px 60px rgba(0,0,0,0.7), 0 0 40px rgba(14,179,255,0.1)",
                background: "#07080f",
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ background: "#0a0c12", borderColor: "#1a2a40" }}
              >
                <span className="font-orbitron text-xs font-bold tracking-widest text-white">
                  TECNOSUP
                </span>
                <span className="text-[#555] text-xs font-mono">TECNOAPP OTIMIZAÇÃO · Pro Edition</span>
                <div className="flex gap-4 text-[#555] text-xs">
                  <span>—</span>
                  <span>□</span>
                  <span className="hover:text-red-400 cursor-pointer">✕</span>
                </div>
              </div>

              {/* App body */}
              <div className="flex" style={{ minHeight: 320 }}>
                {/* Sidebar */}
                <div
                  className="w-48 flex flex-col gap-2 p-4 border-r"
                  style={{ background: "#050710", borderColor: "#1a2a40" }}
                >
                  {modulos.map((m, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-2 px-3 py-2.5 rounded text-xs font-bold font-orbitron text-left transition-all"
                      style={{
                        color: m.color,
                        border: `1px solid ${m.gradient ? "#7000ff66" : "#0eb3ff33"}`,
                        background: m.gradient
                          ? "linear-gradient(135deg, rgba(112,0,255,0.2), rgba(14,179,255,0.1))"
                          : "rgba(14,179,255,0.08)",
                      }}
                    >
                      <m.icon size={14} />
                      {m.label}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button className="px-3 py-2 text-xs font-orbitron font-bold rounded border border-red-900 text-red-500">
                    SAIR
                  </button>
                </div>

                {/* Main panel */}
                <div className="flex-1 p-6">
                  <p className="font-orbitron text-2xl font-bold text-white mb-1">PAINEL</p>
                  <p className="text-xs text-[#555] mb-6">Sistema pronto · 03/05/2026</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "LIMPEZA", value: "459.30", unit: "GB", sub: "usados de 470.71 GB", color: "#0eb3ff", btn: "Limpar" },
                      { label: "OTIMIZAÇÃO", value: "4 de 4", unit: "", sub: "otimizações selecionadas", color: "#0eb3ff", btn: "Otimizar" },
                      { label: "REPAROS", value: "5", unit: "", sub: "ferramentas disponíveis", color: "#0eb3ff", btn: "Abrir" },
                      { label: "MODO GAMER", value: "INATIVO", unit: "", sub: "pronto para ativar", color: "#7000ff", btn: "Abrir", purple: true },
                    ].map((card, i) => (
                      <div
                        key={i}
                        className="rounded-lg p-4 border flex flex-col gap-2"
                        style={{
                          background: "#0a0c12",
                          borderColor: card.purple ? "#7000ff44" : "#0eb3ff22",
                        }}
                      >
                        <p className="font-orbitron text-xs font-bold" style={{ color: card.color }}>
                          {card.label}
                        </p>
                        <p className="font-orbitron text-xl font-black text-white">
                          {card.value}{" "}
                          {card.unit && <span className="text-sm font-normal text-[#888]">{card.unit}</span>}
                        </p>
                        <p className="text-[10px] text-[#555]">{card.sub}</p>
                        <button
                          className="mt-auto text-xs font-bold rounded py-1.5 text-black"
                          style={{
                            background: card.purple
                              ? "linear-gradient(135deg, #7000ff, #0eb3ff)"
                              : "#0eb3ff",
                          }}
                        >
                          {card.btn}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Módulos */}
          <div className="reveal-stagger reveal-right space-y-4">
            <p className="font-orbitron text-sm text-[#0eb3ff] mb-6">4 MÓDULOS INTEGRADOS</p>
            {modulos.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-lg border transition-all duration-300 hover:border-[#0eb3ff44]"
                style={{ background: "#0b1121", borderColor: "#1f3566" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: m.gradient
                      ? "linear-gradient(135deg, rgba(112,0,255,0.2), rgba(14,179,255,0.1))"
                      : "rgba(14,179,255,0.1)",
                    border: `1px solid ${m.gradient ? "#7000ff44" : "#0eb3ff22"}`,
                  }}
                >
                  <m.icon size={18} style={{ color: m.color }} />
                </div>
                <div>
                  <p className="font-orbitron text-sm font-bold text-white mb-1">{m.label}</p>
                  <p className="text-sm text-[#aaa] leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}

            <div
              className="reveal mt-6 p-4 rounded-lg border"
              style={{
                borderColor: "#0eb3ff22",
                background: "rgba(14,179,255,0.04)",
              }}
            >
              <p className="text-xs text-[#aaa] leading-relaxed">
                🚧 O TecnoApp está em desenvolvimento ativo. Versão final em breve.
                Entre em contato para ser avisado do lançamento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
