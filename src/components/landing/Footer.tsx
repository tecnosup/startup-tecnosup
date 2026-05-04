import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="relative z-10 border-t px-6 py-8"
      style={{ borderColor: "#0eb3ff22" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Image
          src="/logo-tecnosup.png"
          alt="Tecnosup"
          width={120}
          height={48}
          className="object-contain"
          style={{ filter: "drop-shadow(0 0 4px rgba(14,179,255,0.3))" }}
        />
        <p className="text-xs text-[#444]">
          © {year} Tecnosup · Cruzeiro, SP · Todos os direitos reservados
        </p>
        <p className="text-xs text-[#333] font-orbitron tracking-widest">
          SUPORTE TECNOLÓGICO
        </p>
      </div>
    </footer>
  );
}
