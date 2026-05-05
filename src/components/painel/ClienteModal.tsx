"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { Cliente, ClienteStatus, ChecklistItem } from "@/lib/types";
import { addCliente, updateCliente, addHistorico } from "@/lib/clientes";

const CHECKLIST_PADRAO: ChecklistItem[] = [
  { tarefa: "Fechar contrato com cliente", feito: false },
  { tarefa: "Criar conta Firebase no nome do cliente", feito: false },
  { tarefa: "Criar conta Cloudinary no nome do cliente", feito: false },
  { tarefa: "Registrar domínio no Registro.br", feito: false },
  { tarefa: "Configurar env vars de produção", feito: false },
  { tarefa: "Deploy na Vercel (conta do cliente)", feito: false },
  { tarefa: "Criar usuário admin no Firebase", feito: false },
];

interface Props {
  cliente?: Cliente;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-orbitron tracking-widest text-[#555] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all text-[#e0e0e0]";
const inputStyle = { background: "#030407", border: "1px solid #1f3566" };

export default function ClienteModal({ cliente, onClose }: Props) {
  const editing = !!cliente;

  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [segmento, setSegmento] = useState(cliente?.segmento ?? "");
  const [status, setStatus] = useState<ClienteStatus>(cliente?.status ?? "dev");
  const [plano, setPlano] = useState(String(cliente?.plano ?? "0"));
  const [renovacao, setRenovacao] = useState(cliente?.renovacao ?? "");
  const [whatsapp, setWhatsapp] = useState(cliente?.whatsapp ?? "");
  const [site, setSite] = useState(cliente?.site ?? "");
  const [vercel, setVercel] = useState(cliente?.vercel ?? "");
  const [firebase, setFirebase] = useState(cliente?.firebase ?? "");
  const [cloudinary, setCloudinary] = useState(cliente?.cloudinary ?? "");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    cliente?.checklist ?? CHECKLIST_PADRAO
  );
  const [notas, setNotas] = useState(cliente?.notas ?? "");
  const [novaTarefa, setNovaTarefa] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function addTarefa() {
    if (!novaTarefa.trim()) return;
    setChecklist((prev) => [...prev, { tarefa: novaTarefa.trim(), feito: false }]);
    setNovaTarefa("");
  }

  function removeTarefa(i: number) {
    setChecklist((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!nome.trim()) { setErro("Nome é obrigatório."); return; }
    setLoading(true);
    setErro("");
    try {
      const agora = new Date().toISOString();
      const payload = {
        nome: nome.trim(),
        segmento: segmento.trim(),
        status,
        plano: Number(plano) || 0,
        renovacao: renovacao || null,
        whatsapp: whatsapp.trim() || null,
        site: site.trim() || null,
        vercel: vercel.trim() || null,
        firebase: firebase.trim() || null,
        cloudinary: cloudinary.trim() || null,
        checklist,
        notas,
        historico: cliente?.historico ?? [],
        criadoEm: cliente?.criadoEm ?? agora,
      };
      if (editing) {
        await updateCliente(cliente.id, payload);
        await addHistorico(cliente.id, { acao: "Cliente atualizado", data: agora });
      } else {
        const id = await addCliente(payload);
        await addHistorico(id, { acao: "Cliente criado", data: agora });
      }
      onClose();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="relative w-full max-w-xl rounded-xl border"
        style={{ background: "#0b1121", borderColor: "#1f3566" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "#1f3566" }}>
          <div>
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff]">CLIENTES</p>
            <h2 className="font-orbitron text-base font-bold text-white mt-0.5">
              {editing ? "Editar cliente" : "Novo cliente"}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Dados básicos */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="NOME DO CLIENTE">
              <input value={nome} onChange={(e) => setNome(e.target.value)}
                className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")}
                placeholder="Ex: Ortega Barber" />
            </Field>
            <Field label="SEGMENTO">
              <input value={segmento} onChange={(e) => setSegmento(e.target.value)}
                className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")}
                placeholder="Ex: Barbearia · Cruzeiro, SP" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="STATUS">
              <select value={status} onChange={(e) => setStatus(e.target.value as ClienteStatus)}
                className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="dev">Em desenvolvimento</option>
                <option value="ativo">Ativo</option>
                <option value="inadimplente">Inadimplente</option>
              </select>
            </Field>
            <Field label="MENSALIDADE (R$)">
              <input type="number" value={plano} onChange={(e) => setPlano(e.target.value)}
                className={inputCls} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")}
                placeholder="129" />
            </Field>
            <Field label="RENOVAÇÃO">
              <input type="date" value={renovacao} onChange={(e) => setRenovacao(e.target.value)}
                className={inputCls} style={{ ...inputStyle, colorScheme: "dark" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
            </Field>
          </div>

          {/* Links */}
          <div className="pt-2 border-t" style={{ borderColor: "#1f356644" }}>
            <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3">LINKS</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "WHATSAPP (55...)", value: whatsapp, set: setWhatsapp, ph: "5512999999999" },
                { label: "SITE", value: site, set: setSite, ph: "https://..." },
                { label: "VERCEL", value: vercel, set: setVercel, ph: "https://vercel.com/..." },
                { label: "FIREBASE", value: firebase, set: setFirebase, ph: "https://console.firebase..." },
                { label: "CLOUDINARY", value: cloudinary, set: setCloudinary, ph: "https://cloudinary.com/..." },
              ].map(({ label, value, set, ph }) => (
                <Field key={label} label={label}>
                  <input value={value} onChange={(e) => set(e.target.value)}
                    className={inputCls} style={inputStyle} placeholder={ph}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
                </Field>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="pt-2 border-t" style={{ borderColor: "#1f356644" }}>
            <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3">CHECKLIST DE ONBOARDING</p>
            <div className="space-y-2 mb-3">
              {checklist.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 text-[#aaa]">{t.tarefa}</span>
                  <button onClick={() => removeTarefa(i)}
                    className="text-[#444] hover:text-red-400 transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={novaTarefa} onChange={(e) => setNovaTarefa(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTarefa()}
                className={`${inputCls} flex-1`} style={inputStyle}
                placeholder="Nova tarefa..."
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
              <button onClick={addTarefa}
                className="px-3 py-2 rounded-lg text-[#0eb3ff] transition-all hover:bg-[#0eb3ff11]"
                style={{ border: "1px solid #0eb3ff33" }}>
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Notas */}
          <div className="pt-2 border-t" style={{ borderColor: "#1f356644" }}>
            <p className="font-orbitron text-[10px] tracking-widest text-[#555] mb-3">NOTAS INTERNAS</p>
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3}
              className={`${inputCls} resize-none`} style={inputStyle}
              placeholder="Observações, combinados, histórico de contato..."
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0eb3ff55")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#1f3566")} />
          </div>

          {erro && <p className="text-xs text-red-400">{erro}</p>}

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm text-[#aaa] transition-all hover:text-white"
              style={{ border: "1px solid #1f3566" }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 py-2.5 rounded-lg font-orbitron text-xs font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0eb3ff, #7000ff)", boxShadow: "0 0 20px rgba(14,179,255,0.2)" }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : editing ? "SALVAR" : "CRIAR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
