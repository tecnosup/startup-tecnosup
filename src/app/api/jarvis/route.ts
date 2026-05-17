import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Rate limiting ─────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; reset: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) { rateLimitMap.set(ip, { count: 1, reset: now + 60000 }); return true; }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

// ─── Firebase Admin ────────────────────────────────────────────────────────────
function getDb() {
  if (!getApps().length) {
    initializeApp({ credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }) });
  }
  return getFirestore();
}

// ─── NVIDIA NIM ────────────────────────────────────────────────────────────────
type NimMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "tool"; tool_call_id: string; content: string };

interface NimResponse {
  choices: { message: { content: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[];
}

async function nimChat(messages: NimMessage[]): Promise<NimResponse> {
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta/llama-3.3-70b-instruct",
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 2048,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status} ${err}`);
  }
  return res.json();
}

// ─── Memória persistente ───────────────────────────────────────────────────────
async function carregarMemoria(userId: string): Promise<string> {
  try {
    const doc = await getDb().collection("jarvis_memoria").doc(userId).get();
    if (!doc.exists) return "";
    const data = doc.data();
    const fatos = (data?.fatos ?? []) as string[];
    const preferencias = (data?.preferencias ?? []) as string[];
    const ultimasConversas = (data?.ultimasConversas ?? []) as { resumo: string; data: string }[];
    if (!fatos.length && !preferencias.length && !ultimasConversas.length) return "";
    const partes = ["MEMORIA ACUMULADA DO JARVIS:"];
    if (preferencias.length) partes.push("Preferencias: " + preferencias.join("; "));
    if (fatos.length) partes.push("Fatos importantes: " + fatos.join("; "));
    if (ultimasConversas.length) {
      partes.push("Ultimas conversas:");
      ultimasConversas.slice(-3).forEach(c => partes.push(`  [${c.data}] ${c.resumo}`));
    }
    return partes.join("\n");
  } catch { return ""; }
}

async function salvarMemoria(userId: string, ultimaMsg: string): Promise<void> {
  try {
    await getDb().collection("jarvis_memoria").doc(userId).set({
      ultimasConversas: FieldValue.arrayUnion({ resumo: ultimaMsg.slice(0, 120), data: new Date().toLocaleDateString("pt-BR") }),
      atualizadoEm: new Date().toISOString(),
    }, { merge: true });
  } catch { /* silencioso */ }
}

// ─── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Voce e JARVIS - o cerebro e a voz da Tecnosup, empresa de tecnologia de Cruzeiro/SP.

SOBRE A TECNOSUP:
- Cardoso e Vitor sao os donos. Voce trabalha pra eles, e leal a eles.
- Servicos: desenvolvimento de sites/apps, assistencia tecnica (computadores, celulares), planos de manutencao mensal
- Stack: Next.js, Firebase, Vercel, WhatsApp via Z-API

SUA PERSONALIDADE:
- Direto, inteligente, humor seco — tipo o Jarvis do Tony Stark
- Fala portugues brasileiro natural, sem ser robotico
- Saudacoes e conversa casual: responde direto, SEM usar ferramentas
- NUNCA repete uma acao sem o usuario pedir explicitamente

QUANDO USAR FERRAMENTAS:
- SO use quando a pergunta exige dados reais do sistema
- Oi, valeu, comentarios gerais: responda direto, zero ferramentas

ACESSO TOTAL: clientes, leads, tarefas, pagamentos, OS, agenda, clientes AT, criativos, Vercel, GitHub
- Leia e escreva diretamente. Para deletar: confirme antes.

MEMÓRIA PERSISTENTE (brain_atualizar):
- Use brain_atualizar proativamente ao aprender algo relevante sobre a Tecnosup, Cardoso, Vitor, clientes ou padrões de trabalho
- Exemplos: decisão estratégica tomada, preferência descoberta, erro que deve ser evitado, padrão identificado
- Seja seletivo: só salva o que vai ser útil em conversas futuras

SEGURANCA: Nunca exponha tokens, chaves de API ou senhas.
DATA ATUAL: ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`;

// ─── Tavily ────────────────────────────────────────────────────────────────────
async function tavilySearch(query: string): Promise<string> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, search_depth: "basic", max_results: 5, include_answer: true }),
  });
  if (!res.ok) return "Erro ao pesquisar na web.";
  const data = await res.json();
  const answer = data.answer ? `Resposta direta: ${data.answer}\n\n` : "";
  const results = (data.results ?? []).map((r: { title: string; url: string; content: string }) => `**${r.title}**\n${r.url}\n${r.content}`).join("\n\n---\n\n");
  return `${answer}${results}`;
}

