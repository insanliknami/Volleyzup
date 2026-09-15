import { useState } from "react";
import { TEAM_CATEGORIES, TEAM_LEVELS, TEAM_GENDERS, POSITIONS, teamDisplayName, teamNetHeight } from "../constants/index";
import { IS, LS, BTN, OS } from "../ui/styles";
import { gid } from "../lib/utils";
import { attendanceStats } from "../lib/storage";
import ConfirmModal from "../ui/ConfirmModal";

const EMPTY = { name: "", category: "midi", level: "", gender: "k", players: [] };

export default function TeamsPage({ teams, setTeams, profiles, setProfiles, isMobile, activeTeamId, onSelectTeam }) {
  const [edit, setEdit] = useState(null);      // düzenlenen takım (yeni ise id yok)
  const [confirm, setConfirm] = useState(null);
  const [adding, setAdding] = useState(null);  // "one" | "bulk" | null
  const [np, setNp] = useState({ name: "", position: "Smaçör", birthDate: "" });
  const [bulk, setBulk] = useState("");

  /* Antrenörün eklediği oyuncu kulüp listesine girer ve kadroya eklenir.
     coachAdded işareti, sporcu sonradan telefondan giriş yapıp kaydı
     sahiplenebilsin diye tutulur. */
  function addOne() {
    const nm = np.name.trim();
    if (!nm) return;
    const pl = { id: gid(), name: nm, position: np.position, birthDate: np.birthDate,
                 gender: "", pin: "", coachAdded: true, createdAt: Date.now() };
    setProfiles([...profiles, pl]);
    if (edit) setEdit({ ...edit, players: [...edit.players, pl.id] });
    setNp({ name: "", position: np.position, birthDate: "" });
  }
  function addBulk() {
    const lines = bulk.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const added = lines.map(line => {
      const parts = line.split(/[,\t;]+|\s{2,}/).map(x => x.trim()).filter(Boolean);
      const nm = parts[0] || line;
      const pos = POSITIONS.find(P => parts.slice(1).some(x => x.toLocaleLowerCase("tr") === P.toLocaleLowerCase("tr")));
      return { id: gid(), name: nm, position: pos || "Diğer", birthDate: "",
               gender: "", pin: "", coachAdded: true, createdAt: Date.now() };
    });
    setProfiles([...profiles, ...added]);
    if (edit) setEdit({ ...edit, players: [...edit.players, ...added.map(a => a.id)] });
    setBulk(""); setAdding(null);
  }
  function removeProfile(pid) {
    setProfiles(profiles.filter(x => x.id !== pid));
    setTeams(teams.map(t => ({ ...t, players: (t.players || []).filter(x => x !== pid) })));
    if (edit) setEdit({ ...edit, players: edit.players.filter(x => x !== pid) });
    setConfirm(null);
  }

  function save() {
    if (!edit) return;
    const t = { ...edit };
    if (!t.id) { t.id = gid(); t.createdAt = Date.now(); setTeams([...teams, t]); }
    else setTeams(teams.map(x => x.id === t.id ? t : x));
    setEdit(null);
  }
  function remove(id) {
    setTeams(teams.filter(t => t.id !== id));
    setConfirm(null);
    if (activeTeamId === id) onSelectTeam(null);
  }
  function togglePlayer(pid) {
    const has = edit.players.includes(pid);
    setEdit({ ...edit, players: has ? edit.players.filter(x => x !== pid) : [...edit.players, pid] });
  }

  return (
    <div>
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#F0F0F0", margin: "0 0 4px" }}>Takımlar</h2>
          <p style={{ color: "#6B7080", fontSize: 14, margin: 0 }}>
            {teams.length} takım · {profiles.length} oyuncu kulüpte kayıtlı
          </p>
        </div>
        {!edit && (
          <button onClick={() => setEdit({ ...EMPTY })} style={{ background: "#FF6B35", border: "none",
            borderRadius: 10, padding: "11px 20px", color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Takım kur</button>
        )}
      </div>

      {edit && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,107,53,0.2)",
          borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, color: "#FF6B35", margin: "0 0 16px", fontWeight: 700 }}>
            {edit.id ? "Takımı düzenle" : "Yeni takım"}
          </h3>

          <div style={{ display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr 0.7fr 0.9fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={LS}>Takım adı (isteğe bağlı)</label>
              <input style={IS} placeholder="örn. Şampiyonluk grubu" value={edit.name}
                onChange={e => setEdit({ ...edit, name: e.target.value })} />
            </div>
            <div>
              <label style={LS}>Kategori</label>
              <select style={IS} value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value })}>
                {TEAM_CATEGORIES.map(c => <option key={c.id} value={c.id} style={OS}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={LS}>Kademe</label>
              <select style={IS} value={edit.level} onChange={e => setEdit({ ...edit, level: e.target.value })}>
                {TEAM_LEVELS.map(l => <option key={l} value={l} style={OS}>{l || "—"}</option>)}
              </select>
            </div>
            <div>
              <label style={LS}>Cinsiyet</label>
              <select style={IS} value={edit.gender} onChange={e => setEdit({ ...edit, gender: e.target.value })}>
                {TEAM_GENDERS.map(g => <option key={g.id} value={g.id} style={OS}>{g.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ color: "#6B7080", fontSize: 12, marginBottom: 16 }}>
            Görünecek ad: <b style={{ color: "#F0F0F0" }}>{teamDisplayName(edit) || "—"}</b>
            {" · "}file {teamNetHeight(edit).toFixed(2)} m
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            <label style={{ ...LS, marginBottom: 0 }}>Kadro ({edit.players.length} seçili)</label>
            <button onClick={() => setAdding(adding === "one" ? null : "one")} style={BTN(adding === "one", "#00D4AA")}>+ Oyuncu ekle</button>
            <button onClick={() => setAdding(adding === "bulk" ? null : "bulk")} style={BTN(adding === "bulk", "#00D4AA")}>Toplu ekle</button>
          </div>

          {adding === "one" && (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr 1fr auto",
              gap: 8, alignItems: "end", background: "rgba(0,212,170,0.05)",
              border: "1px solid rgba(0,212,170,0.2)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <div><label style={LS}>İsim</label>
                <input style={IS} placeholder="Ad Soyad" value={np.name} autoFocus
                  onChange={e => setNp({ ...np, name: e.target.value })}
                  onKeyDown={e => { if (e.key === "Enter") addOne(); }} /></div>
              <div><label style={LS}>Mevki</label>
                <select style={IS} value={np.position} onChange={e => setNp({ ...np, position: e.target.value })}>
                  {POSITIONS.filter(x => x !== "Antrenör").map(x => <option key={x} value={x} style={OS}>{x}</option>)}
                </select></div>
              <div><label style={LS}>Doğum tarihi</label>
                <input type="date" style={IS} value={np.birthDate}
                  onChange={e => setNp({ ...np, birthDate: e.target.value })} /></div>
              <button onClick={addOne} disabled={!np.name.trim()} style={{
                background: np.name.trim() ? "#00D4AA" : "rgba(255,255,255,0.05)", border: "none",
                borderRadius: 10, padding: "11px 20px", color: np.name.trim() ? "#0B1A14" : "#4A4F5C",
                fontSize: 13, fontWeight: 700, cursor: np.name.trim() ? "pointer" : "default",
                fontFamily: "'DM Sans', sans-serif", height: 40 }}>Ekle</button>
            </div>
          )}

          {adding === "bulk" && (
            <div style={{ background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.2)",
              borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <label style={LS}>Her satıra bir oyuncu — isteğe bağlı olarak virgülle mevki</label>
              <textarea value={bulk} onChange={e => setBulk(e.target.value)} rows={7}
                placeholder={"Zeynep Kaya, Pasör\nElif Yılmaz, Libero\nDeniz Arslan"}
                style={{ ...IS, resize: "vertical", fontFamily: "ui-monospace, monospace", fontSize: 13, lineHeight: 1.7 }} />
              <button onClick={addBulk} disabled={!bulk.trim()} style={{
                background: bulk.trim() ? "#00D4AA" : "rgba(255,255,255,0.05)", border: "none",
                borderRadius: 10, padding: "10px 20px", marginTop: 10,
                color: bulk.trim() ? "#0B1A14" : "#4A4F5C", fontSize: 13, fontWeight: 700,
                cursor: bulk.trim() ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif"
              }}>{bulk.split("\n").filter(x => x.trim()).length} oyuncuyu ekle</button>
            </div>
          )}

          {profiles.length === 0 ? (
            <p style={{ color: "#4A4F5C", fontSize: 12, marginBottom: 16 }}>
              Kulüpte kayıtlı oyuncu yok. “+ Oyuncu ekle” ile başla.
            </p>
          ) : (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {profiles.filter(p => p.position !== "Antrenör").map(p => (
                <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => togglePlayer(p.id)} style={BTN(edit.players.includes(p.id))}>
                    {p.name}{p.coachAdded ? "" : " •"}
                  </button>
                  {p.coachAdded && (
                    <button title="Kulüpten sil" onClick={() => setConfirm({
                      message: `${p.name} kulüpten tamamen silinecek. Yoklama geçmişi kalır ama isim listede görünmez.`,
                      onConfirm: () => removeProfile(p.id)
                    })} style={{ background: "none", border: "none", color: "#4A4F5C", fontSize: 14,
                      cursor: "pointer", padding: "0 2px" }}>×</button>
                  )}
                </span>
              ))}
            </div>
          )}
          <div style={{ color: "#4A4F5C", fontSize: 11, marginBottom: 16 }}>
            • işaretli oyuncular kendi telefonundan giriş yapmış olanlardır.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={save} style={{ background: "#FF6B35", border: "none", borderRadius: 10,
              padding: "10px 22px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif" }}>Kaydet</button>
            <button onClick={() => setEdit(null)} style={{ background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 22px",
              color: "#8A8F98", fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif" }}>Vazgeç</button>
          </div>
        </div>
      )}

      {teams.length === 0 && !edit && (
        <p style={{ color: "#4A4F5C", fontSize: 13 }}>
          Henüz takım yok. “Takım kur” ile başla — kategoriyi seçince file yüksekliği otomatik ayarlanır.
        </p>
      )}

      {teams.map(t => {
        const roster = (t.players || []).map(pid => profiles.find(p => p.id === pid)).filter(Boolean);
        return (
          <div key={t.id} style={{ background: activeTeamId === t.id ? "rgba(255,107,53,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${activeTeamId === t.id ? "rgba(255,107,53,0.25)" : "rgba(255,255,255,0.05)"}`,
            borderRadius: 14, padding: 16, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ color: "#F0F0F0", fontSize: 16, fontWeight: 700 }}>
                  {teamDisplayName(t)}{t.name ? <span style={{ color: "#6B7080", fontWeight: 500 }}> · {t.name}</span> : null}
                </div>
                <div style={{ color: "#6B7080", fontSize: 12, marginTop: 2 }}>
                  {roster.length} oyuncu · file {teamNetHeight(t).toFixed(2)} m
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {activeTeamId !== t.id && (
                  <button onClick={() => onSelectTeam(t.id)} style={BTN(false, "#00D4AA")}>Seç</button>
                )}
                <button onClick={() => setEdit({ ...EMPTY, ...t, players: [...(t.players || [])] })}
                  style={BTN(false)}>Düzenle</button>
                <button onClick={() => setConfirm({
                  message: `${teamDisplayName(t)} takımı silinecek. Oyuncular kulüpte kalır.`,
                  onConfirm: () => remove(t.id)
                })} style={BTN(false, "#E84855")}>Sil</button>
              </div>
            </div>

            {roster.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                {roster.map(p => {
                  const st = attendanceStats(t.id, p.id);
                  return (
                    <div key={p.id} style={{ background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
                      padding: "5px 10px", fontSize: 12, color: "#8A8F98" }}>
                      {p.name}
                      {st.rate !== null && (
                        <span style={{ marginLeft: 6, fontWeight: 700,
                          color: st.rate >= 80 ? "#00D4AA" : st.rate >= 60 ? "#FFD23F" : "#E84855" }}>
                          %{st.rate}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
