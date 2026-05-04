"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(visualRef.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1 })
        .fromTo(labelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5")
        .fromTo(headlineRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .fromTo(btnsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
        .fromTo(statsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");

      if (logoRef.current) {
        gsap.to(logoRef.current, {
          y: -16,
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative z-10 min-h-screen flex flex-col justify-center px-4 md:px-6 pt-[70px] pb-16"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Mobile: orbe centralizada em cima */}
        <div
          ref={visualRef}
          className="flex justify-center mb-8 md:hidden"
          style={{ opacity: 0 }}
        >
          <div ref={logoRef} className="relative">
            <div
              className="w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center relative"
              style={{
                border: "2px solid rgba(14,179,255,0.25)",
                boxShadow: "0 0 60px rgba(14,179,255,0.15), inset 0 0 40px rgba(14,179,255,0.04)",
                background: "radial-gradient(circle, rgba(14,179,255,0.06) 0%, transparent 70%)",
              }}
            >
              <div className="absolute inset-4 rounded-full" style={{ border: "1px solid rgba(14,179,255,0.12)" }} />
              <div className="absolute inset-8 rounded-full" style={{ border: "1px solid rgba(112,0,255,0.1)" }} />
              <Image
                src="/logo-icon.png"
                alt="Tecnosup"
                width={90}
                height={90}
                className="object-contain"
                style={{ filter: "drop-shadow(0 0 16px rgba(14,179,255,0.6))" }}
                priority
              />
            </div>
            <div
              className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full"
              style={{
                background: "#0eb3ff",
                boxShadow: "0 0 8px #0eb3ff",
                transform: "translate(-50%, -50%) translateX(105px)",
                animation: "spin 6s linear infinite",
              }}
            />
          </div>
        </div>

        {/* Grid desktop */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Texto — centralizado no mobile */}
          <div className="text-center md:text-left">
            <p
              ref={labelRef}
              className="font-orbitron text-[10px] md:text-xs tracking-[0.3em] mb-3 md:mb-4"
              style={{ color: "#0eb3ff", opacity: 0 }}
            >
              CRUZEIRO, SP · DESDE 2024
            </p>
            <h2
              ref={headlineRef}
              className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 md:mb-6 glow-text"
              style={{ opacity: 0 }}
            >
              Tecnologia que{" "}
              <span style={{ color: "#0eb3ff" }}>resolve</span>
              <br />
              de verdade.
            </h2>
            <p
              ref={subRef}
              className="text-sm md:text-base lg:text-lg text-[#aaa] leading-relaxed mb-6 md:mb-8 max-w-md mx-auto md:mx-0"
              style={{ opacity: 0 }}
            >
              Suporte técnico presencial e sistemas web sob medida para pequenos
              negócios. Feito em Cruzeiro, entregue com qualidade.
            </p>
            <div
              ref={btnsRef}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start"
              style={{ opacity: 0 }}
            >
              <a
                href="#sistemas"
                className="px-6 py-3 font-orbitron text-xs md:text-sm font-bold rounded text-black text-center transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #0eb3ff, #7000ff)",
                  boxShadow: "0 0 20px rgba(14,179,255,0.4)",
                }}
              >
                VER SISTEMAS WEB
              </a>
              <a
                href="#contato"
                className="px-6 py-3 font-orbitron text-xs md:text-sm font-bold rounded border border-[#0eb3ff33] text-[#0eb3ff] text-center hover:border-[#0eb3ff] transition-all duration-200"
              >
                FALAR NO WHATSAPP
              </a>
            </div>

            <div
              ref={statsRef}
              className="flex gap-6 md:gap-8 mt-8 md:mt-12 justify-center md:justify-start"
              style={{ opacity: 0 }}
            >
              {[
                { value: "2+", label: "Clientes ativos" },
                { value: "100%", label: "Infra no nome do cliente" },
                { value: "R$0", label: "Custo mensal de infra" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-orbitron text-xl md:text-2xl font-bold" style={{ color: "#0eb3ff" }}>
                    {s.value}
                  </p>
                  <p className="text-[10px] md:text-xs text-[#666] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Orbe desktop — hidden no mobile */}
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div
                className="w-80 h-80 rounded-full flex items-center justify-center relative"
                style={{
                  border: "2px solid rgba(14,179,255,0.25)",
                  boxShadow: "0 0 80px rgba(14,179,255,0.15), inset 0 0 60px rgba(14,179,255,0.04)",
                  background: "radial-gradient(circle, rgba(14,179,255,0.06) 0%, transparent 70%)",
                }}
              >
                <div className="absolute inset-4 rounded-full" style={{ border: "1px solid rgba(14,179,255,0.12)" }} />
                <div className="absolute inset-8 rounded-full" style={{ border: "1px solid rgba(112,0,255,0.1)" }} />
                <Image
                  src="/logo-icon.png"
                  alt="Tecnosup"
                  width={160}
                  height={160}
                  className="object-contain"
                  style={{ filter: "drop-shadow(0 0 20px rgba(14,179,255,0.6))" }}
                  priority
                />
              </div>
              <div
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                style={{
                  background: "#0eb3ff",
                  boxShadow: "0 0 10px #0eb3ff",
                  transform: "translate(-50%, -50%) translateX(160px)",
                  animation: "spin 6s linear infinite",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — só desktop */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[#444]">
        <span className="font-orbitron text-[10px] tracking-widest">ROLE PARA VER MAIS</span>
        <div
          className="w-px h-12"
          style={{ background: "linear-gradient(to bottom, #0eb3ff, transparent)", animation: "pulseOpacity 2s ease-in-out infinite" }}
        />
      </div>

      <style jsx>{`
        @keyframes pulseOpacity {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
