/* ══════════ MAÇ İSTATİSTİĞİ — MANTIK ══════════
   Kayıt modeli:
   session = { id, teamId, opponent, date, matchId, sets:[set] }
   set     = { no, lineup:{1..6:pid}, weServeFirst, events:[event] }
   event   = { t:"a", pid, skill, grade, ts }      bir temas
           | { t:"end", winner:"us"|"them", why }  ralli sonu (rakip hatası/sayısı)
           | { t:"sub", zone, inPid, outPid }       oyuncu değişikliği
   Skor, servis sırası ve rotasyon olaylardan yeniden hesaplanır —
   böylece geri alma ve düzeltme her zaman tutarlı kalır. */

export const SKILLS = [
  { id: "S", key: "servis",    label: "Servis",    color: "#FF6B35" },
  { id: "K", key: "karsilama", label: "Karşılama", color: "#00D4AA" },
  { id: "H", key: "hucum",     label: "Hücum",     color: "#E84855" },
  { id: "B", key: "blok",      label: "Blok",      color: "#7B68EE" },
  { id: "D", key: "savunma",   label: "Savunma",   color: "#FFD23F" }
];
export const GRADE_TEXT = {
  S: ["Hata", "Rakip rahat karşıladı", "Rakibi zorladı", "As"],
  K: ["Hata", "Hücum yok / free ball", "Pasör kısıtlı", "Mükemmel"],
  H: ["Hata / bloklandı", "Rakip rahat savundu", "Oyun devam", "Sayı"],
  B: ["Hata (file, blok-out)", "Değdi, rakip devam", "Yumuşattı, biz devam", "Sayı"],
  D: ["Yere düştü", "Kurtardı, oynanamaz", "Oynanabilir", "Mükemmel"]
};
const NEXT = { 1: 6, 6: 5, 5: 4, 4: 3, 3: 2, 2: 1 };

/* Bir temas ralliyi bitiriyor mu? */
export function actionEnds(skill, grade) {
  if (grade === 0) return "them";
  if (grade === 3 && (skill === "S" || skill === "H" || skill === "B")) return "us";
  return null;
}

/* Olay listesini baştan oynatır: ralliler, skor, rotasyon, servis sırası */
export function replaySet(set, setterId) {
  let lineup = { ...set.lineup };
  let serving = set.weServeFirst ? "us" : "them";
  let us = 0, them = 0;
  const rallies = [];
  let cur = null;

  const rotNo = () => {
    // Rotasyon numarası = pasörün bulunduğu bölge (P1…P6). Pasör yoksa başlangıca göre.
    if (setterId) for (const z in lineup) if (lineup[z] === setterId) return +z;
    return null;
  };
  const open = () => {
    cur = { serving, rot: rotNo(), lineup: { ...lineup }, actions: [], winner: null, why: null, ts: null };
  };
  const close = (winner, why) => {
    cur.winner = winner; cur.why = why;
    cur.scoreBefore = [us, them];
    if (winner === "us") us++; else them++;
    cur.scoreAfter = [us, them];
    rallies.push(cur);
    if (winner === "us" && serving === "them") {          // side-out: rotasyon döner
      const nl = {};
      for (const z in lineup) nl[NEXT[z]] = lineup[z];
      lineup = nl;
    }
    serving = winner;
    cur = null;
  };

  for (const ev of set.events || []) {
    if (ev.t === "sub") {
      if (lineup[ev.zone] === ev.outPid) lineup[ev.zone] = ev.inPid;
      continue;
    }
    if (!cur) open();
    if (ev.t === "a") {
      cur.actions.push(ev);
      if (ev.ts && !cur.ts) cur.ts = ev.ts;
      const w = actionEnds(ev.skill, ev.grade);
      if (w) close(w, "action");
    } else if (ev.t === "end") {
      if (ev.ts && !cur.ts) cur.ts = ev.ts;
      close(ev.winner, ev.why);
    }
  }
  return { rallies, open: cur, score: [us, them], lineup, serving, rot: rotNo() };
}

/* Maç verisinden toplu istatistik */
export function computeStats(session, setterId) {
  const byPlayer = {};   // pid → skill → [n0,n1,n2,n3]
  const bySkill = {};    // skill → [n0..n3]
  const byRot = {};      // rot → { recv:{n,won}, serve:{n,won}, recvGrades:[] }
  const sets = [];
  for (const set of session.sets || []) {
    const r = replaySet(set, setterId);
    sets.push({ no: set.no, score: r.score });
    for (const ral of r.rallies) {
      for (const a of ral.actions) {
        byPlayer[a.pid] = byPlayer[a.pid] || {};
        const arr = byPlayer[a.pid][a.skill] = byPlayer[a.pid][a.skill] || [0, 0, 0, 0];
        arr[a.grade]++;
        const s2 = bySkill[a.skill] = bySkill[a.skill] || [0, 0, 0, 0];
        s2[a.grade]++;
      }
      if (ral.rot) {
        const R = byRot[ral.rot] = byRot[ral.rot] || { recv: { n: 0, won: 0 }, serve: { n: 0, won: 0 }, recvGrades: [] };
        const side = ral.serving === "them" ? R.recv : R.serve;
        side.n++; if (ral.winner === "us") side.won++;
        ral.actions.filter(a => a.skill === "K").forEach(a => R.recvGrades.push(a.grade));
      }
    }
  }
  return { byPlayer, bySkill, byRot, sets };
}

/* 0-3 dağılımından özet metrikler */
export function summarize(arr) {
  const [a0, a1, a2, a3] = arr || [0, 0, 0, 0];
  const n = a0 + a1 + a2 + a3;
  if (!n) return { n: 0, avg: null, pos: null, err: null, eff: null, kill: null };
  return {
    n,
    avg: (a1 + 2 * a2 + 3 * a3) / n,     // ortalama derece
    pos: (a2 + a3) / n,                  // olumlu oran (2+3)
    err: a0 / n,                         // hata oranı
    kill: a3 / n,                        // sayı / as / mükemmel oranı
    eff: (a3 - a0) / n                   // verim (sayı − hata)
  };
}

/* Klavye kodu: "7K3" → numara 7, karşılama, derece 3.
   "+" rakip hatası (bize sayı), "-" rakip sayısı. Opsiyonel zaman: "7K3 12:34" */
export function parseCode(raw) {
  const s = String(raw || "").trim().toUpperCase().replace(/\s+/g, " ");
  if (!s) return null;
  const tsM = s.match(/(\d{1,2}:\d{2}(?::\d{2})?)$/);
  const ts = tsM ? tsM[1] : null;
  const body = (tsM ? s.slice(0, tsM.index) : s).trim();
  if (body === "+") return { t: "end", winner: "us", why: "opp_err", ts };
  if (body === "-") return { t: "end", winner: "them", why: "opp_pt", ts };
  const m = body.match(/^(\d{1,2})\s*([SKHBD])\s*([0-3])$/);
  if (!m) return { error: "Kod anlaşılamadı. Örnek: 7K3, 12H2, + (rakip hatası), - (rakip sayısı)" };
  return { t: "a", num: m[1], skill: m[2], grade: +m[3], ts };
}
