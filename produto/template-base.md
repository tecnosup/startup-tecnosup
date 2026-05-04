# Template Base — pasta-base

Repositório: c:\Users\cardo\ortega (projeto Ortega Barber = primeiro cliente, baseado no template)

## O que é

Esqueleto Next.js 15 para landing page + painel admin. Ponto de partida para todo novo cliente.

## Features já implementadas

- Landing page com seções: hero, serviços, depoimentos (hardcoded), agendamento, contato
- Sistema de agendamento: cliente escolhe data/hora, dados salvos no Firestore
- Painel admin protegido (Firebase Auth + custom claim):
  - Dashboard de agendamentos (confirmado, cancelado, concluído, não compareceu)
  - Reagendamento com notificação WhatsApp (toast com link wa.me)
  - Filtro de horários passados no mesmo dia (cliente e admin)
  - Gerenciamento de serviços, configurações, galeria
- API routes: agendamentos CRUD, status, upload Cloudinary
- Slots de horário bloqueados por dia da semana + horário de funcionamento configurável

## Checklist de personalização por cliente

- [ ] NEXT_PUBLIC_SITE_NAME
- [ ] Logo (Navbar, Footer, AdminNav, Login)
- [ ] Paleta de cores (tailwind.config.ts)
- [ ] Fonte (layout.tsx)
- [ ] Textos via /admin/configuracoes
- [ ] Imagens reais
- [ ] Fluxo de conversão (/api/contato)
- [ ] CRUD de itens ajustado para o tipo de negócio
- [ ] Domínio customizado no Vercel
- [ ] Google Analytics (GA_ID do cliente)
- [ ] Branch dev criada

## Setup rápido

```
cp .env.local.example .env.local
# preencher variáveis Firebase + Cloudinary
npm install && npm run dev
```

Criar admin: POST /api/admin/set-claim com uid + ADMIN_CLAIM_SECRET
