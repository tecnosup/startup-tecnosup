# Custos de Infraestrutura por Projeto — Tecnosup

Documento de referência para precificação e transparência com clientes.
Câmbio de referência: **R$ 4,94/USD** (mai/2026 — atualizar a cada renovação de contrato).

---

## Resumo executivo

| Item | Custo mensal (USD) | Custo mensal (BRL) |
|---|---|---|
| Firebase (Spark — gratuito) | $0,00 | R$ 0,00 |
| Vercel (Hobby — gratuito) | $0,00 | R$ 0,00 |
| Cloudflare R2 (até 10 GB) | $0,00 | R$ 0,00 |
| Backup — GCS storage (~100 MB) | ~$0,004 | ~R$ 0,02 |
| Backup — Cloud Scheduler (2 jobs) | $0,00 | R$ 0,00 |
| Backup — Cloud Run Job | $0,00 | R$ 0,00 |
| **Total por projeto** | **~$0,004** | **~R$ 0,02/mês** |

**Custo real de infraestrutura por cliente: praticamente zero.**

---

## Detalhamento por serviço

### Firebase (Firestore + Auth)

Plano **Spark (gratuito)**:

| Recurso | Limite gratuito | Uso típico (pequeno negócio) |
|---|---|---|
| Firestore — leituras | 50.000/dia | < 5.000/dia |
| Firestore — escritas | 20.000/dia | < 500/dia |
| Firestore — storage | 1 GB | < 50 MB |
| Auth — usuários ativos | Ilimitado | 1–5 admins |

Custo: **$0,00/mês**

Quando migrar para pago: se o sistema ultrapassar 50.000 leituras/dia de forma consistente (improvável para pequenos negócios). O plano Blaze cobra $0,06 por 100.000 leituras excedentes.

---

### Vercel (hosting + deploy)

Plano **Hobby (gratuito)**:

| Recurso | Limite gratuito |
|---|---|
| Deployments | Ilimitado |
| Bandwidth | 100 GB/mês |
| Serverless Functions | 100 GB-horas/mês |
| Edge Functions | 500.000 invocações/mês |

Custo: **$0,00/mês**

Quando migrar para pago: se o cliente precisar de múltiplos membros de equipe no painel Vercel ou SLA garantido. Plano Pro: $20/mês.

---

### Cloudflare R2 (storage de imagens)

| Recurso | Limite gratuito |
|---|---|
| Storage | 10 GB/mês |
| Operações de leitura (Class B) | 10 milhões/mês |
| Operações de escrita (Class A) | 1 milhão/mês |
| Egress (saída de dados) | Ilimitado e gratuito |

Uso típico por projeto: < 500 MB de imagens.

Custo: **$0,00/mês** (dentro do free tier com folga)

Quando migrar para pago: se o cliente ultrapassar 10 GB de imagens. Acima disso: $0,015/GB/mês.

---

### Backup — Google Cloud Storage

Preço Standard Storage região São Paulo (southamerica-east1): **$0,035/GB/mês**

| Cenário | Tamanho estimado | Custo USD/mês | Custo BRL/mês |
|---|---|---|---|
| Projeto pequeno (< 100 MB) | 0,1 GB | $0,004 | R$ 0,02 |
| Projeto médio (< 500 MB) | 0,5 GB | $0,018 | R$ 0,09 |
| Projeto grande (< 2 GB) | 2 GB | $0,07 | R$ 0,35 |

O backup acumula semana a semana. Recomenda-se configurar uma **política de retenção de 90 dias** no bucket — comando e arquivo de configuração em `empresa/backup-setup.md`.

---

### Backup — Cloud Scheduler + Cloud Run Job

| Serviço | Free tier | Uso |
|---|---|---|
| Cloud Scheduler | 3 jobs gratuitos/projeto | 2 jobs (Firestore + R2) |
| Cloud Run Jobs | 180.000 vCPU-s/mês gratuitos | ~500 vCPU-s/mês |

Custo: **$0,00/mês**

---

## Projeção de crescimento

| Fase | Período estimado | Custo mensal |
|---|---|---|
| Lançamento (0–6 meses) | Primeiros clientes | R$ 0,00–0,05 |
| Crescimento (6–18 meses) | Sistema em uso ativo | R$ 0,05–0,50 |
| Escala (18+ meses) | Alto volume de dados/imagens | R$ 0,50–5,00 |

Para chegar a um custo relevante (> R$ 50,00/mês), um projeto precisaria ter centenas de GBs de imagens e milhões de requisições diárias — fora da realidade de pequenos negócios.

---

## Política de repasse ao cliente

A infraestrutura fica na conta do próprio cliente (Firebase, Cloudflare, Vercel). Portanto:

- Os custos acima são **pagos pelo cliente diretamente** nas plataformas, com o cartão dele
- A Tecnosup **não intermedeia** pagamentos de infraestrutura
- Durante o contrato, a Tecnosup **orienta o cliente** a monitorar o uso e avisa se algum limite estiver próximo
- O valor da mensalidade da Tecnosup (R$ 49,90/mês) cobre **suporte e manutenção**, não infraestrutura

---

## Quando a conta é da Tecnosup (projetos em desenvolvimento)

Durante o desenvolvimento, enquanto o projeto ainda está na conta da Tecnosup antes da entrega:

- Manter os projetos no **Firebase Spark** (gratuito) até o momento da entrega
- Não ultrapassar os limites gratuitos do Vercel Hobby
- Ao entregar: migrar o projeto para a conta do cliente e deletar da conta da Tecnosup

---

*Última atualização: maio/2026. Revisar preços e câmbio a cada 6 meses ou antes de renovar contratos.*
