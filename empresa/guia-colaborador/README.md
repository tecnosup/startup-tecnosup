# Guia do Colaborador — site estático

Manual de onboarding de engenharia da Tecnosup (roadmap de 14 etapas).
Site estático de 1 arquivo — sem build, sem framework, sem dependência.

- **Produção:** https://guia-tecnosup.vercel.app
- **Projeto Vercel:** `tecnosups-projects/guia-tecnosup` (`prj_NCgWuim4xjMD85UBfODbv2ILRpQ2`)
- **Fonte da verdade:** `index.html` **desta pasta**. Não editar em outro lugar.

## Arquivos

| Arquivo | Para quê |
|---|---|
| `index.html` | O guia inteiro — HTML + CSS + JS inline |
| `robots.txt` | `Disallow: /` |
| `vercel.json` | Headers `X-Robots-Tag`, `X-Frame-Options: DENY`, `Referrer-Policy` |

## Publicar

Deploy é **manual**, pela CLI, desta pasta (mesma regra do Ortega — push não sobe nada):

```bash
cd empresa/guia-colaborador
npx vercel deploy --prod --yes --scope team_DAill18OQFCTJWGBZpk8x87B
```

A pasta já está linkada ao projeto (`.vercel/project.json`, fora do git).
Se `.vercel/` sumir, rode `npx vercel link` e escolha `guia-tecnosup`.

Conferir o que subiu:

```bash
curl -sI https://guia-tecnosup.vercel.app | findstr /i "HTTP x-robots"
```

## Atenção — o conteúdo não é público de verdade

`noindex` + `robots.txt` mantêm fora do Google, mas **a URL é adivinhável e não tem senha**
(proteção por senha na Vercel exige plano Pro; a conta é Hobby).

Está no ar hoje: tabela de preços, nomes de clientes e, na etapa 05, a descrição de uma
falha ainda não corrigida em sistema de cliente em produção. Antes de mandar o link para
fora da equipe, decidir se esse trecho sai.
