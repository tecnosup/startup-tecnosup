# Infraestrutura e Segurança — Tecnosup

Documento de referência interno. Descreve a arquitetura padrão de todos os sistemas web desenvolvidos pela Tecnosup, as decisões técnicas por trás de cada escolha, e as responsabilidades de cada parte.

---

## 1. Visão geral da stack

Todos os projetos seguem a mesma stack base:

| Camada | Tecnologia | Plano |
|---|---|---|
| Frontend + Backend | Next.js 15 (App Router) | — |
| Hosting + Deploy | Vercel | Hobby (gratuito) |
| Banco de dados | Firebase Firestore | Spark (gratuito) |
| Autenticação | Firebase Auth | Spark (gratuito) |
| Storage de imagens | Cloudflare R2 | Free (10 GB) |
| WhatsApp | Z-API | Pago pelo cliente |
| Backup | Google Cloud Storage | ~R$0,02/mês |

Detalhamento completo de custos e limites: `empresa/custos-infraestrutura.md`

---

## 2. Princípio fundamental — infraestrutura na conta do cliente

Cada cliente tem sua própria infraestrutura isolada:

- **Firebase** — projeto próprio com Project ID único
- **Cloudflare R2** — bucket próprio na conta do cliente
- **Vercel** — projeto próprio na conta do cliente
- **Domínio** — registrado no Registro.br na conta do cliente

A Tecnosup **nunca** centraliza infraestrutura de clientes na própria conta. Isso garante:

1. **Isolamento total** — um problema em um cliente não afeta outro
2. **Conformidade com LGPD** — os dados do cliente ficam na conta dele
3. **Argumento de venda** — cliente tem controle real sobre seus dados
4. **Sem dependência da Tecnosup** — se o contrato encerrar, o sistema continua funcionando

A Tecnosup acessa a infraestrutura do cliente **apenas durante suporte**, com ciência do cliente, via credenciais armazenadas no cofre Bitwarden compartilhado.

---

## 3. Gestão de credenciais — Bitwarden Organizations

Todas as credenciais de clientes são armazenadas no **Bitwarden Organizations** (gratuito para 2 usuários).

### O que registrar por cliente

Criar uma pasta por cliente no Bitwarden com os seguintes itens:

**Firebase**
- E-mail e senha da conta Google do cliente
- Project ID
- `FIREBASE_ADMIN_PRIVATE_KEY` (chave do service account)
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PROJECT_ID`
- Chaves públicas (`NEXT_PUBLIC_FIREBASE_*`)

**Cloudflare R2**
- E-mail e senha da conta Cloudflare do cliente
- Account ID
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

**Vercel**
- E-mail e senha da conta Vercel do cliente
- URL do projeto em produção

**Domínio**
- E-mail e senha do Registro.br do cliente
- Domínio registrado
- Data de vencimento do domínio

**Sistema**
- `ADMIN_CLAIM_SECRET` (32+ caracteres)
- URL do painel admin
- E-mail e senha do usuário admin do sistema

---

## 4. Arquitetura de autenticação admin

### Fluxo completo

```
Cliente (browser)
    ↓ login email/senha
Firebase Auth
    ↓ idToken
POST /api/admin/session
    ↓ verifyIdToken() + checa claim admin === true
Session cookie (httpOnly, secure, sameSite: lax, 7 dias)
    ↓ todas as requisições seguintes
