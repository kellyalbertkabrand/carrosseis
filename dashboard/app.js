"use strict";

const API = "/api/data";

const DIAS = [
  { code: "MO", label: "Seg" }, { code: "TU", label: "Ter" }, { code: "WE", label: "Qua" },
  { code: "TH", label: "Qui" }, { code: "FR", label: "Sex" }, { code: "SA", label: "Sáb" },
  { code: "SU", label: "Dom" },
];
const PRIO = { alta: "🔴", media: "🟡", baixa: "🟢" };

// Mapas para interpretar texto em português (usado no "Colar em bloco")
const DIAS_MAP = {
  domingo: "SU", segunda: "MO", "segunda-feira": "MO", terca: "TU", "terça": "TU",
  "terça-feira": "TU", quarta: "WE", "quarta-feira": "WE", quinta: "TH", "quinta-feira": "TH",
  sexta: "FR", "sexta-feira": "FR", sabado: "SA", "sábado": "SA",
};
const AREAS_KW = {
  conteudo: ["roteiro", "roteiros", "video", "vídeo", "vídeos", "videos", "gravar", "gravação", "gravacao", "carrossel", "carrosséis", "carrosseis", "post", "postar", "reels", "conteúdo", "conteudo", "edição", "editar", "métrica", "metrica", "métricas", "metricas", "legenda"],
  mentoria: ["mentoria", "mentorada", "mentoradas", "encontro", "aula", "turma", "call"],
  vendas: ["venda", "vendas", "comentário", "comentario", "comentários", "comentarios", "dm", "engajamento", "responder", "proposta", "cliente", "lead", "prospect"],
  financeiro: ["boleto", "pagar", "pagamento", "financeiro", "nota", "imposto", "conta", "fatura", "cobrança", "receber"],
  pessoal: ["casa", "pessoal", "mercado", "família", "familia", "compromisso", "aniversário", "aniversario"],
  saude: ["academia", "treino", "médico", "medico", "saúde", "saude", "consulta", "exercício", "exercicio", "caminhada", "terapia", "dentista"],
};

