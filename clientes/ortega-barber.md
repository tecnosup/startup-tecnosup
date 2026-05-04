# Cliente: Ortega Barber

**Status:** em desenvolvimento (primeiro cliente / projeto piloto)
**Repositório:** c:\Users\cardo\ortega
**Branch produção:** main
**Deploy:** Vercel

## Sobre o negócio

Barbearia. Sistema de agendamento online + painel admin.

## Features entregues

- Landing page: hero, serviços, depoimentos (3 hardcoded), agendamento, contato
- Agendamento público: seleção de data/hora, filtro de horários passados no mesmo dia
- Painel admin: gestão de agendamentos, reagendamento com notificação WhatsApp, serviços, galeria, configurações
- Filtro de horários passados também no modal de reagendamento do admin

## Stack

- Next.js 15 + TypeScript + TailwindCSS
- Firebase Auth + Firestore (Admin SDK)
- Cloudinary
- Vercel

## Pendências / próximos passos

- Fechar com o cliente e configurar Firebase/Cloudinary na conta deles
- Registrar domínio no Registro.br
- Configurar env vars de produção na Vercel
- Criar usuário admin no Firebase Console
