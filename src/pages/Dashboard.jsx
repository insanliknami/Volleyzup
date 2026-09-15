import { useState } from "react";
import { LogoImg } from "../constants/logo";
import { calcAge, fmtDate, fmtShort, gid } from "../lib/utils";
import ConfirmModal from "../ui/ConfirmModal";
import StatCard from "../ui/StatCard";
import { IS, LS, OS } from "../ui/styles";
import { loadAttendance } from "../lib/storage";
import { ATT_STATES, teamDisplayName } from "../constants/index";

export default function Dashboard({ data, profile, isMobile, announcements, setAnnouncements, team, profiles = [], onOpenAttendance }) {
  const [showAnnForm, setShowAnnForm] = useState(false); const [annTitle, setAnnTitle] = useState(""); const [annContent, setAnnContent] = useState(""); const [annDuration, setAnnDuration] = useState("3");
  const [confirmDelAnn, setConfirmDelAnn] = useState(null);
  const isCoach = profile.position === "Antrenör"; const totalEx = data.sessions.reduce((s, x) => s + (x.exercises?.length || 0), 0); const last7 = data.sessions.filter(s => (Date.now() - new Date(s.date)) / 864e5 <= 7).length; const recent = [...data.sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); const vj = data.measurements.filter(m => m.type === "vertical_jump").sort((a, b) => new Date(a.date) - new Date(b.date));

  // Filter expired announcements
  const activeAnn = announcements.filter(a => {
    if (!a.expiresAt) return true;
    return new Date(a.expiresAt) > new Date();
  });

  function handleAddAnn() {
    if (!annTitle) return;
    const durationDays = { "1": 1, "2": 2, "3": 3, "7": 7 }[annDuration] || 3;
    const expiresAt = new Date(Date.now() + durationDays * 864e5).toISOString();
    const na = [{ id: gid(), title: annTitle, content: annContent, date: new Date().toISOString(), createdBy: profile.name, expiresAt }, ...announcements];
    setAnnouncements(na); setShowAnnForm(false); setAnnTitle(""); setAnnContent("");
  }
  function handleDelAnn(id) { const na = announcements.filter(a => a.id !== id); setAnnouncements(na); setConfirmDelAnn(null); }
  return (<div>{team && (() => {
    const d = new Date().toISOString().slice(0, 10);
    const rec = loadAttendance(team.id, d);
    const roster = (team.players || []).length;
    const marks = rec && rec.marks ? rec.marks : null;
    const pres = marks ? Object.values(marks).filter(v => v === "present" || v === "late").length : 0;
    const done = marks ? Object.keys(marks).length : 0;
    return (<div style={{ background: rec ? "rgba(0,212,170,0.06)" : "rgba(255,107,53,0.06)", border: `1px solid ${rec ? "rgba(0,212,170,0.25)" : "rgba(255,107,53,0.25)"}`, borderRadius: 14, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <div>
        <div style={{ color: "#F0F0F0", fontSize: 15, fontWeight: 700 }}>Bugünün yoklaması</div>
        <div style={{ color: "#6B7080", fontSize: 12, marginTop: 2 }}>
          {teamDisplayName(team)} · {rec ? `${pres}/${done} katıldı` : `${roster} oyuncu · henüz alınmadı`}
        </div>
      </div>
      <button onClick={onOpenAttendance} style={{ background: rec ? "rgba(255,255,255,0.06)" : "#FF6B35", border: "none", borderRadius: 10, padding: "10px 20px", color: rec ? "#8A8F98" : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{rec ? "Görüntüle" : "Yoklama al"}</button>
    </div>);
  })()}
    {confirmDelAnn && <ConfirmModal message="Bu duyuruyu silmek istediğine emin misin?" onConfirm={() => handleDelAnn(confirmDelAnn)} onCancel={() => setConfirmDelAnn(null)} />}
    <div style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(123,104,238,0.06))", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 20, padding: isMobile ? 20 : "28px 32px", marginBottom: 28, display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 14, color: "#8A8F98" }}>Hoş geldin,</div><h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 900, color: "#F0F0F0", margin: 0 }}>{profile.name}</h2><div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}><span style={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#FF6B35", fontWeight: 600 }}>{profile.position}</span>{profile.birthDate && <span style={{ background: "rgba(123,104,238,0.12)", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#7B68EE", fontWeight: 600 }}>{calcAge(profile.birthDate)} yaş</span>}</div></div>{!isMobile && <div style={{ opacity: 0.25 }}><LogoImg size={80} /></div>}</div>
    <div style={{ marginBottom: 32 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontSize: 16, color: "#FFD23F", margin: 0, fontWeight: 700 }}>📢 Duyurular</h3>{isCoach && <button onClick={() => setShowAnnForm(!showAnnForm)} style={{ background: "transparent", border: "1px solid #FFD23F", color: "#FFD23F", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{showAnnForm ? "İptal" : "+ Yeni"}</button>}</div>{showAnnForm && isCoach && (<div style={{ background: "rgba(255,210,63,0.05)", border: "1px dashed rgba(255,210,63,0.3)", borderRadius: 12, padding: 16, marginBottom: 16 }}><div style={{ marginBottom: 10 }}><label style={LS}>Başlık *</label><input style={IS} value={annTitle} onChange={e => setAnnTitle(e.target.value)} /></div><div style={{ marginBottom: 10 }}><label style={LS}>İçerik</label><textarea style={{...IS, minHeight: 60}} value={annContent} onChange={e => setAnnContent(e.target.value)} /></div><div style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}><div><label style={LS}>Süre</label><select style={{...IS, width: "auto"}} value={annDuration} onChange={e => setAnnDuration(e.target.value)}><option value="1" style={OS}>1 Gün</option><option value="2" style={OS}>2 Gün</option><option value="3" style={OS}>3 Gün</option><option value="7" style={OS}>1 Hafta</option></select></div><button onClick={handleAddAnn} disabled={!annTitle} style={{ background: annTitle ? "#FFD23F" : "#333", color: "#111", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 800, cursor: annTitle ? "pointer" : "not-allowed" }}>Yayınla</button></div></div>)}{activeAnn.length === 0 ? <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 16, textAlign: "center", color: "#6B7080", fontSize: 13 }}>Aktif duyuru yok.</div> : activeAnn.map(a => { const remaining = a.expiresAt ? Math.max(0, Math.ceil((new Date(a.expiresAt) - new Date()) / 864e5)) : null; return (<div key={a.id} style={{ background: "rgba(255,210,63,0.08)", borderLeft: "3px solid #FFD23F", borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}><div><div style={{ color: "#F0F0F0", fontWeight: 700, fontSize: 14 }}>{a.title}</div>{a.content && <div style={{ color: "#E0E0E0", fontSize: 13, marginTop: 4 }}>{a.content}</div>}<div style={{ color: "#8A8F98", fontSize: 11, marginTop: 4, display: "flex", gap: 8 }}><span>{a.createdBy} · {fmtShort(a.date)}</span>{remaining != null && <span style={{ color: remaining <= 1 ? "#FF6B6B" : "#FFD23F" }}>⏳ {remaining} gün kaldı</span>}</div></div>{isCoach && <button onClick={() => setConfirmDelAnn(a.id)} style={{ background: "none", border: "none", color: "#FF6B6B", cursor: "pointer", fontSize: 14 }}>✕</button>}</div>); })}</div>
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(170px, 1fr))", gap: 16, marginBottom: 28 }}><StatCard label="Antrenman" value={data.sessions.length} accent="#FF6B35" /><StatCard label="Bu Hafta" value={last7} unit="seans" accent="#00D4AA" /><StatCard label="Egzersiz" value={totalEx} accent="#7B68EE" /><StatCard label="Hedefler" value={data.goals?.length || 0} accent="#FFD23F" /></div>

    {/* Aktif sakatlık uyarısı */}
    {(data.injuries || []).filter(i => !i.endDate).length > 0 && (
      <div style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 14 }}>Aktif Sakatlık ({(data.injuries || []).filter(i => !i.endDate).length})</div>
          <div style={{ color: "#8A8F98", fontSize: 12, marginTop: 2 }}>{(data.injuries || []).filter(i => !i.endDate).map(i => `${i.side} ${i.region}`).join(" · ")}</div>
        </div>
      </div>
    )}
    {vj.length > 1 && (<div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 24 }}><h3 style={{ fontSize: 15, color: "#8A8F98", margin: "0 0 16px" }}>DİKEY SIÇRAMA</h3><ResponsiveContainer width="100%" height={200}><AreaChart data={vj.map(m => ({ date: fmtShort(m.date), value: m.value }))}><defs><linearGradient id="vjG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF6B35" stopOpacity={0.3} /><stop offset="100%" stopColor="#FF6B35" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: "#6B7080", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#6B7080", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin-2", "dataMax+2"]} /><Tooltip contentStyle={{ background: "#1A1D24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#F0F0F0" }} formatter={v => [`${v} cm`, "Sıçrama"]} /><Area type="monotone" dataKey="value" stroke="#FF6B35" strokeWidth={2.5} fill="url(#vjG)" dot={{ r: 4, fill: "#FF6B35", stroke: "#111318", strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div>)}
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}><h3 style={{ fontSize: 15, color: "#8A8F98", margin: "0 0 16px" }}>SON ANTRENMANLAR</h3>{recent.length === 0 ? <p style={{ color: "#4A4F5C" }}>Kayıt yok</p> : recent.map(s => (<div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><div><div style={{ color: "#E0E0E0", fontSize: 14, fontWeight: 600 }}>{s.title}</div><div style={{ color: "#6B7080", fontSize: 12 }}>{s.exercises?.length || 0} egzersiz</div></div><div style={{ color: "#6B7080", fontSize: 12 }}>{fmtDate(s.date)}</div></div>))}</div></div>
  </div>);
}

/* ════════ GÖREV PANOSU ════════ */
