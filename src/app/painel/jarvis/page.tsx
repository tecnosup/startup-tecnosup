"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { useAuth } from "@/lib/auth-context";
import {
  Send, Bot, User, Trash2, Zap, Mic, Volume2, VolumeX,
  Globe, Database, CheckSquare, DollarSign, Wrench, Calendar, Triangle, Coffee,
} from "lucide-react";

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface ToolCall { name: string; args: Record<string, unknown> }
interface Message {
  role: "user" | "assistant";
  content: string;
  tools?: ToolCall[];
}

// ─── Ícone por ferramenta ──────────────────────────────────────────────────────
function ToolIcon({ name }: { name: string }) {
  if (name.includes("github")) return <Globe size={10} />;
  if (name.includes("vercel")) return <Triangle size={10} />;
  if (name.includes("pagamento")) return <DollarSign size={10} />;
  if (name.includes("tarefa")) return <CheckSquare size={10} />;
  if (name.includes("ordem") || name.includes("agenda")) return <Wrench size={10} />;
  if (name.includes("agenda")) return <Calendar size={10} />;
  if (name === "web_search") return <Globe size={10} />;
  return <Database size={10} />;
}

function toolLabel(name: string, args: Record<string, unknown> | null): string {
  const a = args ?? {};
  switch (name) {
    case "web_search": return `Pesquisando: ${a.query ?? ""}`;
    case "buscar_clientes": return `Buscando clientes${a.status ? ` (${a.status})` : ""}`;
    case "atualizar_cliente": return `Atualizando cliente`;
    case "deletar_cliente": return `Deletando cliente`;
    case "criar_cliente": return `Criando cliente: ${a.nome ?? ""}`;
    case "buscar_leads": return `Buscando leads${a.status ? ` (${a.status})` : ""}`;
    case "atualizar_lead": return `Atualizando lead`;
    case "criar_lead": return `Criando lead: ${a.nome ?? ""}`;
    case "buscar_tarefas": return `Buscando tarefas`;
    case "criar_tarefa": return `Criando tarefa`;
    case "concluir_tarefa": return `Concluindo tarefa`;
    case "deletar_tarefa": return `Deletando tarefa`;
    case "deletar_todas_tarefas": return `Deletando todas as tarefas`;
    case "concluir_todas_tarefas": return `Concluindo todas as tarefas`;
    case "buscar_pagamentos": return `Buscando pagamentos${a.mes ? ` de ${a.mes}` : ""}`;
    case "registrar_pagamento": return `Registrando pagamento de R$${a.valor ?? ""}`;
    case "buscar_ordens": return `Buscando ordens de serviço`;
    case "criar_ordem": return `Criando OS: ${a.equipamento ?? ""}`;
    case "atualizar_ordem": return `Atualizando OS`;
    case "buscar_agenda": return `Buscando agenda`;
    case "criar_agendamento": return `Agendando: ${a.data ?? ""} ${a.hora ?? ""}`;
    case "vercel_projetos": return `Listando projetos Vercel`;
    case "vercel_deployments": return `Buscando deployments`;
    case "vercel_logs": return `Buscando logs`;
    case "vercel_dominio": return `Verificando domínios`;
    case "enviar_whatsapp": return `Enviando WhatsApp para ${a.telefone ?? ""}`;
    case "salvar_fato": return `Memorizando fato`;
    case "salvar_preferencia": return `Memorizando preferência`;
    case "ver_minha_memoria": return `Lendo memória`;
    case "limpar_memoria": return `Limpando memória`;
    case "github_repos": return `Listando repositórios GitHub`;
    case "github_issues": return `Buscando issues: ${a.repo ?? ""}`;
    case "github_criar_issue": return `Criando issue: ${a.titulo ?? ""}`;
    case "github_prs": return `Buscando pull requests`;
    case "github_commits": return `Buscando commits: ${a.repo ?? ""}`;
    case "github_actions": return `Verificando GitHub Actions`;
    case "github_arquivo": return `Lendo arquivo: ${a.path ?? ""}`;
    default: return name;
  }
}

