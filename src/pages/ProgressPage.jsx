import { useState } from "react";
import { CATEGORIES, MEASUREMENT_TYPES } from "../constants/index";
import { fmtShort } from "../lib/utils";
import { BTN } from "../ui/styles";

export default function ProgressPage({ data, isMobile }) {
  const [sel, setSel] = useState("vertical_jump");
  const COLORS = ["#FF6B35", "#00D4AA", "#7B68EE", "#FFD23F", "#FF6B9D", "#4ECDC4", "#45B7D1", "#96CEB4", "#E84855", "#FF9F1C", "#9C27B0", "#00BCD4"];
  const mt = MEASUREMENT_TYPES.find(t => t.id === sel);
  const mData = data.measurements.filter(m => m.type === sel).sort((a, b) => new Date(a.date) - new Date(b.date)).map(m => ({ date: fmtShort(m.date), value: m.value }));

  // Personal bests
  const pbs = {};
  MEASUREMENT_TYPES.forEach(t => { const vs = data.measurements.filter(m => m.type === t.id); if (vs.length > 0) { pbs[t.id] = t.lower ? vs.reduce((a, b) => a.value < b.value ? a : b) : vs.reduce((a, b) => a.value > b.value ? a : b); } });

  // Category breakdown
  const catCounts = {};
  data.sessions.forEach(s => s.exercises?.forEach(ex => { catCounts[ex.category] = (catCounts[ex.category] || 0) + 1; }));

  // Weekly volume
  const weekMap = {};
  data.sessions.forEach(s => { const d = new Date(s.date); const ws = new Date(d); ws.setDate(d.getDate() - d.getDay() + 1); const k = ws.toISOString().split("T")[0]; if (!weekMap[k]) weekMap[k] = { exercises: 0, sessions: 0 }; weekMap[k].sessions++; weekMap[k].exercises += s.exercises?.length || 0; });
  const weekData = Object.entries(weekMap).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([k, v]) => ({ week: fmtShort(k), ...v }));

  return (<div>
    <h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: "0 0 24px" }}>Gelişim Analizi</h2>

    {/* Personal Bests */}
    {Object.keys(pbs).length > 0 && (
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, color: "#FFD23F", margin: "0 0 16px", fontWeight: 700 }}>🏆 KİŞİSEL REKORLAR</h3>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? "100px" : "120px"}, 1fr))`, gap: 10 }}>
          {Object.entries(pbs).map(([tid, m]) => { const t = MEASUREMENT_TYPES.find(x => x.id === tid); return (
            <div key={tid} style={{ background: "rgba(255,210,63,0.05)", border: "1px solid rgba(255,210,63,0.15)", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{t?.icon}</div>
              <div style={{ color: "#FFD23F", fontWeight: 800, fontSize: 18 }}>{m.value}<span style={{ fontSize: 10, fontWeight: 500 }}> {t?.unit}</span></div>
              <div style={{ color: "#6B7080", fontSize: 10 }}>{t?.label}</div>
            </div>
          ); })}
        </div>
      </div>
    )}

    {/* Measurement chart */}
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 24 }}>
      <h3 style={{ fontSize: 15, color: "#8A8F98", margin: "0 0 16px", fontWeight: 600 }}>ÖLÇÜM GELİŞİMİ</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>{MEASUREMENT_TYPES.map((t, i) => <button key={t.id} onClick={() => setSel(t.id)} style={BTN(sel === t.id, COLORS[i % COLORS.length])}>{t.icon} {t.label}</button>)}</div>
      {mData.length < 2 ? <p style={{ color: "#4A4F5C", textAlign: "center" }}>En az 2 kayıt gerekli</p> : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={mData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#6B7080", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6B7080", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
            <Tooltip contentStyle={{ background: "#1A1D24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0F0" }} formatter={v => [`${v} ${mt?.unit}`, mt?.label]} />
            <Line type="monotone" dataKey="value" stroke="#FF6B35" strokeWidth={2.5} dot={{ r: 5, fill: "#FF6B35", stroke: "#111318", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>

    {/* Weekly Volume */}
    {weekData.length > 0 && (
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, color: "#8A8F98", margin: "0 0 16px", fontWeight: 600 }}>HAFTALIK ANTRENMAN HACMİ</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weekData}>
            <defs><linearGradient id="sG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7B68EE" stopOpacity={0.3} /><stop offset="100%" stopColor="#7B68EE" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fill: "#6B7080", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6B7080", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1A1D24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0F0" }} />
            <Area type="monotone" dataKey="sessions" name="Seans" stroke="#7B68EE" strokeWidth={2} fill="url(#sG)" dot={{ r: 3, fill: "#7B68EE", stroke: "#111318", strokeWidth: 2 }} />
            <Area type="monotone" dataKey="exercises" name="Egzersiz" stroke="#00D4AA" strokeWidth={2} fill="none" dot={{ r: 3, fill: "#00D4AA", stroke: "#111318", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}

    {/* Category Distribution */}
    {Object.keys(catCounts).length > 0 && (
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: isMobile ? 16 : 24 }}>
        <h3 style={{ fontSize: 15, color: "#8A8F98", margin: "0 0 16px", fontWeight: 600 }}>KATEGORİ DAĞILIMI</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cid, cnt]) => { const cat = CATEGORIES.find(c => c.id === cid); const total = Object.values(catCounts).reduce((a, b) => a + b, 0); return (
            <div key={cid} style={{ flex: `1 1 ${isMobile ? "80px" : "100px"}`, background: `${cat?.color || "#666"}10`, border: `1px solid ${cat?.color || "#666"}30`, borderRadius: 12, padding: isMobile ? 10 : 14, textAlign: "center" }}>
              <div style={{ color: cat?.color, fontWeight: 800, fontSize: isMobile ? 18 : 22 }}>{((cnt / total) * 100).toFixed(0)}%</div>
              <div style={{ color: "#8A8F98", fontSize: 11, marginTop: 2 }}>{cat?.label}</div>
              <div style={{ color: "#4A4F5C", fontSize: 10 }}>{cnt} egzersiz</div>
            </div>
          ); })}
        </div>
      </div>
    )}
  </div>);
}

/* ════════ ANA UYGULAMA ════════ */
