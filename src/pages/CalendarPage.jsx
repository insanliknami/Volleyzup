import { useState } from "react";
import { fmtDate, gid } from "../lib/utils";
import ConfirmModal from "../ui/ConfirmModal";
import { IS, LS, OS } from "../ui/styles";

export default function CalendarPage({ matches, setMatches, profile, isMobile }) {
  const [showForm, setShowForm] = useState(false); const [opponent, setOpponent] = useState(""); const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [location, setLocation] = useState("Ev Sahibi"); const [note, setNote] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [scoreEdit, setScoreEdit] = useState(null); const [scoreUs, setScoreUs] = useState(""); const [scoreThem, setScoreThem] = useState(""); const [setScores, setSetScores] = useState("");
  const [showPast, setShowPast] = useState(false);
  const isCoach = profile.position === "Antrenör";
  const todayStr = new Date(new Date().toDateString()).getTime();
  const upcoming = [...matches].filter(m => new Date(m.date).getTime() >= todayStr).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = [...matches].filter(m => new Date(m.date).getTime() < todayStr).sort((a, b) => new Date(b.date) - new Date(a.date));

  function handleAdd() { if (!opponent || !date) return; const nm = [...matches, { id: gid(), opponent, date, time, location, note, createdBy: profile.name, scoreUs: null, scoreThem: null, setScores: "" }]; setMatches(nm); setShowForm(false); setOpponent(""); setDate(""); setTime(""); setNote(""); }
  function handleDel(id) { const nm = matches.filter(m => m.id !== id); setMatches(nm); setConfirmDel(null); }
  function handleSaveScore(id) {
    const nm = matches.map(m => m.id === id ? { ...m, scoreUs: scoreUs ? +scoreUs : null, scoreThem: scoreThem ? +scoreThem : null, setScores: setScores } : m);
    setMatches(nm); setScoreEdit(null); setScoreUs(""); setScoreThem(""); setSetScores("");
  }
  function startScoreEdit(m) { setScoreEdit(m.id); setScoreUs(m.scoreUs ?? ""); setScoreThem(m.scoreThem ?? ""); setSetScores(m.setScores || ""); }

  function MatchCard({ m, isPast }) {
    const hasScore = m.scoreUs != null && m.scoreThem != null;
    const won = hasScore && m.scoreUs > m.scoreThem;
    return (
      <div style={{ background: isPast ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)", border: `1px solid ${isPast ? "rgba(255,255,255,0.06)" : "rgba(0,212,170,0.3)"}`, borderRadius: 14, padding: isMobile ? 16 : 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ background: m.location === "Ev Sahibi" ? "rgba(255,107,53,0.15)" : "rgba(123,104,238,0.15)", color: m.location === "Ev Sahibi" ? "#FF6B35" : "#7B68EE", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{m.location}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {isPast && isCoach && <button onClick={() => startScoreEdit(m)} style={{ background: "rgba(255,210,63,0.1)", border: "1px solid rgba(255,210,63,0.3)", borderRadius: 6, padding: "3px 8px", color: "#FFD23F", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{hasScore ? "✏️" : "Skor Gir"}</button>}
            {isCoach && <button onClick={() => setConfirmDel(m.id)} style={{ background: "none", border: "none", color: "#FF6B6B", cursor: "pointer", fontSize: 12 }}>✕</button>}
          </div>
        </div>
        <h3 style={{ margin: "0 0 4px", fontSize: 18, color: "#F0F0F0" }}>{m.opponent}</h3>
        <div style={{ color: isPast ? "#6B7080" : "#00D4AA", fontSize: 13, fontWeight: 600 }}>🗓 {fmtDate(m.date)} {m.time && `· ⏰ ${m.time}`}</div>
        {hasScore && (
          <div style={{ marginTop: 10, background: won ? "rgba(0,212,170,0.08)" : "rgba(255,107,107,0.08)", border: `1px solid ${won ? "rgba(0,212,170,0.2)" : "rgba(255,107,107,0.2)"}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ color: won ? "#00D4AA" : "#FF6B6B", fontWeight: 900, fontSize: 24 }}>{m.scoreUs}</span>
            <span style={{ color: "#4A4F5C", fontSize: 14 }}>—</span>
            <span style={{ color: won ? "#6B7080" : "#FF6B6B", fontWeight: 900, fontSize: 24 }}>{m.scoreThem}</span>
            <span style={{ color: won ? "#00D4AA" : "#FF6B6B", fontWeight: 700, fontSize: 13, marginLeft: 8 }}>{won ? "GALİBİYET" : m.scoreUs === m.scoreThem ? "BERABERE" : "MAĞLUBİYET"}</span>
          </div>
        )}
        {hasScore && m.setScores && <div style={{ color: "#4A4F5C", fontSize: 11, marginTop: 6, textAlign: "center" }}>Set: {m.setScores}</div>}
        {scoreEdit === m.id && (
          <div style={{ marginTop: 12, background: "rgba(255,210,63,0.05)", border: "1px solid rgba(255,210,63,0.15)", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><label style={LS}>Biz (set)</label><input style={IS} type="number" value={scoreUs} onChange={e => setScoreUs(e.target.value)} placeholder="3" /></div>
              <div><label style={LS}>Rakip (set)</label><input style={IS} type="number" value={scoreThem} onChange={e => setScoreThem(e.target.value)} placeholder="1" /></div>
            </div>
            <div style={{ marginBottom: 10 }}><label style={LS}>Set Skorları (opsiyonel)</label><input style={IS} value={setScores} onChange={e => setSetScores(e.target.value)} placeholder="25-20, 23-25, 25-18, 25-22" /></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleSaveScore(m.id)} style={{ background: "#FFD23F", border: "none", borderRadius: 8, padding: "8px 16px", color: "#111", fontWeight: 700, cursor: "pointer" }}>Kaydet</button>
              <button onClick={() => setScoreEdit(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "#8A8F98", cursor: "pointer" }}>İptal</button>
            </div>
          </div>
        )}
        {m.note && <div style={{ color: "#8A8F98", fontSize: 12, marginTop: 8 }}>📍 {m.note}</div>}
      </div>
    );
  }

  return (<div>
    {confirmDel && <ConfirmModal message="Bu maçı silmek istediğine emin misin?" onConfirm={() => handleDel(confirmDel)} onCancel={() => setConfirmDel(null)} />}
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
      <div><h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: 0 }}>Maç Takvimi</h2><p style={{ color: "#6B7080", marginTop: 4, fontSize: 14 }}>{upcoming.length} yaklaşan · {past.length} geçmiş</p></div>
      {isCoach && <button onClick={() => setShowForm(!showForm)} style={{ background: "rgba(0,212,170,0.15)", border: "1px solid rgba(0,212,170,0.3)", borderRadius: 12, padding: "12px 20px", color: "#00D4AA", fontWeight: 700, cursor: "pointer" }}>{showForm ? "✕ Kapat" : "+ Yeni Maç"}</button>}
    </div>

    {showForm && isCoach && (
      <div style={{ background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={LS}>Rakip *</label><input style={IS} value={opponent} onChange={e => setOpponent(e.target.value)} /></div>
          <div><label style={LS}>Tarih *</label><input style={IS} type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label style={LS}>Saat</label><input style={IS} type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 12, marginBottom: 12 }}>
          <div><label style={LS}>Yer</label><select style={IS} value={location} onChange={e => setLocation(e.target.value)}><option style={OS}>Ev Sahibi</option><option style={OS}>Deplasman</option><option style={OS}>Tarafsız Saha</option></select></div>
          <div><label style={LS}>Salon / Not</label><input style={IS} value={note} onChange={e => setNote(e.target.value)} /></div>
        </div>
        <button onClick={handleAdd} disabled={!opponent || !date} style={{ background: opponent && date ? "#00D4AA" : "#333", border: "none", borderRadius: 10, padding: "10px 24px", color: "#111", fontWeight: 800, cursor: opponent && date ? "pointer" : "not-allowed" }}>Ekle</button>
      </div>
    )}

    {/* Yaklaşan Maçlar */}
    <h3 style={{ fontSize: 15, color: "#00D4AA", margin: "0 0 12px", fontWeight: 700 }}>📅 YAKLAŞAN MAÇLAR ({upcoming.length})</h3>
    {upcoming.length === 0 ? <p style={{ color: "#4A4F5C", textAlign: "center", padding: 20, fontSize: 13 }}>Takvimde yaklaşan maç yok</p> :
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {upcoming.map(m => <MatchCard key={m.id} m={m} isPast={false} />)}
      </div>
    }

    {/* Geçmiş Maçlar */}
    {past.length > 0 && (
      <div>
        <button onClick={() => setShowPast(!showPast)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#8A8F98", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 12, padding: 0 }}>
          <span style={{ transform: showPast ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
          GEÇMİŞ MAÇLAR ({past.length})
          {past.filter(m => m.scoreUs != null).length > 0 && <span style={{ color: "#4A4F5C", fontWeight: 500, fontSize: 12 }}>· {past.filter(m => m.scoreUs != null && m.scoreUs > m.scoreThem).length}G {past.filter(m => m.scoreUs != null && m.scoreUs < m.scoreThem).length}M</span>}
        </button>
        {showPast && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            {past.map(m => <MatchCard key={m.id} m={m} isPast={true} />)}
          </div>
        )}
      </div>
    )}
  </div>);
}

/* ════════ DASHBOARD ════════ */
