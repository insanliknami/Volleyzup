import { useState, useEffect, useRef } from "react";
import { teamDisplayName } from "../constants/index";
import { IS, LS, BTN, OS } from "../ui/styles";
import { gid, fmtDate } from "../lib/utils";
import { loadStatIndex, loadStatSession, saveStatSession, deleteStatSession } from "../lib/storage";
import { SKILLS, GRADE_TEXT, replaySet, computeStats, summarize, parseCode } from "../lib/matchstats";
import ConfirmModal from "../ui/ConfirmModal";

const GRADE_COL = ["#E84855", "#FF9F1C", "#8BC34A", "#00D4AA"];
const skillOf = id => SKILLS.find(s => s.id === id);
const pct = v => (v === null || v === undefined) ? "—" : `%${Math.round(v * 100)}`;
const today = () => new Date().toISOString().slice(0, 10);
const CARD = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16 };
const H3 = { fontSize: 13, color: "#8A8F98", margin: "0 0 10px", letterSpacing: "0.05em", fontWeight: 700 };

export default function MatchStatsPage({ team, profiles, matches = [], isMobile }) {
  const [idx, setIdx] = useState([]);
  const [sess, setSess] = useState(null);
  const [setNo, setSetNo] = useState(1);
  const [view, setView] = useState("entry");       // entry | report
  const [creating, setCreating] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => { if (team) setIdx(loadStatIndex(team.id)); setSess(null); }, [team?.id]);

  if (!team) return (<div><h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: "0 0 8px" }}>Maç İstatistiği</h2>
    <p style={{ color: "#6B7080", fontSize: 14 }}>Önce üst şeritten bir takım seç.</p></div>);

  const roster = (team.players || []).map(pid => profiles.find(p => p.id === pid)).filter(Boolean);
  const nums = team.numbers || {};
  const nameOf = pid => profiles.find(p => p.id === pid)?.name || "?";
  const short = pid => { const n = nameOf(pid); return nums[pid] ? `${nums[pid]} ${n.split(" ")[0]}` : n.split(" ")[0]; };

  function persist(ns) { setSess(ns); saveStatSession(ns); setIdx(loadStatIndex(team.id)); }

  /* ── MAÇ LİSTESİ ── */
  if (!sess) {
    return (
      <div>
        {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: "0 0 4px" }}>Maç İstatistiği</h2>
            <p style={{ color: "#6B7080", fontSize: 14, margin: 0 }}>{teamDisplayName(team)} · {idx.length} maç</p>
          </div>
          {!creating && <button onClick={() => setCreating({ opponent: "", date: today(), matchId: "" })}
            style={{ background: "#FF6B35", border: "none", borderRadius: 10, padding: "11px 20px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Yeni maç</button>}
        </div>

        {creating && (
          <div style={{ ...CARD, border: "1px solid rgba(255,107,53,0.25)", marginBottom: 20 }}>
            {matches.length > 0 && (<div style={{ marginBottom: 12 }}>
              <label style={LS}>Takvimden seç (isteğe bağlı)</label>
              <select style={IS} value={creating.matchId} onChange={e => {
                const m = matches.find(x => x.id === e.target.value);
                setCreating({ ...creating, matchId: e.target.value, opponent: m ? (m.opponent || m.title || creating.opponent) : creating.opponent, date: m?.date || creating.date });
              }}>
                <option value="" style={OS}>—</option>
                {matches.map(m => <option key={m.id} value={m.id} style={OS}>{fmtDate(m.date)} · {m.opponent || m.title || "Maç"}</option>)}
              </select></div>)}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 12, marginBottom: 14 }}>
              <div><label style={LS}>Rakip</label><input style={IS} value={creating.opponent} placeholder="Rakip takım" onChange={e => setCreating({ ...creating, opponent: e.target.value })} /></div>
              <div><label style={LS}>Tarih</label><input type="date" style={IS} value={creating.date} onChange={e => setCreating({ ...creating, date: e.target.value })} /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button disabled={!creating.opponent.trim()} onClick={() => {
                const ns = { id: gid(), teamId: team.id, opponent: creating.opponent.trim(), date: creating.date, matchId: creating.matchId, sets: [], createdAt: Date.now() };
                persist(ns); setSetNo(1); setView("entry"); setCreating(null);
              }} style={{ background: creating.opponent.trim() ? "#FF6B35" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "10px 22px", color: creating.opponent.trim() ? "#fff" : "#4A4F5C", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Başlat</button>
              <button onClick={() => setCreating(null)} style={BTN(false, "#6B7080")}>Vazgeç</button>
            </div>
          </div>
        )}

        {idx.length === 0 && !creating && <p style={{ color: "#4A4F5C", fontSize: 13 }}>Henüz istatistik girilmiş maç yok.</p>}
        {idx.map(m => {
          const full = loadStatSession(m.id);
          const sc = (full?.sets || []).map(st => replaySet(st).score);
          const won = sc.filter(x => x[0] > x[1]).length, lost = sc.filter(x => x[1] > x[0]).length;
          return (
            <div key={m.id} style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, marginBottom: 6, padding: "12px 16px" }}>
              <button onClick={() => { setSess(full); setSetNo(Math.max(1, (full?.sets || []).length)); setView("report"); }}
                style={{ flex: 1, background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ color: "#F0F0F0", fontSize: 14, fontWeight: 700 }}>{m.opponent}</div>
                <div style={{ color: "#6B7080", fontSize: 12 }}>{fmtDate(m.date)} · {sc.length ? `${won}–${lost} · ${sc.map(x => x.join("-")).join(", ")}` : "set girilmedi"}</div>
              </button>
              <button onClick={() => { setSess(full); setSetNo(Math.max(1, (full?.sets || []).length)); setView("entry"); }} style={BTN(false)}>Giriş</button>
              <button onClick={() => setConfirm({ message: `${m.opponent} maçının istatistiği silinecek.`, onConfirm: () => { deleteStatSession(team.id, m.id); setIdx(loadStatIndex(team.id)); setConfirm(null); } })}
                style={{ background: "none", border: "none", color: "#4A4F5C", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── MAÇ İÇİ ── */
  const setterId = st => { if (!st) return null; for (const z in st.lineup) { const p = profiles.find(x => x.id === st.lineup[z]); if (p && p.position === "Pasör") return p.id; } return null; };
  const curSet = sess.sets.find(s => s.no === setNo) || null;

  return (
    <div>
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <button onClick={() => setSess(null)} style={BTN(false, "#6B7080")}>← Maçlar</button>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ color: "#F0F0F0", fontSize: 18, fontWeight: 800 }}>{teamDisplayName(team)} – {sess.opponent}</div>
          <div style={{ color: "#6B7080", fontSize: 12 }}>{fmtDate(sess.date)}</div>
        </div>
        <button onClick={() => setView("entry")} style={BTN(view === "entry")}>Giriş</button>
        <button onClick={() => setView("report")} style={BTN(view === "report", "#00D4AA")}>Rapor</button>
      </div>

      {view === "entry" ? (<>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {sess.sets.map(s => {
            const sc = replaySet(s).score;
            return <button key={s.no} onClick={() => setSetNo(s.no)} style={BTN(s.no === setNo)}>Set {s.no} · {sc.join("-")}</button>;
          })}
          {sess.sets.length < 5 && <button onClick={() => { setSetNo(sess.sets.length + 1); }} style={BTN(!curSet, "#00D4AA")}>+ Set {sess.sets.length + 1}</button>}
        </div>
        {curSet
          ? <SetEntry key={setNo} set={curSet} setterId={setterId(curSet)} roster={roster} nums={nums} short={short} isMobile={isMobile}
              onChange={ns => persist({ ...sess, sets: sess.sets.map(s => s.no === ns.no ? ns : s) })}
              onDelete={() => setConfirm({ message: `Set ${setNo} ve tüm girişleri silinecek.`, onConfirm: () => {
                const rest = sess.sets.filter(s => s.no !== setNo).map((s, i) => ({ ...s, no: i + 1 }));
                persist({ ...sess, sets: rest }); setSetNo(Math.max(1, rest.length)); setConfirm(null); } })} />
          : <LineupSetup no={setNo} roster={roster} short={short} isMobile={isMobile}
              prev={sess.sets[sess.sets.length - 1]}
              onStart={st => { persist({ ...sess, sets: [...sess.sets, st] }); }} />}
      </>) : <Report sess={sess} setterIdOf={setterId} roster={roster} short={short} isMobile={isMobile} />}
    </div>
  );
}

/* ══════════ SET BAŞLANGIÇ DİZİLİŞİ ══════════ */
function LineupSetup({ no, roster, short, isMobile, prev, onStart }) {
  const [lu, setLu] = useState(prev ? { ...prev.lineup } : {});
  const [serveFirst, setServeFirst] = useState(prev ? !prev.weServeFirst : true);
  const used = Object.values(lu).filter(Boolean);
  const ready = [1, 2, 3, 4, 5, 6].every(z => lu[z]);
  const grid = [[4, 3, 2], [5, 6, 1]];
  return (
    <div style={{ ...CARD, border: "1px solid rgba(0,212,170,0.25)" }}>
      <h3 style={H3}>SET {no} · BAŞLANGIÇ DİZİLİŞİ</h3>
      <p style={{ color: "#6B7080", fontSize: 12, margin: "0 0 14px" }}>File üstte. Her bölgeye bir oyuncu seç — rotasyon buradan otomatik takip edilir.</p>
      <div style={{ maxWidth: 480 }}>
        <div style={{ height: 3, background: "#F0F0F0", borderRadius: 2, marginBottom: 8, opacity: .6 }} />
        {grid.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 8 }}>
            {row.map(z => (
              <div key={z}>
                <label style={{ ...LS, marginBottom: 4 }}>Bölge {z}</label>
                <select style={IS} value={lu[z] || ""} onChange={e => setLu({ ...lu, [z]: e.target.value })}>
                  <option value="" style={OS}>—</option>
                  {roster.filter(p => !used.includes(p.id) || lu[z] === p.id).map(p => <option key={p.id} value={p.id} style={OS}>{short(p.id)}</option>)}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0 16px" }}>
        <span style={{ color: "#8A8F98", fontSize: 12, fontWeight: 600 }}>İlk servis:</span>
        <button onClick={() => setServeFirst(true)} style={BTN(serveFirst)}>Biz</button>
        <button onClick={() => setServeFirst(false)} style={BTN(!serveFirst)}>Rakip</button>
      </div>
      <button disabled={!ready} onClick={() => onStart({ no, lineup: lu, weServeFirst: serveFirst, events: [] })}
        style={{ background: ready ? "#00D4AA" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "11px 24px", color: ready ? "#0B1A14" : "#4A4F5C", fontSize: 14, fontWeight: 800, cursor: ready ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif" }}>Seti başlat</button>
      {roster.length < 6 && <p style={{ color: "#E84855", fontSize: 12, marginTop: 10 }}>Kadroda 6'dan az oyuncu var — Takımlar sekmesinden ekle.</p>}
    </div>
  );
}

/* ══════════ SET GİRİŞİ ══════════ */
function SetEntry({ set, setterId, roster, nums, short, isMobile, onChange, onDelete }) {
  const [pid, setPid] = useState(null);
  const [skill, setSkill] = useState(null);
  const [ts, setTs] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [subOpen, setSubOpen] = useState(false);
  const codeRef = useRef(null);

  const r = replaySet(set, setterId);
  const onCourt = Object.values(r.lineup);
  const inRally = r.open ? r.open.actions : [];
  const suggest = inRally.length === 0 ? (r.serving === "us" ? "S" : "K") : null;
  const numToPid = n => Object.keys(nums).find(k => nums[k] === String(+n) || nums[k] === n);

  function push(ev) {
    onChange({ ...set, events: [...set.events, ev] });
    setPid(null); setSkill(null); setTs(""); setMsg(null);
    setTimeout(() => codeRef.current && !isMobile && codeRef.current.focus(), 0);
  }
  function commitGrade(g) {
    const sk = skill || suggest;
    if (!pid || !sk) { setMsg("Önce oyuncu ve beceri seç"); return; }
    push({ t: "a", pid, skill: sk, grade: g, ts: ts || null });
  }
  function commitCode() {
    const c = parseCode(code);
    if (!c) return;
    if (c.error) { setMsg(c.error); return; }
    if (c.t === "end") { push({ t: "end", winner: c.winner, why: c.why, ts: c.ts || ts || null }); setCode(""); return; }
    const p = numToPid(c.num);
    if (!p) { setMsg(`${c.num} numara kadroda tanımlı değil (Takımlar → forma numaraları)`); return; }
    push({ t: "a", pid: p, skill: c.skill, grade: c.grade, ts: c.ts || ts || null });
    setCode("");
  }
  function undo() { if (set.events.length) onChange({ ...set, events: set.events.slice(0, -1) }); }

  const grid = [[4, 3, 2], [5, 6, 1]];
  const sk = skill || suggest;

  return (
    <div>
      {/* skor şeridi */}
      <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#F0F0F0", letterSpacing: "-0.02em" }}>
          {r.score[0]}<span style={{ color: "#4A4F5C", margin: "0 8px" }}>–</span>{r.score[1]}
        </div>
        <div style={{ fontSize: 12, color: "#8A8F98", lineHeight: 1.7 }}>
          <div>Servis: <b style={{ color: r.serving === "us" ? "#FF6B35" : "#C0C4CC" }}>{r.serving === "us" ? "Biz" : "Rakip"}</b></div>
          <div>Rotasyon: <b style={{ color: "#00D4AA" }}>{r.rot ? `R${r.rot}` : "—"}</b>{!setterId && <span style={{ color: "#4A4F5C" }}> (pasör tanımlı değil)</span>}</div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={undo} disabled={!set.events.length} style={BTN(false, "#FFD23F")}>Geri al</button>
        <button onClick={() => setSubOpen(v => !v)} style={BTN(subOpen)}>Değişiklik</button>
        <button onClick={onDelete} style={BTN(false, "#E84855")}>Seti sil</button>
      </div>

      {subOpen && <SubPanel lineup={r.lineup} roster={roster} short={short} onSub={(zone, inPid) => { push({ t: "sub", zone, inPid, outPid: r.lineup[zone] }); setSubOpen(false); }} />}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(260px,340px) 1fr", gap: 12, marginBottom: 12 }}>
        {/* saha */}
        <div style={CARD}>
          <h3 style={H3}>OYUNCU</h3>
          <div style={{ height: 3, background: "#F0F0F0", borderRadius: 2, marginBottom: 8, opacity: .5 }} />
          {grid.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 6 }}>
              {row.map(z => {
                const p = r.lineup[z];
                return (<button key={z} onClick={() => setPid(p)} style={{
                  background: pid === p ? "rgba(255,107,53,0.18)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${pid === p ? "#FF6B35" : "rgba(255,255,255,0.08)"}`, borderRadius: 10,
                  padding: "12px 4px", color: "#F0F0F0", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", position: "relative" }}>
                  <span style={{ position: "absolute", top: 3, left: 6, fontSize: 9, color: "#4A4F5C" }}>{z}</span>
                  {p ? short(p) : "—"}
                </button>);
              })}
            </div>
          ))}
          {roster.filter(p => !onCourt.includes(p.id)).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: "#4A4F5C", marginBottom: 4, letterSpacing: "0.05em" }}>KENAR</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {roster.filter(p => !onCourt.includes(p.id)).map(p => (
                  <button key={p.id} onClick={() => setPid(p.id)} style={{ ...BTN(pid === p.id), padding: "4px 8px", fontSize: 11 }}>{short(p.id)}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* beceri + derece */}
        <div style={CARD}>
          <h3 style={H3}>BECERİ{suggest && !skill ? <span style={{ color: "#4A4F5C", fontWeight: 500 }}> · önerilen: {skillOf(suggest).label}</span> : null}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 14 }}>
            {SKILLS.map(s => (
              <button key={s.id} onClick={() => setSkill(s.id)} style={{
                background: sk === s.id ? `${s.color}22` : "rgba(255,255,255,0.03)",
                border: `1px solid ${sk === s.id ? s.color : "rgba(255,255,255,0.08)"}`, borderRadius: 10,
                padding: "12px 2px", color: sk === s.id ? s.color : "#8A8F98", fontSize: isMobile ? 11 : 12,
                fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{s.id}</div>{s.label}
              </button>
            ))}
          </div>
          <h3 style={H3}>DERECE</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 12 }}>
            {[0, 1, 2, 3].map(g => (
              <button key={g} onClick={() => commitGrade(g)} disabled={!pid} style={{
                background: pid ? `${GRADE_COL[g]}18` : "rgba(255,255,255,0.02)",
                border: `1px solid ${pid ? `${GRADE_COL[g]}55` : "rgba(255,255,255,0.05)"}`, borderRadius: 10,
                padding: "10px 4px", color: pid ? GRADE_COL[g] : "#4A4F5C", cursor: pid ? "pointer" : "default",
                fontFamily: "'DM Sans', sans-serif", minHeight: 64 }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{g}</div>
                <div style={{ fontSize: 10, lineHeight: 1.3, color: "#8A8F98" }}>{sk ? GRADE_TEXT[sk][g] : ""}</div>
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
            <button onClick={() => push({ t: "end", winner: "us", why: "opp_err", ts: ts || null })} style={{ ...BTN(false, "#00D4AA"), padding: "10px" }}>+ Rakip hatası</button>
            <button onClick={() => push({ t: "end", winner: "them", why: "opp_pt", ts: ts || null })} style={{ ...BTN(false, "#E84855"), padding: "10px" }}>− Rakip sayısı</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 110px", gap: 6 }}>
            <input ref={codeRef} style={{ ...IS, fontFamily: "ui-monospace, monospace", fontWeight: 700, letterSpacing: "0.05em" }}
              placeholder="Kod: 7K3 · 12H2 03:41 · + · −" value={code}
              onChange={e => { setCode(e.target.value); setMsg(null); }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commitCode(); } }} />
            <input style={{ ...IS, fontFamily: "ui-monospace, monospace" }} placeholder="Zaman 12:34" value={ts} onChange={e => setTs(e.target.value)} />
          </div>
          {msg && <div style={{ color: "#FF9F1C", fontSize: 12, marginTop: 8 }}>{msg}</div>}
        </div>
      </div>

      {/* ralli günlüğü */}
      <div style={CARD}>
        <h3 style={H3}>RALLİLER ({r.rallies.length}){inRally.length ? " · devam eden ralli var" : ""}</h3>
        {r.open && r.open.actions.length > 0 && <RallyRow ral={r.open} short={short} live />}
        {[...r.rallies].reverse().slice(0, 40).map((ral, i) => <RallyRow key={i} ral={ral} short={short} />)}
        {r.rallies.length === 0 && !inRally.length && <p style={{ color: "#4A4F5C", fontSize: 12, margin: 0 }}>Henüz ralli yok. Oyuncuya dokun, beceri ve derece seç — ya da kod yaz.</p>}
      </div>
    </div>
  );
}

function RallyRow({ ral, short, live }) {
  const why = { opp_err: "rakip hatası", opp_pt: "rakip sayısı" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
      <span style={{ minWidth: 42, fontWeight: 800, color: live ? "#FFD23F" : ral.winner === "us" ? "#00D4AA" : "#E84855" }}>
        {live ? "…" : ral.scoreAfter.join("-")}
      </span>
      <span style={{ minWidth: 26, color: "#4A4F5C" }}>{ral.rot ? `R${ral.rot}` : ""}</span>
      <span style={{ flex: 1, color: "#C0C4CC" }}>
        {ral.actions.map((a, i) => <span key={i} style={{ marginRight: 8 }}>{short(a.pid)} <b style={{ color: skillOf(a.skill).color }}>{a.skill}{a.grade}</b></span>)}
        {ral.why && why[ral.why] ? <span style={{ color: "#6B7080" }}>{why[ral.why]}</span> : null}
      </span>
      {ral.ts && <span style={{ color: "#6B7080", fontFamily: "ui-monospace, monospace" }}>{ral.ts}</span>}
    </div>
  );
}

function SubPanel({ lineup, roster, short, onSub }) {
  const [zone, setZone] = useState(null);
  const onCourt = Object.values(lineup);
  return (
    <div style={{ ...CARD, border: "1px solid rgba(255,107,53,0.25)", marginBottom: 12 }}>
      <h3 style={H3}>OYUNCU DEĞİŞİKLİĞİ / LİBERO</h3>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {[1, 2, 3, 4, 5, 6].map(z => <button key={z} onClick={() => setZone(z)} style={BTN(zone === z)}>{z}: {short(lineup[z])} çıksın</button>)}
      </div>
      {zone && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {roster.filter(p => !onCourt.includes(p.id)).map(p => <button key={p.id} onClick={() => onSub(zone, p.id)} style={BTN(false, "#00D4AA")}>{short(p.id)} girsin</button>)}
      </div>}
    </div>
  );
}

/* ══════════ RAPOR ══════════ */
function Report({ sess, setterIdOf, roster, short, isMobile }) {
  if (!sess.sets.length) return <p style={{ color: "#4A4F5C", fontSize: 13 }}>Henüz set girilmedi.</p>;
  const st = computeStats({ sets: sess.sets }, setterIdOf(sess.sets[0]));
  const won = st.sets.filter(s => s.score[0] > s.score[1]).length;
  const lost = st.sets.filter(s => s.score[1] > s.score[0]).length;
  const cell = { padding: "8px 6px", textAlign: "center", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.04)" };
  const head = { ...cell, color: "#6B7080", fontWeight: 700, fontSize: 11 };
  const errs = [];
  sess.sets.forEach(s => replaySet(s, setterIdOf(s)).rallies.forEach(ral => {
    ral.actions.filter(a => a.grade === 0).forEach(a => errs.push({ set: s.no, a, ts: ral.ts || a.ts, score: ral.scoreBefore }));
  }));

  return (
    <div>
      <div style={{ ...CARD, marginBottom: 12, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: won > lost ? "#00D4AA" : won < lost ? "#E84855" : "#F0F0F0" }}>{won}–{lost}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {st.sets.map(s => <span key={s.no} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: s.score[0] > s.score[1] ? "#00D4AA" : "#E84855", fontWeight: 700 }}>{s.score.join("-")}</span>)}
        </div>
      </div>

      <div style={{ ...CARD, marginBottom: 12 }}>
        <h3 style={H3}>TAKIM</h3>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5,1fr)", gap: 8 }}>
          {SKILLS.map(s => {
            const m = summarize(st.bySkill[s.id]);
            return (<div key={s.id} style={{ background: `${s.color}0F`, border: `1px solid ${s.color}30`, borderRadius: 10, padding: 12 }}>
              <div style={{ color: s.color, fontSize: 12, fontWeight: 800 }}>{s.label}</div>
              <div style={{ color: "#F0F0F0", fontSize: 22, fontWeight: 900, margin: "4px 0" }}>{m.avg === null ? "—" : m.avg.toFixed(2)}</div>
              <div style={{ color: "#8A8F98", fontSize: 11, lineHeight: 1.6 }}>
                {m.n} deneme<br />olumlu {pct(m.pos)} · hata {pct(m.err)}
                {(s.id === "H" || s.id === "S" || s.id === "B") && m.n ? <><br />verim {pct(m.eff)}</> : null}
              </div>
            </div>);
          })}
        </div>
      </div>

      <div style={{ ...CARD, marginBottom: 12, overflowX: "auto" }}>
        <h3 style={H3}>ROTASYON</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
          <thead><tr><th style={head}>Rot.</th><th style={head}>Side-out</th><th style={head}>Break</th><th style={head}>Karşılama ort.</th></tr></thead>
          <tbody>{[1, 2, 3, 4, 5, 6].map(R => {
            const v = st.byRot[R]; if (!v) return null;
            const so = v.recv.n ? v.recv.won / v.recv.n : null, br = v.serve.n ? v.serve.won / v.serve.n : null;
            const ka = v.recvGrades.length ? v.recvGrades.reduce((a, b) => a + b, 0) / v.recvGrades.length : null;
            const c = x => x === null ? "#4A4F5C" : x >= .6 ? "#00D4AA" : x >= .45 ? "#FFD23F" : "#E84855";
            return (<tr key={R}>
              <td style={{ ...cell, fontWeight: 800, color: "#F0F0F0" }}>R{R}</td>
              <td style={{ ...cell, color: c(so), fontWeight: 700 }}>{pct(so)} <span style={{ color: "#4A4F5C", fontWeight: 400 }}>{v.recv.won}/{v.recv.n}</span></td>
              <td style={{ ...cell, color: c(br === null ? null : br + .15), fontWeight: 700 }}>{pct(br)} <span style={{ color: "#4A4F5C", fontWeight: 400 }}>{v.serve.won}/{v.serve.n}</span></td>
              <td style={{ ...cell, color: "#C0C4CC" }}>{ka === null ? "—" : ka.toFixed(2)}</td>
            </tr>);
          })}</tbody>
        </table>
        {!setterIdOf(sess.sets[0]) && <p style={{ color: "#6B7080", fontSize: 11, margin: "8px 0 0" }}>Rotasyon, dizilişteki “Pasör” mevkili oyuncuya göre numaralanır. Kadroda pasör tanımlı değilse bu tablo boş kalır.</p>}
      </div>

      <div style={{ ...CARD, marginBottom: 12, overflowX: "auto" }}>
        <h3 style={H3}>OYUNCULAR · ortalama derece (deneme)</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead><tr><th style={{ ...head, textAlign: "left" }}>Oyuncu</th>{SKILLS.map(s => <th key={s.id} style={{ ...head, color: s.color }}>{s.label}</th>)}<th style={head}>Hücum verimi</th></tr></thead>
          <tbody>{roster.filter(p => st.byPlayer[p.id]).map(p => (
            <tr key={p.id}>
              <td style={{ ...cell, textAlign: "left", color: "#F0F0F0", fontWeight: 600 }}>{short(p.id)}</td>
              {SKILLS.map(s => { const m = summarize(st.byPlayer[p.id][s.id]); return <td key={s.id} style={{ ...cell, color: m.n ? "#C0C4CC" : "#3A3F4A" }}>{m.n ? <>{m.avg.toFixed(2)} <span style={{ color: "#4A4F5C" }}>({m.n})</span></> : "—"}</td>; })}
              <td style={{ ...cell, fontWeight: 700, color: (() => { const m = summarize(st.byPlayer[p.id].H); return m.eff === null ? "#3A3F4A" : m.eff >= .3 ? "#00D4AA" : m.eff >= .1 ? "#FFD23F" : "#E84855"; })() }}>{pct(summarize(st.byPlayer[p.id].H).eff)}</td>
            </tr>))}</tbody>
        </table>
      </div>

      {errs.length > 0 && (
        <div style={CARD}>
          <h3 style={H3}>HATALAR · videoda bakılacaklar ({errs.length})</h3>
          {errs.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
              <span style={{ color: "#6B7080", minWidth: 44 }}>Set {e.set}</span>
              <span style={{ color: "#6B7080", minWidth: 42 }}>{e.score.join("-")}</span>
              <span style={{ flex: 1, color: "#C0C4CC" }}>{short(e.a.pid)} · <b style={{ color: skillOf(e.a.skill).color }}>{skillOf(e.a.skill).label}</b> · {GRADE_TEXT[e.a.skill][0]}</span>
              <span style={{ color: e.ts ? "#FFD23F" : "#3A3F4A", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>{e.ts || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
