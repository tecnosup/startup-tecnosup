# Padrão de Segurança — Tecnosup

Documento de referência para implementação de segurança em todos os sistemas web desenvolvidos pela Tecnosup. Aplicar obrigatoriamente antes de todo deploy em produção.

---

## 1. Checklist de deploy seguro

Execute antes de cada deploy em produção:

- [ ] Todas as variáveis sensíveis estão em `.env.local` (nunca em código)
- [ ] `.env.local` está no `.gitignore` e não foi commitado
- [ ] As variáveis de produção estão configuradas no painel da Vercel (não no repo)
- [ ] `ADMIN_CLAIM_SECRET` é uma string aleatória com 32+ caracteres
- [ ] Rate limiting está ativo em todas as rotas públicas de POST
- [ ] Validação de input está nas rotas que recebem dados do usuário
- [ ] O `AuthGuard` (ou middleware equivalente) protege todas as rotas `/admin/*`
- [ ] `httpOnly: true` e `secure: true` estão nos cookies de sessão
- [ ] `sameSite: "lax"` está no cookie de sessão
- [ ] A rota `/api/admin/set-claim` tem rate limiting (máx. 3 req/min por IP)
- [ ] Não há `console.log` com dados sensíveis no código
- [ ] O `.env.local.example` está atualizado com os nomes (sem valores) das variáveis necessárias

---

## 2. Rate limiting — template padrão

Usar o módulo `src/lib/rate-limit.ts` abaixo em todos os projetos. Não requer nenhuma dependência externa.

```typescript
// src/lib/rate-limit.ts
type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

export function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}
```

### Como usar nas rotas de API

```typescript
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(`agendamento:${getClientIp(req)}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429 }
    );
  }
  // ...restante da lógica
}
```

### Limites recomendados por tipo de rota

| Tipo de rota | Limite | Janela | Chave |
|---|---|---|---|
| Criação de agendamento | 5 req | 1 min | `agendamento:{ip}` |
| Consulta pública (GET) | 10 req | 1 min | `{rota}:{ip}` |
| Contato / formulário | 5 req | 1 min | `contato:{ip}` |
| Set-claim (admin) | 3 req | 1 min | `set-claim:{ip}` |
| Login / auth | 5 req | 5 min | `login:{ip}` |

**Nota:** Este rate limiter usa memória do processo. Para múltiplas instâncias (alto tráfego), migrar para Redis ou Upstash. Para o volume atual dos clientes, memória é suficiente e tem custo zero.

---

## 3. Validação de input — regras padrão

Aplicar em toda rota que recebe dados de usuário externo:

```typescript
// Telefone: apenas dígitos, 10–15 caracteres
const telefone = String(raw).replace(/\D/g, "").slice(0, 15);
if (telefone.length < 10) return erro("Telefone inválido");

// Nome / texto curto: strip de espaços extras, limite de caracteres
const nome = String(raw).trim().slice(0, 100);

// Mensagem / texto longo: limite mais generoso
const mensagem = String(raw).trim().slice(0, 1000);

// Número (preço, valor): garantir que é numérico
const preco = Math.abs(parseFloat(raw) || 0);
```

**Regra geral:** nunca confie em `typeof` no input — sempre converta para `String()` antes de sanitizar.

---

## 4. Autenticação admin — padrão Firebase

### Fluxo correto

1. Cliente faz login com Firebase Auth (email/password)
2. Firebase retorna `idToken`
3. Frontend envia `idToken` para `/api/admin/session` (POST)
4. Backend verifica o token via `adminAuth.verifyIdToken()` e checa `decoded.admin === true`
5. Backend cria session cookie `httpOnly` com validade de 7 dias
6. Todas as rotas `/admin/*` verificam o cookie via middleware ou `AuthGuard`

### Cookie de sessão (padrão)

```typescript
res.cookies.set("NOME_session", sessionCookie, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
  path: "/",
});
```

### Criação do admin (set-claim)

- A rota `/api/admin/set-claim` exige o `ADMIN_CLAIM_SECRET` no body
- Nunca expor essa rota sem rate limiting
- Usar apenas uma vez na configuração inicial; depois desabilitar ou proteger com IP allowlist se possível
- O secret deve ter 32+ caracteres aleatórios. Gerar com: `openssl rand -base64 32`

---

## 5. Variáveis de ambiente — política de rotação

| Variável | Rotação recomendada | Ação em caso de vazamento |
|---|---|---|
| `ADMIN_CLAIM_SECRET` | Anual ou após suspeita de vazamento | Regenerar, revogar claims antigos se necessário |
| `FIREBASE_PRIVATE_KEY` | A cada 12 meses | Revogar chave no Console Firebase, gerar nova |
| `ZAPI_TOKEN` (WhatsApp) | A cada 6 meses | Revogar no painel Z-API, atualizar na Vercel |
| `R2_SECRET_ACCESS_KEY` | A cada 12 meses | Revogar token no painel R2, gerar novo, atualizar na Vercel |
| Chaves públicas (`NEXT_PUBLIC_*`) | Não precisam de rotação | — |

**Procedimento de rotação:**
1. Gerar novo valor
2. Atualizar em **Vercel → Settings → Environment Variables**
3. Fazer redeploy (a Vercel injeta as novas vars no build)
4. Revogar o valor antigo na plataforma de origem
5. Atualizar no Bitwarden
6. Testar em produção

---

## 6. Boas práticas para o cliente (orientar na entrega)

Infraestrutura isolada por cliente e gestão de credenciais: `empresa/infra-seguranca.md` seções 2 e 3.

Repassar ao cliente durante o treinamento de uso do sistema:

- Usar senha forte no painel administrativo (mínimo 12 caracteres, misturar letras, números e símbolos)
- Ativar verificação em dois fatores no e-mail cadastrado no Firebase
- Nunca compartilhar a senha do painel com terceiros
- Sair do painel ao usar dispositivos compartilhados
- Em caso de suspeita de acesso indevido: avisar a Tecnosup imediatamente para reset de credenciais e revisão do log de auditoria

---

## 8. O que NÃO fazer

- Nunca commitar `.env.local` ou qualquer arquivo com credenciais reais
- Nunca usar `eval()`, `innerHTML` com dados do usuário, ou concatenação direta de SQL/queries
- Nunca retornar stack traces ou mensagens de erro internas para o cliente (`console.error` internamente, mensagem genérica externamente)
- Nunca deixar rota de criação de admin (`set-claim`) sem autenticação de secret
- Nunca usar `Math.random()` para geração de tokens de segurança (usar `crypto.randomUUID()` ou `openssl`)
