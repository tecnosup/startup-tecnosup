"use client";
import { useState } from "react";
import { Check } from "lucide-react";

const servicosAssistencia = [
  { label: "Diagnóstico Técnico", price: 0 },
  { label: "Formatação Windows", price: 60 },
  { label: "Remoção de Vírus", price: 30 },
  { label: "Otimização Windows", price: 30 },
  { label: "Limpeza Simples", price: 50 },
  { label: "Limpeza Complexa", price: 100 },
  { label: "Montagem de PC", price: 100 },
  { label: "Pendrive Bootável", price: 90 },
];

export default function Planos() {
  const [selected, setSelected] = useState<string[]>([]);

  const total = selected.reduce((acc, label) => {
    const s = servicosAssistencia.find((x) => x.label === label);
    return acc + (s?.price ?? 0);
  }, 0);

  const toggle = (label: string) =>
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );

  return (
    <section id="planos" className="relative z-10 py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-12 reveal">
          <p className="font-orbitron text-[10px] md:text-xs tracking-[0.3em] text-[#0eb3ff] mb-3">PREÇOS</p>
          <h2 className="font-orbitron text-2xl md:text-4xl font-bold text-white mb-4">
            Monte seu orçamento
          </h2>
          <p className="text-[#aaa] max-w-xl mx-auto text-sm md:text-base">
            Preços fixos, sem surpresas. Selecione os serviços e veja o total na hora.
          </p>
        </div>

        <div className="reveal-left rounded-xl border overflow-hidden" style={{ borderColor: "#1f3566" }}>
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between"
            style={{ background: "#0b1121", borderColor: "#1f3566" }}>
            <p className="font-orbitron text-xs tracking-widest text-[#0eb3ff]">ASSISTÊNCIA TÉCNICA</p>
            <p className="text-xs text-[#aaa]">Selecione os serviços</p>
          </div>

          {/* Items */}
          <div className="divide-y" style={{ background: "#070b15", borderColor: "#1f3566" }}>
            {servicosAssistencia.map((s) => (
              <button
                key={s.label}
                onClick={() => toggle(s.label)}
                className="w-full flex items-center justify-between px-6 py-4 transition-all duration-200 text-left"
                style={{
                  background: selected.includes(s.label) ? "rgba(14,179,255,0.06)" : "transparent",
                  borderColor: "#1f3566",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: selected.includes(s.label) ? "#0eb3ff" : "#333",
                      background: selected.includes(s.label) ? "#0eb3ff" : "transparent",
                    }}
                  >
                    {selected.includes(s.label) && <Check size={11} className="text-black" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-white">{s.label}</span>
                </div>
                <span
                  className="text-sm font-bold font-orbitron flex-shrink-0 ml-4"
                  style={{ color: s.price === 0 ? "#00ff88" : "#0eb3ff" }}
                >
                  {s.price === 0 ? "Grátis" : `R$ ${s.price}`}
                </span>
              </button>
            ))}
          </div>

          {/* Total */}
          <div className="px-6 py-5 border-t flex items-center justify-between"
            style={{ background: "#0b1121", borderColor: "#0eb3ff22" }}>
            <div>
              <p className="font-orbitron text-xs text-[#aaa]">TOTAL ESTIMADO</p>
              <p className="text-[10px] text-[#666] mt-0.5">Diagnóstico gratuito confirma o valor final</p>
            </div>
            <p
              className="font-orbitron text-3xl font-black"
              style={{ color: "#00ff88", textShadow: "0 0 20px rgba(0,255,136,0.4)" }}
            >
              {total === 0 ? "Grátis" : `R$ ${total}`}
            </p>
          </div>
        </div>

        <div className="mt-4 text-center reveal">
          <a
            href="#contato"
            className="inline-flex items-center gap-2 px-7 py-3 font-orbitron text-xs font-bold rounded-lg border border-[#0eb3ff] text-[#0eb3ff] hover:bg-[#0eb3ff] hover:text-black transition-all duration-200"
          >
            FALAR COM O VITOR →
          </a>
        </div>

      </div>
    </section>
  );
}
