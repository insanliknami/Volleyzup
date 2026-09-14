import { useState } from "react";
import { LogoImg } from "../constants/logo";
import { genClubCode, gid } from "../lib/utils";
import { IS, LS } from "../ui/styles";

export default function ClubScreen({ clubs, onSelect, onCreate, onJoin, isMobile }) {
  const [mode, setMode] = useState("select"); // select | create | join
  const [clubName, setClubName] = useState("");
  const [joinCode, setJoinCode] = useState(""); const [joinErr, setJoinErr] = useState(false);

  function handleCreate() {
    if (!clubName) return;
    const code = genClubCode();
    onCreate({ id: gid(), name: clubName, code, createdAt: new Date().toISOString() });
  }
  function handleJoin() {
    const found = clubs.find(c => c.code.toUpperCase() === joinCode.toUpperCase().trim());
    if (!found) { setJoinErr(true); return; }
    onJoin(found);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#111318", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ width: isMobile ? "90%" : 480, padding: isMobile ? 20 : 40 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><LogoImg size={80} /></div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#F0F0F0" }}>VOLLEYZ<span style={{ color: "#FF6B35" }}>UP</span></h1>
          <div style={{ fontSize: 12, color: "#4A4F5C", letterSpacing: "0.15em", fontWeight: 600, marginTop: 4 }}>ANTRENMAN TAKİP SİSTEMİ</div>
        </div>

        {mode === "select" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <button onClick={() => setMode("create")} style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.25)", borderRadius: 16, padding: "28px 20px", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏗️</div>
                <div style={{ color: "#FF6B35", fontWeight: 800, fontSize: 16 }}>Kulüp Oluştur</div>
                <div style={{ color: "#6B7080", fontSize: 11, marginTop: 4 }}>Yeni takım oluştur ve sporculara kod ver</div>
              </button>
              <button onClick={() => setMode("join")} style={{ background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 16, padding: "28px 20px", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
                <div style={{ color: "#00D4AA", fontWeight: 800, fontSize: 16 }}>Kulübe Katıl</div>
                <div style={{ color: "#6B7080", fontSize: 11, marginTop: 4 }}>Antrenörünüzün verdiği kodu girin</div>
              </button>
            </div>

            {/* Daha önce giriş yapılmış kulüpler - sadece bilgi */}
            {(() => { try { const recent = JSON.parse(localStorage.getItem("vball-recent-clubs") || "[]"); if (recent.length === 0) return null; return (
              <div>
                <h3 style={{ color: "#8A8F98", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Son Kullanılan Kulüpler</h3>
                {recent.map(rc => {
                  const club = clubs.find(c => c.id === rc.id);
                  if (!club) return null;
                  return (
                    <div key={rc.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ color: "#F0F0F0", fontWeight: 700, fontSize: 15 }}>{club.name}</div>
                        <div style={{ color: "#4A4F5C", fontSize: 11 }}>Kod: {club.code}</div>
                      </div>
                      <button onClick={() => { setMode("join"); setJoinCode(club.code); }} style={{ background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 8, padding: "5px 12px", color: "#00D4AA", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Giriş</button>
                    </div>
                  );
                })}
              </div>
            ); } catch { return null; } })()}
          </div>
        )}

        {mode === "create" && (
          <div>
            <h2 style={{ color: "#E0E0E0", fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Kulüp Oluştur</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={LS}>Kulüp / Takım Adı *</label>
              <input style={IS} value={clubName} onChange={e => setClubName(e.target.value)} placeholder="Örn: İst. Marmara Voleybol" />
            </div>
            <button onClick={handleCreate} disabled={!clubName} style={{ background: clubName ? "linear-gradient(135deg, #FF6B35, #FF8C5A)" : "#333", border: "none", borderRadius: 12, padding: "14px 0", color: "#fff", fontWeight: 800, fontSize: 16, cursor: clubName ? "pointer" : "not-allowed", width: "100%", opacity: clubName ? 1 : 0.5 }}>Kulübü Oluştur</button>
            <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={() => setMode("select")} style={{ background: "none", border: "none", color: "#6B7080", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>← Geri</button></div>
          </div>
        )}

        {mode === "join" && (
          <div>
            <h2 style={{ color: "#E0E0E0", fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Kulübe Katıl</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={LS}>Kulüp Kodu *</label>
              <input style={{ ...IS, textAlign: "center", fontSize: 24, fontWeight: 800, letterSpacing: "0.15em" }} maxLength={6} value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinErr(false); }} placeholder="ABC123" />
              {joinErr && <div style={{ color: "#FF6B6B", fontSize: 12, marginTop: 6, textAlign: "center" }}>Kulüp bulunamadı! Kodu kontrol edin.</div>}
              <p style={{ color: "#4A4F5C", fontSize: 12, marginTop: 8, textAlign: "center" }}>Antrenörünüzden 6 haneli kulüp kodunu isteyiniz</p>
            </div>
            <button onClick={handleJoin} disabled={joinCode.length < 4} style={{ background: joinCode.length >= 4 ? "#00D4AA" : "#333", border: "none", borderRadius: 12, padding: "14px 0", color: "#111", fontWeight: 800, fontSize: 16, cursor: joinCode.length >= 4 ? "pointer" : "not-allowed", width: "100%", opacity: joinCode.length >= 4 ? 1 : 0.5 }}>Katıl</button>
            <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={() => setMode("select")} style={{ background: "none", border: "none", color: "#6B7080", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>← Geri</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════ GİRİŞ EKRANI ════════ */
