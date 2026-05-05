"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard, Users, DollarSign, LogOut, Menu, X,
  CheckSquare, Wrench, Calendar, FileText, LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  titulo: string;
  items: NavItem[];
}

const grupos: NavGroup[] = [
  {
    titulo: "SISTEMAS WEB",
    items: [
      { label: "Dashboard", href: "/painel", icon: LayoutDashboard },
      { label: "Clientes", href: "/painel/clientes", icon: Users },
      { label: "Financeiro", href: "/painel/financeiro", icon: DollarSign },
      { label: "Proposta", href: "/painel/proposta", icon: FileText },
      { label: "Tarefas", href: "/painel/tarefas", icon: CheckSquare },
    ],
  },
  {
    titulo: "ASSISTÊNCIA TÉCNICA",
    items: [
      { label: "Ordens de Serviço", href: "/painel/assistencia/ordens", icon: Wrench },
      { label: "Clientes AT", href: "/painel/assistencia/clientes", icon: Users },
      { label: "Agenda", href: "/painel/assistencia/agenda", icon: Calendar },
    ],
  },
];

function NavLinks({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
      {grupos.map((grupo) => (
        <div key={grupo.titulo}>
          <p className="font-orbitron text-[9px] tracking-[0.2em] px-3 mb-2" style={{ color: "#333" }}>
            {grupo.titulo}
          </p>
          <div className="space-y-0.5">
            {grupo.items.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/painel" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    background: active ? "rgba(14,179,255,0.08)" : "transparent",
                    color: active ? "#0eb3ff" : "#777",
                    border: active ? "1px solid #0eb3ff22" : "1px solid transparent",
                  }}>
                  <Icon size={15} />
                  <span className="font-orbitron text-[10px] tracking-wide">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    router.push("/painel/login");
  }

  const LogoutBtn = () => (
    <button onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-all hover:text-red-400"
      style={{ color: "#555" }}>
      <LogOut size={15} />
      <span className="font-orbitron text-[10px] tracking-wide">Sair</span>
    </button>
  );

  const Logo = () => (
    <div>
      <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff]">TECNOSUP</p>
      <p className="font-orbitron text-[9px] text-[#333] mt-0.5">Painel Admin</p>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 min-h-screen border-r shrink-0"
        style={{ background: "#0b1121", borderColor: "#1f3566" }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: "#1f3566" }}>
          <Logo />
        </div>
        <NavLinks pathname={pathname} />
        <div className="px-3 py-4 border-t" style={{ borderColor: "#1f3566" }}>
          <LogoutBtn />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b"
        style={{ background: "#0b1121", borderColor: "#1f3566" }}>
        <Logo />
        <button onClick={() => setMobileOpen(true)} className="text-[#777] hover:text-white transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 min-h-screen border-r"
            style={{ background: "#0b1121", borderColor: "#1f3566" }}>
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "#1f3566" }}>
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="text-[#555] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <NavLinks pathname={pathname} onClose={() => setMobileOpen(false)} />
            <div className="px-3 py-4 border-t" style={{ borderColor: "#1f3566" }}>
              <LogoutBtn />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
