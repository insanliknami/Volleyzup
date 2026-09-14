import { useState } from "react";
import { INJURY_REGIONS, INJURY_SEVERITY, INJURY_TYPES } from "../constants/index";
import { fmtDate, gid } from "../lib/utils";
import ConfirmModal from "../ui/ConfirmModal";
import { IS, LS, OS } from "../ui/styles";
import { saveData } from "../lib/storage";

export default function InjuryPage({ data, setData, profileId, isMobile }) {
  const [showForm, setShowForm] = useState(false);
  const [region, setRegion] = useState(INJURY_REGIONS[0]); const [type, setType] = useState(INJURY_TYPES[0]); const [severity, setSeverity] = useState("orta");
  const [side, setSide] = useState("Sol"); const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]); const [endDate, setEndDate] = useState(""); const [treatment, setTreatment] = useState(""); const [restrictions, setRestrictions] = useState(""); const [note, setNote] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const injuries = data.injuries || [];

  function handleAdd() {
    if (!region) return;
    const ni = { id: gid(), region, type, severity, side, startDate, endDate: endDate || null, treatment, restrictions, note, createdAt: new Date().toISOString() };
    const nd = { ...data, injuries: [...injuries, ni] }; setData(nd); saveData(profileId, nd);
    setShowForm(false); setTreatment(""); setRestrictions(""); setNote(""); setEndDate("");
  }
  function handleDel(id) { const nd = { ...data, injuries: injuries.filter(i => i.id !== id) }; setData(nd); saveData(profileId, nd); setConfirmDel(null); }
  function markRecovered(id) { const nd = { ...data, injuries: injuries.map(i => i.id === id ? { ...i, endDate: new Date().toISOString().split("T")[0] } : i) }; setData(nd); saveData(profileId, nd); }

  const active = injuries.filter(i => !i.endDate);
  const past = injuries.filter(i => i.endDate).sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  return (<div>
    {confirmDel && <ConfirmModal message="Bu sakatlık kaydını silmek istediğine emin misin?" onConfirm={() => handleDel(confirmDel)} onCancel={() => setConfirmDel(null)} />}
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
      <div><h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: 0 }}>Sakatlık Geçmişi</h2><p style={{ color: "#6B7080", marginTop: 4, fontSize: 14 }}>{active.length} aktif · {past.length} geçmiş</p></div>
      <button onClick={() => setShowForm(!showForm)} style={{ background: "rgba(255,107,107,0.15)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, padding: "12px 20px", color: "#FF6B6B", fontWeight: 700, cursor: "pointer" }}>{showForm ? "✕ İptal" : "🩹 Sakatlık Kaydet"}</button>
    </div>

    {showForm && (
      <div style={{ background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={LS}>Bölge *</label><select style={IS} value={region} onChange={e => setRegion(e.target.value)}>{INJURY_REGIONS.map(r => <option key={r} style={OS}>{r}</option>)}</select></div>
          <div><label style={LS}>Tip</label><select style={IS} value={type} onChange={e => setType(e.target.value)}>{INJURY_TYPES.map(t => <option key={t} style={OS}>{t}</option>)}</select></div>
          <div><label style={LS}>Taraf</label><select style={IS} value={side} onChange={e => setSide(e.target.value)}><option style={OS}>Sol</option><option style={OS}>Sağ</option><option style={OS}>Her İkisi</option><option style={OS}>Merkez</option></select></div>
          <div><label style={LS}>Şiddet</label><select style={IS} value={severity} onChange={e => setSeverity(e.target.value)}>{INJURY_SEVERITY.map(s => <option key={s.id} value={s.id} style={OS}>{s.label} ({s.desc})</option>)}</select></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={LS}>Başlangıç Tarihi *</label><input style={IS} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div><label style={LS}>İyileşme Tarihi (opsiyonel)</label><input style={IS} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={LS}>Tedavi / Rehabilitasyon</label><input style={IS} value={treatment} onChange={e => setTreatment(e.target.value)} placeholder="Örn: Fizik tedavi, buz, bandaj..." /></div>
          <div><label style={LS}>Antrenman Kısıtlamaları</label><input style={IS} value={restrictions} onChange={e => setRestrictions(e.target.value)} placeholder="Örn: Sıçrama yasak, hafif koşu OK..." /></div>
        </div>
        <div style={{ marginBottom: 12 }}><label style={LS}>Ek Notlar</label><textarea style={{ ...IS, minHeight: 50 }} value={note} onChange={e => setNote(e.target.value)} /></div>
        <button onClick={handleAdd} style={{ background: "#FF6B6B", border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Kaydet</button>
      </div>
    )}

    {/* Active injuries */}
    {active.length > 0 && (
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 15, color: "#FF6B6B", margin: "0 0 12px", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>⚠️ AKTİF SAKATLIKLAR ({active.length})</h3>
        {active.map(inj => {
          const sev = INJURY_SEVERITY.find(s => s.id === inj.severity);
          const days = Math.floor((Date.now() - new Date(inj.startDate)) / 864e5);
          return (
            <div key={inj.id} style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 14, padding: isMobile ? 16 : 20, marginBottom: 10, borderLeft: `4px solid ${sev?.color || "#FF6B6B"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: "#F0F0F0", fontSize: 18, fontWeight: 800 }}>{inj.side} {inj.region}</span>
                    <span style={{ background: `${sev?.color}20`, color: sev?.color, padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{sev?.label}</span>
                    <span style={{ background: "rgba(255,107,107,0.15)", color: "#FF6B6B", padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{days} gün</span>
                  </div>
                  <div style={{ color: "#8A8F98", fontSize: 13, marginTop: 4 }}>{inj.type} · {fmtDate(inj.startDate)}</div>
                  {inj.treatment && <div style={{ color: "#00D4AA", fontSize: 12, marginTop: 6 }}>💊 {inj.treatment}</div>}
                  {inj.restrictions && <div style={{ color: "#FFD23F", fontSize: 12, marginTop: 4 }}>⛔ {inj.restrictions}</div>}
                  {inj.note && <div style={{ color: "#6B7080", fontSize: 12, marginTop: 4 }}>📝 {inj.note}</div>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => markRecovered(inj.id)} style={{ background: "rgba(0,212,170,0.15)", border: "1px solid rgba(0,212,170,0.3)", borderRadius: 8, padding: "6px 14px", color: "#00D4AA", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✅ İyileşti</button>
                  <button onClick={() => setConfirmDel(inj.id)} style={{ background: "none", border: "none", color: "#6B7080", cursor: "pointer" }}>✕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* Past injuries */}
    <h3 style={{ fontSize: 15, color: "#8A8F98", margin: "0 0 12px", fontWeight: 600 }}>GEÇMİŞ SAKATLIKLAR ({past.length})</h3>
    {past.length === 0 ? <p style={{ color: "#4A4F5C", textAlign: "center", padding: 20 }}>Geçmiş sakatlık kaydı yok</p> :
      past.map(inj => {
        const sev = INJURY_SEVERITY.find(s => s.id === inj.severity);
        const days = Math.floor((new Date(inj.endDate) - new Date(inj.startDate)) / 864e5);
        return (
          <div key={inj.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 18px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.8 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>{inj.side} {inj.region}</span>
                <span style={{ color: sev?.color, fontSize: 11, fontWeight: 600 }}>{inj.type}</span>
                <span style={{ color: "#4A4F5C", fontSize: 11 }}>· {days} gün sürdü</span>
              </div>
              <div style={{ color: "#6B7080", fontSize: 12, marginTop: 2 }}>{fmtDate(inj.startDate)} → {fmtDate(inj.endDate)}</div>
              {inj.treatment && <div style={{ color: "#4A4F5C", fontSize: 11, marginTop: 2 }}>💊 {inj.treatment}</div>}
            </div>
            <button onClick={() => setConfirmDel(inj.id)} style={{ background: "none", border: "none", color: "#4A4F5C", cursor: "pointer" }}>✕</button>
          </div>
        );
      })
    }
  </div>);
}

/* ════════ GELİŞİM ════════ */
