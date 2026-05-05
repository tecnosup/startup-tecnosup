"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { subscribeAgenda, addAgendaItem, deleteAgendaItem, AgendaItem } from "@/lib/assistencia";
import { Plus, Trash2, Loader2, Calendar } from "lucide-react";

export default function AgendaPage() {
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    titulo: "", clienteNome: "", data: "", hora: "", observacao: "",
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    return subscribeAgenda((data) => { setAgenda(data); setLoading(false); });
  }, []);

  async function handleAdd() {
    if (!form.titulo.trim() || !form.data || !form.hora) {
      setErro("Preencha título, data e hora."); return;
    }
    setSaving(true);
    setErro("");
    await addAgendaItem({ ...form, criadoEm: new Date().toISOString() });
    setForm({ titulo: "", clienteNome: "", data: "", hora: "", observacao: "" });
    setSaving(false);
  }

  const hoje = new Date().toISOString().split("T")[0];
  const futuros = agenda.filter((a) => a.data >= hoje);
  const passados = agenda.filter((a) => a.data < hoje);

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none text-[#e0e0e0]";
  const inputStyle = { background: "#030407", border: "1px solid #1f3566" };

  function AgendaCard({ item }: { item: AgendaItem }) {
    const isPast = item.data < hoje;
    return (
      <div className="flex items-start justify-between px-5 py-4 rounded-xl border"
        style={{ background: "#0b1121", borderColor: isPast ? "#1f356644" : "#1f3566", opacity: isPast ? 0.5 : 1 }}>
        <div className="flex gap-4">
          <div className="text-center shrink-0">
            <p className="font-orbitron text-xs font-bold text-white">{item.data.split("-").slice(1).join("/")}</p>
            <p className="font-mono text-xs text-[#0eb3ff]">{item.hora}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{item.titulo}</p>
            {item.clienteNome && <p className="text-xs text-[#0eb3ff]">{item.clienteNome}</p>}
            {item.observacao && <p className="text-xs text-[#555] mt-1">{item.observacao}</p>}
          </div>
        </div>
        <button onClick={() => deleteAgendaItem(item.id)}
          className="text-[#444] hover:text-red-400 transition-colors shrink-0 ml-4">
          <Trash2 size={13} />
        </button>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="mb-8 mt-14 md:mt-0">
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">ASSISTÊNCIA TÉCNICA</p>
            <h1 className="font-orbitron text-2xl font-bold text-white">Agenda</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="rounded-xl border p-5" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
              <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-4">NOVO AGENDAMENTO</p>
              <div className="space-y-3">
                {[
                  { label: "TÍTULO", key: "titulo", ph: "Ex: Retirada de notebook", type: "text" },
                  { label: "CLIENTE", key: "clienteNome", ph: "Nome do cliente", type: "text" },
                ].map(({ label, key, ph, type }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">{label}</label>
                    <input type={type} value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className={inputCls} style={inputStyle} placeholder={ph}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">DATA</label>
                    <input type="date" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                      className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">HORA</label>
                    <input type="time" value={form.hora} onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                      className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">OBSERVAÇÃO</label>
                  <textarea value={form.observacao} onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                    rows={2} className={`${inputCls} resize-none`} style={inputStyle}
                    placeholder="Detalhes adicionais..."
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                </div>
                {erro && <p className="text-xs text-red-400">{erro}</p>}
                <button onClick={handleAdd} disabled={saving}
                  className="w-full py-2.5 rounded-lg font-orbitron text-xs font-bold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)" }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> AGENDAR</>}
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="lg:col-span-2 space-y-5">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#0eb3ff]" /></div>
              ) : (
                <>
                  {futuros.length > 0 && (
                    <div>
                      <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3 flex items-center gap-2">
                        <Calendar size={11} /> PRÓXIMOS — {futuros.length}
                      </p>
                      <div className="space-y-2">
                        {futuros.map((a) => <AgendaCard key={a.id} item={a} />)}
                      </div>
                    </div>
                  )}
                  {passados.length > 0 && (
                    <div>
                      <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3">PASSADOS — {passados.length}</p>
                      <div className="space-y-2">
                        {passados.map((a) => <AgendaCard key={a.id} item={a} />)}
                      </div>
                    </div>
                  )}
                  {agenda.length === 0 && (
                    <p className="text-center text-[#555] py-20 text-sm">Nenhum agendamento.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
