const STORAGE_KEY = "controle-presencas-salas";

export function loadRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      presentes: Number(r.presentes ?? 0),
      ausentes: Number(r.ausentes ?? 0),
    }));
  } catch {
    return [];
  }
}

export function saveRooms(rooms) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch {
    // ignore
  }
}

export function clearRooms() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}