"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const links = [
  { label: "Serviços", href: "#servicos" },
  { label: "Sistemas Web", href: "#sistemas" },
  { label: "TecnoApp", href: "#tecnoapp" },
  { label: "Planos", href: "#planos" },
  { label: "Cases", href: "#cases" },
  { label: "Contato", href: "#contato" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(3,4,7,0.95)] backdrop-blur-md border-b border-[#0eb3ff33]"
          : "bg-transparent"
      }`}
      style={{ height: 70 }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center">
          <Image
            src="/logo-tecnosup.png"
            alt="Tecnosup"
            width={80}
            height={32}
            className="object-contain"
            style={{ filter: "drop-shadow(0 0 6px rgba(14,179,255,0.4))" }}
            priority
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[#e0e0e0] hover:text-[#0eb3ff] transition-colors duration-200 relative group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#0eb3ff] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#contato"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold font-orbitron rounded border border-[#0eb3ff] text-[#0eb3ff] hover:bg-[#0eb3ff] hover:text-black transition-all duration-200"
          style={{ boxShadow: "0 0 12px rgba(14,179,255,0.2)" }}
        >
          FALE CONOSCO
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#0eb3ff]"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[rgba(3,4,7,0.98)] border-t border-[#0eb3ff22] px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-[#e0e0e0] hover:text-[#0eb3ff] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contato"
            onClick={() => setOpen(false)}
            className="mt-2 text-center px-5 py-2.5 text-sm font-semibold font-orbitron rounded border border-[#0eb3ff] text-[#0eb3ff]"
          >
            FALE CONOSCO
          </a>
        </div>
      )}
    </header>
  );
}
