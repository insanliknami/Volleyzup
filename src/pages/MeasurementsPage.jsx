import { useState } from "react";
import { MEASUREMENT_TYPES } from "../constants/index";
import { calcAge, calcNavyBF, calcSkinfoldBF, fmtDate, gid } from "../lib/utils";
import ConfirmModal from "../ui/ConfirmModal";
import { BTN, IS, LS } from "../ui/styles";
import { saveData } from "../lib/storage";

export default function MeasurementsPage({ data, setData, profile, profileId, isMobile }) {
  const today = new Date().toISOString().split("T")[0]; const [sel, setSel] = useState("height"); const [val, setVal] = useState(""); const [date, setDate] = useState(today); const mt = MEASUREMENT_TYPES.find(t => t.id === sel); const filtered = data.measurements.filter(m => m.type === sel).sort((a, b) => new Date(b.date) - new Date(a.date)); const manualTypes = MEASUREMENT_TYPES.filter(t => !t.auto);
  const [showBFCalc, setShowBFCalc] = useState(false); const [bfMethod, setBfMethod] = useState("navy");
  const [bfWaist, setBfWaist] = useState(""); const [bfNeck, setBfNeck] = useState(""); const [bfHip, setBfHip] = useState("");
  const [bfS1, setBfS1] = useState(""); const [bfS2, setBfS2] = useState(""); const [bfS3, setBfS3] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);

  const latestHeight = [...data.measurements].filter(m => m.type === "height").sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const latestSpike = [...data.measurements].filter(m => m.type === "spike_reach").sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const latestReach = [...data.measurements].filter(m => m.type === "standing_reach").sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const autoVJ = latestSpike && latestReach ? (latestSpike.value - latestReach.value) : null;

  function handleAdd() {
    if (!val) return;
    const newM = [{ id: gid(), type: sel, value: parseFloat(val), date }];
    // Auto-calc VJ when adding spike_reach or standing_reach
    if (sel === "spike_reach" || sel === "standing_reach") {
      const spike = sel === "spike_reach" ? parseFloat(val) : latestSpike?.value;
      const reach = sel === "standing_reach" ? parseFloat(val) : latestReach?.value;
      if (spike && reach) { newM.push({ id: gid(), type: "vertical_jump", value: Math.round(spike - reach), date, notes: "Otomatik: Smaç − Uzanma" }); }
    }
    const nd = { ...data, measurements: [...data.measurements, ...newM] }; setData(nd); saveData(profileId, nd); setVal("");
  }
  function handleDel(id) { const nd = { ...data, measurements: data.measurements.filter(m => m.id !== id) }; setData(nd); saveData(profileId, nd); setConfirmDel(null); }

  function saveBF() {
    let bf = null; const h = latestHeight?.value; const age = profile.birthDate ? calcAge(profile.birthDate) : null;
    if (bfMethod === "navy") { bf = calcNavyBF(profile.gender, +bfWaist, +bfNeck, h, +bfHip); }
    else { bf = calcSkinfoldBF(profile.gender, age, +bfS1, +bfS2, +bfS3); }
    if (bf && !isNaN(bf) && bf > 0 && bf < 60) {
      const nd = { ...data, measurements: [...data.measurements, { id: gid(), type: "body_fat", value: parseFloat(bf), date: today, notes: `${bfMethod === "navy" ? "U.S. Navy" : "Skinfold"} metodu` }] };
      setData(nd); saveData(profileId, nd);
      setShowBFCalc(false); setBfWaist(""); setBfNeck(""); setBfHip(""); setBfS1(""); setBfS2(""); setBfS3("");
    }
  }

  return (<div>
    {confirmDel && <ConfirmModal message="Bu ölçümü silmek istediğine emin misin?" onConfirm={() => handleDel(confirmDel)} onCancel={() => setConfirmDel(null)} />}
    <h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: "0 0 16px" }}>Ölçümler</h2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
      {manualTypes.map(t => <button key={t.id} onClick={() => setSel(t.id)} style={BTN(sel === t.id, "#FF6B35")}>{t.icon} {t.label}</button>)}
      <button onClick={() => setShowBFCalc(!showBFCalc)} style={{ ...BTN(showBFCalc, "#FF6B9D"), borderStyle: "dashed" }}>📊 Yağ Oranı Hesapla</button>
    </div>

    {/* Auto VJ Display */}
    {autoVJ && (
      <div style={{ background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>⬆️</span>
          <div><div style={{ color: "#00D4AA", fontSize: 13, fontWeight: 700 }}>Dikey Sıçrama (Otomatik)</div><div style={{ color: "#6B7080", fontSize: 11 }}>Smaç ({latestSpike.value}cm) − Uzanma ({latestReach.value}cm)</div></div>
        </div>
        <span style={{ color: "#00D4AA", fontWeight: 900, fontSize: 24 }}>{autoVJ} cm</span>
      </div>
    )}

    {/* Benchmark bar */}
    {mt?.benchmarks && filtered.length > 0 && (() => {
      const latest = filtered[0].value;
      const { beginner: bg, developing: dv, elite: el } = mt.benchmarks;
      const isLower = mt.lower;
      let pct, lvl, lc;
      if (isLower) { pct = Math.max(0, Math.min(100, ((bg - latest) / (bg - el)) * 100)); lvl = latest <= el ? "Elite" : latest <= dv ? "Gelişen" : "Başlangıç"; lc = latest <= el ? "#00D4AA" : latest <= dv ? "#FFD23F" : "#6B7080"; }
      else { pct = Math.max(0, Math.min(100, ((latest - bg) / (el - bg)) * 100)); lvl = latest >= el ? "Elite" : latest >= dv ? "Gelişen" : "Başlangıç"; lc = latest >= el ? "#00D4AA" : latest >= dv ? "#FFD23F" : "#6B7080"; }
      return (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, color: "#8A8F98", fontWeight: 600 }}>SEVİYE</span><span style={{ fontSize: 13, color: lc, fontWeight: 700 }}>{lvl}</span></div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, height: 10, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #FFD23F, #00D4AA)", borderRadius: 8, transition: "width 0.5s" }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "#4A4F5C" }}><span>Başlangıç</span><span>Gelişen</span><span>Elite</span></div>
        </div>
      );
    })()}

    {/* Body Fat Calculator */}
    {showBFCalc && (
      <div style={{ background: "rgba(255,107,157,0.06)", border: "1px solid rgba(255,107,157,0.2)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <h3 style={{ color: "#FF6B9D", margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>📊 Yağ Oranı Hesaplayıcı</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setBfMethod("navy")} style={BTN(bfMethod === "navy", "#FF6B9D")}>🔱 U.S. Navy</button>
          <button onClick={() => setBfMethod("skinfold")} style={BTN(bfMethod === "skinfold", "#FF6B9D")}>📎 Skinfold (Kaliper)</button>
        </div>
        {bfMethod === "navy" ? (
          <div>
            <p style={{ color: "#6B7080", fontSize: 12, margin: "0 0 12px" }}>Çevre ölçümleri ile hesaplama{!latestHeight && <span style={{ color: "#FF6B6B" }}> — Önce boy kaydı gerekli!</span>}</p>
            <div style={{ display: "grid", gridTemplateColumns: profile.gender === "kadın" ? "1fr 1fr 1fr" : "1fr 1fr", gap: 12 }}>
              <div><label style={LS}>Bel çevresi (cm)</label><input style={IS} type="number" step="0.1" value={bfWaist} onChange={e => setBfWaist(e.target.value)} /></div>
              <div><label style={LS}>Boyun çevresi (cm)</label><input style={IS} type="number" step="0.1" value={bfNeck} onChange={e => setBfNeck(e.target.value)} /></div>
              {profile.gender === "kadın" && <div><label style={LS}>Kalça çevresi (cm)</label><input style={IS} type="number" step="0.1" value={bfHip} onChange={e => setBfHip(e.target.value)} /></div>}
            </div>
            {latestHeight && <p style={{ color: "#4A4F5C", fontSize: 11, marginTop: 8 }}>Boy: {latestHeight.value} cm (kayıtlı)</p>}
          </div>
        ) : (
          <div>
            <p style={{ color: "#6B7080", fontSize: 12, margin: "0 0 12px" }}>3 bölge deri kıvrımı (mm) — {profile.gender === "erkek" ? "Göğüs, Karın, Uyluk" : "Triceps, Suprailiac, Uyluk"}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><label style={LS}>{profile.gender === "erkek" ? "Göğüs (mm)" : "Triceps (mm)"}</label><input style={IS} type="number" value={bfS1} onChange={e => setBfS1(e.target.value)} /></div>
              <div><label style={LS}>{profile.gender === "erkek" ? "Karın (mm)" : "Suprailiac (mm)"}</label><input style={IS} type="number" value={bfS2} onChange={e => setBfS2(e.target.value)} /></div>
              <div><label style={LS}>Uyluk (mm)</label><input style={IS} type="number" value={bfS3} onChange={e => setBfS3(e.target.value)} /></div>
            </div>
          </div>
        )}
        <button onClick={saveBF} style={{ background: "#FF6B9D", border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", fontWeight: 700, cursor: "pointer", marginTop: 14 }}>Hesapla & Kaydet</button>
      </div>
    )}

    {!mt?.auto && (<div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20, marginBottom: 20 }}><div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr auto", gap: 12, alignItems: "end" }}><div><label style={LS}>Değer ({mt?.unit})</label><input style={IS} type="number" step="0.1" value={val} onChange={e => setVal(e.target.value)} /></div><div><label style={LS}>Tarih</label><input style={IS} type="date" value={date} onChange={e => setDate(e.target.value)} /></div><button onClick={handleAdd} disabled={!val} style={{ background: val ? "#FF6B35" : "#333", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontWeight: 700, height: 42, cursor: val ? "pointer" : "not-allowed", gridColumn: isMobile ? "span 2" : "auto" }}>Kaydet</button></div>
      {(sel === "spike_reach" || sel === "standing_reach") && <p style={{ color: "#4A4F5C", fontSize: 11, marginTop: 8 }}>💡 Smaç ve Uzanma yüksekliği girildiğinde Dikey Sıçrama otomatik hesaplanır</p>}
    </div>)}
    {filtered.length === 0 ? <p style={{ color: "#4A4F5C" }}>Kayıt yok</p> : filtered.map(m => (<div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 6 }}><div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}><span style={{ color: "#FF6B35", fontWeight: 800, fontSize: 20 }}>{m.value} <span style={{ fontSize: 13, color: "#6B7080" }}>{mt?.unit}</span></span><span style={{ color: "#6B7080", fontSize: 13 }}>{fmtDate(m.date)}</span>{m.notes && <span style={{ color: "#4A4F5C", fontSize: 12 }}>— {m.notes}</span>}</div>{!mt?.auto && <button onClick={() => setConfirmDel(m.id)} style={{ background: "none", border: "none", color: "#4A4F5C", cursor: "pointer" }}>✕</button>}</div>))}
  </div>);
}

/* ════════ SAKATLIK GEÇMİŞİ ════════ */