function norm(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function isoData(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function semHora(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

// Interpreta uma linha de texto livre e devolve os campos de uma tarefa.
function parseLinhaPt(linha) {
  const original = linha.trim();
  const t = norm(original);

  let area = DOC.areas[0].id, best = 0;
  for (const [id, kws] of Object.entries(AREAS_KW)) {
    if (!DOC.areas.find((a) => a.id === id)) continue;
    const n = kws.filter((k) => t.includes(norm(k))).length;
    if (n > best) { best = n; area = id; }
  }

  const dias = [];
  for (const [p, code] of Object.entries(DIAS_MAP)) {
    if (t.includes(norm(p)) && !dias.includes(code)) dias.push(code);
  }
  let recorrencia = dias.length ? `RRULE:FREQ=WEEKLY;BYDAY=${dias.join(",")}` : null;
  if (/todo dia|todos os dias|diariamente/.test(t)) recorrencia = "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU";

  let data = null;
  const now = new Date();
  if (/amanha/.test(t)) { const d = new Date(now); d.setDate(now.getDate() + 1); data = isoData(d); }
  else if (/hoje/.test(t)) { data = isoData(now); }
  else {
    const md = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    const dd = t.match(/\bdia\s+(\d{1,2})\b/);
    if (md) {
      const day = +md[1], mon = +md[2] - 1;
      let y = md[3] ? (+md[3] < 100 ? 2000 + +md[3] : +md[3]) : now.getFullYear();
      let d = new Date(y, mon, day);
      if (!md[3] && d < semHora(now)) d = new Date(y + 1, mon, day);
      data = isoData(d);
    } else if (dd) {
      const day = +dd[1];
      let d = new Date(now.getFullYear(), now.getMonth(), day);
      if (d < semHora(now)) d = new Date(now.getFullYear(), now.getMonth() + 1, day);
      data = isoData(d);
    }
  }
  if (recorrencia) data = null;

  let hora = null;
  const mh = t.match(/(\d{1,2})\s*(?:h|:|horas?)\s*(\d{0,2})/);
  if (mh) hora = String(Math.min(23, +mh[1])).padStart(2, "0") + ":" + ((mh[2] || "00").padStart(2, "0"));
  else if (/manha|manhã/.test(t)) hora = "09:00";
  else if (/tarde/.test(t)) hora = "14:00";
  else if (/noite/.test(t)) hora = "19:00";

  let prioridade = "media";
  if (/urgente|importante|priorit/.test(t)) prioridade = "alta";

  let titulo = original.replace(/\s+/g, " ").trim();
  if (titulo) titulo = titulo[0].toUpperCase() + titulo.slice(1);

  return { titulo, area, hora, data, recorrencia, prioridade, duracao_min: 60, lembrete_min: 30 };
}

let DOC = null;
let editId = null;

const $ = (s) => document.querySelector(s);
const el = (s) => document.getElementById(s);

function setStatus(msg, timeout) {
  el("status").textContent = msg || "";
  if (timeout) setTimeout(() => { el("status").textContent = ""; }, timeout);
}

async function load() {
  setStatus("Carregando…");
  const r = await fetch(API);
  DOC = await r.json();
  setStatus("");
  renderHoje();
  renderBoard();
}

async function save() {
  setStatus("Salvando…");
  const r = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(DOC),
  });
  if (r.ok) setStatus("Salvo ✓", 1800);
  else setStatus("Erro ao salvar", 3000);
}

function renderHoje() {
  const d = new Date();
  const opt = { weekday: "long", day: "2-digit", month: "long" };
  el("hoje").textContent = d.toLocaleDateString("pt-BR", opt);
}

function diasLegiveis(rrule) {
  if (!rrule) return null;
  const m = rrule.match(/BYDAY=([A-Z,]+)/);
  if (!m) return null;
  const set = m[1].split(",");
  return DIAS.filter((d) => set.includes(d.code)).map((d) => d.label).join("/");
}

function metaTexto(t) {
  const parts = [];
  const rec = diasLegiveis(t.recorrencia);
  if (rec) parts.push("🔁 " + rec);
  else if (t.data) parts.push("📅 " + t.data.split("-").reverse().join("/"));
  if (t.hora) parts.push("🕒 " + t.hora + (t.duracao_min ? ` (${t.duracao_min}min)` : ""));
  return parts;
}

let view = "afazer"; // "afazer" | "concluidas"

const DIAS_NUM = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function areaById(id) {
  return DOC.areas.find((a) => a.id === id) || { nome: "—", colorId: "0" };
}

function ymd(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// Próxima data (Date) em que a tarefa acontece; null se não tem data nem recorrência.
function proximaData(t) {
  const [hh, mm] = (t.hora || "00:00").split(":").map(Number);
  if (t.data) { const d = new Date(t.data + "T00:00:00"); d.setHours(hh, mm, 0, 0); return d; }
  if (t.recorrencia) {
    const m = t.recorrencia.match(/BYDAY=([A-Z,]+)/);
    const days = (m ? m[1].split(",") : []).map((c) => DIAS_NUM[c]).filter((x) => x != null);
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now); d.setDate(now.getDate() + i); d.setHours(hh, mm, 0, 0);
      if (days.includes(d.getDay()) && d.getTime() >= now.getTime() - 3600000) return d;
    }
  }
  return null;
}

