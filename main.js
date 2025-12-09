import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STORAGE_KEY = "controle-presencas_v1";

const inputName = document.getElementById("input-name");
const inputPresent = document.getElementById("input-present");
const inputAbsent = document.getElementById("input-absent");
const btnSave = document.getElementById("btn-save");
const btnCancelEdit = document.getElementById("btn-cancel-edit");
const btnPdf = document.getElementById("btn-pdf");
const btnClear = document.getElementById("btn-clear");
const roomsListEl = document.getElementById("rooms-list");
const totalPresentEl = document.getElementById("total-present");
const totalAbsentEl = document.getElementById("total-absent");
const totalAllEl = document.getElementById("total-all");

let rooms = [];
let editingId = null;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return;
    rooms = data.filter(
      (r) =>
        typeof r.id === "string" &&
        typeof r.name === "string" &&
        typeof r.present === "number" &&
        typeof r.absent === "number"
    );
  } catch {
    rooms = [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch {
    // ignore
  }
}

function clearForm() {
  inputName.value = "";
  inputPresent.value = "";
  inputAbsent.value = "";
}

function setEditing(id) {
  editingId = id;
  if (editingId === null) {
    btnSave.textContent = "Adicionar";
    btnCancelEdit.hidden = true;
    clearForm();
    return;
  }
  const room = rooms.find((r) => r.id === id);
  if (!room) {
    editingId = null;
    return;
  }
  inputName.value = room.name;
  inputPresent.value = room.present;
  inputAbsent.value = room.absent;
  btnSave.textContent = "Salvar";
  btnCancelEdit.hidden = false;
}

function sanitizeNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function renderTotals() {
  let totalP = 0;
  let totalA = 0;
  rooms.forEach((r) => {
    totalP += r.present;
    totalA += r.absent;
  });
  totalPresentEl.textContent = totalP;
  totalAbsentEl.textContent = totalA;
  totalAllEl.textContent = totalP + totalA;
}

function createRoomRow(room) {
  const row = document.createElement("div");
  row.className = "list-row";
  row.dataset.id = room.id;

  const nameCol = document.createElement("div");
  nameCol.className = "col-name";
  const nameSpan = document.createElement("span");
  nameSpan.className = "col-name-text";
  nameSpan.textContent = room.name;
  nameCol.appendChild(nameSpan);

  const pCol = document.createElement("div");
  pCol.className = "col-small";
  pCol.textContent = room.present;

  const aCol = document.createElement("div");
  aCol.className = "col-small";
  aCol.textContent = room.absent;

  const tCol = document.createElement("div");
  tCol.className = "col-small";
  tCol.textContent = room.present + room.absent;

  const actionsCol = document.createElement("div");
  actionsCol.className = "col-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn edit";
  editBtn.type = "button";
  editBtn.innerHTML = "";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setEditing(room.id);
  });

  const delBtn = document.createElement("button");
  delBtn.className = "icon-btn delete";
  delBtn.type = "button";
  delBtn.innerHTML = "";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeRoom(room.id);
  });

  actionsCol.appendChild(editBtn);
  actionsCol.appendChild(delBtn);

  row.appendChild(nameCol);
  row.appendChild(pCol);
  row.appendChild(aCol);
  row.appendChild(tCol);
  row.appendChild(actionsCol);

  return row;
}

function renderRooms() {
  roomsListEl.innerHTML = "";
  if (!rooms.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhuma sala adicionada.";
    roomsListEl.appendChild(empty);
    renderTotals();
    return;
  }

  rooms.forEach((room) => {
    const row = createRoomRow(room);
    roomsListEl.appendChild(row);
  });

  renderTotals();
}

function addOrUpdateRoom() {
  const name = (inputName.value || "").trim() || "Sala sem nome";
  const present = sanitizeNumber(inputPresent.value);
  const absent = sanitizeNumber(inputAbsent.value);

  if (editingId) {
    const idx = rooms.findIndex((r) => r.id === editingId);
    if (idx !== -1) {
      rooms[idx] = { ...rooms[idx], name, present, absent };
    }
  } else {
    const room = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      present,
      absent,
    };
    rooms.push(room);
  }

  saveToStorage();
  renderRooms();
  setEditing(null);
  clearForm();
}

function removeRoom(id) {
  const idx = rooms.findIndex((r) => r.id === id);
  if (idx === -1) return;
  rooms.splice(idx, 1);
  if (editingId === id) {
    setEditing(null);
  }
  saveToStorage();
  renderRooms();
}

function clearAll() {
  rooms = [];
  editingId = null;
  clearForm();
  saveToStorage();
  renderRooms();
}

function generatePdf() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  const title = "Controle de Presenças";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, margin, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const date = new Date();
  const dateStr = date.toLocaleString("pt-BR");
  doc.text(`Gerado em: ${dateStr}`, margin, 26);

  const totalP = rooms.reduce((s, r) => s + r.present, 0);
  const totalA = rooms.reduce((s, r) => s + r.absent, 0);
  const totalGeral = totalP + totalA;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Presentes: ${totalP}   Ausentes: ${totalA}   Total: ${totalGeral}`,
    margin,
    34
  );

  const body =
    rooms.length === 0
      ? [["-", "-", "-", "-"]]
      : rooms.map((r, i) => [
          i + 1,
          r.name,
          r.present,
          r.absent,
          r.present + r.absent,
        ]);

  autoTable(doc, {
    startY: 40,
    head: [["#", "Sala / Grupo", "Presentes", "Ausentes", "Total"]],
    body,
    styles: { fontSize: 10 },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: 255,
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 90 },
      2: { cellWidth: 20, halign: "right" },
      3: { cellWidth: 20, halign: "right" },
      4: { cellWidth: 20, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  doc.save("controle-presencas.pdf");
}

/* Event wiring */

btnSave.addEventListener("click", (e) => {
  e.preventDefault();
  addOrUpdateRoom();
});

btnCancelEdit.addEventListener("click", (e) => {
  e.preventDefault();
  setEditing(null);
});

btnPdf.addEventListener("click", (e) => {
  e.preventDefault();
  generatePdf();
});

btnClear.addEventListener("click", (e) => {
  e.preventDefault();
  if (rooms.length === 0) return;
  const ok = window.confirm("Limpar todas as salas e totais?");
  if (!ok) return;
  clearAll();
});

[inputName, inputPresent, inputAbsent].forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addOrUpdateRoom();
    }
  });
});

/* Init */

loadFromStorage();
renderRooms();
setEditing(null);