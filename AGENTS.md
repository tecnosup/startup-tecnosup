# AGENTS.md - Memoria do Projeto startup-tecnosup

> Arquivo de contexto para agentes de IA (Claude, Copilot, etc.) que trabalham neste repositorio.
> Atualizado em: 2026-05-12

---

## 1. O QUE E ESTE PROJETO

**startup-tecnosup** e o sistema interno da empresa **Tecnosup** - uma software house localizada na regiao do Vale do Paraiba (SP) que desenvolve sistemas para barbearias e negocios locais.

Este repositorio e o **novo sistema de gestao da propria Tecnosup**, contendo:
- Painel de controle interno (Next.js 15 + Firebase)
- Modulo de leads e prospeccao automatizada
- Modulo de propostas comerciais
- Gestao de clientes, financeiro, tarefas e assistencia tecnica
- Integracao com Z-API (WhatsApp)

**NAO confundir com repositorios de clientes** (ex: ortega, nyx, docevale).

---

## 2. STACK TECNICA

| Tecnologia | Uso |
|---|---|
| Next.js 15 (App Router) | Frontend + API Routes |
| TypeScript | Tipagem estrita |
| Firebase (Firestore + Auth) | Banco de dados + Autenticacao |
| Tailwind CSS | Estilizacao |
| Vercel | Deploy + Cron Jobs |
| Z-API | Integracao WhatsApp |
| Google Places API | Prospeccao de leads |
| Gemini 1.5 Flash | Geracao de mensagens (tier gratuito) |

---

## 3. ESTRUTURA DE PASTAS

```
src/
  app/
    api/
      cron/
        prospectar/route.ts   <- Cron job de prospeccao de leads
      whatsapp/route.ts       <- Envio via Z-API
    painel/
      leads/page.tsx          <- Painel de leads
      clientes/               <- Gestao de clientes
      financeiro/             <- Modulo financeiro
      proposta/               <- Geracao de propostas
      tarefas/                <- Gestao de tarefas
      assistencia/            <- Suporte tecnico
      saude/                  <- Health check do sistema
      login/                  <- Autenticacao
  components/
    painel/
      Sidebar.tsx             <- Menu lateral (inclui item Leads)
  lib/
    types.ts                  <- Tipos TypeScript (inclui Lead, LeadStatus, LeadOrigem)
    leads.ts                  <- CRUD Firestore para leads
    firebase.ts               <- Config Firebase
empresa/
  modelo-vendas.md            <- Precificacao: R$1.500-R$2.000 setup + R$129/mes
  vendas-instagram-dm.md      <- Script DM Instagram (4 etapas)
  vendas-cold-call.md         <- Script cold call (4 blocos)
vercel.json                   <- Config cron: 0 9 * * 1-5 (seg-sex 6h BRT)
.env.local.example            <- Variaveis de ambiente necessarias
```

---

## 4. MODULO DE LEADS (IMPLEMENTADO EM 2026-05-12)

### Fluxo completo
```
Vercel Cron (Seg-Sex 06h BRT)
  -> Google Places API (busca barbearias por cidade)
  -> Firebase Admin (verifica duplicatas por nome+cidade)
  -> Gemini 1.5 Flash (gera mensagem DM personalizada)
  -> Firestore (salva lead com status "mensagem_pronta")
  -> Z-API (notifica equipe Tecnosup no WhatsApp)
  -> /painel/leads (painel para visualicao e gestao)
```

### Cidades prospectadas
- Cruzeiro SP
- Lorena SP
- Guaratingueta SP
- Aparecida SP
- Cachoeira Paulista SP

### Funil de status dos leads
novo -> mensagem_pronta -> contato_feito -> respondeu -> demo_enviada -> proposta_enviada -> fechado / perdido

### Score de prioridade (0-100)
- Sem site: +40
- Usa WhatsApp para agendar: +25
- Tem WhatsApp: +15
- Tem Instagram: +10
- Mais de 500 seguidores: +10

### Regra critica de mensagem
A mensagem gerada pelo Gemini NAO deve mencionar: sistema, produto, preco ou Tecnosup na primeira abordagem.
Seguir o script de empresa/vendas-instagram-dm.md.

---

## 5. VARIAVEIS DE AMBIENTE NECESSARIAS

Todas listadas em .env.local.example. Para producao, adicionar na Vercel (Settings -> Environment Variables):

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Z-API (WhatsApp)
ZAPI_INSTANCE_ID=
ZAPI_TOKEN=
ZAPI_PHONE=

# Google Places (prospeccao)
GOOGLE_PLACES_API_KEY=

# Gemini (geracao de mensagens - tier gratuito)
GEMINI_API_KEY=

# Cron protection
CRON_SECRET=
NEXT_PUBLIC_CRON_SECRET=
```

Obter GEMINI_API_KEY: https://aistudio.google.com -> Get API Key

---

## 6. CRON JOB

Arquivo: vercel.json
Schedule: 0 9 * * 1-5 (segunda a sexta, 9h UTC = 6h BRT)
Path: /api/cron/prospectar

ATENCAO: O vercel.json ainda contem CRON_SECRET_PLACEHOLDER.
Substituir pelo valor real antes do deploy.
Gerar secret: openssl rand -hex 32

---

## 7. IMPLEMENTACAO GEMINI (sem SDK externo)

A chamada ao Gemini usa fetch puro - sem instalar nenhum pacote adicional.
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=GEMINI_API_KEY
Method: POST
Body: { contents: [{ parts: [{ text: prompt }] }] }
Response path: data.candidates[0].content.parts[0].text

---

## 8. MODELO DE NEGOCIO (empresa/modelo-vendas.md)

- Setup: R$1.500 - R$2.000 (unico)
- Mensalidade: R$129/mes
- Publico-alvo: Barbearias sem sistema de agendamento digital
- Diferencial: Sistema proprio, suporte local, WhatsApp integrado

---

## 9. PENDENCIAS (acao do usuario)

- [ ] git pull origin main (sincronizar remote com local)
- [ ] Gerar CRON_SECRET: openssl rand -hex 32
- [ ] Editar vercel.json: trocar CRON_SECRET_PLACEHOLDER pelo secret real
- [ ] Adicionar todas as env vars na Vercel (Settings -> Environment Variables)
- [ ] Obter GEMINI_API_KEY em https://aistudio.google.com
- [ ] Fazer novo deploy na Vercel para ativar a cron

---

## 10. CONTEXTO DO REPOSITORIO TECNOSUP (outros repos)

| Repo | Stack | Status |
|---|---|---|
| WebAppTecnosup | HTML puro | Legado - site antigo |
| tecnosup-v2 | Next.js | Site institucional atual |
| pasta-base | Next.js + Firebase | Boilerplate para novos projetos |
| ortega | Next.js 15 + Firebase | Cliente ativo - 89 commits, 75 deploys |
| nyx | Next.js + Firebase | E-commerce cliente - 75 commits |
| projeto-docevale | HTML | Cliente simples |
| startup-tecnosup | Next.js 15 + Firebase | Sistema interno Tecnosup (este repo) |

---

## 11. REGRAS PARA AGENTES IA

1. Nunca confundir este repo com repos de clientes
2. Commits direto em main (branch unico)
3. Seguir convencao de commits: feat:, fix:, chore:, refactor:
4. Nao instalar SDKs desnecessarios - Gemini usa fetch nativo
5. Mensagens de IA para leads: nao mencionar produto, preco ou empresa na primeira abordagem
6. Duplicatas de leads: verificar por nome + cidade antes de inserir no Firestore
7. A cron roda automaticamente na Vercel - nao chamar manualmente sem o CRON_SECRET
