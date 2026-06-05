import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const STORE = "atividades";
const KEY = "doc";

// Documento inicial (semente). Só é usado se ainda não houver dados salvos na nuvem.
const SEED = {
  config: {
    timezone: "America/Sao_Paulo",
    calendarId: "kellyalbertka@gmail.com",
    calendarName: "Agenda KA 2023 (Kelly Albert)",
    horario_resumo_diario: "09:00",
    lembrete_padrao_min: 30,
  },
  areas: [
    { id: "conteudo", nome: "Conteúdo & Carrosséis", tipo: "negocio", colorId: "7" },
    { id: "mentoria", nome: "Mentoria", tipo: "negocio", colorId: "10" },
    { id: "vendas", nome: "Vendas & Marketing", tipo: "negocio", colorId: "6" },
    { id: "financeiro", nome: "Financeiro", tipo: "negocio", colorId: "5" },
    { id: "pessoal", nome: "Pessoal & Casa", tipo: "vida", colorId: "2" },
    { id: "saude", nome: "Saúde & Bem-estar", tipo: "vida", colorId: "9" },
  ],
  tarefas: [
    { id: "t-0001", area: "conteudo", titulo: "Criar roteiros", descricao: "Roteirizar os conteúdos da semana (carrosséis / vídeos).", data: null, hora: "09:00", duracao_min: 90, recorrencia: "RRULE:FREQ=WEEKLY;BYDAY=TH,FR", prioridade: "alta", status: "pendente", lembrete_min: 30, sugestao: false, calendar_event_id: "j0qs4g81subv74dirr5en5uhro" },
    { id: "t-0002", area: "conteudo", titulo: "Gravar vídeos", descricao: "Bloco de gravação dos vídeos da semana.", data: null, hora: "10:00", duracao_min: 120, recorrencia: "RRULE:FREQ=WEEKLY;BYDAY=MO", prioridade: "alta", status: "pendente", lembrete_min: 30, sugestao: false, calendar_event_id: "jufof0pedlth81hr2i9ru5l1bk" },
    { id: "t-0003", area: "conteudo", titulo: "Planejar conteúdo da semana", descricao: "Definir temas/pautas antes de gravar.", data: null, hora: "08:30", duracao_min: 30, recorrencia: "RRULE:FREQ=WEEKLY;BYDAY=MO", prioridade: "media", status: "pendente", lembrete_min: 15, sugestao: true, calendar_event_id: null },
    { id: "t-0004", area: "conteudo", titulo: "Editar e postar vídeos", descricao: "Edição e publicação do que foi gravado.", data: null, hora: "10:00", duracao_min: 90, recorrencia: "RRULE:FREQ=WEEKLY;BYDAY=TU", prioridade: "media", status: "pendente", lembrete_min: 30, sugestao: true, calendar_event_id: null },
    { id: "t-0005", area: "vendas", titulo: "Engajamento e responder comentários", descricao: "Responder DMs/comentários e interagir com a audiência.", data: null, hora: "17:00", duracao_min: 30, recorrencia: "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", prioridade: "media", status: "pendente", lembrete_min: 10, sugestao: true, calendar_event_id: null },
    { id: "t-0006", area: "conteudo", titulo: "Revisar métricas da semana", descricao: "Olhar o que performou melhor para ajustar a próxima semana.", data: null, hora: "16:00", duracao_min: 30, recorrencia: "RRULE:FREQ=WEEKLY;BYDAY=FR", prioridade: "baixa", status: "pendente", lembrete_min: 15, sugestao: true, calendar_event_id: null },
  ],
};

export default async (req: Request, _context: Context) => {
  const store = getStore({ name: STORE, consistency: "strong" });

  if (req.method === "GET") {
    let doc = await store.get(KEY, { type: "json" });
    if (!doc) {
      doc = SEED;
      await store.setJSON(KEY, doc);
    }
    return Response.json(doc);
  }

  if (req.method === "POST" || req.method === "PUT") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "json_invalido" }, { status: 400 });
    }
    if (!body || !Array.isArray(body.tarefas) || !Array.isArray(body.areas)) {
      return Response.json({ error: "formato_invalido" }, { status: 400 });
    }
    await store.setJSON(KEY, body);
    return Response.json({ ok: true });
  }

  return new Response("Método não permitido", { status: 405 });
};

export const config: Config = {
  path: "/api/data",
};
