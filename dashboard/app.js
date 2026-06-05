"use strict";

const API = "/api/data";
const TRANSCRIBE = "/api/transcribe";

const DIAS = [
  { code: "MO", label: "Seg" }, { code: "TU", label: "Ter" }, { code: "WE", label: "Qua" },
  { code: "TH", label: "Qui" }, { code: "FR", label: "Sex" }, { code: "SA", label: "Sáb" },
  { code: "SU", label: "Dom" },
];
const PRIO = { alta: "🔴", media: "🟡", baixa: "🟢" };

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

const SECOES = [
  { tipo: "negocio", titulo: "💼 Profissional" },
  { tipo: "vida", titulo: "🌱 Pessoal" },
];

function areaById(id) {
  return DOC.areas.find((a) => a.id === id) || { nome: "—", colorId: "0" };
}

// Calcula a próxima data/hora relevante da tarefa, para ordenar por data.
function sortKey(t) {
  const [hh, mm] = (t.hora || "23:59").split(":").map(Number);
  if (t.data) {
    const d = new Date(t.data + "T00:00:00");
    d.setHours(hh, mm, 0, 0);
    return d.getTime();
  }
  if (t.recorrencia) {
    const m = t.recorrencia.match(/BYDAY=([A-Z,]+)/);
    const map = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
    const days = (m ? m[1].split(",") : []).map((c) => map[c]).filter((x) => x != null);
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      d.setHours(hh, mm, 0, 0);
      if (days.includes(d.getDay()) && d.getTime() >= now.getTime() - 3600000) return d.getTime();
    }
  }
  // sem data definida: vai para o fim, mas ainda ordenada por horário
  return Number.MAX_SAFE_INTEGER - (1440 - (hh * 60 + mm));
}

function sortTarefas(arr) {
  return arr.slice().sort((a, b) => {
    // concluídas descem
    if ((a.status === "concluida") !== (b.status === "concluida")) {
      return a.status === "concluida" ? 1 : -1;
    }
    return sortKey(a) - sortKey(b);
  });
}

function renderBoard() {
  const board = el("board");
  board.innerHTML = "";
  for (const secao of SECOES) {
    const areaIds = DOC.areas.filter((a) => a.tipo === secao.tipo).map((a) => a.id);
    const tarefas = sortTarefas(DOC.tarefas.filter((t) => areaIds.includes(t.area)));

    const group = document.createElement("div");
    group.className = "area-group";
    group.innerHTML = `
      <div class="secao-head">
        <span class="secao-title">${secao.titulo}</span>
        <span class="area-count">${tarefas.length}</span>
      </div>`;

    if (tarefas.length === 0) {
      const e = document.createElement("div");
      e.className = "empty";
      e.textContent = "Sem atividades.";
      group.appendChild(e);
    }

    for (const t of tarefas) {
      const area = areaById(t.area);
      const card = document.createElement("div");
      card.className = "task" + (t.status === "concluida" ? " concluida" : "");
      const meta = metaTexto(t).map((p) => `<span class="tag">${escapeHtml(p)}</span>`).join("");
      card.innerHTML = `
        <div class="check ${t.status === "concluida" ? "on" : ""}" data-toggle="${t.id}"></div>
        <div class="task-body">
          <div class="task-title">${PRIO[t.prioridade] || ""} ${escapeHtml(t.titulo)}</div>
          <div class="task-meta">
            <span class="tag area-tag"><span class="area-dot sm" style="background:${corArea(area.colorId)}"></span>${escapeHtml(area.nome)}</span>
            ${meta}${t.sugestao ? '<span class="tag sug">sugestão</span>' : ""}
          </div>
        </div>
        <div class="task-actions">
          <button class="icon-btn" data-edit="${t.id}" title="Editar">✏️</button>
          <button class="icon-btn" data-del="${t.id}" title="Excluir">🗑️</button>
        </div>`;
      group.appendChild(card);
    }
    board.appendChild(group);
  }

  board.querySelectorAll("[data-toggle]").forEach((n) =>
    n.addEventListener("click", () => toggle(n.getAttribute("data-toggle"))));
  board.querySelectorAll("[data-edit]").forEach((n) =>
    n.addEventListener("click", () => openModal(n.getAttribute("data-edit"))));
  board.querySelectorAll("[data-del]").forEach((n) =>
    n.addEventListener("click", () => remove(n.getAttribute("data-del"))));
}

function corArea(colorId) {
  const map = { "1": "#7986cb", "2": "#33b679", "5": "#f6c026", "6": "#f5511d",
    "7": "#039be5", "9": "#3f51b5", "10": "#0b8043", "11": "#d60000" };
  return map[colorId] || "#b08968";
}

function toggle(id) {
  const t = DOC.tarefas.find((x) => x.id === id);
  if (!t) return;
  t.status = t.status === "concluida" ? "pendente" : "concluida";
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

/* ---------- Áudio ---------- */
let mediaRecorder = null;
let chunks = [];

async function toggleMic() {
  const btn = el("btn-mic");
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    return;
  }
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    showMic("Seu navegador não suporta gravação de áudio.");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data); };
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      btn.classList.remove("gravando");
      btn.textContent = "🎤 Falar";
      await enviarAudio(new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" }));
    };
    mediaRecorder.start();
    btn.classList.add("gravando");
    btn.textContent = "⏹ Parar";
    showMic("Gravando… fale a atividade e toque em Parar. Ex.: “gravar vídeo do carrossel quinta de manhã”.");
  } catch (err) {
    showMic("Não consegui acessar o microfone. Verifique a permissão.");
  }
}

async function enviarAudio(blob) {
  showMic("Transcrevendo o áudio…");
  try {
    const r = await fetch(TRANSCRIBE, {
      method: "POST",
      headers: { "content-type": blob.type || "audio/webm" },
      body: blob,
    });
    const data = await r.json();
    if (!r.ok) {
      showMic(data.message || "Não foi possível transcrever o áudio agora.");
      return;
    }
    hideMic();
    const p = data.parsed || {};
    openModal(null, {
      titulo: p.titulo || data.transcript,
      area: p.area,
      hora: p.hora,
      recorrencia: p.recorrencia,
      prioridade: p.prioridade,
    });
  } catch (e) {
    showMic("Erro ao enviar o áudio.");
  }
}

function showMic(msg) { const f = el("mic-feedback"); f.textContent = msg; f.classList.remove("hidden"); }
function hideMic() { el("mic-feedback").classList.add("hidden"); }

/* ---------- util ---------- */
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- init ---------- */
el("btn-add").addEventListener("click", () => openModal(null));
el("btn-mic").addEventListener("click", toggleMic);
el("btn-cancel").addEventListener("click", closeModal);
el("form").addEventListener("submit", onSubmit);
el("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
buildDias();
load();
