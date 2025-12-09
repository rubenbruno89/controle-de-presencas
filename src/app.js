import { loadRooms, saveRooms, clearRooms } from "./storage.js";
import { generatePdf } from "./pdf.js";

let rooms = [];
let editingId = null;

export function initApp() {
  rooms = loadRooms();
  bindEvents();
  render();
}

function bindEvents() {
  const form = document.getElementById("room-form");
  const btnCancelEdit = document.getElementById("btn-cancel-edit");
  const btnClearAll = document.getElementById("btn-clear-all");
  const btnGeneratePdf = document.getElementById("btn-generate-pdf");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit();
  });

  btnCancelEdit.addEventListener("click", () => {
    clearForm();
  });

  btnClearAll.addEventListener("click", () => {
    if (!rooms.length) return;
    if (confirm("Remover todas as salas?")) {
      rooms = [];
      clearRooms();
      clearForm();
      render();
    }
  });

  btnGeneratePdf.addEventListener("click", () => {
    const totals = computeTotals();
    generatePdf(rooms, totals);
  });
}

function handleSubmit() {
  const nameInput = document.getElementById("input-sala");
  const presInput = document.getElementById("input-presentes");
  const ausInput = document.getElementById("input-ausentes");

  const name = nameInput.value.trim();
  const presentes = Math.max(0, Number(presInput.value || 0));
  const ausentes = Math.max(0, Number(ausInput.value || 0));

  if (!name) return;

  if (editingId) {
    rooms = rooms.map((r) =>
      r.id === editingId ? { ...r, name, presentes, ausentes } : r
    );
  } else {
    const id = String(Date.now()) + "-" + Math.random().toString(16).slice(2);
    rooms.push({ id, name, presentes, ausentes });
  }

  saveRooms(rooms);
  clearForm();
  render();
}

function clearForm() {
  editingId = null;
  const form = document.getElementById("room-form");
  form.reset();
  document.getElementById("edit-id").value = "";
  document.getElementById("btn-submit").textContent = "Adicionar";
  document.getElementById("btn-cancel-edit").hidden = true;
}

function startEdit(id) {
  const room = rooms.find((r) => r.id === id);
  if (!room) return;
  editingId = id;

  document.getElementById("edit-id").value = id;
  document.getElementById("input-sala").value = room.name;
  document.getElementById("input-presentes").value = room.presentes;
  document.getElementById("input-ausentes").value = room.ausentes;
  document.getElementById("btn-submit").textContent = "Salvar";
  document.getElementById("btn-cancel-edit").hidden = false;
}

function deleteRoom(id) {
  rooms = rooms.filter((r) => r.id !== id);
  saveRooms(rooms);
  if (editingId === id) {
    clearForm();
  }
  render();
}

function computeTotals() {
  let presentes = 0;
  let ausentes = 0;
  rooms.forEach((r) => {
    presentes += Number(r.presentes || 0);
    ausentes += Number(r.ausentes || 0);
  });
  return {
    presentes,
    ausentes,
    geral: presentes + ausentes,
  };
}

function renderTotals() {
  const totals = computeTotals();
  document.getElementById("total-presentes").textContent = totals.presentes;
  document.getElementById("total-ausentes").textContent = totals.ausentes;
  document.getElementById("total-geral").textContent = totals.geral;
}

function renderRooms() {
  const container = document.getElementById("rooms-list");
  container.innerHTML = "";

  rooms.forEach((room) => {
    const row = document.createElement("div");
    row.className = "room-row";

    const total = room.presentes + room.ausentes;

    const nameEl = document.createElement("div");
    nameEl.className = "room-name";
    nameEl.textContent = room.name;

    const presEl = document.createElement("div");
    presEl.className = "room-num";
    presEl.textContent = room.presentes;

    const ausEl = document.createElement("div");
    ausEl.className = "room-num";
    ausEl.textContent = room.ausentes;

    const totalEl = document.createElement("div");
    totalEl.className = "room-num";
    totalEl.textContent = total;

    const actionsEl = document.createElement("div");
    actionsEl.className = "room-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn edit";
    editBtn.type = "button";
    editBtn.textContent = "Editar";
    editBtn.addEventListener("click", () => startEdit(room.id));

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn delete";
    delBtn.type = "button";
    delBtn.textContent = "Excluir";
    delBtn.addEventListener("click", () => {
      if (confirm(`Excluir sala "${room.name}"?`)) {
        deleteRoom(room.id);
      }
    });

    actionsEl.append(editBtn, delBtn);
    row.append(nameEl, presEl, ausEl, totalEl, actionsEl);
    container.appendChild(row);
  });
}

function render() {
  renderTotals();
  renderRooms();
}