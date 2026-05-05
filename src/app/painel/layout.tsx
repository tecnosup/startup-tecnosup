import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "Painel — Tecnosup",
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
