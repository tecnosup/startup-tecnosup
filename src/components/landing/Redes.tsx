"use client";
import { useState } from "react";
import { Instagram, Facebook, Youtube } from "lucide-react";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={22} height={22}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.19 8.19 0 004.79 1.53V6.84a4.85 4.85 0 01-1.02-.15z" />
  </svg>
);

const redes = [
  {
    nome: "Instagram",
    desc: "Ofertas relâmpago de serviços, bastidores da bancada e dicas rápidas de hardware.",
    href: "https://instagram.com/tecnosup",
    Icon: Instagram,
    color: "#E1306C",
    neon: "rgba(225,48,108,0.6)",
    neonSoft: "rgba(225,48,108,0.15)",
  },
  {
    nome: "Facebook",
    desc: "Comunidade, avaliações de clientes e novidades sobre a empresa.",
    href: "https://facebook.com/tecnosup",
    Icon: Facebook,
    color: "#1877F2",
    neon: "rgba(24,119,242,0.6)",
    neonSoft: "rgba(24,119,242,0.15)",
  },
  {
    nome: "TikTok",
    desc: "Vídeos satisfatórios de limpeza, montagens aceleradas e humor tech.",
    href: "https://tiktok.com/@tecnosup",
    Icon: TikTokIcon,
    color: "#69C9D0",
    neon: "rgba(105,201,208,0.6)",
    neonSoft: "rgba(105,201,208,0.15)",
  },
  {
    nome: "YouTube",
    desc: "Tutoriais aprofundados, benchmarks de jogos e reviews de peças.",
    href: "https://youtube.com/@tecnosup",
    Icon: Youtube,
    color: "#FF0000",
    neon: "rgba(255,0,0,0.6)",
    neonSoft: "rgba(255,0,0,0.15)",
  },
];

export default function Redes() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="redes" className="relative z-10 py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <p className="reveal font-orbitron text-[10px] md:text-xs tracking-[0.3em] text-[#0eb3ff] mb-3">
            REDES SOCIAIS
          </p>
          <h2 className="reveal title-drift font-orbitron text-2xl md:text-4xl font-bold text-white mb-4">
            Conecte-se
          </h2>
          <p className="reveal text-[#aaa] max-w-xl mx-auto text-sm md:text-base">
            Acompanhe nosso trabalho e ofertas exclusivas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {redes.map((r) => {
            const active = hovered === r.nome;
            return (
              <a
                key={r.nome}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHovered(r.nome)}
                onMouseLeave={() => setHovered(null)}
                className="scale-in flex items-center gap-5 p-5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: active ? r.neonSoft : "#0b1121",
                  borderColor: active ? r.color : "#1f3566",
                  boxShadow: active
                    ? `0 0 24px ${r.neon}, 0 0 48px ${r.neonSoft}, inset 0 0 20px ${r.neonSoft}`
                    : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Ícone circular */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: active ? r.color : r.neonSoft,
                    color: active ? "#fff" : r.color,
                    boxShadow: active ? `0 0 20px ${r.neon}, 0 0 40px ${r.neon}` : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <r.Icon size={22} />
                </div>

                {/* Texto */}
                <div
                  className="border-l pl-4 flex-1"
                  style={{ borderColor: active ? r.color + "88" : "#1f3566" }}
                >
                  <p
                    className="font-bold text-sm mb-1 transition-colors duration-300"
                    style={{ color: active ? r.color : "#fff" }}
                  >
                    {r.nome}
                  </p>
                  <p className="text-xs text-[#aaa] leading-relaxed">{r.desc}</p>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