// ─── Markdown renderer simples ─────────────────────────────────────────────────
function MarkdownLine({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

function AssistantMessage({ content, tools }: { content: string; tools?: ToolCall[] }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5">
      {/* Tool calls usados */}
      {tools && tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tools.map((t, i) => (
            <span key={i} className="flex items-center gap-1 text-[10px] font-orbitron px-2 py-0.5 rounded-md"
              style={{ background: "rgba(14,179,255,0.08)", border: "1px solid #0eb3ff22", color: "#0eb3ff88" }}>
              <ToolIcon name={t.name} />
              {toolLabel(t.name, t.args)}
            </span>
          ))}
        </div>
      )}

      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.startsWith("# ")) return <p key={i} className="font-orbitron text-base font-bold text-white mt-3">{line.slice(2)}</p>;
        if (line.startsWith("## ")) return <p key={i} className="font-orbitron text-sm font-bold text-[#0eb3ff] mt-2">{line.slice(3)}</p>;
        if (line.startsWith("### ")) return <p key={i} className="font-orbitron text-xs font-bold text-[#7000ff] mt-2 tracking-wide">{line.slice(4)}</p>;
        if (line.startsWith("- ") || line.startsWith("* ")) return (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[#0eb3ff] mt-1 shrink-0">▸</span>
            <p className="text-sm text-[#c0cce0] leading-relaxed"><MarkdownLine text={line.slice(2)} /></p>
          </div>
        );
        if (/^\d+\. /.test(line)) {
          const num = line.match(/^(\d+)\. /)?.[1];
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="font-orbitron text-[10px] text-[#0eb3ff] shrink-0 mt-0.5 w-4">{num}.</span>
              <p className="text-sm text-[#c0cce0] leading-relaxed"><MarkdownLine text={line.replace(/^\d+\. /, "")} /></p>
            </div>
          );
        }
        if (line.startsWith("---")) return <hr key={i} className="border-[#1f3566] my-2" />;
        return <p key={i} className="text-sm text-[#c0cce0] leading-relaxed"><MarkdownLine text={line} /></p>;
      })}
    </div>
  );
}

const SUGGESTIONS = [
  "Quais clientes estão inadimplentes?",
  "Quanto recebi este mês?",
  "Quais tarefas estão pendentes?",
  "Mostra as ordens de serviço abertas",
  "Lista os deployments da Vercel",
  "Cria uma tarefa: ligar para todos os clientes em renovação este mês",
];