AuthGuard / middleware
    ↓ verifica cookie em cada rota /admin/*
Painel admin liberado
```

### Padrão do cookie de sessão

```typescript
res.cookies.set("base_admin_session", sessionCookie, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 dias
  path: "/",
});
```

### Criação do primeiro admin (set-claim)

- Rota: `POST /api/admin/set-claim`
- Exige `ADMIN_CLAIM_SECRET` no body (32+ caracteres, gerado com `openssl rand -base64 32`)
- Rate limited: máx. 3 req/min por IP
- Usar apenas uma vez na configuração inicial

---

## 5. Storage de imagens — Cloudflare R2

### Por que R2 e não Cloudinary ou S3

| Critério | Cloudflare R2 | Cloudinary | AWS S3 |
|---|---|---|---|
| Egress (saída) | **Gratuito** | Cobrado | Cobrado |
| Free tier storage | 10 GB | 25 GB (com limitações) | 5 GB (12 meses) |
| Complexidade | Baixa | Baixa | Alta |
| Vendor lock-in | Baixo | Alto | Médio |

O egress gratuito é o diferencial principal — imagens são servidas diretamente pelo bucket sem custo por acesso.

### Variáveis de ambiente necessárias

```
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=https://pub-XXXXXXXX.r2.dev
```

### Estrutura de pastas por projeto

```
bucket-do-cliente/
  produtos/       ← imagens de produtos
  itens/          ← imagens de serviços
  hero/           ← imagens da landing page (fundo, retrato)
  sobre/          ← foto da seção sobre nós
```

### Upload — fluxo seguro

O upload é feito server-side via `POST /api/admin/upload` (autenticado):
1. Frontend envia o arquivo para a rota da Vercel
2. Rota verifica sessão admin
3. Rota faz upload para R2 via AWS Signature V4
4. Rota retorna a URL pública
5. Frontend salva a URL no Firestore

Validações aplicadas na rota:
- Autenticação obrigatória (session cookie)
- Tamanho máximo: 10 MB
- Formatos permitidos: JPG, PNG, WebP, GIF
- `isR2Configured` — retorna 503 se variáveis não estiverem configuradas (não quebra em produção)

---

## 6. Rate limiting — padrão em todas as rotas públicas

Implementado em `src/lib/rate-limit.ts` — sem dependências externas, usa Map em memória.

Template de implementação, limites recomendados e exemplo de uso: `empresa/seguranca-padrao.md` seção 2.

---

## 7. Backup automático

### Arquitetura

```
Firestore ──────────────→ Google Cloud Storage (bucket do cliente)
                              /firestore/  ← export semanal (seg 03h00)

Cloudflare R2 ──────────→ Google Cloud Storage (bucket do cliente)
  (imagens)                   /r2-images/  ← sync semanal (seg 03h30)
```

### Características

- **Frequência:** semanal (toda segunda-feira às 03h, horário de Brasília)
- **Retenção:** 90 dias (política de lifecycle no GCS apaga backups mais antigos)
- **Custo:** ~R$0,02/mês por projeto (só o storage GCS)
- **Acesso:** Tecnosup acessa via credenciais no Bitwarden

### Quando configurar

O backup é configurado **no momento da entrega do projeto ao cliente**, quando a infraestrutura já está na conta dele com faturamento ativo. Durante o desenvolvimento, o Firebase já replica os dados internamente.

Guia completo de setup: `empresa/backup-setup.md`

---

## 8. Variáveis de ambiente — padrão de nomenclatura

| Prefixo | Visibilidade | Uso |
|---|---|---|
| `NEXT_PUBLIC_` | Exposta no browser | Firebase Client SDK, GA, site name |
| sem prefixo | Só no servidor | Admin SDK, R2, secrets |

Política de rotação completa: `empresa/seguranca-padrao.md` seção 5.

---

## 9. Checklist de entrega ao cliente

Executar antes de cada entrega em produção:

**Infraestrutura**
- [ ] Firebase migrado para conta do cliente (novo Project ID)
- [ ] Cloudflare R2 criado na conta do cliente
- [ ] Vercel migrado para conta do cliente
- [ ] Domínio apontando para Vercel (DNS configurado)
- [ ] Todas as variáveis de ambiente configuradas na Vercel do cliente
- [ ] Credenciais registradas no Bitwarden (pasta do cliente)

**Segurança**
- [ ] `ADMIN_CLAIM_SECRET` gerado com 32+ caracteres (`openssl rand -base64 32`)
- [ ] Rate limiting ativo em todas as rotas públicas de POST
- [ ] `AuthGuard` protegendo todas as rotas `/admin/*`
- [ ] Cookies de sessão com `httpOnly: true`, `secure: true`, `sameSite: "lax"`
- [ ] Nenhum `console.log` com dados sensíveis
- [ ] `.env.local` não commitado (verificar `.gitignore`)

**Backup**
- [ ] Conta de faturamento vinculada ao projeto GCP do cliente
- [ ] Bucket GCS criado com política de retenção de 90 dias
- [ ] Cloud Scheduler configurado para export do Firestore (seg 03h)
- [ ] Cloud Run Job configurado para sync R2 → GCS (seg 03h30)
- [ ] Teste manual executado e verificado

**Treinamento**
- [ ] Manual de uso entregue ao cliente (`clientes/CLIENTE-manual-uso.html`)
- [ ] Treinamento presencial ou por vídeo realizado
- [ ] Cliente orientado sobre senha forte e 2FA no e-mail do Firebase
- [ ] Cliente orientado a avisar a Tecnosup em caso de suspeita de acesso indevido

---

## 10. Projetos ativos

| Cliente | Project ID Firebase | Bucket R2 | Status |
|---|---|---|---|
| Ortega Barber | `ortegabarber-21668` | `ortega-images` (a criar) | Em desenvolvimento |
| Nyx | `nyx-012` | `nyx-images` | Em produção |

---

*Última atualização: maio/2026.*
