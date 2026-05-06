"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal() {
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    const timeout = setTimeout(init, 250);
    return () => { clearTimeout(timeout); triggers.forEach((t) => t.kill()); };

    function init() {

      // ── .reveal: fade-up com reverse ──────────────────────────────────
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.set(el, { opacity: 0, y: 40 });
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          end: "top 15%",
          onEnter:     () => gsap.to(el, { opacity: 1, y: 0,  duration: 0.85, ease: "power3.out" }),
          onLeaveBack: () => gsap.to(el, { opacity: 0, y: 40, duration: 0.5,  ease: "power3.in" }),
        });
        triggers.push(st);
      });

      // ── .reveal-left: slide da esquerda ───────────────────────────────
      gsap.utils.toArray<HTMLElement>(".reveal-left").forEach((el) => {
        gsap.set(el, { opacity: 0, x: -60 });
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          end: "top 15%",
          onEnter:     () => gsap.to(el, { opacity: 1, x: 0,   duration: 1,   ease: "power3.out" }),
          onLeaveBack: () => gsap.to(el, { opacity: 0, x: -60, duration: 0.5, ease: "power3.in" }),
        });
        triggers.push(st);
      });

      // ── .reveal-right: slide da direita ───────────────────────────────
      gsap.utils.toArray<HTMLElement>(".reveal-right").forEach((el) => {
        gsap.set(el, { opacity: 0, x: 60 });
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          end: "top 15%",
          onEnter:     () => gsap.to(el, { opacity: 1, x: 0,  duration: 1,   ease: "power3.out" }),
          onLeaveBack: () => gsap.to(el, { opacity: 0, x: 60, duration: 0.5, ease: "power3.in" }),
        });
        triggers.push(st);
      });

      // ── .reveal-stagger: filhos em cascata com reverse ────────────────
      gsap.utils.toArray<HTMLElement>(".reveal-stagger").forEach((parent) => {
        const children = Array.from(parent.querySelectorAll<HTMLElement>(":scope > *"));
        gsap.set(children, { opacity: 0, y: 30 });
        const st = ScrollTrigger.create({
          trigger: parent,
          start: "top 90%",
          end: "top 15%",
          onEnter:     () => gsap.to(children, { opacity: 1, y: 0,  duration: 0.7, stagger: 0.1,  ease: "power3.out" }),
          onLeaveBack: () => gsap.to(children, { opacity: 0, y: 30, duration: 0.4, stagger: 0.05, ease: "power3.in" }),
        });
        triggers.push(st);
      });

      // ── .parallax-slow: move mais devagar que o scroll (flutua) ───────
      gsap.utils.toArray<HTMLElement>(".parallax-slow").forEach((el) => {
        gsap.to(el, {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });

      // ── .parallax-fast: move mais rápido (vai à frente) ───────────────
      gsap.utils.toArray<HTMLElement>(".parallax-fast").forEach((el) => {
        gsap.to(el, {
          y: -120,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // ── .scale-in: escala de 0.88 a 1 conforme entra ─────────────────
      gsap.utils.toArray<HTMLElement>(".scale-in").forEach((el) => {
        gsap.fromTo(el,
          { scale: 0.88, opacity: 0 },
          {
            scale: 1, opacity: 1, ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      });

      // ── .reveal-clip: wipe de baixo pra cima ─────────────────────────
      gsap.utils.toArray<HTMLElement>(".reveal-clip").forEach((el) => {
        gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 });
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          end: "top 20%",
          onEnter:     () => gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.out" }),
          onLeaveBack: () => gsap.to(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.5, ease: "power3.in" }),
        });
        triggers.push(st);
      });

      // ── títulos de seção: scrub horizontal leve ───────────────────────
      gsap.utils.toArray<HTMLElement>(".title-drift").forEach((el, i) => {
        const dir = i % 2 === 0 ? -30 : 30;
        gsap.fromTo(el,
          { x: dir },
          {
            x: 0, ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              end: "top 30%",
              scrub: 2,
            },
          }
        );
      });

    }
  }, []);

  return null;
}
