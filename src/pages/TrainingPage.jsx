import { useState } from "react";
import { EXERCISE_LIBRARY } from "../constants/exercises";
import { CATEGORIES, LEVEL_COLORS, LEVEL_LABELS } from "../constants/index";
import { fmtDate, gid } from "../lib/utils";
import ConfirmModal from "../ui/ConfirmModal";
import { BTN, IS, LS, OS } from "../ui/styles";
import { saveData } from "../lib/storage";

export default function TrainingPage({ data, setData, profileId, isMobile }) {
  const [view, setView] = useState("list"); const [edit, setEdit] = useState(null); const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState(""); const [date, setDate] = useState(today); const [notes, setNotes] = useState(""); const [exercises, setExercises] = useState([]);
  const [expandedEx, setExpandedEx] = useState(null);
  const [showPicker, setShowPicker] = useState(false); const [pickerCat, setPickerCat] = useState("all"); const [pickerSearch, setPickerSearch] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [exN, setExN] = useState(""); const [exC, setExC] = useState("strength"); const [exS, setExS] = useState(""); const [exR, setExR] = useState(""); const [exW, setExW] = useState(""); const [exD, setExD] = useState(""); const [exNo, setExNo] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [listSearch, setListSearch] = useState(""); const [listFilter, setListFilter] = useState("all");

  function startEdit(s) { setEdit(s); setTitle(s.title); setDate(s.date); setNotes(s.notes || ""); setExercises(s.exercises || []); setView("form"); }
  function startNew() { setEdit(null); setTitle(""); setDate(today); setNotes(""); setExercises([]); setView("form"); }
  function copySession(s) { const copied = { ...s, id: gid(), title: s.title + " (Kopya)", date: today, exercises: s.exercises?.map(e => ({ ...e, id: gid() })) || [] }; const nd = { ...data, sessions: [...data.sessions, copied] }; setData(nd); saveData(profileId, nd); }
  function addFromLib(libEx) { setExercises([...exercises, { id: gid(), name: libEx.name, category: libEx.category, level: libEx.level, sets: libEx.defSets || null, reps: libEx.defReps || null, weight: null, duration: libEx.defDuration || null, notes: libEx.desc, videoLink: libEx.videoLink }]); }
  function addManual() { if (!exN) return; setExercises([...exercises, { id: gid(), name: exN, category: exC, sets: exS ? +exS : null, reps: exR || null, weight: exW ? +exW : null, duration: exD || null, notes: exNo }]); setExN(""); setExS(""); setExR(""); setExW(""); setExD(""); setExNo(""); setShowManual(false); }
  function updateEx(id, field, val) { setExercises(exercises.map(e => e.id === id ? { ...e, [field]: val } : e)); }
  function moveEx(idx, dir) { const newEx = [...exercises]; const target = idx + dir; if (target < 0 || target >= newEx.length) return; [newEx[idx], newEx[target]] = [newEx[target], newEx[idx]]; setExercises(newEx); }
  function handleSave() { const sess = { id: edit?.id || gid(), title: title || "Antrenman", date, notes, exercises }; const ns = edit ? data.sessions.map(s => s.id === sess.id ? sess : s) : [...data.sessions, sess]; const nd = { ...data, sessions: ns }; setData(nd); saveData(profileId, nd); setView("list"); setEdit(null); }
  function handleDel(id) { const nd = { ...data, sessions: data.sessions.filter(s => s.id !== id) }; setData(nd); saveData(profileId, nd); setConfirmDel(null); }

  const allSorted = [...data.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const now = new Date();
  const sorted = allSorted.filter(s => {
    if (listSearch && !s.title.toLowerCase().includes(listSearch.toLowerCase())) return false;
    if (listFilter === "week") { return (now - new Date(s.date)) / 864e5 <= 7; }
    if (listFilter === "month") { return (now - new Date(s.date)) / 864e5 <= 30; }
    return true;
  });
  const pf = EXERCISE_LIBRARY.filter(ex => (pickerCat === "all" || ex.category === pickerCat) && (!pickerSearch || ex.name.toLowerCase().includes(pickerSearch.toLowerCase())));

  if (view === "form") return (
    <div>
      <button onClick={() => { setView("list"); setEdit(null); }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", color: "#8A8F98", cursor: "pointer", marginBottom: 24 }}>← Geri</button>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: "0 0 24px" }}>{edit ? "Düzenle" : "Yeni Antrenman"}</h2>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16, marginBottom: 20 }}>
        <div><label style={LS}>Başlık</label><input style={IS} value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Pliometrik + Hız" /></div>
        <div><label style={LS}>Tarih</label><input style={IS} type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 20 }}><label style={LS}>Notlar</label><textarea style={{ ...IS, minHeight: 50, resize: "vertical" }} value={notes} onChange={e => setNotes(e.target.value)} /></div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontSize: 16, color: "#E0E0E0", margin: 0, fontWeight: 700 }}>Egzersizler ({exercises.length})</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setShowPicker(!showPicker); setShowManual(false); }} style={{ background: showPicker ? "rgba(255,107,53,0.15)" : "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 10, padding: "8px 16px", color: "#FF6B35", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{showPicker ? "✕ Kapat" : "📚 Kütüphane"}</button>
          <button onClick={() => { setShowManual(!showManual); setShowPicker(false); }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", color: "#8A8F98", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{showManual ? "✕ Kapat" : "+ Manuel"}</button>
        </div>
      </div>

      {showPicker && (
        <div style={{ background: "rgba(255,107,53,0.04)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 14, padding: 16, marginBottom: 16, maxHeight: 360, overflowY: "auto" }}>
          <input style={{ ...IS, marginBottom: 10 }} placeholder="Ara..." value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} />
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            <button onClick={() => setPickerCat("all")} style={BTN(pickerCat === "all")}>Tümü</button>
            {CATEGORIES.map(c => <button key={c.id} onClick={() => setPickerCat(c.id)} style={BTN(pickerCat === c.id, c.color)}>{c.icon}</button>)}
          </div>
          {pf.map((ex, i) => { const cat = CATEGORIES.find(c => c.id === ex.category); const added = exercises.some(e => e.name === ex.name); return (
            <div key={i} onClick={() => !added && addFromLib(ex)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: added ? "rgba(0,212,170,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${added ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.04)"}`, borderRadius: 8, marginBottom: 3, cursor: added ? "default" : "pointer", opacity: added ? 0.5 : 1, borderLeft: `3px solid ${cat?.color}` }}>
              <div><span style={{ color: "#E0E0E0", fontSize: 13, fontWeight: 600 }}>{ex.name}</span> <span style={{ fontSize: 9, color: LEVEL_COLORS[ex.level] }}>{LEVEL_LABELS[ex.level]}</span><div style={{ color: "#4A4F5C", fontSize: 11 }}>{ex.defSets ? `${ex.defSets}×${ex.defReps}` : ""}{ex.defDuration ? ` · ${ex.defDuration}` : ""}</div></div>
              <span style={{ color: added ? "#00D4AA" : "#FF6B35", fontSize: 16, fontWeight: 700 }}>{added ? "✓" : "+"}</span>
            </div>
          ); })}
        </div>
      )}

      {showManual && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={LS}>Ad *</label><input style={IS} value={exN} onChange={e => setExN(e.target.value)} /></div>
            <div><label style={LS}>Kategori</label><select style={IS} value={exC} onChange={e => setExC(e.target.value)}>{CATEGORIES.map(c => <option key={c.id} value={c.id} style={OS}>{c.label}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={LS}>Set</label><input style={IS} type="number" value={exS} onChange={e => setExS(e.target.value)} /></div>
            <div><label style={LS}>Tekrar</label><input style={IS} value={exR} onChange={e => setExR(e.target.value)} /></div>
            <div><label style={LS}>Ağırlık</label><input style={IS} type="number" step="0.5" value={exW} onChange={e => setExW(e.target.value)} /></div>
            <div><label style={LS}>Süre</label><input style={IS} value={exD} onChange={e => setExD(e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={LS}>Not</label><input style={IS} value={exNo} onChange={e => setExNo(e.target.value)} /></div>
          <button onClick={addManual} disabled={!exN} style={{ background: exN ? "#FF6B35" : "#333", borderRadius: 10, border: "none", padding: "10px 24px", color: "#fff", fontWeight: 700, cursor: exN ? "pointer" : "not-allowed", opacity: exN ? 1 : 0.5 }}>Ekle</button>
        </div>
      )}

      {/* Editable exercise list */}
      {exercises.map((ex, idx) => {
        const cat = CATEGORIES.find(c => c.id === ex.category);
        const isOpen = expandedEx === ex.id;
        return (
          <div key={ex.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${isOpen ? "rgba(255,107,53,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, marginBottom: 6, borderLeft: `3px solid ${cat?.color || "#FF6B35"}`, overflow: "hidden" }}>
            <div onClick={() => setExpandedEx(isOpen ? null : ex.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ color: "#6B7080", fontSize: 11, fontWeight: 700 }}>#{idx + 1}</span>
                  <span style={{ color: "#E0E0E0", fontWeight: 600, fontSize: 14 }}>{ex.name}</span>
                  {ex.level && <span style={{ fontSize: 9, color: LEVEL_COLORS[ex.level], background: `${LEVEL_COLORS[ex.level]}15`, padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>{LEVEL_LABELS[ex.level]}</span>}
                </div>
                <div style={{ color: "#6B7080", fontSize: 12, marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ color: cat?.color, fontWeight: 600 }}>{cat?.label}</span>
                  {ex.sets && <span>{ex.sets} set</span>}{ex.reps && <span>{ex.reps} tekrar</span>}{ex.weight && <span>{ex.weight}kg</span>}{ex.duration && <span>{ex.duration}</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {ex.videoLink && <a href={ex.videoLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#FF6B35", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>▶</a>}
                <button onClick={e => { e.stopPropagation(); moveEx(idx, -1); }} disabled={idx === 0} style={{ background: "none", border: "none", color: idx === 0 ? "#2A2D35" : "#6B7080", cursor: idx === 0 ? "default" : "pointer", fontSize: 12, padding: "2px 4px" }}>▲</button>
                <button onClick={e => { e.stopPropagation(); moveEx(idx, 1); }} disabled={idx === exercises.length - 1} style={{ background: "none", border: "none", color: idx === exercises.length - 1 ? "#2A2D35" : "#6B7080", cursor: idx === exercises.length - 1 ? "default" : "pointer", fontSize: 12, padding: "2px 4px" }}>▼</button>
                <span style={{ color: "#4A4F5C", fontSize: 12, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                <button onClick={e => { e.stopPropagation(); setExercises(exercises.filter(x => x.id !== ex.id)); }} style={{ background: "none", border: "none", color: "#6B7080", cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
            </div>
            {isOpen && (
              <div style={{ padding: "0 16px 16px", background: "rgba(255,107,53,0.03)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                  <div><label style={LS}>Set</label><input style={IS} type="number" value={ex.sets || ""} onChange={e => updateEx(ex.id, "sets", e.target.value ? +e.target.value : null)} /></div>
                  <div><label style={LS}>Tekrar</label><input style={IS} value={ex.reps || ""} onChange={e => updateEx(ex.id, "reps", e.target.value)} /></div>
                  <div><label style={LS}>Ağırlık (kg)</label><input style={IS} type="number" step="0.5" value={ex.weight || ""} onChange={e => updateEx(ex.id, "weight", e.target.value ? +e.target.value : null)} /></div>
                  <div><label style={LS}>Süre</label><input style={IS} value={ex.duration || ""} onChange={e => updateEx(ex.id, "duration", e.target.value)} /></div>
                </div>
                <div style={{ marginTop: 10 }}><label style={LS}>Not</label><input style={IS} value={ex.notes || ""} onChange={e => updateEx(ex.id, "notes", e.target.value)} /></div>
              </div>
            )}
          </div>
        );
      })}

      <button onClick={handleSave} style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C5A)", border: "none", borderRadius: 12, padding: "14px 32px", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,107,53,0.3)", marginTop: 16, width: isMobile ? "100%" : "auto" }}>{edit ? "Güncelle" : "Kaydet"}</button>
    </div>
  );

  return (
    <div>
      {confirmDel && <ConfirmModal message="Bu antrenmanı silmek istediğine emin misin?" onConfirm={() => handleDel(confirmDel)} onCancel={() => setConfirmDel(null)} />}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
        <div><h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: 0 }}>Antrenmanlar</h2><p style={{ color: "#6B7080", marginTop: 4, fontSize: 14 }}>{data.sessions.length} kayıt</p></div>
        <button onClick={startNew} style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C5A)", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>+ Yeni Antrenman</button>
      </div>
      {/* Search & Filter */}
      {data.sessions.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input style={{ ...IS, maxWidth: 260, padding: "8px 12px", fontSize: 13 }} placeholder="Antrenman ara..." value={listSearch} onChange={e => setListSearch(e.target.value)} />
          <div style={{ display: "flex", gap: 6 }}>
            {[["all", "Tümü"], ["week", "Bu Hafta"], ["month", "Bu Ay"]].map(([k, l]) => (
              <button key={k} onClick={() => setListFilter(k)} style={BTN(listFilter === k)}>{l}</button>
            ))}
          </div>
          {(listSearch || listFilter !== "all") && <span style={{ color: "#4A4F5C", fontSize: 12 }}>{sorted.length} sonuç</span>}
        </div>
      )}
      {sorted.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#4A4F5C" }}><div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div><p>{data.sessions.length === 0 ? "Henüz kayıt yok" : "Filtre sonucu bulunamadı"}</p></div> :
        sorted.map(s => (
          <div key={s.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: isMobile ? 16 : 20, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div><h3 style={{ color: "#F0F0F0", margin: 0, fontSize: 18, fontWeight: 700 }}>{s.title}</h3><div style={{ color: "#6B7080", fontSize: 13, marginTop: 4 }}>{fmtDate(s.date)} · {s.exercises?.length || 0} egzersiz</div></div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => copySession(s)} title="Kopyala" style={{ background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 8, padding: "6px 10px", color: "#00D4AA", fontSize: 12, cursor: "pointer" }}>📋</button>
                <button onClick={() => startEdit(s)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", color: "#8A8F98", fontSize: 12, cursor: "pointer" }}>Düzenle</button>
                <button onClick={() => setConfirmDel(s.id)} style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 8, padding: "6px 12px", color: "#FF6B6B", fontSize: 12, cursor: "pointer" }}>Sil</button>
              </div>
            </div>
            {s.notes && <p style={{ color: "#6B7080", fontSize: 13, margin: "8px 0 0" }}>{s.notes}</p>}
            {s.exercises?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>{s.exercises.map(ex => { const cat = CATEGORIES.find(c => c.id === ex.category); return <span key={ex.id} style={{ background: `${cat?.color || "#666"}15`, border: `1px solid ${cat?.color || "#666"}30`, borderRadius: 8, padding: "4px 10px", fontSize: 12, color: cat?.color, fontWeight: 600 }}>{ex.name}{ex.sets && ex.reps ? ` ${ex.sets}×${ex.reps}` : ""}{ex.weight ? ` @${ex.weight}kg` : ""}</span>; })}</div>}
          </div>
        ))
      }
    </div>
  );
}

/* ════════ ÖLÇÜMLER + YAĞ ORANI HESAPLAYICI ════════ */
