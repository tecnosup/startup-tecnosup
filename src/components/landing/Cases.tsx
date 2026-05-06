"use client";
import { ExternalLink, Clock, CheckCircle } from "lucide-react";

const cases = [
  {
    badge: "01",
    cliente: "NYX Streetwear",
    segmento: "E-commerce · Moda",
    status: "No ar",
    stack: ["Next.js", "Firebase", "Cloudinary"],
    desc: "Loja virtual com catálogo de produtos, identidade visual streetwear e gestão de pedidos.",
    link: "https://nyx-xxx.vercel.app/",
  },
  {
    badge: "02",
    cliente: "Ortega Barber",
    segmento: "Barbearia · Cruzeiro, SP",
    status: "Em desenvolvimento",
    stack: ["Next.js", "Firebase", "Cloudinary"],
    desc: "Sistema completo de agendamento online com painel admin para gerenciar horários, serviços e galeria de fotos.",
    link: null,
  },
];

export default function Cases() {
  return (
    <section id="cases" className="relative z-10 py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12 md:mb-16">
          <p className="reveal font-orbitron text-[10px] md:text-xs tracking-[0.3em] text-[#0eb3ff] mb-3">CASES</p>
          <h2 className="reveal title-drift font-orbitron text-2xl md:text-4xl font-bold text-white mb-4">
            Projetos em andamento
          </h2>
          <p className="reveal text-[#aaa] max-w-xl mx-auto text-sm md:text-base">
            Primeiros clientes construídos com o template base da Tecnosup.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {cases.map((c, i) => (
            <div
              key={i}
              className="scale-in group relative rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ background: "#0b1121", borderColor: "#1f3566" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#0eb3ff44";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(14,179,255,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#1f3566";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, #0eb3ff, #7000ff)" }} />

              {/* Number watermark */}
              <div className="absolute top-4 right-4 font-orbitron text-6xl font-black opacity-[0.04] select-none text-white">
                {c.badge}
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  {c.status === "No ar" ? (
                    <CheckCircle size={12} style={{ color: "#22c55e" }} />
                  ) : (
                    <Clock size={12} style={{ color: "#ffbd2e" }} />
                  )}
                  <span className="text-xs font-orbitron" style={{ color: c.status === "No ar" ? "#22c55e" : "#ffbd2e" }}>
                    {c.status}
                  </span>
                </div>

                <h3 className="font-orbitron text-xl md:text-2xl font-bold text-white mb-1">{c.cliente}</h3>
                <p className="text-sm text-[#0eb3ff] mb-4">{c.segmento}</p>
                <p className="text-sm text-[#aaa] mb-6 leading-relaxed">{c.desc}</p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {c.stack.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-1 rounded-md"
                        style={{ background: "rgba(14,179,255,0.08)", color: "#0eb3ff", border: "1px solid #0eb3ff22" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {c.link ? (
                    <a href={c.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#0eb3ff] hover:text-white transition-colors flex-shrink-0 ml-3">
                      Ver site <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-xs text-[#aaa] flex-shrink-0 ml-3">Em breve</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal scale-in text-center">
          <p className="text-[#aaa] text-sm mb-5">Seu negócio pode ser o próximo case.</p>
          <a
            href="#contato"
            className="inline-flex items-center gap-2 px-8 py-3.5 font-orbitron text-sm font-bold rounded-lg text-black transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #0eb3ff, #7000ff)",
              boxShadow: "0 0 28px rgba(14,179,255,0.3)",
            }}
          >
            QUERO SER O PRÓXIMO →
          </a>
        </div>

      </div>
    </section>
  );
}
