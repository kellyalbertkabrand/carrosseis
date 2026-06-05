# 🤖 Rotina Diária — instruções para o robô (sessão agendada)

Este arquivo é o **roteiro** que eu (Claude) sigo toda manhã quando uma sessão
agendada me dispara. É também o texto que você cola no campo de instruções ao
**criar o trigger agendado** no Claude Code na web.

---

## Quando rodar
Todo dia às **09:00** (fuso `America/Sao_Paulo`).

## O que fazer (passo a passo)

1. **Ler as tarefas do dashboard** (fonte da verdade na nuvem):
   `GET https://kelly-atividades.netlify.app/api/data` → devolve `{ config, areas, tarefas }`.
   *(Enquanto o site não estiver publicado, ler `Controle de Atividades/atividades.json`.)*
2. **Selecionar as tarefas de HOJE**:
   - tarefas com `data` igual à data de hoje, **ou**
   - tarefas com `recorrencia` cujo RRULE cai hoje, **ou**
   - tarefas `pendente`/`em_andamento` atrasadas (data anterior a hoje e ainda não concluídas).
3. **Sincronizar com a Google Agenda** (`calendarId: kellyalbertka@gmail.com`):
   - Para cada tarefa de hoje **sem** `calendar_event_id`, criar evento com:
     - `summary`: `[Área] Título`
     - `startTime`/`endTime`: a partir de `hora` + `duracao_min` (se `hora` for `null`, criar `allDay`)
     - `colorId`: a cor da área
     - `overrideReminders`: popup `lembrete_min` minutos antes
     - `timeZone`: `America/Sao_Paulo`
   - Gravar o `id` do evento de volta no campo `calendar_event_id` da tarefa.
   - Para tarefas já concluídas que ainda têm evento, remover/ignorar.
   - **Salvar de volta** o documento atualizado no dashboard:
     `POST https://kelly-atividades.netlify.app/api/data` com o JSON completo no corpo.
4. **Montar o resumo do dia** agrupado por área, ordenado por horário, destacando
   prioridades 🔴 e tarefas atrasadas.
5. **Notificar** a Kelly:
   - A própria Google Agenda já dispara os alarmes no celular (canal principal).
   - Enviar também uma notificação push com o resumo do dia.
6. Confirmar que o dashboard recebeu o `POST` (passo 3) com os `calendar_event_id` preenchidos.

## Regras
- Nunca duplicar eventos: se a tarefa já tem `calendar_event_id`, não recriar.
- Não apagar eventos que a Kelly criou manualmente na agenda.
- Tarefas marcadas `[EXEMPLO]` podem ser ignoradas/limpas quando ela mandar as reais.
- Sempre confirmar o fuso `America/Sao_Paulo`.

---

## Texto para colar no trigger agendado (web)

> Leia `Controle de Atividades/rotina-diaria.md` e execute a rotina diária:
> busque as atividades em `https://kelly-atividades.netlify.app/api/data`, selecione as
> de hoje, sincronize-as como eventos na Google Agenda (`kellyalbertka@gmail.com`) com
> lembrete, salve o documento atualizado de volta via `POST` na mesma URL, e me mande
> o resumo do dia por push.
