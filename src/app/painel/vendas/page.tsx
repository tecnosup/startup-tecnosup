"use client";
import { useState } from "react";
import AuthGuard from "@/components/painel/AuthGuard";
import Sidebar from "@/components/painel/Sidebar";
import { ChevronDown, ChevronUp } from "lucide-react";

type Canal = "presencial" | "coldcall" | "instagram";

const canais: { key: Canal; label: string; desc: string }[] = [
  { key: "presencial", label: "Presencial", desc: "Na barbearia, como cliente ou abordagem direta" },
  { key: "coldcall", label: "Cold Call", desc: "Ligação fria para barbearias" },
  { key: "instagram", label: "Instagram DM", desc: "Abordagem ativa pelo Instagram" },
];

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#0b1121", borderColor: "#1f3566" }}>
      <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpen((v) => !v)}>
        <p className="font-orbitron text-xs font-bold text-white tracking-wide">{title}</p>
        {open ? <ChevronUp size={14} className="text-[#555]" /> : <ChevronDown size={14} className="text-[#555]" />}
      </button>
      {open && (
        <div className="border-t px-5 py-4 text-sm text-[#ccc] space-y-3" style={{ borderColor: "#1f3566" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-block text-[10px] font-orbitron px-2 py-0.5 rounded mr-2"
      style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}>
      {children}
    </span>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-4 py-3 my-1 italic text-[#e0e0e0]"
      style={{ background: "#030407", borderLeft: "3px solid #0eb3ff33" }}>
      {children}
    </div>
  );
}

function Objection({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: "#1f3566" }}>
      <button className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm"
        style={{ background: "#030407" }} onClick={() => setOpen((v) => !v)}>
        <span className="text-[#aaa]">{q}</span>
        {open ? <ChevronUp size={12} className="text-[#555] shrink-0 ml-2" /> : <ChevronDown size={12} className="text-[#555] shrink-0 ml-2" />}
      </button>
      {open && (
        <div className="px-4 py-3 text-sm" style={{ background: "#0b1121", borderTop: "1px solid #1f3566" }}>
          <Quote>{a}</Quote>
        </div>
      )}
    </div>
  );
}

// ── CONTEÚDO POR CANAL ──────────────────────────────────────────────────────

