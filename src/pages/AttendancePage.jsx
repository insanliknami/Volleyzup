import { useState, useEffect } from "react";
import { ATT_STATES, ATT_CYCLE, teamDisplayName } from "../constants/index";
import { IS, LS, BTN } from "../ui/styles";
import { fmtDate } from "../lib/utils";
import { loadAttendance, saveAttendance, deleteAttendance, loadAttendanceIndex } from "../lib/storage";
import ConfirmModal from "../ui/ConfirmModal";

const today = () => new Date().toISOString().slice(0, 10);
const stOf = id => ATT_STATES.find(s => s.id === id);

export default function AttendancePage({ team, profiles, isMobile, initialDate }) {
  const [date, setDate] = useState(initialDate || today());
  const [marks, setMarks] = useState({});
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [saved, setSaved] = useState(false);

  const roster = (team?.players || [])
    .map(pid => profiles.find(p => p.id === pid))
    .filter(Boolean);

  useEffect(() => {
    if (!team) return;
    const rec = loadAttendance(team.id, date);
    setMarks(rec?.marks || {});
    setNote(rec?.note || "");
    setSaved(!!rec);
    setHistory(loadAttendanceIndex(team.id));
  }, [team?.id, date]);

  if (!team) return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: "0 0 8px" }}>Yoklama</h2>
      <p style={{ color: "#6B7080", fontSize: 14 }}>
        Önce bir takım seç. Üst şeritteki takım menüsünden takım oluşturabilirsin.
      </p>
    </div>
  );

  /* Her dokunuş durumu bir sonrakine çevirir; başlangıçta hiçbiri işaretli değil */
  function cycle(pid) {
    const cur = marks[pid];
    const i = cur ? ATT_CYCLE.indexOf(cur) : -1;
    const next = ATT_CYCLE[(i + 1) % ATT_CYCLE.length];
    const nm = { ...marks, [pid]: next };
    setMarks(nm); setSaved(false);
  }
  function setAll(id) { const nm = {}; roster.forEach(p => { nm[p.id] = id; }); setMarks(nm); setSaved(false); }
  function clearAll() { setMarks({}); setSaved(false); }

  function save() {
    saveAttendance(team.id, date, { date, marks, note, teamId: team.id, savedAt: Date.now() });
    setHistory(loadAttendanceIndex(team.id));
    setSaved(true);
  }
  function removeDay(d) {
    deleteAttendance(team.id, d);
    setHistory(loadAttendanceIndex(team.id));
    if (d === date) { setMarks({}); setNote(""); setSaved(false); }
    setConfirm(null);
  }

  const counts = {};
  ATT_STATES.forEach(s => { counts[s.id] = roster.filter(p => marks[p.id] === s.id).length; });
  const marked = roster.filter(p => marks[p.id]).length;
  const missing = roster.length - marked;

  return (
    <div>
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}

      <h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: "0 0 4px" }}>Yoklama</h2>
      <p style={{ color: "#6B7080", fontSize: 14, marginBottom: 16 }}>
        {teamDisplayName(team)}{team.name ? ` · ${team.name}` : ""} · {roster.length} oyuncu
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>
        <div style={{ maxWidth: 190 }}>
          <label style={LS}>Tarih</label>
          <input type="date" style={IS} value={date} max={today()} onChange={e => setDate(e.target.value)} />
        </div>
        <button onClick={() => setDate(today())} style={BTN(date === today())}>Bugün</button>
        <button onClick={() => setAll("present")} style={BTN(false, "#00D4AA")}>Hepsi geldi</button>
        <button onClick={clearAll} style={BTN(false, "#6B7080")}>Temizle</button>
      </div>

      {roster.length === 0 ? (
        <p style={{ color: "#4A4F5C", fontSize: 13 }}>
          Bu takımın kadrosu boş. Üst şeritteki takım menüsünden “Takımları yönet” ile oyuncu ekle.
        </p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {ATT_STATES.map(s => (
              <div key={s.id} style={{ background: `${s.color}14`, border: `1px solid ${s.color}35`,
                borderRadius: 10, padding: "8px 14px", minWidth: 78 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{counts[s.id]}</div>
                <div style={{ fontSize: 11, color: "#8A8F98" }}>{s.label}</div>
              </div>
            ))}
            {missing > 0 && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)",
                borderRadius: 10, padding: "8px 14px", minWidth: 78 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#6B7080" }}>{missing}</div>
                <div style={{ fontSize: 11, color: "#6B7080" }}>İşaretsiz</div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 6, marginBottom: 16 }}>
            {roster.map(p => {
              const st = stOf(marks[p.id]);
              return (
                <button key={p.id} onClick={() => cycle(p.id)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  background: st ? `${st.color}14` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${st ? `${st.color}45` : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12, padding: "12px 14px", cursor: "pointer", textAlign: "left",
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  <div>
                    <div style={{ color: "#F0F0F0", fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: "#6B7080", fontSize: 11 }}>{p.position}</div>
                  </div>
                  <span style={{
                    minWidth: 62, textAlign: "center", padding: "5px 10px", borderRadius: 8,
                    background: st ? `${st.color}22` : "rgba(255,255,255,0.04)",
                    color: st ? st.color : "#4A4F5C", fontSize: 11, fontWeight: 700
                  }}>{st ? st.label : "—"}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LS}>Not</label>
            <input style={IS} placeholder="Antrenman notu (isteğe bağlı)"
              value={note} onChange={e => { setNote(e.target.value); setSaved(false); }} />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 28 }}>
            <button onClick={save} disabled={marked === 0} style={{
              background: marked === 0 ? "rgba(255,255,255,0.05)" : "#FF6B35",
              border: "none", borderRadius: 10, padding: "11px 22px",
              color: marked === 0 ? "#4A4F5C" : "#fff", fontSize: 14, fontWeight: 700,
              cursor: marked === 0 ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif"
            }}>Kaydet</button>
            {saved && <span style={{ color: "#00D4AA", fontSize: 12, fontWeight: 600 }}>Kaydedildi</span>}
            {!saved && marked > 0 && <span style={{ color: "#FFD23F", fontSize: 12 }}>Kaydedilmedi</span>}
          </div>
        </>
      )}

      {history.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, color: "#8A8F98", margin: "0 0 10px", letterSpacing: "0.05em" }}>
            GEÇMİŞ ({history.length})
          </h3>
          {history.slice(0, 30).map(d => {
            const rec = loadAttendance(team.id, d);
            const m = rec?.marks || {};
            const pres = Object.values(m).filter(v => v === "present" || v === "late").length;
            const tot = Object.keys(m).length;
            return (
              <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                background: d === date ? "rgba(255,107,53,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${d === date ? "rgba(255,107,53,0.25)" : "rgba(255,255,255,0.05)"}`,
                borderRadius: 10, padding: "10px 14px", marginBottom: 5 }}>
                <button onClick={() => setDate(d)} style={{ background: "none", border: "none", padding: 0,
                  cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>
                  <div style={{ color: "#F0F0F0", fontSize: 13, fontWeight: 600 }}>{fmtDate(d)}</div>
                  <div style={{ color: "#6B7080", fontSize: 11 }}>
                    {tot ? `${pres}/${tot} katıldı` : "boş"}{rec?.note ? ` · ${rec.note}` : ""}
                  </div>
                </button>
                <button onClick={() => setConfirm({
                  title: "Yoklama silinsin mi?",
                  message: `${fmtDate(d)} tarihli yoklama kaydı silinecek.`,
                  onConfirm: () => removeDay(d)
                })} style={{ background: "none", border: "none", color: "#4A4F5C", fontSize: 16,
                  cursor: "pointer", padding: "0 4px" }}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
