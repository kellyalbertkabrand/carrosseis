import type { Context, Config } from "@netlify/functions";

// Mapas para interpretar o texto falado em português.
const DIAS: Record<string, string> = {
  domingo: "SU", segunda: "MO", "segunda-feira": "MO", terca: "TU", "terça": "TU",
  "terça-feira": "TU", quarta: "WE", "quarta-feira": "WE", quinta: "TH",
  "quinta-feira": "TH", sexta: "FR", "sexta-feira": "FR", sabado: "SA", "sábado": "SA",
};

const AREAS_KEYWORDS: Record<string, string[]> = {
  conteudo: ["roteiro", "roteiros", "video", "vídeo", "vídeos", "videos", "gravar", "gravação", "gravacao", "carrossel", "carrosséis", "carrosseis", "post", "postar", "reels", "conteúdo", "conteudo", "edição", "editar", "métrica", "metrica", "métricas", "metricas"],
  mentoria: ["mentoria", "mentorada", "mentoradas", "encontro", "aula", "turma"],
  vendas: ["venda", "vendas", "comentário", "comentario", "comentários", "comentarios", "dm", "engajamento", "responder", "proposta", "cliente", "lead"],
  financeiro: ["boleto", "pagar", "pagamento", "financeiro", "nota", "imposto", "conta", "fatura"],
  pessoal: ["casa", "pessoal", "mercado", "família", "familia", "compromisso"],
  saude: ["academia", "treino", "médico", "medico", "saúde", "saude", "consulta", "exercício", "exercicio", "caminhada"],
};

function normaliza(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function parsePtTask(transcript: string) {
  const t = normaliza(transcript);

  // Área pela contagem de palavras-chave
  let area = "conteudo";
  let melhor = 0;
  for (const [id, kws] of Object.entries(AREAS_KEYWORDS)) {
    const n = kws.filter((k) => t.includes(normaliza(k))).length;
    if (n > melhor) { melhor = n; area = id; }
  }

  // Dia da semana -> RRULE
  const dias: string[] = [];
  for (const [palavra, code] of Object.entries(DIAS)) {
    if (t.includes(normaliza(palavra)) && !dias.includes(code)) dias.push(code);
  }
  const recorrencia = dias.length ? `RRULE:FREQ=WEEKLY;BYDAY=${dias.join(",")}` : null;

  // Hora: "9h", "09:00", "9 horas", "às 14"
  let hora: string | null = null;
  const mHora = t.match(/(\d{1,2})\s*(?:h|:|horas?)\s*(\d{0,2})/);
  if (mHora) {
    const hh = String(Math.min(23, parseInt(mHora[1], 10))).padStart(2, "0");
    const mm = (mHora[2] ? mHora[2] : "00").padStart(2, "0");
    hora = `${hh}:${mm}`;
  } else if (/manha|manhã/.test(t)) hora = "09:00";
  else if (/tarde/.test(t)) hora = "14:00";
  else if (/noite/.test(t)) hora = "19:00";

  // Prioridade
  let prioridade = "media";
  if (/(urgente|importante|prioridade|priorit)/.test(t)) prioridade = "alta";

  // Título = transcrição limpa, primeira letra maiúscula
  let titulo = transcript.trim().replace(/\s+/g, " ");
  if (titulo.length > 80) titulo = titulo.slice(0, 80).trim() + "…";
  if (titulo) titulo = titulo[0].toUpperCase() + titulo.slice(1);

  return { titulo, area, hora, recorrencia, prioridade };
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  const apiKey = Netlify.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return Response.json(
      {
        error: "sem_chave",
        message: "A transcrição por áudio ainda não está configurada. Configure a variável OPENAI_API_KEY nas configurações do site.",
      },
      { status: 503 },
    );
  }

  try {
    const audioBuffer = await req.arrayBuffer();
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return Response.json({ error: "audio_vazio" }, { status: 400 });
    }
    const contentType = req.headers.get("content-type") || "audio/webm";

    const form = new FormData();
    form.append("file", new Blob([audioBuffer], { type: contentType }), "audio.webm");
    form.append("model", "whisper-1");
    form.append("language", "pt");

    const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return Response.json({ error: "falha_transcricao", detail }, { status: 502 });
    }

    const data: any = await resp.json();
    const transcript = (data.text || "").trim();
    const parsed = parsePtTask(transcript);
    return Response.json({ transcript, parsed });
  } catch (e: any) {
    return Response.json({ error: "erro_interno", detail: String(e?.message || e) }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/transcribe",
};
