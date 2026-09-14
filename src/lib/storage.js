

export function ls(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } }
export function ss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.error(e); } }
export async function loadClubs() { return ls("vball-clubs-v1") || []; }
export async function saveClubs(c) { ss("vball-clubs-v1", c); }

/* ═══ PROFİL STORAGE (kulüp bazlı) ═══ */
export async function loadProfiles(clubId) { return ls(`vball-prof-${clubId}`) || []; }
export async function saveProfiles(clubId, p) { ss(`vball-prof-${clubId}`, p); }

/* ═══ KİŞİSEL VERİ STORAGE ═══ */
export async function loadData(pid) { return ls(`vball-data-v3-${pid}`) || { sessions: [], measurements: [], goals: [], injuries: [] }; }
export async function saveData(pid, d) { ss(`vball-data-v3-${pid}`, d); }

/* ═══ PAYLAŞIMLI VERİ STORAGE (kulüp bazlı) ═══ */
export async function loadQuests(clubId) { return ls(`vball-q-${clubId}`) || []; }
export async function saveQuests(clubId, q) { ss(`vball-q-${clubId}`, q); }
export async function loadAnnouncements(clubId) { return ls(`vball-a-${clubId}`) || []; }
export async function saveAnnouncements(clubId, a) { ss(`vball-a-${clubId}`, a); }
export async function loadMatches(clubId) { return ls(`vball-m-${clubId}`) || []; }
export async function saveMatches(clubId, m) { ss(`vball-m-${clubId}`, m); }

