import { useState } from "react";
import { TEAM_CATEGORIES, TEAM_LEVELS, TEAM_GENDERS, teamDisplayName, teamNetHeight } from "../constants/index";
import { IS, LS, BTN, OS } from "../ui/styles";
import { gid } from "../lib/utils";
import { attendanceStats } from "../lib/storage";
import ConfirmModal from "../ui/ConfirmModal";

const EMPTY = { name: "", category: "midi", level: "", gender: "k", players: [] };

export default function TeamsPage({ teams, setTeams, profiles, isMobile, activeTeamId, onSelectTeam }) {
  const [edit, setEdit] = useState(null);      // düzenlenen takım (yeni ise id yok)
  const [confirm, setConfirm] = useState(null);

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

          <label style={LS}>Kadro ({edit.players.length} seçili)</label>
          {profiles.length === 0 ? (
            <p style={{ color: "#4A4F5C", fontSize: 12 }}>Kulüpte kayıtlı oyuncu yok.</p>
          ) : (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {profiles.map(p => (
                <button key={p.id} onClick={() => togglePlayer(p.id)}
                  style={BTN(edit.players.includes(p.id))}>{p.name}</button>
              ))}
            </div>
          )}

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
