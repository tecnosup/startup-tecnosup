import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-orbitron",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tecnosup — Tecnologia que resolve de verdade",
  description:
    "Suporte técnico presencial e sistemas web sob medida para pequenos negócios em Cruzeiro, SP.",
  keywords: ["suporte técnico", "sistemas web", "barbearia", "Cruzeiro SP", "Tecnosup"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${orbitron.variable} ${inter.variable} overflow-x-hidden`}>
      <body className="bg-[#030407] text-[#e0e0e0] font-inter antialiased overflow-x-hidden w-full">{children}</body>
    </html>
  );
}