function ConteudoPresencial() {
  return (
    <div className="space-y-3">
      <Section title="Perfil do cliente-alvo" defaultOpen>
        <ul className="list-disc pl-4 space-y-1">
          <li>Dono de barbearia com até 3 barbeiros e 5 funcionários</li>
          <li>Agenda pelo WhatsApp ou caderno</li>
          <li>Não sabe exatamente quanto fatura por mês</li>
          <li>Parece profissional na decoração mas não na operação</li>
          <li>Já pensou em "ter um site" mas nunca foi adiante</li>
        </ul>
      </Section>

      <Section title="FASE 1 — Papo normal (5–10 min)" defaultOpen>
        <p className="text-[#aaa]">Não force. Fale de qualquer coisa — futebol, bairro, movimento. O objetivo é criar clima de conversa genuína <strong className="text-white">antes de qualquer coisa relacionada a negócio</strong>.</p>
        <p className="text-[#0eb3ff] text-xs font-orbitron mt-2">NUNCA abra como vendedor. Abra como pessoa.</p>
      </Section>

      <Section title="FASE 2 — Pergunta de abertura (escolha UMA)">
        <p className="text-[#555] text-xs mb-2">Faz a pergunta e fecha a boca. Deixa ele falar.</p>
        <Quote>"E aí, como tá o movimento? Agenda cheia?"</Quote>
        <Quote>"Você ainda agenda pelo WhatsApp ou tem outro sistema?"</Quote>
        <Quote>"Você tá abrindo barbearia própria né? Como tá sendo a organização?"</Quote>
      </Section>

      <Section title="FASE 3 — Aprofundar a dor">
        <p className="text-[#555] text-xs mb-3">Com base no que ele responder, vai fundo. Não resolva ainda — faça ele sentir o peso do problema.</p>
        <div className="space-y-3">
          <div><Tag color="#ffbd2e">SE AGENDA CHEIA</Tag><div className="mt-1 space-y-1"><Quote>"Você consegue acompanhar tudo? Já aconteceu de cliente confirmar pelo Zap e não aparecer?"</Quote><Quote>"Você sabe quanto fez essa semana de cabeça, ou só vê no fim do mês?"</Quote></div></div>
          <div><Tag color="#0eb3ff">SE USA WHATSAPP</Tag><div className="mt-1 space-y-1"><Quote>"Já teve cliente que marcou horário errado por confusão no Zap?"</Quote><Quote>"Quando você tá cortando e chega mensagem — você para pra responder ou deixa pra depois e perde o cliente?"</Quote></div></div>
          <div><Tag color="#22c55e">DORES MAIS COMUNS</Tag><div className="mt-2"><ul className="list-disc pl-4 space-y-1 text-[#aaa]"><li>Perda de cliente por falta de organização</li><li>Confusão no agendamento pelo WhatsApp</li><li>Não saber o faturamento real</li><li>Imagem premium mas operação amadora</li><li>Horários vazios sem saber o motivo</li></ul></div></div>
        </div>
      </Section>

      <Section title="FASE 4 — A virada (plantar a solução sem empurrar)">
        <p className="text-[#555] text-xs mb-2">Só quando a dor estiver clara. Tom de conversa, não de pitch.</p>
        <Quote>"Cara, eu tava pensando nisso outro dia. A gente desenvolveu um sistema pra barbearia que resolve exatamente isso — o cliente agenda sozinho online, você vê tudo no painel, sabe quanto fez no mês, quais serviços rendem mais. Fiz pro Ortega e ficou muito bom."</Quote>
        <p className="text-[#555] text-xs mt-2">Se ele demonstrar qualquer interesse → <strong className="text-white">"Deixa eu te mostrar funcionando."</strong> — abre o celular, mostra o sistema.</p>
        <p className="text-[#555] text-xs">Se não demonstrar → planta a semente e muda de assunto. O interesse vem depois.</p>
      </Section>

      <Section title="FASE 5 — Demo no celular">
        <p className="text-[#555] text-xs mb-3">Não faz tour do sistema. Mostra as soluções das dores que ELE mencionou.</p>
        <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#1f3566" }}>
          {[
            ["Confusão no WhatsApp", "Fluxo de agendamento — cliente marca em 30 segundos"],
            ["Não saber o faturamento", "Painel financeiro com gráfico de receita"],
            ["Cliente que sumiu", "Página de status — cliente consulta o próprio agendamento"],
            ["Imagem / profissionalismo", "Landing page com visual premium"],
            ["Produtos / serviços", "Módulo de produtos com integração no WhatsApp"],
          ].map(([dor, mostra]) => (
            <div key={dor} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-xs border-b last:border-0" style={{ borderColor: "#1f3566" }}>
              <span className="text-[#aaa]">Se falou sobre: <strong className="text-white">{dor}</strong></span>
              <span className="text-[#0eb3ff]">→ {mostra}</span>
            </div>
          ))}
        </div>
        <div className="mt-2"><Quote>"Tudo isso fica no nome da sua barbearia — domínio, Firebase, tudo. Não é plataforma de terceiro. É seu."</Quote></div>
      </Section>

      <Section title="Preço">
        <p className="text-[#aaa]"><strong className="text-white">Nunca fale de preço na primeira conversa.</strong> Se ele perguntar:</p>
        <Quote>"A gente conversa isso com calma, quero entender o seu volume antes de te passar um número. Mas o que você achou?"</Quote>
        <p className="text-[#aaa] mt-2">Se insistir muito:</p>
        <Quote>"O setup fica na faixa de R$1.500 a R$2.000 dependendo do que você precisa. Mas antes de falar de preço, deixa eu te montar algo personalizado pro seu perfil."</Quote>
      </Section>

      <Section title="Objeções comuns">
        <div className="space-y-2">
          <Objection q='"Eu já uso o WhatsApp, funciona bem."' a='"Funciona, mas você tá perdendo cliente que não quer mandar mensagem. Tem gente que prefere marcar sozinho, na hora que quer, sem ter que esperar você responder. Esse cliente vai pra barbearia que tiver o link."' />
          <Objection q='"É caro."' a='"Depende do que você tá comparando. Se for com nada, parece caro. Se for com um cliente a mais por semana que você não perdeu — já pagou."' />
          <Objection q='"Não sei mexer com tecnologia."' a='"O painel é mais simples que o WhatsApp. E a gente cuida de tudo — você nem precisa pensar na parte técnica."' />
          <Objection q='"Vou pensar."' a='"Faz sentido. Mas me fala — o que você precisaria ver pra ter certeza que vale? Posso te mandar o link do sistema funcionando pra você mostrar pra alguém de confiança."' />
          <Objection q='"Tenho um sobrinho que faz site."' a='"Site é diferente de sistema. Site é uma página. Isso aqui tem agendamento, painel financeiro, módulo de produtos, cupons. Tudo integrado e no nome da sua barbearia."' />
        </div>
      </Section>

      <Section title="Frases de urgência (use com moderação)">
        <Quote>"Barbearia que tiver isso primeiro na cidade já sai na frente. Cliente fiel é fiel pra quem parece mais profissional."</Quote>
        <Quote>"Cada semana sem isso é mais um cliente que foi uma vez e não teve como remarcar fácil."</Quote>
        <Quote>"Estou fechando só mais 2 clientes esse mês pra garantir suporte de qualidade."</Quote>
      </Section>

      <Section title="Checklist pré-conversa">
        {["Sistema do Ortega abrindo rápido no celular (testa antes)", "Sabe o nome do dono", "Sabe se ele tem barbearia própria ainda", "Bateria do celular acima de 50%", "Não está com pressa — a conversa não tem hora marcada"].map((item) => (
          <label key={item} className="flex items-start gap-2 cursor-pointer select-none">
            <input type="checkbox" className="mt-0.5 accent-[#0eb3ff]" />
            <span className="text-[#aaa]">{item}</span>
          </label>
        ))}
      </Section>
    </div>
  );
}

