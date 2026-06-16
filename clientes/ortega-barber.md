# Cliente: Ortega Barber

**Status:** MVP entregue (maio/2026)
**Repositório:** `c:\Users\cardo\ortega`
**Deploy:** Vercel

## Sobre o negócio
Barbearia em Cruzeiro/SP. Sistema de agendamento online + painel admin.

## Features entregues
- Landing page: hero, serviços, depoimentos, agendamento, contato
- Agendamento público: seleção de data/hora, filtro de horários passados no mesmo dia
- Painel admin: gestão de agendamentos, reagendamento com notificação WhatsApp, serviços, galeria, configurações
- Filtro de horários passados também no modal de reagendamento do admin

## Stack
- Next.js 15 + TypeScript + TailwindCSS
- Firebase Auth + Firestore (Admin SDK)
- Cloudinary
- Vercel

## Uso interno
Usado como **demo ao vivo** durante pitches para novos clientes barbearia — sistema rodando no celular na hora da visita.

## Pendências
- Fechar contrato formal e configurar Firebase/Cloudinary na conta do cliente
- Registrar domínio no Registro.br
- Configurar env vars de produção na Vercel
- Criar usuário admin no Firebase Console
