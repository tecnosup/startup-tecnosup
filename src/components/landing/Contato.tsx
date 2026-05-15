"use client";
import { MessageCircle, Instagram } from "lucide-react";

const contatos = [
  {
    nome: "Cardoso (Abraão)",
    cargo: "Co-fundador · Tecnosup",
    foco: "Suporte técnico, sistemas e e-commerce",
    whatsapp: "5512996065673",
    msg: "Oi Cardoso, vi o site da Tecnosup e quero saber mais!",
  },
  {
    nome: "Vitor",
    cargo: "Co-fundador · Tecnosup",
    foco: "Suporte técnico, sistemas e e-commerce",
    whatsapp: "5512991037897",
    msg: "Oi Vitor, vi o site da Tecnosup e quero saber mais!",
  },
];

export default function Contato() {
  return (
    <section id="contato" className="relative z-10 py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <p className="reveal font-orbitron text-[10px] md:text-xs tracking-[0.3em] text-[#0eb3ff] mb-3">CONTATO</p>
          <h2 className="reveal title-drift font-orbitron text-2xl md:text-4xl font-bold text-white mb-4">
            Bora conversar?
          </h2>
          <p className="reveal text-[#aaa] max-w-xl mx-auto text-sm md:text-base">
            Sem enrolação. Manda mensagem, mostramos o sistema ao vivo e você decide.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-10">
          {contatos.map((c, i) => (
            <a
              key={i}
              href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(c.msg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="scale-in group relative flex flex-col p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1"
              style={{ background: "#0b1121", borderColor: "#1f3566" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#25d36644";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 20px 40px rgba(0,0,0,0.4), 0 0 24px rgba(37,211,102,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1f3566";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, #25d366, transparent)" }} />

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(37,211,102,0.12)", border: "1px solid #25d36633" }}>
                  <MessageCircle size={22} style={{ color: "#25d366" }} />
                </div>
                <div>
                  <p className="font-orbitron text-sm font-bold text-white">{c.nome}</p>
                  <p className="text-xs text-[#aaa] mt-0.5">{c.cargo}</p>
                </div>
              </div>

              <p className="text-xs text-[#aaa] mb-4 leading-relaxed">
                <span className="text-white font-semibold">Fala comigo sobre:</span> {c.foco}
              </p>

              <div className="flex items-center gap-2 mt-auto">
                <div className="w-2 h-2 rounded-full bg-[#25d366]" style={{ boxShadow: "0 0 6px #25d366" }} />
                <p className="text-sm font-bold" style={{ color: "#25d366" }}>
                  Abrir WhatsApp →
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Social */}
      </div>
    </section>
  );
}
