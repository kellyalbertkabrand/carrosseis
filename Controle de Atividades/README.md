# 🗂️ Controle de Atividades — Kelly Albert

Sistema simples e interativo para **controlar suas atividades por área** e receber
**lembretes no celular**, sem depender de você abrir o chat. Ele vive em três lugares:

1. **GitHub (este repositório)** — a fonte da verdade das suas tarefas, versionada e
   sempre acessível.
2. **Google Agenda** (`kellyalbertka@gmail.com`) — onde cada tarefa do dia vira um
   evento com alarme nativo no seu celular.
3. **Robô diário (Claude)** — toda manhã uma sessão agendada lê suas tarefas, monta a
   agenda do dia, te notifica e mantém tudo sincronizado.

```
  atividades.json  ──►  Robô diário (09:00)  ──►  Google Agenda  ──►  🔔 celular
   (suas tarefas)         (lê / sincroniza)         (eventos)         (alarme)
```

## Arquivos

| Arquivo | Para quê |
|---|---|
| [`atividades.json`](./atividades.json) | **Fonte oficial.** Áreas + tarefas que o robô lê. |
| [`atividades.md`](./atividades.md) | Espelho legível para você ver/anotar rápido. |
| [`rotina-diaria.md`](./rotina-diaria.md) | Roteiro do robô + texto do trigger agendado. |

## Como usar no dia a dia

- **Adicionar/mudar tarefa:** me diga em linguagem natural ("adiciona na área Vendas:
  responder propostas, terça 10h") que eu atualizo o `atividades.json` e a agenda.
- **Concluir:** "marca como concluída a tarefa X" → eu atualizo o status.
- **Ver o dia:** "me mostra as atividades de hoje".

## Áreas (modelo misto: negócio + vida)

**💼 Negócio:** Conteúdo & Carrosséis · Mentoria · Vendas & Marketing · Financeiro
**🌱 Vida:** Pessoal & Casa · Saúde & Bem-estar

> As áreas são editáveis — é só pedir para criar, renomear ou remover.

## Calendário de destino

As atividades vão para a agenda **"Agenda KA 2023" (`kellyalbertka@gmail.com`)** —
a principal da Kelly. Cada área tem uma cor própria para facilitar a leitura.

## A peça que falta ligar: o lembrete automático diário

O robô só roda sozinho se houver um **trigger agendado** no Claude Code na web
(este ambiente é efêmero e não "acorda" sozinho). Veja o passo a passo em
[`rotina-diaria.md`](./rotina-diaria.md) → seção *"Texto para colar no trigger agendado"*.
