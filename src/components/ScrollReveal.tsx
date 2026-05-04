"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal() {
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    // Small delay ensures dynamic components (3D, lazy) are in the DOM
    const timeout = setTimeout(init, 200);
    return () => { clearTimeout(timeout); triggers.forEach((t) => t.kill()); };

    function init() {

    // Fade-up
    gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.fromTo(
            el,
            { opacity: 0, y: 36 },
            { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }
          ),
      });
      triggers.push(st);
    });

    // Slide from left
    gsap.utils.toArray<HTMLElement>(".reveal-left").forEach((el) => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.fromTo(
            el,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
          ),
      });
      triggers.push(st);
    });

    // Slide from right
    gsap.utils.toArray<HTMLElement>(".reveal-right").forEach((el) => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.fromTo(
            el,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
          ),
      });
      triggers.push(st);
    });

    // Stagger children
    gsap.utils.toArray<HTMLElement>(".reveal-stagger").forEach((parent) => {
      const children = Array.from(parent.querySelectorAll<HTMLElement>(":scope > *"));
      // set initial state immediately so they don't flash visible
      gsap.set(children, { opacity: 0, y: 28 });
      const st = ScrollTrigger.create({
        trigger: parent,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(children, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
          }),
      });
      triggers.push(st);
    });

    } // end init
  }, []);

  return null;
}