// ─── Componente principal ──────────────────────────────────────────────────────
export default function JarvisPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [briefingLoading, setBriefingLoading] = useState(false);
  // voiceMode = conversa contínua ativa (estilo Gemini)
  const [voiceMode, setVoiceMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const sendRef = useRef<(text?: string) => void>(() => {});
  const voiceModeRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Text-to-Speech via Web Speech API ───────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startListeningRef = useRef<() => void>(() => {});
  // Fila de sentenças a falar — preenchida durante o streaming
  const ttsQueueRef = useRef<string[]>([]);
  const ttsBusyRef = useRef(false);

  function getBestVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const pt = voices.filter(v => v.lang === "pt-BR" || v.lang === "pt_BR");
    if (pt.length) {
      const premium = pt.find(v => /premium|neural|natural|enhanced/i.test(v.name));
      return premium ?? pt[0];
    }
    return voices.find(v => v.lang.startsWith("pt")) ?? null;
  }

  // Fala a próxima sentença da fila, encadeando automaticamente
  const drainQueue = useCallback(() => {
    if (ttsBusyRef.current || !ttsQueueRef.current.length) return;
    const sentence = ttsQueueRef.current.shift()!;
    ttsBusyRef.current = true;
    setSpeaking(true);


    const utt = new SpeechSynthesisUtterance(sentence);
    utt.lang = "pt-BR";
    utt.rate = 1.08;
    utt.pitch = 0.88;
    utt.volume = 1;
    const voice = getBestVoice();
    if (voice) utt.voice = voice;

    utt.onend = () => {
      ttsBusyRef.current = false;
      if (ttsQueueRef.current.length) {
        drainQueue();
      } else {
        setSpeaking(false);
        if (voiceModeRef.current) setTimeout(() => startListeningRef.current(), 300);
      }
    };
    utt.onerror = () => {
      ttsBusyRef.current = false;
      setSpeaking(false);
      if (voiceModeRef.current) setTimeout(() => startListeningRef.current(), 300);
    };
    window.speechSynthesis.speak(utt);
  }, []);

  // Enfileira uma sentença e começa a drenar a fila
  const speakSentence = useCallback((sentence: string) => {
    if (!window.speechSynthesis) return;
    const clean = sentence
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/#{1,3} /g, "")
      .replace(/---/g, "")
      .replace(/▸/g, "")
      .trim();
    if (!clean) return;

    const go = () => { ttsQueueRef.current.push(clean); drainQueue(); };
    if (window.speechSynthesis.getVoices().length) {
      go();
    } else {
      window.speechSynthesis.onvoiceschanged = go;
    }
  }, [drainQueue]);

  // Cancela tudo e limpa a fila (ex: novo envio de mensagem)
  const cancelTts = useCallback(() => {
    window.speechSynthesis?.cancel();
    ttsQueueRef.current = [];
    ttsBusyRef.current = false;
    setSpeaking(false);
  }, []);

  // speak é mantido para compatibilidade com o botão de voz on/off
  const speak = useCallback((text: string) => {
    if (!voiceEnabled) return;
    cancelTts();
    const clean = text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/#{1,3} /g, "")
      .replace(/---/g, "")
      .replace(/▸/g, "")
      .replace(/\n+/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 600);
    if (!clean) return;
    // Divide em sentenças e enfileira todas
    clean.split(/(?<=[.!?;:])\s+/).filter(Boolean).forEach(s => speakSentence(s));
  }, [voiceEnabled, cancelTts, speakSentence]);

  // ─── Speech-to-Text (push-to-talk — clique para falar) ──────────────────────
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR || recognitionRef.current) return;

    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = false;
    rec.interimResults = false;
    recognitionRef.current = rec;

    rec.onstart = () => setListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      recognitionRef.current = null;
      setListening(false);
      sendRef.current(transcript);
    };
    rec.onerror = () => { recognitionRef.current = null; setListening(false); };
    rec.onend = () => { recognitionRef.current = null; setListening(false); };
    rec.start();
  }, []);

  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

  // Botão do mic — clique inicia, clique de novo cancela
  const toggleVoiceMode = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { alert("Seu navegador não suporta reconhecimento de voz."); return; }
    if (listening) { stopListening(); return; }
    if (speaking) { cancelTts(); return; }
    startListening();
  }, [listening, speaking, startListening, stopListening, cancelTts]);

  // ─── Enviar mensagem ──────────────────────────────────────────────────────────
  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading || !user) return;

    const idToken = await user.getIdToken();
    cancelTts();
    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantIndex = newMessages.length;
    setMessages(prev => [...prev, { role: "assistant", content: "", tools: [] }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user.uid,
        }),
        signal: abortRef.current.signal,
      });

      if (res.status === 401) {
        setMessages(prev => { const u = [...prev]; u[assistantIndex] = { role: "assistant", content: "Sessão expirada. Faça login novamente." }; return u; });
        return;
      }
      if (res.status === 429) {
        setMessages(prev => { const u = [...prev]; u[assistantIndex] = { role: "assistant", content: "Muitas requisições. Aguarde um momento." }; return u; });
        return;
      }
      if (!res.body) throw new Error("no body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      const toolsCalled: ToolCall[] = [];
      let contentStarted = false;
      let finalContent = "";
      // Buffer de texto ainda não falado — vai sendo esvaziado sentença a sentença
      let ttsBuffer = "";
      let ttsStarted = false;

      // Dispara fala de uma sentença completa assim que detecta pontuação final
      const flushTts = (force = false) => {
        if (!voiceEnabled) return;
        const sentenceEnd = /[.!?;:]\s/g;
        let match: RegExpExecArray | null;
        let lastIndex = 0;
        // eslint-disable-next-line no-cond-assign
        while ((match = sentenceEnd.exec(ttsBuffer)) !== null) {
          const sentence = ttsBuffer.slice(lastIndex, match.index + 1).trim();
          lastIndex = match.index + match[0].length;
          if (sentence) speakSentence(sentence);
          ttsStarted = true;
        }
        ttsBuffer = ttsBuffer.slice(lastIndex);
        // Se force=true (fim do stream), fala o que sobrar no buffer
        if (force && ttsBuffer.trim()) {
          speakSentence(ttsBuffer.trim());
          ttsBuffer = "";
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });

        const lines = raw.split("\n");
        raw = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("__TOOL__:")) {
            const cleanName = line.slice("__TOOL__:".length).split(":")[0];
            try {
              const argsStr = line.slice(`__TOOL__:${cleanName}:`.length);
              toolsCalled.push({ name: cleanName, args: JSON.parse(argsStr) });
            } catch {
              toolsCalled.push({ name: cleanName, args: {} });
            }
            setMessages(prev => {
              const u = [...prev];
              u[assistantIndex] = { role: "assistant", content: "", tools: [...toolsCalled] };
              return u;
            });
          } else if (line === "__DONE_TOOLS__") {
            contentStarted = true;
          } else if (contentStarted || (!line.startsWith("__") && line)) {
            contentStarted = true;
            finalContent += line + "\n";
            ttsBuffer += line + " ";
            setMessages(prev => {
              const u = [...prev];
              u[assistantIndex] = { role: "assistant", content: finalContent, tools: toolsCalled };
              return u;
            });
            flushTts();
          }
        }
      }

      // Restante do buffer de linha
      if (raw && !raw.startsWith("__")) {
        finalContent += raw;
        ttsBuffer += raw + " ";
        setMessages(prev => {
          const u = [...prev];
          u[assistantIndex] = { role: "assistant", content: finalContent, tools: toolsCalled };
          return u;
        });
      }

      // Fala o que sobrou no buffer de TTS
      if (voiceEnabled) {
        flushTts(true);
        // Se não havia nenhuma sentença com pontuação (resposta curta), fala tudo
        if (!ttsStarted && finalContent.trim()) speakSentence(finalContent.trim().slice(0, 600));
      }

      if (!voiceEnabled && voiceModeRef.current) {
        setTimeout(() => startListeningRef.current(), 300);
      }

    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages(prev => { const u = [...prev]; u[assistantIndex] = { role: "assistant", content: "Erro ao processar. Tente novamente." }; return u; });
      }
      if (voiceModeRef.current) setTimeout(() => startListeningRef.current(), 500);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, messages, loading, user, speak, speakSentence, cancelTts, voiceEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mantém sendRef sempre apontando para a versão mais recente do send
  useEffect(() => { sendRef.current = send; }, [send]);

  // ─── Briefing matinal ─────────────────────────────────────────────────────────
  async function solicitarBriefing() {
    if (!user || briefingLoading) return;
    setBriefingLoading(true);
    try {
      const idToken = await user.getIdToken();
      const telefone = prompt("Seu número do WhatsApp (com DDD):");
      if (!telefone) return;
      const res = await fetch("/api/jarvis/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ telefone }),
      });
      const data = await res.json();
      if (data.ok) {
        alert("Briefing enviado no WhatsApp!");
        // Mostra no chat também
        setMessages(prev => [...prev,
          { role: "user" as const, content: "Me manda o briefing matinal" },
          { role: "assistant" as const, content: data.briefing, tools: [] },
        ]);
      } else {
        alert("Erro ao gerar briefing: " + (data.erro ?? "tente novamente"));
      }
    } catch {
      alert("Erro ao conectar. Verifique a conexão.");
    } finally {
      setBriefingLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function clear() {
    abortRef.current?.abort();
    cancelTts();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setMessages([]);
    setInput("");
    setLoading(false);
  }

  const isEmpty = messages.length === 0;

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />

        <main className="flex-1 flex flex-col h-screen overflow-hidden md:pt-0 pt-14">
          {/* Header */}
          <div className="shrink-0 px-6 py-4 border-b flex items-center justify-between"
            style={{ background: "#0b1121", borderColor: "#1f3566" }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(14,179,255,0.1)", border: "1px solid #0eb3ff33" }}>
                  <Zap size={16} style={{ color: "#0eb3ff" }} />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0b1121]"
                  style={{ background: loading ? "#ffbd2e" : "#22c55e" }} />
              </div>
              <div>
                <p className="font-orbitron text-sm font-bold text-white">JARVIS</p>
                <p className="font-orbitron text-[9px] tracking-widest" style={{ color: "#0eb3ff" }}>
                  {loading ? "PROCESSANDO..." : "ONLINE · TECNOSUP AI"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Briefing matinal */}
              <button onClick={solicitarBriefing} disabled={briefingLoading}
                className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-all disabled:opacity-50"
                style={{ background: "rgba(255,189,46,0.08)", border: "1px solid rgba(255,189,46,0.2)", color: "#ffbd2e" }}
                title="Briefing matinal no WhatsApp">
                <Coffee size={13} />
                <span className="font-orbitron text-[9px] hidden sm:block">
                  {briefingLoading ? "..." : "BRIEFING"}
                </span>
              </button>

              {/* Voz (TTS) on/off */}
              <button onClick={() => { setVoiceEnabled(v => !v); cancelTts(); }}
                className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-all"
                style={voiceEnabled
                  ? { background: "rgba(14,179,255,0.1)", border: "1px solid #0eb3ff33", color: "#0eb3ff" }
                  : { background: "transparent", border: "1px solid #1f3566", color: "#555" }
                }
                title={voiceEnabled ? "Desativar voz" : "Ativar voz"}>
                {voiceEnabled
                  ? <><Volume2 size={13} /><span className="font-orbitron text-[9px] hidden sm:block">VOZ ON</span></>
                  : <><VolumeX size={13} /><span className="font-orbitron text-[9px] hidden sm:block">VOZ OFF</span></>
                }
              </button>

              {messages.length > 0 && (
                <button onClick={clear}
                  className="flex items-center gap-1.5 text-xs text-[#555] hover:text-red-400 transition-colors px-2 py-1 rounded">
                  <Trash2 size={12} />
                  <span className="font-orbitron text-[10px]">Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ background: "rgba(14,179,255,0.08)", border: "1px solid #0eb3ff22" }}>
                    <Zap size={28} style={{ color: "#0eb3ff" }} />
                  </div>
                  <div>
                    <p className="font-orbitron text-xl font-bold text-white">JARVIS</p>
                    <p className="text-xs text-[#555] mt-1">Cérebro operacional da Tecnosup</p>
                    <p className="text-xs text-[#333] mt-0.5">Acesso total: clientes · leads · tarefas · financeiro · OS · Vercel</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl w-full">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)}
                      className="text-left px-4 py-3 rounded-xl text-xs text-[#888] transition-all hover:text-white"
                      style={{ background: "#0b1121", border: "1px solid #1f3566" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "rgba(14,179,255,0.1)", border: "1px solid #0eb3ff22" }}>
                      <Bot size={13} style={{ color: "#0eb3ff" }} />
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                    style={msg.role === "user"
                      ? { background: "rgba(112,0,255,0.15)", border: "1px solid rgba(112,0,255,0.3)" }
                      : { background: "#0b1121", border: "1px solid #1f3566" }
                    }>
                    {msg.role === "user" ? (
                      <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                    ) : (
                      <>
                        {/* Loading state */}
                        {loading && i === messages.length - 1 && !msg.content && (
                          <div className="flex items-center gap-2 py-1">
                            {msg.tools && msg.tools.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {msg.tools.map((t, ti) => (
                                  <span key={ti} className="flex items-center gap-1 text-[10px] font-orbitron px-2 py-0.5 rounded-md animate-pulse"
                                    style={{ background: "rgba(14,179,255,0.08)", border: "1px solid #0eb3ff22", color: "#0eb3ff" }}>
                                    <ToolIcon name={t.name} />
                                    {toolLabel(t.name, t.args)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="flex gap-1">
                                {[0, 1, 2].map(j => (
                                  <span key={j} className="w-1.5 h-1.5 rounded-full bg-[#0eb3ff] animate-bounce"
                                    style={{ animationDelay: `${j * 150}ms` }} />
                                ))}
                              </span>
                            )}
                          </div>
                        )}
                        <AssistantMessage content={msg.content} tools={msg.tools} />
                        {loading && i === messages.length - 1 && msg.content && (
                          <span className="inline-block w-0.5 h-4 bg-[#0eb3ff] ml-0.5 animate-pulse align-middle" />
                        )}
                      </>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "rgba(112,0,255,0.1)", border: "1px solid rgba(112,0,255,0.2)" }}>
                      <User size={13} style={{ color: "#7000ff" }} />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 px-4 md:px-8 py-4 border-t" style={{ borderColor: "#1f3566" }}>

            {/* Modo de conversa contínua — ativado */}
            {voiceMode ? (
              <div className="flex flex-col items-center gap-4 py-2">
                {/* Botão central de conversa */}
                <button onClick={toggleVoiceMode}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all"
                  style={listening
                    ? { background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.6)", color: "#ef4444", boxShadow: "0 0 30px rgba(239,68,68,0.3)" }
                    : speaking
                    ? { background: "rgba(14,179,255,0.12)", border: "2px solid rgba(14,179,255,0.5)", color: "#0eb3ff", boxShadow: "0 0 30px rgba(14,179,255,0.25)" }
                    : { background: "rgba(14,179,255,0.08)", border: "2px solid rgba(14,179,255,0.3)", color: "#0eb3ff66" }
                  }
                  title="Clique para encerrar a conversa por voz">
                  {/* Anel pulsando quando ouve ou fala */}
                  {(listening || speaking) && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{ background: listening ? "#ef4444" : "#0eb3ff" }} />
                  )}
                  <Mic size={32} />
                </button>
                <div className="text-center">
                  <p className="font-orbitron text-xs text-[#0eb3ff]">
                    {listening ? "OUVINDO..." : speaking ? "FALANDO..." : "AGUARDANDO..."}
                  </p>
                  <p className="text-[10px] text-[#444] mt-1">Toque para encerrar · Fale naturalmente</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 items-end max-w-4xl mx-auto">
                {/* Botão de conversa por voz */}
                <button onClick={toggleVoiceMode}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{ background: "rgba(14,179,255,0.08)", border: "1px solid #0eb3ff22", color: "#0eb3ff66" }}
                  title="Iniciar conversa por voz">
                  <Mic size={16} />
                </button>

                <div className="flex-1 rounded-xl border overflow-hidden transition-all focus-within:border-[#0eb3ff44]"
                  style={{ background: "#0b1121", borderColor: "#1f3566" }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Fale com o JARVIS... (Enter para enviar)"
                    rows={1}
                    className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-[#333] resize-none outline-none leading-relaxed"
                    style={{ maxHeight: 160 }}
                    onInput={e => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 160) + "px";
                    }}
                  />
                </div>

                <button onClick={() => send()} disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                  style={{ background: "rgba(14,179,255,0.15)", border: "1px solid #0eb3ff33", color: "#0eb3ff" }}>
                  <Send size={16} />
                </button>
              </div>
            )}

            <p className="text-center text-[10px] text-[#222] mt-2 font-orbitron tracking-wide">
              JARVIS · NVIDIA LLAMA 3.3 · FIREBASE · VERCEL · GITHUB · TAVILY
              {speaking && !voiceMode && <span className="ml-2 text-[#0eb3ff]">· FALANDO</span>}
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
