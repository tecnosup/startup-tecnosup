import Groq from "groq-sdk";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function enviarWhatsApp(telefone: string, mensagem: string): Promise<boolean> {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;
  if (!instanceId || !token) return false;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (clientToken) headers["Client-Token"] = clientToken;

  const res = await fetch(
    `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ phone: telefone.replace(/\D/g, ""), message: mensagem }),
    }
  );
  return res.ok;
}

export async function POST(req: Request) {
  // Autenticação por secret ou Firebase token
  const auth = req.headers.get("authorization");
  const secret = req.headers.get("x-secret");
  if (secret !== process.env.CRON_SECRET && !auth?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { telefone } = await req.json().catch(() => ({}));
  const destinatario = telefone || process.env.TECNOSUP_WHATSAPP;
  if (!destinatario) {
    return Response.json({ erro: "telefone nao informado" }, { status: 400 });
  }

  try {
    const db = getDb();
    const hoje = new Date();
    const mesAtual = hoje.toISOString().slice(0, 7);
    const em30dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Busca dados em paralelo
    const [clientesSnap, pagamentosSnap, tarefasSnap, leadsSnap, ordensSnap] = await Promise.all([
      db.collection("clientes").get(),
      db.collection("pagamentos").orderBy("data", "desc").limit(100).get(),
      db.collection("tarefas").where("feito", "==", false).get(),
      db.collection("leads").orderBy("criadoEm", "desc").limit(50).get(),
      db.collection("at_ordens").where("status", "in", ["aguardando", "em_andamento"]).get(),
    ]);

    const clientes = clientesSnap.docs.map(d => d.data());
    const pagamentos = pagamentosSnap.docs.map(d => d.data());
    const tarefas = tarefasSnap.docs.map(d => d.data());
    const leads = leadsSnap.docs.map(d => d.data());
    const ordens = ordensSnap.docs.map(d => d.data());

    // Calcula métricas
    const ativos = clientes.filter(c => c.status === "ativo").length;
    const inadimplentes = clientes.filter(c => c.status === "inadimplente");
    const emDev = clientes.filter(c => c.status === "dev").length;
    const mrr = clientes.filter(c => c.status === "ativo").reduce((s, c) => s + (c.plano ?? 0), 0);
    const receitaMes = pagamentos.filter(p => String(p.data).startsWith(mesAtual)).reduce((s, p) => s + (p.valor ?? 0), 0);
    const renovacoes = clientes.filter(c => c.renovacao && c.renovacao <= em30dias && c.renovacao >= hoje.toISOString().slice(0, 10));
    const leadsNovos = leads.filter(l => l.status === "novo" || l.status === "mensagem_pronta").length;
    const tarefasAlta = tarefas.filter(t => t.prioridade === "alta");

    const contexto = `
DATA: ${hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}

CLIENTES: ${ativos} ativos | ${emDev} em dev | ${inadimplentes.length} inadimplentes
INADIMPLENTES: ${inadimplentes.map(c => c.nome).join(", ") || "nenhum"}
MRR: R$${mrr.toLocaleString("pt-BR")}
RECEBIDO ESTE MES: R$${receitaMes.toLocaleString("pt-BR")}
RENOVACOES EM 30 DIAS: ${renovacoes.map(c => `${c.nome} (${c.renovacao})`).join(", ") || "nenhuma"}

TAREFAS PENDENTES: ${tarefas.length} total | ${tarefasAlta.length} alta prioridade
TAREFAS ALTA PRIORIDADE: ${tarefasAlta.map(t => t.texto).slice(0, 5).join(" | ") || "nenhuma"}

LEADS: ${leadsNovos} aguardando contato
ORDENS DE SERVICO ABERTAS: ${ordens.length}
`.trim();

    // Gera briefing com o Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Voce e JARVIS, assistente da Tecnosup. Gere um briefing matinal curto e direto para o Cardoso. Use emojis estrategicamente. Maximo 300 palavras. Tom: profissional mas descontraido, como o Jarvis do Tony Stark. Em portugues brasileiro.",
        },
        {
          role: "user",
          content: `Gere o briefing matinal com base nestes dados:\n\n${contexto}`,
        },
      ],
      max_tokens: 600,
      stream: false,
    });

    const briefing = response.choices[0].message.content ?? "";

    // Envia no WhatsApp
    const enviado = await enviarWhatsApp(destinatario, briefing);

    return Response.json({
      ok: true,
      enviado,
      destinatario,
      briefing,
      metricas: { ativos, inadimplentes: inadimplentes.length, mrr, receitaMes, tarefasPendentes: tarefas.length, leadsNovos, ordensAbertas: ordens.length },
    });

  } catch (err) {
    console.error("[BRIEFING]", err);
    return Response.json({ erro: String(err) }, { status: 500 });
  }
}
