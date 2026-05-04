"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const frase =
  "Não acreditamos em soluções genéricas. Cada projeto é pensado do zero, unindo suporte, estratégia e tecnologia.";

export default function FraseImpacto() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  const words = frase.split(" ");

  useEffect(() => {
    if (!sectionRef.current) return;

    const wordEls = wordsRef.current.filter(Boolean);
    gsap.set(wordEls, { opacity: 0.1, color: "#444" });

    const isMobile = window.innerWidth < 768;

    gsap.to(wordEls, {
      opacity: 1,
      color: "#e0e0e0",
      stagger: { each: 0.08 },
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: isMobile ? "+=100%" : "+=220%",
        pin: true,
        scrub: 0.5,
      },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 min-h-screen flex items-center px-5 sm:px-10 md:px-20"
      style={{ background: "#030407" }}
    >
      <div className="max-w-5xl mx-auto">
        <p
          className="font-orbitron text-[10px] md:text-xs tracking-[0.3em] mb-6 md:mb-8"
          style={{ color: "#0eb3ff" }}
        >
          NOSSA FILOSOFIA
        </p>
        <p className="font-inter text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
          {words.map((word, i) => (
            <span key={i} className="inline-block mr-[0.3em]">
              <span
                ref={(el) => {
                  if (el) wordsRef.current[i] = el;
                }}
                style={{ opacity: 0.1, color: "#444", display: "inline-block" }}
              >
                {word}
              </span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
