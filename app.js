import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const els = {
  form: document.getElementById("roomForm"),
  room: document.getElementById("room"),
  present: document.getElementById("present"),
  absent: document.getElementById("absent"),
  tbody: document.getElementById("roomsBody"),
  totalPresent: document.getElementById("totalPresent"),
  totalAbsent: document.getElementById("totalAbsent"),
  totalAll: document.getElementById("totalAll"),
  exportBtn: document.getElementById("btnExport"),
  clearBtn: document.getElementById("btnClear"),
  search: document.getElementById("search"),
  editDialog: document.getElementById("editDialog"),
  editForm: document.getElementById("editForm"),
  editId: document.getElementById("editId"),
  editRoom: document.getElementById("editRoom"),
  editPresent: document.getElementById("editPresent"),
  editAbsent: document.getElementById("editAbsent"),
};

const STORAGE_KEY = "rooms-attendance-v1";

let state = load() || [];

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }

function uid() { return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()); }

function sanitizeInt(v) {
  const n = parseInt(String(v).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function render(filter = "") {
  const frag = document.createDocumentFragment();
  const q = filter.trim().toLowerCase();
  const rows = (q ? state.filter(r => r.room.toLowerCase().includes(q)) : state);

  let sumP = 0, sumA = 0;

  rows.forEach(r => {
    const tr = document.createElement("tr");
    const total = r.present + r.absent;
    sumP += r.present; sumA += r.absent;

    tr.innerHTML = `
      <td>${r.room}</td>
      <td>${r.present}</td>
      <td>${r.absent}</td>
      <td>${total}</td>
      <td>
        <div class="row-actions">
          <button class="action edit" data-id="${r.id}" aria-label="Editar ${r.room}">Editar</button>
          <button class="action del" data-id="${r.id}" aria-label="Remover ${r.room}">Remover</button>
        </div>
      </td>
    `;
    frag.appendChild(tr);
  });

  els.tbody.innerHTML = "";
  els.tbody.appendChild(frag);

  // Totais globais sempre sobre todos os registros, não apenas filtrados
  const totals = state.reduce((acc, r) => {
    acc.p += r.present; acc.a += r.absent; return acc;
  }, { p: 0, a: 0 });

  els.totalPresent.textContent = totals.p;
  els.totalAbsent.textContent = totals.a;
  els.totalAll.textContent = totals.p + totals.a;
}

function addRoom(e) {
  e.preventDefault();
  const room = els.room.value.trim();
  const present = sanitizeInt(els.present.value);
  const absent = sanitizeInt(els.absent.value);
  if (!room) return;

  state.push({ id: uid(), room, present, absent });
  save();
  els.form.reset();
  els.present.value = 0; els.absent.value = 0;
  render(els.search.value);
}

function onTableClick(e) {
  const btn = e.target.closest("button.action");
  if (!btn) return;
  const id = btn.dataset.id;
  const rec = state.find(r => r.id === id);
  if (!rec) return;

  if (btn.classList.contains("edit")) {
    openEdit(rec);
  } else if (btn.classList.contains("del")) {
    if (confirm(`Remover a sala "${rec.room}"?`)) {
      state = state.filter(r => r.id !== id);
      save();
      render(els.search.value);
    }
  }
}

function openEdit(rec) {
  els.editId.value = rec.id;
  els.editRoom.value = rec.room;
  els.editPresent.value = rec.present;
  els.editAbsent.value = rec.absent;
  els.editDialog.showModal();
}

function submitEdit(e) {
  e.preventDefault();
  const id = els.editId.value;
  const room = els.editRoom.value.trim();
  const present = sanitizeInt(els.editPresent.value);
  const absent = sanitizeInt(els.editAbsent.value);
  if (!room) { els.editDialog.close(); return; }

  const idx = state.findIndex(r => r.id === id);
  if (idx >= 0) {
    state[idx] = { ...state[idx], room, present, absent };
    save();
    render(els.search.value);
  }
  els.editDialog.close();
}

function clearAll() {
  if (!state.length) return;
  if (confirm("Tem certeza que deseja remover todos os registros?")) {
    state = [];
    save();
    render(els.search.value);
  }
}

function generatePDF() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const now = new Date();
  const fmt = now.toLocaleString("pt-BR");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Relatório de Presenças por Sala", 40, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Gerado em: ${fmt}`, 40, 66);

  const body = state.map(r => [r.room, r.present, r.absent, r.present + r.absent]);
  const totals = state.reduce((acc, r) => ({ p: acc.p + r.present, a: acc.a + r.absent }), { p: 0, a: 0 });

  autoTable(doc, {
    startY: 90,
    head: [["Sala", "Presentes", "Ausentes", "Total"]],
    body,
    styles: { font: "helvetica", halign: "left" },
    headStyles: { fillColor: [17,17,17], textColor: [255,255,255] },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    willDrawCell: data => {
      // minimal
    }
  });

  const endY = doc.lastAutoTable.finalY || 90;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Presentes: ${totals.p}`, 40, endY + 24);
  doc.text(`Total Ausentes: ${totals.a}`, 40, endY + 44);
  doc.text(`Total Geral: ${totals.p + totals.a}`, 40, endY + 64);

  doc.save(`relatorio-salas-${now.toISOString().slice(0,10)}.pdf`);
}

// Events
els.form.addEventListener("submit", addRoom);
els.tbody.addEventListener("click", onTableClick);
els.editForm.addEventListener("submit", submitEdit);
els.clearBtn.addEventListener("click", clearAll);
els.exportBtn.addEventListener("click", generatePDF);
els.search.addEventListener("input", (e) => render(e.target.value));

// Initial render
render();

