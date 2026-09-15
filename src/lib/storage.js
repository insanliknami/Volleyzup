

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


/* ═══ TAKIM STORAGE (kulüp bazlı) ═══ */
export async function loadTeams(clubId) { return ls(`vball-teams-${clubId}`) || []; }
export async function saveTeams(clubId, t) { ss(`vball-teams-${clubId}`, t); }

/* ═══ YOKLAMA STORAGE (takım + tarih bazlı) ═══
   Her gün ayrı kayıtta tutulur; sezon boyunca yüzlerce antrenman birikince
   tek dosyada tutmak yavaşlar. İndeks hangi günlerde kayıt olduğunu söyler. */
export function loadAttendance(teamId, date) { return ls(`vball-att-${teamId}-${date}`) || null; }
export function saveAttendance(teamId, date, rec) {
  ss(`vball-att-${teamId}-${date}`, rec);
  const idx = ls(`vball-att-idx-${teamId}`) || [];
  if (!idx.includes(date)) { idx.push(date); idx.sort().reverse(); ss(`vball-att-idx-${teamId}`, idx); }
}
export function deleteAttendance(teamId, date) {
  try { localStorage.removeItem(`vball-att-${teamId}-${date}`); } catch (e) { console.error(e); }
  const idx = (ls(`vball-att-idx-${teamId}`) || []).filter(d => d !== date);
  ss(`vball-att-idx-${teamId}`, idx);
}
export function loadAttendanceIndex(teamId) { return ls(`vball-att-idx-${teamId}`) || []; }
/* Bir oyuncunun takımdaki devam istatistiği */
export function attendanceStats(teamId, playerId) {
  const idx = loadAttendanceIndex(teamId);
  let present = 0, absent = 0, excused = 0, late = 0, total = 0;
  for (const d of idx) {
    const rec = loadAttendance(teamId, d);
    const st = rec && rec.marks ? rec.marks[playerId] : null;
    if (!st) continue;
    total++;
    if (st === "present") present++;
    else if (st === "absent") absent++;
    else if (st === "excused") excused++;
    else if (st === "late") late++;
  }
  const counted = present + late + absent;
  return { present, absent, excused, late, total,
    rate: counted ? Math.round(((present + late) / counted) * 100) : null };
}