// ─── Vercel API ────────────────────────────────────────────────────────────────
async function vercelRequest(path: string): Promise<unknown> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { erro: "VERCEL_TOKEN não configurado" };
  const res = await fetch(`https://api.vercel.com${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return { erro: `Vercel API erro: ${res.status}` };
  return res.json();
}

// ─── GitHub API ────────────────────────────────────────────────────────────────
const BRAIN_REPO = "tecnosup/jarvis-brain";
const BRAIN_FILES = ["memoria/tecnosup.md", "memoria/cardoso.md", "memoria/vitor.md", "memoria/clientes.md", "memoria/aprendizados.md"];

async function githubRequest(path: string, method = "GET", body?: unknown): Promise<unknown> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { erro: "GITHUB_TOKEN não configurado" };
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) return { erro: `GitHub API erro: ${res.status}` };
  return res.json();
}

// Cache de memória — carregado uma vez, válido por 2h
let brainCache: { content: string; loadedAt: number } | null = null;

async function loadBrain(): Promise<string> {
  const now = Date.now();
  if (brainCache && now - brainCache.loadedAt < 2 * 60 * 60 * 1000) return brainCache.content;

  const token = process.env.GITHUB_TOKEN;
  if (!token) return "";

  try {
    const parts: string[] = [];
    await Promise.all(BRAIN_FILES.map(async (file) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const res = await fetch(`https://api.github.com/repos/${BRAIN_REPO}/contents/${file}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json() as { content?: string };
        if (data.content) {
          const text = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
          parts.push(text.slice(0, 3072));
        }
      } finally {
        clearTimeout(timeout);
      }
    }));
    const content = parts.join("\n\n---\n\n");
    brainCache = { content, loadedAt: now };
    return content;
  } catch { return brainCache?.content ?? ""; }
}

// Atualiza um arquivo no brain (busca o SHA atual, faz PUT)
async function updateBrainFile(file: string, content: string, commitMsg: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return;
  try {
    const current = await fetch(`https://api.github.com/repos/${BRAIN_REPO}/contents/${file}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    const currentData = await current.json() as { sha?: string };
    await fetch(`https://api.github.com/repos/${BRAIN_REPO}/contents/${file}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
      body: JSON.stringify({ message: commitMsg, content: Buffer.from(content).toString("base64"), sha: currentData.sha }),
    });
    // Invalida o cache para próxima sessão pegar o conteúdo atualizado
    brainCache = null;
  } catch { /* silencioso */ }
}

