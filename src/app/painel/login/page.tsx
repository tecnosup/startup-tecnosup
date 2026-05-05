"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/painel");
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#030407" }}>

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(14,179,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,179,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative w-full max-w-sm">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #0eb3ff, transparent)" }} />

        <div className="relative rounded-xl border p-8"
          style={{ background: "#0b1121", borderColor: "#1f3566" }}>

          <div className="text-center mb-8">
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-3">TECNOSUP</p>
            <h1 className="font-orbitron text-xl font-bold text-white">Painel Admin</h1>
            <p className="text-xs text-[#aaa] mt-2">Acesso restrito à equipe</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#aaa] mb-1.5 font-orbitron tracking-wider">E-MAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                style={{
                  background: "#030407",
                  border: "1px solid #1f3566",
                  color: "#e0e0e0",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")}
              />
            </div>

            <div>
              <label className="block text-xs text-[#aaa] mb-1.5 font-orbitron tracking-wider">SENHA</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "#030407",
                  border: "1px solid #1f3566",
                  color: "#e0e0e0",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-orbitron text-sm font-bold text-black rounded-lg transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #0eb3ff, #7000ff)",
                boxShadow: "0 0 24px rgba(14,179,255,0.25)",
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "ENTRAR"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