function rotuloDia(chave) {
  if (chave === "sem-data") return "Sem data definida";
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(chave + "T00:00:00");
  const diff = Math.round((d - hoje) / 86400000);
  const curto = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  if (diff === 0) return `Hoje · ${curto}`;
  if (diff === 1) return `Amanhã · ${curto}`;
  const s = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderTabs() {
  const nConc = DOC.tarefas.filter((t) => t.status === "concluida").length;
  el("tabs").innerHTML =
    `<button class="tab ${view === "afazer" ? "on" : ""}" data-view="afazer">A fazer</button>` +
    `<button class="tab ${view === "concluidas" ? "on" : ""}" data-view="concluidas">✓ Concluídas (${nConc})</button>`;
  el("tabs").querySelectorAll("[data-view]").forEach((n) =>
    n.addEventListener("click", () => { view = n.getAttribute("data-view"); renderBoard(); }));
}

function linhaTarefa(t, feita) {
  const area = areaById(t.area);
  const rec = t.recorrencia ? "🔁" : "";
  const sub = [t.hora || "", rec].filter(Boolean).join(" · ");
  return `<div class="item ${feita ? "feito" : ""}" data-id="${t.id}">
    <div class="item-check ${feita ? "on" : ""}" data-toggle="${t.id}"></div>
    <div class="item-dot" style="background:${corArea(area.colorId)}"></div>
    <div class="item-body">
      <div class="item-tit">${escapeHtml(t.titulo)}</div>
      ${sub ? `<div class="item-sub">${escapeHtml(sub)}</div>` : ""}
    </div>
    <button class="icon-btn" data-edit="${t.id}" title="Editar">✏️</button>
    <button class="icon-btn" data-del="${t.id}" title="Excluir">🗑️</button>
    ${feita ? "" : `<div class="grip" title="Segure e arraste para mover">⠿</div>`}
  </div>`;
}

function ligarEventos(board) {
  board.querySelectorAll("[data-toggle]").forEach((n) =>
    n.addEventListener("click", () => toggle(n.getAttribute("data-toggle"))));
  board.querySelectorAll("[data-edit]").forEach((n) =>
    n.addEventListener("click", () => openModal(n.getAttribute("data-edit"))));
  board.querySelectorAll("[data-del]").forEach((n) =>
    n.addEventListener("click", () => remove(n.getAttribute("data-del"))));
}

// Ordenação dos itens dentro de um grupo (mesmo dia)
function ordenarItens(a, b) {
  const ao = a.ordem, bo = b.ordem;
  if (ao != null && bo != null) return ao - bo;
  if (ao != null) return -1;
  if (bo != null) return 1;
  return (a.hora || "99:99").localeCompare(b.hora || "99:99");
}

// Arrastar para reordenar: segura a atividade (toque longo) e arrasta.
// Padrão robusto no iPhone — trava a rolagem só depois do "pega" pra não confundir com scroll.
function enableDragSort(grupoEl) {
  let dragItem = null, dragging = false, longPress = null, startY = 0, lastY = 0;

  const reordenar = (y) => {
    const outros = [...grupoEl.querySelectorAll(".item:not(.dragging)")];
    let alvo = null;
    for (const s of outros) {
      const r = s.getBoundingClientRect();
      if (y < r.top + r.height / 2) { alvo = s; break; }
    }
    if (alvo) grupoEl.insertBefore(dragItem, alvo);
    else grupoEl.appendChild(dragItem);
  };

  const cancelLongPress = () => { if (longPress) { clearTimeout(longPress); longPress = null; } };

  const finalizar = () => {
    cancelLongPress();
    if (dragging && dragItem) {
      dragItem.classList.remove("dragging");
      commitOrder(grupoEl);
    }
    dragging = false; dragItem = null;
  };

  grupoEl.querySelectorAll(".item").forEach((item) => {
    item.addEventListener("touchstart", (e) => {
      // deixa os botões (concluir/editar/excluir) funcionarem normalmente
      if (e.target.closest("button") || e.target.closest(".item-check")) return;
      const ty = e.touches[0].clientY;
      startY = ty; lastY = ty;
      longPress = setTimeout(() => {
        longPress = null;
        dragging = true; dragItem = item;
        item.classList.add("dragging");
        if (navigator.vibrate) navigator.vibrate(12); // feedbackzinho de "pegou"
      }, 220);
    }, { passive: true });

    item.addEventListener("touchmove", (e) => {
      const y = e.touches[0].clientY; lastY = y;
      if (!dragging) {
        // mexeu antes de "pegar" => é rolagem, cancela o toque longo
        if (Math.abs(y - startY) > 8) cancelLongPress();
        return;
      }
      e.preventDefault(); // já pegou: trava a rolagem enquanto arrasta
      reordenar(y);
    }, { passive: false });

    item.addEventListener("touchend", finalizar);
    item.addEventListener("touchcancel", finalizar);
  });
}

function commitOrder(grupoEl) {
  const ids = [...grupoEl.querySelectorAll(".item")].map((el) => el.dataset.id);
  ids.forEach((id, i) => { const t = DOC.tarefas.find((x) => x.id === id); if (t) t.ordem = i; });
  save();
}

function renderBoard() {
  renderTabs();
  const board = el("board");
  board.innerHTML = "";

  if (view === "concluidas") {
    const feitas = DOC.tarefas
      .filter((t) => t.status === "concluida")
      .sort((a, b) => String(b.concluida_em || "").localeCompare(String(a.concluida_em || "")));
    if (!feitas.length) { board.innerHTML = '<div class="empty">Nada concluído ainda.</div>'; return; }
    board.innerHTML = `<div class="grupo">${feitas.map((t) => linhaTarefa(t, true)).join("")}</div>`;
    ligarEventos(board);
    return;
  }

  // A fazer: agrupar por dia
  const pendentes = DOC.tarefas.filter((t) => t.status !== "concluida");
  const grupos = {};
  for (const t of pendentes) {
    const d = proximaData(t);
    const chave = d ? ymd(d) : "sem-data";
    (grupos[chave] = grupos[chave] || []).push(t);
  }
  const chaves = Object.keys(grupos).sort((a, b) => {
    if (a === "sem-data") return 1;
    if (b === "sem-data") return -1;
    return a.localeCompare(b);
  });

  if (!chaves.length) { board.innerHTML = '<div class="empty">Tudo em dia! 🎉</div>'; return; }

  for (const chave of chaves) {
    const itens = grupos[chave].sort(ordenarItens);
    const grupo = document.createElement("div");
    grupo.className = "grupo";
    grupo.innerHTML = `<div class="dia-head">${rotuloDia(chave)}</div>` + itens.map((t) => linhaTarefa(t, false)).join("");
    board.appendChild(grupo);
  }
  ligarEventos(board);
  board.querySelectorAll(".grupo").forEach(enableDragSort);
}

function corArea(colorId) {
  const map = { "1": "#7986cb", "2": "#33b679", "5": "#f6c026", "6": "#f5511d",
    "7": "#039be5", "9": "#3f51b5", "10": "#0b8043", "11": "#d60000" };
  return map[colorId] || "#b08968";
}

function toggle(id) {
  const t = DOC.tarefas.find((x) => x.id === id);
  if (!t) return;
  if (t.status === "concluida") { t.status = "pendente"; t.concluida_em = null; }
  else { t.status = "concluida"; t.concluida_em = new Date().toISOString(); }
  renderBoard();
  save();
}

function remove(id) {
  const t = DOC.tarefas.find((x) => x.id === id);
  if (!t) return;
  if (!confirm(`Excluir "${t.titulo}"?`)) return;
  DOC.tarefas = DOC.tarefas.filter((x) => x.id !== id);
  renderBoard();
  save();
}

/* ---------- Modal ---------- */
function buildAreaSelect() {
  const sel = el("f-area");
  sel.innerHTML = DOC.areas.map((a) => `<option value="${a.id}">${escapeHtml(a.nome)}</option>`).join("");
}
function buildDias() {
  const wrap = el("f-dias");
  wrap.innerHTML = "";
  for (const d of DIAS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dia-btn";
    b.textContent = d.label;
    b.dataset.code = d.code;
    b.addEventListener("click", () => b.classList.toggle("on"));
    wrap.appendChild(b);
  }
}
function setDias(rrule) {
  const m = rrule ? rrule.match(/BYDAY=([A-Z,]+)/) : null;
  const set = m ? m[1].split(",") : [];
  el("f-dias").querySelectorAll(".dia-btn").forEach((b) =>
    b.classList.toggle("on", set.includes(b.dataset.code)));
}
function getDiasRRule() {
  const on = [...el("f-dias").querySelectorAll(".dia-btn.on")].map((b) => b.dataset.code);
  return on.length ? `RRULE:FREQ=WEEKLY;BYDAY=${on.join(",")}` : null;
}

function openModal(id, prefill) {
  editId = id || null;
  el("modal-title").textContent = id ? "Editar atividade" : "Nova atividade";
  buildAreaSelect();
  const t = id ? DOC.tarefas.find((x) => x.id === id) : null;
  const base = t || prefill || {};
  el("f-id").value = id || "";
  el("f-titulo").value = base.titulo || "";
  el("f-area").value = base.area || DOC.areas[0].id;
  el("f-hora").value = base.hora || "";
  el("f-duracao").value = base.duracao_min != null ? base.duracao_min : 60;
  el("f-data").value = base.data || "";
  el("f-prioridade").value = base.prioridade || "media";
  el("f-lembrete").value = base.lembrete_min != null ? base.lembrete_min : 30;
  setDias(base.recorrencia);
  el("modal").classList.remove("hidden");
}
function closeModal() { el("modal").classList.add("hidden"); editId = null; }

function nextId() {
  let max = 0;
  for (const t of DOC.tarefas) {
    const n = parseInt(String(t.id).replace(/\D/g, ""), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return "t-" + String(max + 1).padStart(4, "0");
}

function onSubmit(e) {
  e.preventDefault();
  const rec = getDiasRRule();
  const dados = {
    titulo: el("f-titulo").value.trim(),
    area: el("f-area").value,
    hora: el("f-hora").value || null,
    duracao_min: parseInt(el("f-duracao").value, 10) || 0,
    data: rec ? null : (el("f-data").value || null),
    recorrencia: rec,
    prioridade: el("f-prioridade").value,
    lembrete_min: parseInt(el("f-lembrete").value, 10) || 0,
  };
  if (!dados.titulo) return;

  if (editId) {
    const t = DOC.tarefas.find((x) => x.id === editId);
    Object.assign(t, dados);
    t.sugestao = false;
  } else {
    DOC.tarefas.push({
      id: nextId(),
      ...dados,
      descricao: "",
      status: "pendente",
      sugestao: false,
      calendar_event_id: null,
    });
  }
  closeModal();
  renderBoard();
  save();
}

/* ---------- util ---------- */
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Colar em bloco ---------- */
let blocoParsed = [];

function openBloco() {
  el("bloco-texto").value = "";
  el("bloco-preview").classList.add("hidden");
  el("bloco-confirm-actions").classList.add("hidden");
  el("modal-bloco").classList.remove("hidden");
}
function closeBloco() { el("modal-bloco").classList.add("hidden"); blocoParsed = []; }

function processarBloco() {
  const linhas = el("bloco-texto").value.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!linhas.length) return;
  blocoParsed = linhas.map(parseLinhaPt);
  renderBlocoPreview();
}

function renderBlocoPreview() {
  const wrap = el("bloco-preview");
  wrap.classList.remove("hidden");
  el("bloco-confirm-actions").classList.remove("hidden");
  if (!blocoParsed.length) { wrap.innerHTML = '<div class="empty">Nada para adicionar.</div>'; return; }
  wrap.innerHTML =
    `<div class="prev-titulo">Confira antes de adicionar (${blocoParsed.length}):</div>` +
    blocoParsed.map((t, i) => {
      const a = areaById(t.area);
      const meta = metaTexto(t).join(" · ");
      return `<div class="prev-item">
        <span class="area-dot sm" style="background:${corArea(a.colorId)};margin-top:4px"></span>
        <div class="prev-body">
          <div class="prev-tit">${PRIO[t.prioridade] || ""} ${escapeHtml(t.titulo)}</div>
          <div class="prev-meta">${escapeHtml(a.nome)}${meta ? " · " + escapeHtml(meta) : ""}</div>
        </div>
        <button class="icon-btn" data-rm="${i}" title="Remover">✕</button>
      </div>`;
    }).join("");
  wrap.querySelectorAll("[data-rm]").forEach((n) =>
    n.addEventListener("click", () => { blocoParsed.splice(+n.getAttribute("data-rm"), 1); renderBlocoPreview(); }));
}

function adicionarBloco() {
  for (const t of blocoParsed) {
    DOC.tarefas.push({
      id: nextId(), titulo: t.titulo, area: t.area, descricao: "",
      data: t.data, hora: t.hora, duracao_min: t.duracao_min, recorrencia: t.recorrencia,
      prioridade: t.prioridade, status: "pendente", lembrete_min: t.lembrete_min,
      sugestao: false, calendar_event_id: null,
    });
  }
  closeBloco();
  renderBoard();
  save();
}

/* ---------- init ---------- */
el("btn-add").addEventListener("click", () => openModal(null));
el("btn-bloco").addEventListener("click", openBloco);
el("bloco-cancel").addEventListener("click", closeBloco);
el("bloco-processar").addEventListener("click", processarBloco);
el("bloco-voltar").addEventListener("click", () => {
  el("bloco-preview").classList.add("hidden");
  el("bloco-confirm-actions").classList.add("hidden");
});
el("bloco-add").addEventListener("click", adicionarBloco);
el("modal-bloco").addEventListener("click", (e) => { if (e.target.id === "modal-bloco") closeBloco(); });
el("btn-cancel").addEventListener("click", closeModal);
el("form").addEventListener("submit", onSubmit);
el("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
buildDias();
load();