function ConteudoColdCall() {
  return (
    <div className="space-y-3">
      <Section title="Contexto" defaultOpen>
        <p className="text-[#aaa]">O dono provavelmente vai atender no meio de um corte, com tesoura na mão. Você tem no máximo <strong className="text-white">60 segundos</strong> para despertar interesse.</p>
        <p className="text-[#0eb3ff] text-xs font-orbitron mt-2">O objetivo não é vender. É conseguir um próximo passo.</p>
        <div className="mt-3">
          <p className="text-xs text-[#555] font-orbitron tracking-widest mb-2">ONDE ACHAR OS NÚMEROS</p>
          <ul className="list-disc pl-4 space-y-1 text-[#aaa]">
            <li>Google Maps — busca "barbearia + cidade"</li>
            <li>Instagram da barbearia — número geralmente na bio</li>
            <li>WhatsApp Business visível no perfil do Instagram</li>
            <li>Indicações de clientes já atendidos</li>
          </ul>
        </div>
      </Section>

      <Section title="BLOCO 1 — Identificação (15s)" defaultOpen>
        <Quote>"Oi, tudo bem? Aqui é o [seu nome], da Tecnosup. Você é o responsável pela [nome da barbearia]?"</Quote>
        <div className="space-y-1 mt-2">
          <p className="text-xs text-[#555]">Se for funcionário → <span className="text-[#aaa] italic">"Tem como falar com o dono? É rápido."</span></p>
          <p className="text-xs text-[#555]">Se o dono não estiver → <span className="text-[#aaa] italic">"Sem problema. Qual o melhor horário pra eu ligar de volta?"</span></p>
        </div>
      </Section>

      <Section title="BLOCO 2 — Gancho (20s, escolha UMA opção)">
        <div className="space-y-2">
          <div><Tag color="#0eb3ff">OPÇÃO A — Operação</Tag><Quote>"Eu pergunto porque a gente desenvolveu um sistema de agendamento pra barbearia aqui em Cruzeiro. Antes de te apresentar qualquer coisa, queria saber: você ainda controla os agendamentos pelo WhatsApp ou tem outro sistema?"</Quote></div>
          <div><Tag color="#7000ff">OPÇÃO B — Referência local</Tag><Quote>"A gente acabou de implementar um sistema pra uma barbearia aqui na região e tivemos um resultado bem bom. Queria saber se faria sentido pra você também — como funciona o agendamento aí hoje?"</Quote></div>
          <div><Tag color="#22c55e">OPÇÃO C — Dor direta</Tag><Quote>"Você sabe quantos clientes você teve esse mês de cabeça? Pergunto porque a gente resolve exatamente isso pra barbearia — controle financeiro e agendamento num lugar só."</Quote></div>
        </div>
        <p className="text-[#555] text-xs mt-2">Faz a pergunta e fica quieto. Deixa ele responder.</p>
      </Section>

      <Section title="BLOCO 3 — Qualificação rápida (15–30s)">
        <div className="space-y-3">
          <div><Tag color="#22c55e">SE DEMONSTROU INTERESSE</Tag><Quote>"Entendi. E você tem ideia de quantos agendamentos você perde por semana por falta de organização — cliente que some, horário errado, resposta atrasada?"</Quote></div>
          <div><Tag color="#ef4444">SE DISSE QUE TÁ ÓTIMO</Tag><Quote>"Faz sentido. Só uma última coisa — você conhece alguma barbearia na sua cidade que já usa sistema de agendamento online próprio?"</Quote></div>
          <div><Tag color="#ffbd2e">SE ESTAVA COM PRESSA</Tag><Quote>"Entendo, você tá no meio de um corte. Posso te mandar o link do sistema no WhatsApp pra você ver quando tiver 2 minutinhos? Não é catálogo, é o sistema real funcionando."</Quote></div>
        </div>
      </Section>

      <Section title="BLOCO 4 — Próximo passo (15s)">
        <p className="text-[#555] text-xs mb-2">Nunca termina a ligação sem um próximo passo claro.</p>
        <div className="space-y-2">
          <div><Tag color="#22c55e">SE DEMONSTROU INTERESSE</Tag><Quote>"Que tal a gente bater um papo de 15 minutos essa semana? Você vê o sistema funcionando e decide se faz sentido pro seu caso. Qual dia fica melhor pra você?"</Quote></div>
          <div><Tag color="#0eb3ff">SE PREFERIU VER PRIMEIRO</Tag><Quote>"Posso te mandar o link agora no WhatsApp. Você acessa, vê funcionando e se tiver interesse você me chama. Pode ser?"</Quote></div>
          <div><Tag color="#ffbd2e">SE VAI PENSAR</Tag><Quote>"Tudo bem. Te mando o link no Zap pra você guardar. Se quiser conversar depois é só me chamar."</Quote></div>
        </div>
      </Section>

      <Section title="Variações por situação">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#555] font-orbitron mb-1">VIU NO INSTAGRAM</p>
            <Quote>"Oi, tudo bem? Aqui é o [nome], da Tecnosup. Vi o perfil da [barbearia] no Instagram — você é o responsável? Vi que vocês usam o Zap pra agendamento. A gente desenvolveu um sistema pra barbearia que substitui isso — o cliente marca sozinho, você controla tudo num painel."</Quote>
          </div>
          <div>
            <p className="text-xs text-[#555] font-orbitron mb-1">POR INDICAÇÃO</p>
            <Quote>"Oi, tudo bem? Aqui é o [nome], da Tecnosup. O [nome de quem indicou] falou que vocês podem se interessar pelo que a gente faz. Você tem 1 minutinho?"</Quote>
          </div>
          <div>
            <p className="text-xs text-[#555] font-orbitron mb-1">SEGUNDO CONTATO (FOLLOW-UP)</p>
            <Quote>"Oi [nome], tudo bem? Aqui é o [nome] da Tecnosup. A gente falou semana passada sobre o sistema de agendamento. Você conseguiu dar uma olhada no link que mandei?"</Quote>
          </div>
        </div>
      </Section>

      <Section title="Objeções comuns">
        <div className="space-y-2">
          <Objection q='"Não tenho interesse." (nos primeiros 10s)' a='"Tudo bem. Só uma pergunta rápida antes de desligar: você já usa algum sistema de agendamento ou ainda é pelo Zap?"' />
          <Objection q='"Já tenho quem cuida disso."' a='"Entendi. É uma plataforma de agendamento ou sistema próprio?" — Se for plataforma (Booksy etc.) → "Plataforma cobra taxa e fica no nome deles, não no nome da barbearia."' />
          <Objection q='"Não tenho dinheiro agora."' a='"Faz sentido. Não precisa decidir nada agora — te mando o link pra você guardar e quando o momento certo chegar você já sabe o que é. Pode ser?"' />
          <Objection q='"Me manda por WhatsApp que eu vejo."' a='Manda o link em seguida. 24h depois: "Conseguiu dar uma olhada?"' />
          <Objection q='"Como você achou meu número?"' a='"Tá no Google Maps da barbearia. Mas se preferir que eu não ligue mais, é só falar." — Transparência total, nunca minta.' />
        </div>
      </Section>

      <Section title="Melhores horários para ligar">
        <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#1f3566" }}>
          {[
            ["✅ Terça a quinta, 10h–12h", "Movimento mais tranquilo, dono mais disponível"],
            ["✅ Terça a quinta, 14h–16h", "Após almoço, antes do pico da tarde"],
            ["⛔ Sexta e sábado", "Dia mais cheio da barbearia"],
            ["⛔ Segunda manhã", "Dono organizando a semana, menos receptivo"],
          ].map(([hora, motivo]) => (
            <div key={hora} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-xs border-b last:border-0" style={{ borderColor: "#1f3566" }}>
              <span className="text-white">{hora}</span>
              <span className="text-[#aaa]">{motivo}</span>
            </div>
          ))}
        </div>
        <p className="text-[#555] text-xs mt-2">Meta realista: de cada 10 ligações, 3 conversam, 1 pede o link, 0,3 vira cliente. Isso é normal — é processo.</p>
      </Section>

      <Section title="Tom de voz e postura">
        <ul className="list-disc pl-4 space-y-1 text-[#aaa]">
          <li>Fale devagar. Telemarketing fala rápido com medo de ser interrompido. Você não é telemarketing.</li>
          <li>Não leia o script. Use como referência, mas fale como se fosse conversa.</li>
          <li>Se ele estiver com pressa, perceba e encurte. Não force.</li>
          <li>Sorria enquanto fala — muda o tom de voz mesmo ele não vendo.</li>
          <li>Nunca use tom de súplica — você tem algo que resolve um problema real.</li>
        </ul>
      </Section>

      <Section title="Checklist pré-ligação">
        {["Nome da barbearia e idealmente nome do dono anotados", "Sabe a fonte do número (Google, Instagram, indicação)", "Link do sistema do Ortega no celular (pra mandar no WhatsApp logo após)", "Horário adequado (evitar segunda de manhã e sexta de tarde)", "Não está em lugar barulhento"].map((item) => (
          <label key={item} className="flex items-start gap-2 cursor-pointer select-none">
            <input type="checkbox" className="mt-0.5 accent-[#0eb3ff]" />
            <span className="text-[#aaa]">{item}</span>
          </label>
        ))}
      </Section>
    </div>
  );
}

