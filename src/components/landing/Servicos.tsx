"use client";
import { Monitor, Globe, Wifi, Shield, Cpu, Wrench } from "lucide-react";

const servicos = [
  { icon: Monitor, title: "Formatação",      desc: "Windows reinstalado, drivers atualizados, PC como novo.",            price: "R$ 60"    },
  { icon: Shield,  title: "Remoção de Vírus",desc: "Limpeza completa de malware, adware e programas indesejados.",       price: "R$ 30"    },
  { icon: Wrench,  title: "Limpeza Física",  desc: "Limpeza interna, pasta térmica e otimização de hardware.",           price: "R$ 50–100"},
  { icon: Cpu,     title: "Montagem de PC",  desc: "Montagem profissional com garantia de funcionamento.",               price: "R$ 100+"  },
  { icon: Wifi,    title: "Diagnóstico",     desc: "Identificamos o problema sem cobrar nada por isso.",                 price: "Grátis"   },
  { icon: Globe,   title: "Suporte Remoto",  desc: "Resolvemos problemas online, sem sair de casa.",                    price: "Consultar"},
];

export default function Servicos() {
  return (
    <section id="servicos" className="relative z-10 py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12 md:mb-16">
          <p className="reveal font-orbitron text-[10px] md:text-xs tracking-[0.3em] text-[#0eb3ff] mb-3">
            ASSISTÊNCIA TÉCNICA
          </p>
          <h2 className="reveal title-drift font-orbitron text-2xl md:text-4xl font-bold text-white mb-4">
            Suporte presencial & remoto
          </h2>
          <p className="reveal text-[#aaa] max-w-xl mx-auto text-sm md:text-base">
            Atendemos em Cruzeiro e região. Diagnóstico sempre gratuito — só cobramos quando resolvemos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 reveal-stagger mb-10 md:mb-14">
          {servicos.map((s, i) => (
            <div
              key={i}
              className="group relative rounded-xl p-5 md:p-6 border transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              style={{ background: "#0b1121", borderColor: "#1f3566" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#0eb3ff44";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px rgba(0,0,0,0.4), 0 0 24px rgba(14,179,255,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#1f3566";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, #0eb3ff, transparent)" }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "rgba(14,179,255,0.1)", border: "1px solid rgba(14,179,255,0.2)" }}>
                  <s.icon size={20} style={{ color: "#0eb3ff" }} />
                </div>
                <span className="font-orbitron text-xs font-bold px-2 py-1 rounded-md"
                  style={{
                    color: s.price === "Grátis" ? "#00ff88" : "#0eb3ff",
                    background: s.price === "Grátis" ? "rgba(0,255,136,0.1)" : "rgba(14,179,255,0.1)",
                    border: `1px solid ${s.price === "Grátis" ? "rgba(0,255,136,0.2)" : "rgba(14,179,255,0.2)"}`,
                  }}>
                  {s.price}
                </span>
              </div>
              <h3 className="font-orbitron text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-[#aaa] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="reveal scale-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 rounded-xl border"
            style={{
              background: "linear-gradient(135deg, rgba(14,179,255,0.06), rgba(112,0,255,0.06))",
              borderColor: "#0eb3ff33",
            }}>
            <div className="text-center sm:text-left">
              <p className="font-orbitron text-base font-bold text-white">
                Diagnóstico <span style={{ color: "#00ff88" }}>100% gratuito</span>
              </p>
              <p className="text-sm text-[#aaa] mt-1">Descubra o problema antes de pagar qualquer coisa.</p>
            </div>
            <a href="#contato"
              className="flex-shrink-0 px-7 py-3 font-orbitron text-xs font-bold rounded-lg text-black transition-all duration-200 hover:scale-105 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 20px rgba(14,179,255,0.3)" }}>
              AGENDAR DIAGNÓSTICO →
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