// ─── Executores de ferramentas ─────────────────────────────────────────────────
async function executeTool(name: string, args: Record<string, unknown>, userId?: string): Promise<string> {
  const db = getDb();
  const now = new Date().toISOString();

  switch (name) {
    case "web_search": return tavilySearch(String(args.query));

    case "buscar_clientes": {
      const snap = await db.collection("clientes").get();
      const clientes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (args.status) return JSON.stringify(clientes.filter((c: Record<string, unknown>) => c.status === args.status));
      if (args.nome) { const n = String(args.nome).toLowerCase(); return JSON.stringify(clientes.filter((c: Record<string, unknown>) => String(c.nome ?? "").toLowerCase().includes(n))); }
      return JSON.stringify(clientes);
    }
    case "atualizar_cliente": {
      const { id, ...dados } = args as { id: string } & Record<string, unknown>;
      await db.collection("clientes").doc(id).update({ ...dados, historico: FieldValue.arrayUnion({ acao: `Atualizado via JARVIS: ${Object.keys(dados).join(", ")}`, data: now }) });
      return `Cliente ${id} atualizado.`;
    }
    case "deletar_cliente": {
      await db.collection("clientes").doc(String(args.id)).delete();
      return `Cliente ${args.id} deletado.`;
    }
    case "criar_cliente": {
      const ref = await db.collection("clientes").add({ ...args, checklist: [], historico: [{ acao: "Cliente criado via JARVIS", data: now }], notas: args.notas ?? "", criadoEm: now });
      return `Cliente criado com ID: ${ref.id}`;
    }

    case "buscar_leads": {
      const snap = await db.collection("leads").get();
      const leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (args.status) return JSON.stringify(leads.filter((l: Record<string, unknown>) => l.status === args.status));
      if (args.nome) { const n = String(args.nome).toLowerCase(); return JSON.stringify(leads.filter((l: Record<string, unknown>) => String(l.nome ?? "").toLowerCase().includes(n))); }
      return JSON.stringify(leads);
    }
    case "atualizar_lead": {
      const { id, status, notas, mensagemPronta } = args as Record<string, string>;
      const update: Record<string, unknown> = { atualizadoEm: now };
      if (status) update.status = status;
      if (notas) update.notas = notas;
      if (mensagemPronta) update.mensagemPronta = mensagemPronta;
      update.historico = FieldValue.arrayUnion({ acao: `Atualizado via JARVIS`, data: now });
      await db.collection("leads").doc(id).update(update);
      return `Lead ${id} atualizado.`;
    }
    case "criar_lead": {
      const ref = await db.collection("leads").add({ ...args, status: args.status ?? "novo", historico: [{ acao: "Lead criado via JARVIS", data: now }], notas: args.notas ?? "", criadoEm: now, atualizadoEm: now });
      return `Lead criado com ID: ${ref.id}`;
    }

    case "buscar_tarefas": {
      const snap = await db.collection("tarefas").get();
      const tarefas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (args.responsavel) return JSON.stringify(tarefas.filter((t: Record<string, unknown>) => t.responsavel === args.responsavel || t.responsavel === "Ambos"));
      if (args.feito !== undefined) return JSON.stringify(tarefas.filter((t: Record<string, unknown>) => t.feito === args.feito));
      return JSON.stringify(tarefas);
    }
    case "criar_tarefa": {
      const ref = await db.collection("tarefas").add({ texto: args.texto, feito: false, prioridade: args.prioridade ?? "media", responsavel: args.responsavel ?? "Ambos", clienteNome: args.clienteNome ?? "", prazo: args.prazo ?? null, criadoEm: now });
      return `Tarefa criada com ID: ${ref.id}`;
    }
    case "concluir_tarefa":
      await db.collection("tarefas").doc(String(args.id)).update({ feito: true });
      return `Tarefa ${args.id} concluída.`;
    case "deletar_tarefa":
      await db.collection("tarefas").doc(String(args.id)).delete();
      return `Tarefa ${args.id} deletada.`;
    case "deletar_todas_tarefas": {
      const snap = await db.collection("tarefas").get();
      const batch = db.batch();
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      return `${snap.size} tarefas deletadas.`;
    }
    case "concluir_todas_tarefas": {
      const snap = await db.collection("tarefas").where("feito", "==", false).get();
      const batch = db.batch();
      snap.docs.forEach(d => batch.update(d.ref, { feito: true }));
      await batch.commit();
      return `${snap.size} tarefas concluídas.`;
    }

    case "buscar_pagamentos": {
      const snap = await db.collection("pagamentos").orderBy("data", "desc").get();
      const pagamentos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (args.mes) return JSON.stringify(pagamentos.filter((p: Record<string, unknown>) => String(p.data ?? "").startsWith(String(args.mes))));
      if (args.clienteNome) { const n = String(args.clienteNome).toLowerCase(); return JSON.stringify(pagamentos.filter((p: Record<string, unknown>) => String(p.clienteNome ?? "").toLowerCase().includes(n))); }
      return JSON.stringify(pagamentos);
    }
    case "registrar_pagamento": {
      const ref = await db.collection("pagamentos").add({ clienteId: args.clienteId ?? "", clienteNome: args.clienteNome, valor: Number(args.valor), data: args.data ?? now.slice(0, 10), descricao: args.descricao ?? "", tipo: args.tipo ?? "mensalidade" });
      return `Pagamento registrado com ID: ${ref.id}`;
    }

    case "buscar_clientes_at": {
      const snap = await db.collection("at_clientes").get();
      const clientes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (args.nome) { const n = String(args.nome).toLowerCase(); return JSON.stringify(clientes.filter((c: Record<string, unknown>) => String(c.nome ?? "").toLowerCase().includes(n))); }
      return JSON.stringify(clientes);
    }
    case "criar_cliente_at": {
      const ref = await db.collection("at_clientes").add({ nome: args.nome, telefone: args.telefone ?? "", email: args.email ?? "", criadoEm: now });
      return `Cliente AT criado com ID: ${ref.id}`;
    }
    case "atualizar_cliente_at": {
      const { id, ...dados } = args as { id: string } & Record<string, unknown>;
      await db.collection("at_clientes").doc(id).update(dados);
      return `Cliente AT ${id} atualizado.`;
    }
    case "deletar_cliente_at": {
      await db.collection("at_clientes").doc(String(args.id)).delete();
      return `Cliente AT ${args.id} deletado.`;
    }

    case "gerar_criativo": {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/criativos/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: args.tema, tipo: args.tipo ?? "portfólio de cliente", tom: args.tom ?? "profissional" }),
      });
      if (!res.ok) return `Erro ao gerar criativo: ${res.status}`;
      const data = await res.json() as { caption?: string; hashtags?: string[]; promptImagem?: string };
      return `**Caption:**\n${data.caption}\n\n**Hashtags:** ${(data.hashtags ?? []).join(" ")}\n\n**Prompt de imagem:** ${data.promptImagem}`;
    }

    case "buscar_ordens": {
      const snap = await db.collection("at_ordens").get();
      const ordens = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (args.status) return JSON.stringify(ordens.filter((o: Record<string, unknown>) => o.status === args.status));
      return JSON.stringify(ordens);
    }
    case "criar_ordem": {
      const ref = await db.collection("at_ordens").add({ clienteId: args.clienteId ?? "", clienteNome: args.clienteNome, equipamento: args.equipamento, problema: args.problema, diagnostico: "", valor: Number(args.valor ?? 0), status: "aguardando", dataEntrada: now.slice(0, 10), dataSaida: null, criadoEm: now });
      return `OS criada com ID: ${ref.id}`;
    }
    case "atualizar_ordem": {
      const { id, ...dados } = args as { id: string } & Record<string, unknown>;
      await db.collection("at_ordens").doc(id).update(dados);
      return `OS ${id} atualizada.`;
    }

    case "buscar_agenda": {
      const snap = await db.collection("at_agenda").orderBy("data", "asc").get();
      return JSON.stringify(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    case "criar_agendamento": {
      await db.collection("at_agenda").add({ titulo: args.titulo, clienteNome: args.clienteNome ?? "", data: args.data, hora: args.hora, observacao: args.observacao ?? "", criadoEm: now });
      return `Agendamento criado para ${args.data} às ${args.hora}.`;
    }

    case "vercel_projetos": {
      const raw = await vercelRequest("/v9/projects?limit=20") as { projects?: unknown[] };
      return JSON.stringify((raw.projects ?? []).map((p) => { const x = p as Record<string, unknown>; return { id: x.id, name: x.name, framework: x.framework, updatedAt: x.updatedAt }; })).slice(0, 6000);
    }
    case "vercel_deployments": {
      const raw = await vercelRequest(`/v6/deployments?limit=10${args.projeto ? `&projectId=${args.projeto}` : ""}`) as { deployments?: unknown[] };
      return JSON.stringify((raw.deployments ?? []).map((d) => { const x = d as Record<string, unknown>; return { id: x.uid, url: x.url, state: x.readyState, name: x.name, createdAt: x.createdAt }; })).slice(0, 4000);
    }
    case "vercel_logs": {
      const raw = await vercelRequest(`/v2/deployments/${args.deploymentId}/events`) as unknown[];
      return JSON.stringify(Array.isArray(raw) ? raw.slice(-30) : raw).slice(0, 4000);
    }
    case "vercel_dominio": {
      return JSON.stringify(await vercelRequest(`/v9/projects/${args.projeto}/domains`)).slice(0, 3000);
    }

    case "github_repos": {
      const raw = await githubRequest("/user/repos?sort=updated&per_page=20") as unknown[];
      return JSON.stringify((raw as Record<string, unknown>[]).map(r => ({ name: r.name, full_name: r.full_name, description: r.description, private: r.private, language: r.language, updated_at: r.updated_at, open_issues: r.open_issues_count }))).slice(0, 4000);
    }
    case "github_issues": {
      const path = `/repos/${args.repo}/issues?state=${args.state ?? "open"}&per_page=20`;
      const raw = await githubRequest(path) as unknown[];
      return JSON.stringify((raw as Record<string, unknown>[]).map(i => ({ number: i.number, title: i.title, state: i.state, user: (i.user as Record<string, unknown>)?.login, created_at: i.created_at, labels: (i.labels as Record<string, unknown>[])?.map(l => l.name) }))).slice(0, 4000);
    }
    case "github_criar_issue": {
      const raw = await githubRequest(`/repos/${args.repo}/issues`, "POST", { title: args.titulo, body: args.descricao ?? "", labels: args.labels ? String(args.labels).split(",") : [] }) as Record<string, unknown>;
      return `Issue #${raw.number} criada: ${raw.html_url}`;
    }
    case "github_prs": {
      const raw = await githubRequest(`/repos/${args.repo}/pulls?state=${args.state ?? "open"}&per_page=10`) as unknown[];
      return JSON.stringify((raw as Record<string, unknown>[]).map(p => ({ number: p.number, title: p.title, state: p.state, user: (p.user as Record<string, unknown>)?.login, created_at: p.created_at, head: (p.head as Record<string, unknown>)?.ref, base: (p.base as Record<string, unknown>)?.ref }))).slice(0, 4000);
    }
    case "github_commits": {
      const raw = await githubRequest(`/repos/${args.repo}/commits?per_page=${args.limite ?? 10}`) as unknown[];
      return JSON.stringify((raw as Record<string, unknown>[]).map(c => { const cm = (c as Record<string, unknown>).commit as Record<string, unknown>; return { sha: String((c as Record<string, unknown>).sha).slice(0, 7), message: (cm?.message as string)?.split("\n")[0], author: (cm?.author as Record<string, unknown>)?.name, date: (cm?.author as Record<string, unknown>)?.date }; })).slice(0, 4000);
    }
    case "github_actions": {
      const raw = await githubRequest(`/repos/${args.repo}/actions/runs?per_page=10`) as Record<string, unknown>;
      const runs = (raw.workflow_runs as Record<string, unknown>[]) ?? [];
      return JSON.stringify(runs.map(r => ({ id: r.id, name: r.name, status: r.status, conclusion: r.conclusion, branch: r.head_branch, created_at: r.created_at, url: r.html_url }))).slice(0, 4000);
    }
    case "brain_atualizar": {
      const file = `memoria/${String(args.arquivo)}.md`;
      if (!BRAIN_FILES.includes(file)) return `Arquivo inválido. Use: tecnosup, cardoso, vitor, clientes, aprendizados`;
      // Lê o conteúdo atual e acrescenta o novo aprendizado
      const current = await fetch(`https://api.github.com/repos/${BRAIN_REPO}/contents/${file}`, {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      });
      const currentData = await current.json() as { content?: string };
      const currentText = currentData.content ? Buffer.from(currentData.content.replace(/\n/g, ""), "base64").toString("utf-8") : "";
      const newText = currentText + `\n\n<!-- ${new Date().toLocaleDateString("pt-BR")} -->\n${String(args.conteudo)}`;
      updateBrainFile(file, newText, `jarvis: atualiza ${args.arquivo} — ${String(args.conteudo).slice(0, 60)}`).catch(() => {});
      return `Memória de ${args.arquivo} atualizada.`;
    }

    case "github_listar": {
      const path = args.path ? `?ref=${args.branch ?? "HEAD"}` : "";
      const url = `/repos/${args.repo}/contents/${args.path ?? ""}${path}`;
      const raw = await githubRequest(url) as unknown;
      if (!Array.isArray(raw)) return JSON.stringify(raw).slice(0, 500);
      return JSON.stringify((raw as Record<string, unknown>[]).map(f => ({ name: f.name, type: f.type, path: f.path }))).slice(0, 3000);
    }

    case "github_arquivo": {
      const raw = await githubRequest(`/repos/${args.repo}/contents/${args.path}${args.branch ? `?ref=${args.branch}` : ""}`) as Record<string, unknown>;
      if (raw.content && typeof raw.content === "string") {
        const decoded = Buffer.from(raw.content.replace(/\n/g, ""), "base64").toString("utf-8");
        return decoded.slice(0, 5000);
      }
      return JSON.stringify(raw).slice(0, 2000);
    }

    case "enviar_whatsapp": {
      const instanceId = process.env.ZAPI_INSTANCE_ID;
      const token = process.env.ZAPI_TOKEN;
      const clientToken = process.env.ZAPI_CLIENT_TOKEN;
      if (!instanceId || !token) return "Z-API nao configurada.";
      const numero = String(args.telefone).replace(/\D/g, "");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (clientToken) headers["Client-Token"] = clientToken;
      const res = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`, { method: "POST", headers, body: JSON.stringify({ phone: numero, message: args.mensagem }) });
      if (!res.ok) return `Erro ao enviar WhatsApp: ${res.status}`;
      return `WhatsApp enviado para ${numero}.`;
    }

    case "salvar_fato": {
      if (!userId) return "userId ausente.";
      await getDb().collection("jarvis_memoria").doc(userId).set({ fatos: FieldValue.arrayUnion(String(args.fato)), atualizadoEm: now }, { merge: true });
      return `Fato memorizado.`;
    }
    case "salvar_preferencia": {
      if (!userId) return "userId ausente.";
      await getDb().collection("jarvis_memoria").doc(userId).set({ preferencias: FieldValue.arrayUnion(String(args.preferencia)), atualizadoEm: now }, { merge: true });
      return `Preferencia memorizada.`;
    }
    case "ver_minha_memoria": {
      if (!userId) return "userId ausente.";
      return (await carregarMemoria(userId)) || "Nenhuma memoria acumulada ainda.";
    }
    case "limpar_memoria": {
      if (!userId) return "userId ausente.";
      await getDb().collection("jarvis_memoria").doc(userId).delete();
      return "Memoria resetada.";
    }

    default: return `Ferramenta desconhecida: ${name}`;
  }
}

// ─── Definição das ferramentas ─────────────────────────────────────────────────
const tools = [
  { type: "function", function: { name: "web_search", description: "Pesquisa informações atuais na internet.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
  { type: "function", function: { name: "buscar_clientes", description: "Busca clientes da Tecnosup. Filtra por status (ativo/dev/inadimplente) ou nome.", parameters: { type: "object", properties: { status: { type: "string" }, nome: { type: "string" } } } } },
  { type: "function", function: { name: "atualizar_cliente", description: "Atualiza dados de um cliente.", parameters: { type: "object", properties: { id: { type: "string" }, status: { type: "string" }, plano: { type: "number" }, renovacao: { type: "string" }, whatsapp: { type: "string" }, notas: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "deletar_cliente", description: "Deleta um cliente permanentemente. Confirme antes de executar.", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "criar_cliente", description: "Cria um novo cliente.", parameters: { type: "object", properties: { nome: { type: "string" }, segmento: { type: "string" }, status: { type: "string" }, plano: { type: "number" }, whatsapp: { type: "string" }, site: { type: "string" }, notas: { type: "string" } }, required: ["nome", "segmento", "status"] } } },
  { type: "function", function: { name: "buscar_leads", description: "Busca leads no pipeline.", parameters: { type: "object", properties: { status: { type: "string" }, nome: { type: "string" } } } } },
  { type: "function", function: { name: "atualizar_lead", description: "Atualiza status, notas ou mensagem de um lead.", parameters: { type: "object", properties: { id: { type: "string" }, status: { type: "string" }, notas: { type: "string" }, mensagemPronta: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "criar_lead", description: "Cria um novo lead.", parameters: { type: "object", properties: { nome: { type: "string" }, cidade: { type: "string" }, whatsapp: { type: "string" }, instagram: { type: "string" }, origem: { type: "string" }, temSite: { type: "boolean" }, notas: { type: "string" }, score: { type: "number" } }, required: ["nome", "cidade", "origem"] } } },
  { type: "function", function: { name: "buscar_tarefas", description: "Busca tarefas. Filtra por responsável (Cardoso/Vitor/Ambos) ou feito (true/false).", parameters: { type: "object", properties: { responsavel: { type: "string" }, feito: { type: "boolean" } } } } },
  { type: "function", function: { name: "criar_tarefa", description: "Cria uma nova tarefa.", parameters: { type: "object", properties: { texto: { type: "string" }, prioridade: { type: "string" }, responsavel: { type: "string" }, clienteNome: { type: "string" }, prazo: { type: "string" } }, required: ["texto"] } } },
  { type: "function", function: { name: "concluir_tarefa", description: "Marca uma tarefa como concluída.", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "deletar_tarefa", description: "Deleta uma tarefa.", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "deletar_todas_tarefas", description: "Deleta TODAS as tarefas. Usar só quando explicitamente pedido.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "concluir_todas_tarefas", description: "Conclui todas as tarefas pendentes.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "buscar_pagamentos", description: "Busca pagamentos. Filtra por mês (YYYY-MM) ou cliente.", parameters: { type: "object", properties: { mes: { type: "string" }, clienteNome: { type: "string" } } } } },
  { type: "function", function: { name: "registrar_pagamento", description: "Registra um pagamento recebido.", parameters: { type: "object", properties: { clienteNome: { type: "string" }, clienteId: { type: "string" }, valor: { type: "number" }, data: { type: "string" }, descricao: { type: "string" }, tipo: { type: "string" } }, required: ["clienteNome", "valor"] } } },
  { type: "function", function: { name: "buscar_clientes_at", description: "Busca clientes da assistência técnica (at_clientes). Filtra por nome.", parameters: { type: "object", properties: { nome: { type: "string" } } } } },
  { type: "function", function: { name: "criar_cliente_at", description: "Cria um cliente na assistência técnica.", parameters: { type: "object", properties: { nome: { type: "string" }, telefone: { type: "string" }, email: { type: "string" } }, required: ["nome"] } } },
  { type: "function", function: { name: "atualizar_cliente_at", description: "Atualiza dados de um cliente AT.", parameters: { type: "object", properties: { id: { type: "string" }, nome: { type: "string" }, telefone: { type: "string" }, email: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "deletar_cliente_at", description: "Deleta um cliente AT. Confirme antes.", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "gerar_criativo", description: "Gera um criativo de marketing (caption, hashtags, prompt de imagem) para redes sociais da Tecnosup.", parameters: { type: "object", properties: { tema: { type: "string", description: "Tema ou assunto do post" }, tipo: { type: "string", description: "portfólio de cliente | dica de tecnologia | promoção | antes e depois" }, tom: { type: "string", description: "profissional | descontraído | urgente" } }, required: ["tema"] } } },
  { type: "function", function: { name: "buscar_ordens", description: "Busca ordens de serviço.", parameters: { type: "object", properties: { status: { type: "string" } } } } },
  { type: "function", function: { name: "criar_ordem", description: "Cria uma ordem de serviço.", parameters: { type: "object", properties: { clienteNome: { type: "string" }, clienteId: { type: "string" }, equipamento: { type: "string" }, problema: { type: "string" }, valor: { type: "number" } }, required: ["clienteNome", "equipamento", "problema"] } } },
  { type: "function", function: { name: "atualizar_ordem", description: "Atualiza uma OS.", parameters: { type: "object", properties: { id: { type: "string" }, status: { type: "string" }, diagnostico: { type: "string" }, valor: { type: "number" }, dataSaida: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "buscar_agenda", description: "Busca agendamentos.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "criar_agendamento", description: "Cria um agendamento.", parameters: { type: "object", properties: { titulo: { type: "string" }, clienteNome: { type: "string" }, data: { type: "string" }, hora: { type: "string" }, observacao: { type: "string" } }, required: ["titulo", "data", "hora"] } } },
  { type: "function", function: { name: "vercel_projetos", description: "Lista projetos da Vercel.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "vercel_deployments", description: "Lista deployments de um projeto.", parameters: { type: "object", properties: { projeto: { type: "string" } } } } },
  { type: "function", function: { name: "vercel_logs", description: "Busca logs de um deployment.", parameters: { type: "object", properties: { deploymentId: { type: "string" } }, required: ["deploymentId"] } } },
  { type: "function", function: { name: "vercel_dominio", description: "Lista domínios de um projeto.", parameters: { type: "object", properties: { projeto: { type: "string" } }, required: ["projeto"] } } },
  { type: "function", function: { name: "enviar_whatsapp", description: "Envia WhatsApp para um número.", parameters: { type: "object", properties: { telefone: { type: "string" }, mensagem: { type: "string" } }, required: ["telefone", "mensagem"] } } },
  { type: "function", function: { name: "brain_atualizar", description: "Salva um aprendizado ou informação importante na memória persistente (repositório GitHub). Use para registrar preferências, decisões, padrões e contexto relevante sobre a Tecnosup, Cardoso, Vitor, clientes ou aprendizados gerais.", parameters: { type: "object", properties: { arquivo: { type: "string", description: "tecnosup | cardoso | vitor | clientes | aprendizados" }, conteudo: { type: "string", description: "Texto a adicionar ao arquivo de memória" } }, required: ["arquivo", "conteudo"] } } },
  { type: "function", function: { name: "github_repos", description: "Lista repositórios do GitHub da conta configurada.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "github_issues", description: "Lista issues de um repositório.", parameters: { type: "object", properties: { repo: { type: "string", description: "owner/repo, ex: cardoso/tecnosup" }, state: { type: "string", description: "open, closed ou all" } }, required: ["repo"] } } },
  { type: "function", function: { name: "github_criar_issue", description: "Cria uma issue em um repositório.", parameters: { type: "object", properties: { repo: { type: "string" }, titulo: { type: "string" }, descricao: { type: "string" }, labels: { type: "string", description: "labels separadas por vírgula" } }, required: ["repo", "titulo"] } } },
  { type: "function", function: { name: "github_prs", description: "Lista pull requests de um repositório.", parameters: { type: "object", properties: { repo: { type: "string" }, state: { type: "string" } }, required: ["repo"] } } },
  { type: "function", function: { name: "github_commits", description: "Lista commits recentes de um repositório.", parameters: { type: "object", properties: { repo: { type: "string" }, limite: { type: "number" } }, required: ["repo"] } } },
  { type: "function", function: { name: "github_actions", description: "Lista runs de GitHub Actions de um repositório.", parameters: { type: "object", properties: { repo: { type: "string" } }, required: ["repo"] } } },
  { type: "function", function: { name: "github_listar", description: "Lista arquivos e pastas de um diretório do repositório. Use SEMPRE antes de github_arquivo para descobrir os paths corretos.", parameters: { type: "object", properties: { repo: { type: "string" }, path: { type: "string", description: "caminho da pasta (deixe vazio para raiz)" }, branch: { type: "string" } }, required: ["repo"] } } },
  { type: "function", function: { name: "github_arquivo", description: "Lê o conteúdo de um arquivo. Use github_listar primeiro para confirmar o path exato.", parameters: { type: "object", properties: { repo: { type: "string" }, path: { type: "string", description: "caminho exato do arquivo no repo" }, branch: { type: "string" } }, required: ["repo", "path"] } } },
  { type: "function", function: { name: "salvar_fato", description: "Salva um fato na memória permanente.", parameters: { type: "object", properties: { fato: { type: "string" } }, required: ["fato"] } } },
  { type: "function", function: { name: "salvar_preferencia", description: "Salva uma preferência na memória permanente.", parameters: { type: "object", properties: { preferencia: { type: "string" } }, required: ["preferencia"] } } },
  { type: "function", function: { name: "ver_minha_memoria", description: "Mostra tudo memorizado pelo Jarvis.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "limpar_memoria", description: "Reseta a memória do Jarvis.", parameters: { type: "object", properties: {} } } },
];

// ─── Handler principal ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return new Response("Unauthorized", { status: 401 });

  try {
    const { getAuth } = await import("firebase-admin/auth");
    if (!getApps().length) getDb();
    await getAuth().verifyIdToken(idToken);
  } catch { return new Response("Unauthorized", { status: 401 }); }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!checkRateLimit(ip)) return new Response("Too Many Requests", { status: 429 });

  const { messages, userId } = await req.json();
  const safeMessages = (messages as { role: string; content: string }[])
    .slice(-8)
    .map(m => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  const [memoria, brain] = await Promise.all([
    userId ? carregarMemoria(String(userId)) : Promise.resolve(""),
    loadBrain(),
  ]);
  let systemContent = SYSTEM_PROMPT;
  if (brain) systemContent += "\n\n---\nMEMÓRIA PERSISTENTE (repositório jarvis-brain):\n" + brain;
  if (memoria) systemContent += "\n\n" + memoria;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));
      try {
        let currentMessages: NimMessage[] = [
          { role: "system", content: systemContent },
          ...safeMessages as NimMessage[],
        ];

        for (let round = 0; round < 8; round++) {
          const response = await nimChat(currentMessages);
          const msg = response.choices[0].message;

          if (!msg.tool_calls?.length) {
            send("__DONE_TOOLS__\n");
            if (msg.content) send(msg.content);
            if (userId && safeMessages.length > 0) {
              salvarMemoria(String(userId), safeMessages[safeMessages.length - 1]?.content ?? "").catch(() => {});
            }
            break;
          }

          currentMessages.push({ role: "assistant", content: msg.content ?? "" });

          for (const toolCall of msg.tool_calls) {
            const toolName = toolCall.function.name;
            let toolArgs: Record<string, unknown> = {};
            try { toolArgs = JSON.parse(toolCall.function.arguments ?? "{}"); } catch { /* mantém {} */ }

            send(`__TOOL__:${toolName}:${JSON.stringify(toolArgs)}\n`);

            let result: string;
            try {
              result = await executeTool(toolName, toolArgs, userId ? String(userId) : undefined);
            } catch (err) {
              console.error(`[JARVIS tool:${toolName}]`, err);
              result = `Erro ao executar ${toolName}: ${String(err)}`;
            }

            currentMessages.push({ role: "tool", tool_call_id: toolCall.id, content: result });
          }
        }
      } catch (err: unknown) {
        console.error("[JARVIS]", err);
        send("__DONE_TOOLS__\n");
        const msg = (err as { message?: string })?.message ?? "";
        if (msg.includes("429") || msg.includes("quota")) {
          send("Limite da API atingido. Aguarde alguns segundos e tente novamente.");
        } else {
          send(`Erro: ${msg.slice(0, 200)}`);
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
  });
}