function ConteudoInstagram() {
  return (
    <div className="space-y-3">
      <Section title="Regra principal" defaultOpen>
        <p className="text-[#0eb3ff] font-orbitron text-xs">A primeira mensagem nunca vende. Ela abre uma conversa.</p>
        <p className="text-[#aaa] mt-2">Gaste 2 minutos no perfil antes de escrever. Você precisa saber: nome da barbearia, nome do dono (na bio ou nos posts), se posta regularmente, se tem post recente com gancho real.</p>
        <p className="text-[#ef4444] text-xs mt-2 font-orbitron">Nunca mande a mesma mensagem para dois perfis. Personalização mínima obrigatória.</p>
      </Section>

      <Section title="ETAPA 1 — Primeira mensagem" defaultOpen>
        <p className="text-[#555] text-xs mb-2">Objetivo: gerar uma resposta. Não apresentar a empresa, não falar de sistema, não mandar link.</p>
        <Quote>"Oi [nome/barbearia], vi o perfil de vocês aqui. Trabalha bastante com agendamento online ou ainda é mais pelo Zap?"</Quote>
        <div className="space-y-2 mt-2">
          <div><Tag color="#ffbd2e">BARBEARIA NOVA / EM ABERTURA</Tag><Quote>"Oi [nome], vi que vocês estão abrindo a [barbearia]. Já tem estrutura de agendamento definida ou ainda tá organizando isso?"</Quote></div>
          <div><Tag color="#7000ff">POUCOS SEGUIDORES / BONS POSTS</Tag><Quote>"Oi [nome], passei no perfil de vocês. Barbearia com esse nível de acabamento merecia mais visibilidade. Como vocês tão recebendo clientes novos hoje?"</Quote></div>
          <div><Tag color="#0eb3ff">POST RECENTE RELEVANTE</Tag><Quote>"Oi [nome], vi o post sobre [referência real]. Que bom! Como tá sendo a organização do agendamento com o movimento?"</Quote></div>
        </div>
      </Section>

      <Section title="ETAPA 2 — Ele responde">
        <div className="space-y-3">
          <div><Tag color="#22c55e">RESPONDEU POSITIVAMENTE</Tag><p className="text-xs text-[#555] mb-1">Aprofunda a dor. Não apresenta o produto ainda.</p><Quote>"Entendi. E você consegue acompanhar tudo pelo Zap sem perder nada? Já tive relato de barbearia que perdeu cliente porque a mensagem se perdeu no meio de outras."</Quote></div>
          <div><Tag color="#0eb3ff">DISSE "USO O ZAP"</Tag><Quote>"Faz sentido no começo. Mas com o movimento crescendo fica difícil de controlar tudo, né? Você sabe quantos agendamentos você teve esse mês de cabeça?"</Quote></div>
          <div><Tag color="#ef4444">RESPONDEU COM DESCONFIANÇA</Tag><Quote>"Pergunto porque a gente desenvolveu um sistema de agendamento pra barbearia e antes de apresentar pra alguém gosto de entender como ele trabalha hoje. Não faz sentido mostrar algo que ele já tem."</Quote></div>
          <div><Tag color="#ffbd2e">NÃO RESPONDEU EM 48H</Tag><Quote>"Oi [nome], desculpa incomodar. Só queria saber se chegou minha mensagem — o Instagram às vezes some com as DMs."</Quote><p className="text-xs text-[#555] mt-1">Se não responder após a segunda, não insiste. Parte pro próximo.</p></div>
        </div>
      </Section>

      <Section title="ETAPA 3 — A virada">
        <p className="text-[#555] text-xs mb-2">Só entra aqui depois que ele falou de alguma dificuldade real.</p>
        <Quote>"Cara, exatamente isso que a gente resolve. Desenvolvemos um sistema de agendamento pra barbearia — cliente marca sozinho online, você vê tudo no painel, controla o financeiro, tudo no nome da sua barbearia. Fiz pra uma barbearia aqui e ficou muito bom. Quer ver funcionando?"</Quote>
        <p className="text-[#555] text-xs mt-2">Se topar → <span className="text-[#aaa] italic">"Te mando o link direto do sistema pra você testar no seu celular. É a demo real, não é apresentação."</span></p>
      </Section>

      <Section title="ETAPA 4 — Após mandar o link">
        <p className="text-[#555] text-xs mb-2">Espera ele falar primeiro. Se não falar em 24h:</p>
        <Quote>"Conseguiu acessar? Qualquer dúvida sobre o que você viu, pode perguntar."</Quote>
        <div className="space-y-2 mt-2">
          <div><Tag color="#22c55e">SE GOSTOU</Tag><Quote>"Que bom. Posso te chamar numa call rápida de 15 minutos pra você ver o painel admin também? Tem coisas que no link você não consegue ver."</Quote></div>
          <div><Tag color="#ffbd2e">SE FICOU EM DÚVIDA</Tag><Quote>"O que mais te chamou atenção? Ou o que você sentiu falta?"</Quote></div>
        </div>
      </Section>

      <Section title="Perfis para priorizar">
        <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#1f3566" }}>
          {[
            ["Bio com WhatsApp para agendamento", "Está usando Zap — dor latente de organização"],
            ["Poucos posts mas bom acabamento visual", "Quer profissionalismo, não tem estrutura ainda"],
            ["Posts sobre inauguração ou reforma", "Momento de decisão — está montando a operação"],
            ["Muitos comentários sem resposta", "Está sobrecarregado — dor de gestão"],
            ["Bio vaga, sem CTA claro", "Não tem estratégia — espaço pra entrar"],
          ].map(([sinal, indica]) => (
            <div key={sinal} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-xs border-b last:border-0" style={{ borderColor: "#1f3566" }}>
              <span className="text-[#aaa]">{sinal}</span>
              <span className="text-[#0eb3ff]">{indica}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Objeções comuns no DM">
        <div className="space-y-2">
          <Objection q='"Tenho interesse, mas agora não é hora."' a='"Tudo bem. Posso te mandar o link da demo pra você guardar e ver quando tiver um tempo? Não precisa decidir nada agora."' />
          <Objection q='"Quanto custa?" (muito cedo na conversa)' a='"Depende do que você precisa. Me conta como funciona o agendamento hoje pra eu entender melhor."' />
          <Objection q='"Já tenho site."' a='"Site é diferente de sistema. O que a gente fez tem agendamento online, painel admin, controle financeiro, cupons. Tudo integrado. Quer ver a diferença funcionando?"' />
          <Objection q='"Não tenho tempo agora."' a='"Sem problema. Quando você tiver 2 minutinhos, olha isso aqui [link da demo]. É rápido e você já entende o que é."' />
        </div>
      </Section>

      <Section title="Checklist antes da primeira DM">
        {["Leu a bio completa", "Viu os últimos 3 posts", "Sabe o nome da barbearia (e idealmente o nome do dono)", "Identificou pelo menos 1 dor ou gancho real no perfil", "A mensagem tem referência específica ao perfil (não é copiar e colar)", "A primeira mensagem não menciona sistema, preço ou a Tecnosup"].map((item) => (
          <label key={item} className="flex items-start gap-2 cursor-pointer select-none">
            <input type="checkbox" className="mt-0.5 accent-[#0eb3ff]" />
            <span className="text-[#aaa]">{item}</span>
          </label>
        ))}
      </Section>
    </div>
  );
}

export default function VendasPage() {
  const [canal, setCanal] = useState<Canal>("presencial");

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ background: "#030407" }}>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="mb-8 mt-14 md:mt-0">
            <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#0eb3ff] mb-1">PAINEL</p>
            <h1 className="font-orbitron text-2xl font-bold text-white">Playbook de Vendas</h1>
            <p className="text-sm text-[#555] mt-1">Scripts e estratégias por canal de abordagem</p>
          </div>

          {/* Seletor de canal */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {canais.map((c) => (
              <button key={c.key} onClick={() => setCanal(c.key)}
                className="flex-1 min-w-[140px] px-4 py-3 rounded-xl border text-left transition-all"
                style={{
                  background: canal === c.key ? "rgba(14,179,255,0.08)" : "#0b1121",
                  borderColor: canal === c.key ? "#0eb3ff55" : "#1f3566",
                }}>
                <p className="font-orbitron text-xs font-bold mb-0.5" style={{ color: canal === c.key ? "#0eb3ff" : "#777" }}>{c.label}</p>
                <p className="text-[10px] text-[#555]">{c.desc}</p>
              </button>
            ))}
          </div>

          <div className="max-w-3xl">
            {canal === "presencial" && <ConteudoPresencial />}
            {canal === "coldcall" && <ConteudoColdCall />}
            {canal === "instagram" && <ConteudoInstagram />}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
