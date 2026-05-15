import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export const dynamic = 'force-dynamic';

function calcularScore(lead: {
      temSite: boolean;
      usaWhatsappParaAgendar: boolean;
      seguidores: number | null;
      whatsapp: string | null;
      instagram: string | null;
}): number {
      let score = 0;
      if (!lead.temSite) score += 40;
      if (lead.usaWhatsappParaAgendar) score += 25;
      if (lead.whatsapp) score += 15;
      if (lead.instagram) score += 10;
      if ((lead.seguidores ?? 0) > 500) score += 10;
      return Math.min(score, 100);
}

async function gerarMensagem(lead: {
      nome: string;
      cidade: string;
      seguidores: number | null;
      usaWhatsappParaAgendar: boolean;
      temSite: boolean;
}): Promise<string> {
      const contexto = [
              lead.usaWhatsappParaAgendar && "usa WhatsApp para agendamento",
              !lead.temSite && "nao tem site proprio",
              lead.seguidores && lead.seguidores < 500 && "perfil com poucos seguidores mas ativo",
              lead.seguidores && lead.seguidores >= 500 && "perfil com boa audiencia",
            ]
        .filter(Boolean)
        .join(", ");

  const prompt = `Voce e um vendedor da Tecnosup, empresa de tecnologia de Cruzeiro/SP que desenvolve sistemas de agendamento para barbearias.

  Escreva a PRIMEIRA mensagem de abordagem no Instagram DM para a barbearia "${lead.nome}" de ${lead.cidade}.

  Contexto do perfil: ${contexto}.

  Regras:
  - Maximo 3 linhas
  - Nao mencione sistema, produto, preco ou a Tecnosup
  - Objetivo: gerar resposta com pergunta sobre como gerenciam agendamentos hoje
  - Tom: humano, direto, sem parecer automatico

  Escreva apenas a mensagem.`;

  return callGemini(prompt, { maxOutputTokens: 150, temperature: 0.7 });
}

export async function GET(req: Request) {
      const { searchParams } = new URL(req.url);
      if (searchParams.get("secret") !== process.env.CRON_SECRET) {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
              return NextResponse.json({ error: "Google Places API nao configurada" }, { status: 503 });
      }

  const cidades = [
          "Cruzeiro SP",
          "Lorena SP",
          "Guaratingueta SP",
          "Aparecida SP",
          "Cachoeira Paulista SP",
        ];

  const { initializeApp, getApps, cert } = await import("firebase-admin/app");
      const { getFirestore } = await import("firebase-admin/firestore");

  if (!getApps().length) {
          initializeApp({
                    credential: cert({
                                projectId: process.env.FIREBASE_PROJECT_ID,
                                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                    }),
          });
  }

  const adminDb = getFirestore();
      const leadsGerados: { id: string; nome: string; cidade: string }[] = [];

  for (const cidade of cidades) {
          const queryStr = `barbearia em ${cidade}`;
          const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryStr)}&key=${apiKey}&language=pt-BR`;

        const res = await fetch(url);
          const data = await res.json();

        for (const place of (data.results ?? []).slice(0, 5)) {
                  const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,website,url&key=${apiKey}`;
                  const detailRes = await fetch(detailUrl);
                  const detail = await detailRes.json();
                  const p = detail.result ?? {};

            const temSite =
                        !!p.website &&
                        !p.website.includes("facebook") &&
                        !p.website.includes("instagram") &&
                        !p.website.includes("wa.me");

            const whatsapp = p.formatted_phone_number?.replace(/\D/g, "") ?? null;

            const lead = {
                        nome: place.name as string,
                        cidade: cidade.replace(" SP", ""),
                        whatsapp,
                        instagram: null,
                        googleMapsUrl: (p.url as string) ?? null,
                        seguidores: null,
                        temSite,
                        usaWhatsappParaAgendar: !temSite,
                        origem: "google_maps" as const,
                        status: "novo" as const,
                        score: calcularScore({
                                      temSite,
                                      usaWhatsappParaAgendar: !temSite,
                                      seguidores: null,
                                      whatsapp,
                                      instagram: null,
                        }),
                        mensagemPronta: null as string | null,
                        notas: "",
                        historico: [
                            { acao: "Lead encontrado via Google Maps", data: new Date().toISOString() },
                                    ],
            };

            const existing = await adminDb
                    .collection("leads")
                    .where("nome", "==", lead.nome)
                    .where("cidade", "==", lead.cidade)
                    .limit(1)
                    .get();

            if (existing.empty) {
                        const docRef = await adminDb.collection("leads").add({
                                      ...lead,
                                      criadoEm: new Date(),
                                      atualizadoEm: new Date(),
                        });

                    const mensagem = await gerarMensagem(lead);
                        await docRef.update({
                                      mensagemPronta: mensagem,
                                      status: "mensagem_pronta",
                                      historico: [
                                                      ...lead.historico,
                                          { acao: "Mensagem personalizada gerada pelo Gemini", data: new Date().toISOString() },
                                                    ],
                        });

                    leadsGerados.push({ id: docRef.id, nome: lead.nome, cidade: lead.cidade });
            }
        }
  }

  if (leadsGerados.length > 0) {
          const instanceId = process.env.ZAPI_INSTANCE_ID;
          const token = process.env.ZAPI_TOKEN;
          const seuNumero = process.env.TECNOSUP_WHATSAPP;

        if (instanceId && token && seuNumero) {
                  const msg = `Tecnosup - Novos Leads\n\n${leadsGerados.length} barbearias encontradas hoje e prontas para contato:\n\n${leadsGerados.map((l) => `- ${l.nome} (${l.cidade})`).join("\n")}\n\nAcesse o painel para ver as mensagens prontas.`;
                  await fetch(
                              `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
                      {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ phone: seuNumero, message: msg }),
                      }
                            );
        }
  }

  return NextResponse.json({
          ok: true,
          leadsGerados: leadsGerados.length,
          detalhes: leadsGerados,
  });
}
