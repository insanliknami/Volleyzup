import { useState, useEffect, lazy, Suspense } from "react";
/* Taktik tahtası three.js kullanıyor — sekmeye girilene kadar yüklenmez */
const TacticsPage = lazy(() => import("./pages/TacticsPage"));
import { TABS, teamDisplayName, teamNetHeight } from "./constants/index";
import { LogoImg } from "./constants/logo";
import CalendarPage from "./pages/CalendarPage";
import Dashboard from "./pages/Dashboard";
import GoalsPage from "./pages/GoalsPage";
import InjuryPage from "./pages/InjuryPage";
import AttendancePage from "./pages/AttendancePage";
import LibraryPage from "./pages/LibraryPage";
import MeasurementsPage from "./pages/MeasurementsPage";
import ProgressPage from "./pages/ProgressPage";
import TeamsPage from "./pages/TeamsPage";
import QuestsPage from "./pages/QuestsPage";
import TrainingPage from "./pages/TrainingPage";
import ClubScreen from "./screens/ClubScreen";
import LoginScreen from "./screens/LoginScreen";
import { loadTeams, saveTeams, loadAnnouncements, loadClubs, loadData, loadMatches, loadProfiles, loadQuests, saveAnnouncements, saveClubs, saveMatches, saveProfiles, saveQuests } from "./lib/storage";

export default function App() {
  const [clubs, setClubs] = useState([]);
  const [activeClub, setActiveClub] = useState(null);
  const [profiles, setProfiles] = useState([]); const [activeProfile, setActiveProfile] = useState(null);
  const [data, setData] = useState({ sessions: [], measurements: [], goals: [], injuries: [] });
  const [quests, setQuests] = useState([]); const [matches, setMatches] = useState([]); const [announcements, setAnnouncements] = useState([]);
  const [teams, setTeams] = useState([]); const [activeTeamId, setActiveTeamId] = useState(null);
  const [teamMenu, setTeamMenu] = useState(false);
  const [tab, setTab] = useState("dashboard"); const [loading, setLoading] = useState(true); const [isMobile, setIsMobile] = useState(false);

  // Initial load: only clubs
  useEffect(() => {
    const hr = () => setIsMobile(window.innerWidth <= 768); hr(); window.addEventListener("resize", hr);
    loadClubs().then(c => { setClubs(c); setLoading(false); });
    return () => window.removeEventListener("resize", hr);
  }, []);

  // Load club data when club is selected
  async function enterClub(club) {
    setActiveClub(club);
    // Save to recent clubs in localStorage
    try { const recent = JSON.parse(localStorage.getItem("vball-recent-clubs") || "[]"); const updated = [{ id: club.id, name: club.name }, ...recent.filter(r => r.id !== club.id)].slice(0, 5); localStorage.setItem("vball-recent-clubs", JSON.stringify(updated)); } catch {}
    const [p, q, m, a, tm] = await Promise.all([loadProfiles(club.id), loadQuests(club.id), loadMatches(club.id), loadAnnouncements(club.id), loadTeams(club.id)]);
    setProfiles(p); setQuests(q); setMatches(m); setAnnouncements(a); setTeams(tm);
    /* Son seçilen takımı hatırla */
    try { const last = localStorage.getItem(`vball-last-team-${club.id}`); 
      setActiveTeamId(tm.some(t => t.id === last) ? last : (tm[0] ? tm[0].id : null)); } catch { setActiveTeamId(tm[0] ? tm[0].id : null); }
  }

  async function handleCreateClub(club) {
    const nc = [...clubs, club]; setClubs(nc); await saveClubs(nc);
    await enterClub(club);
  }

  async function handleJoinClub(club) { await enterClub(club); }
  function handleChangeClub() { setActiveClub(null); setActiveProfile(null); setProfiles([]); setTeams([]); setActiveTeamId(null); setQuests([]); setMatches([]); setAnnouncements([]); setData({ sessions: [], measurements: [], goals: [], injuries: [] }); setTab("dashboard"); }

  async function handleSelectProfile(p) { setActiveProfile(p); setData(await loadData(p.id)); }
  async function handleCreateProfile(p) { const np = [...profiles, p]; setProfiles(np); await saveProfiles(activeClub.id, np); await handleSelectProfile(p); }
  /* Antrenörün açtığı kaydı sporcu sahiplenir: geçmişi korunur, kayıt ikiye bölünmez */
  async function handleClaimProfile(pid, patch) {
    const np = profiles.map(x => x.id === pid ? { ...x, ...patch, coachAdded: false } : x);
    setProfiles(np); await saveProfiles(activeClub.id, np);
    await handleSelectProfile(np.find(x => x.id === pid));
  }
  function setProfilesAndSave(np) { setProfiles(np); if (activeClub) saveProfiles(activeClub.id, np); }
  function handleLogout() { setActiveProfile(null); setData({ sessions: [], measurements: [], goals: [], injuries: [] }); setTab("dashboard"); }

  function setTeamsAndSave(t) { setTeams(t); if (activeClub) saveTeams(activeClub.id, t); }
  function selectTeam(id) {
    setActiveTeamId(id); setTeamMenu(false);
    try { if (activeClub) localStorage.setItem(`vball-last-team-${activeClub.id}`, id || ""); } catch {}
  }
  const activeTeam = teams.find(t => t.id === activeTeamId) || null;

  // Wrapper functions that pass clubId to shared save functions
  function setQuestsAndSave(q) { setQuests(q); if (activeClub) saveQuests(activeClub.id, q); }
  function setMatchesAndSave(m) { setMatches(m); if (activeClub) saveMatches(activeClub.id, m); }
  function setAnnouncementsAndSave(a) { setAnnouncements(a); if (activeClub) saveAnnouncements(activeClub.id, a); }

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#111318", color: "#FF6B35", fontFamily: "'DM Sans'" }}><div style={{ textAlign: "center" }}><div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><LogoImg size={72} /></div><div>Yükleniyor...</div></div></div>;
  if (!activeClub) return <ClubScreen clubs={clubs} onSelect={enterClub} onCreate={handleCreateClub} onJoin={handleJoinClub} isMobile={isMobile} />;
  if (!activeProfile) return <LoginScreen profiles={profiles} onSelect={handleSelectProfile} onCreate={handleCreateProfile} onClaim={handleClaimProfile} isMobile={isMobile} club={activeClub} onChangeClub={handleChangeClub} />;

  return (
    <div style={{ minHeight: "100vh", background: "#111318", color: "#E0E0E0", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`.hs::-webkit-scrollbar{display:none}.hs{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <header style={{ background: "rgba(17,19,24,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: isMobile ? "12px 16px" : "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LogoImg size={isMobile ? 28 : 34} />
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 900, color: "#F0F0F0" }}>VOLLEYZ<span style={{ color: "#FF6B35" }}>UP</span></h1>
            {!isMobile && <div style={{ fontSize: 9, color: "#4A4F5C", letterSpacing: "0.15em" }}>{activeClub.name}</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {!isMobile && <div style={{ background: "rgba(255,107,53,0.08)", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#FF6B35", fontWeight: 700 }}>{activeClub.code}</div>}
          <div style={{ position: "relative" }}>
            <button onClick={() => setTeamMenu(v => !v)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: isMobile ? "6px 10px" : "7px 13px", color: activeTeam ? "#F0F0F0" : "#6B7080", fontSize: isMobile ? 11 : 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif", maxWidth: isMobile ? 140 : 230, whiteSpace: "nowrap", overflow: "hidden" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{activeTeam ? teamDisplayName(activeTeam) : "Takım seç"}</span>
              {activeTeam && <span style={{ color: "#6B7080", fontWeight: 500 }}>{(activeTeam.players || []).length}</span>}
              <span style={{ color: "#6B7080", fontSize: 9 }}>▼</span>
            </button>
            {teamMenu && (
              <>
                <div onClick={() => setTeamMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 190 }} />
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 220, background: "#1A1D24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 6, zIndex: 200, boxShadow: "0 12px 32px rgba(0,0,0,0.5)", maxHeight: 340, overflowY: "auto" }}>
                  {teams.length === 0 && <div style={{ color: "#6B7080", fontSize: 12, padding: "10px 12px" }}>Henüz takım yok</div>}
                  {teams.map(t => (
                    <button key={t.id} onClick={() => selectTeam(t.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, width: "100%", background: t.id === activeTeamId ? "rgba(255,107,53,0.12)" : "transparent", border: "none", borderRadius: 8, padding: "10px 12px", color: t.id === activeTeamId ? "#FF6B35" : "#E0E0E0", fontSize: 13, fontWeight: t.id === activeTeamId ? 700 : 500, cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>
                      <span>{teamDisplayName(t)}{t.name ? ` · ${t.name}` : ""}</span>
                      <span style={{ color: "#4A4F5C", fontSize: 11 }}>{(t.players || []).length}</span>
                    </button>
                  ))}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "5px 8px" }} />
                  <button onClick={() => { setTab("teams"); setTeamMenu(false); }} style={{ width: "100%", background: "transparent", border: "none", borderRadius: 8, padding: "10px 12px", color: "#8A8F98", fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>Takımları yönet</button>
                </div>
              </>
            )}
          </div>
          <div style={{ textAlign: "right" }}><div style={{ color: "#F0F0F0", fontSize: 14, fontWeight: 700 }}>{activeProfile.name}</div><div style={{ color: "#6B7080", fontSize: 11 }}>{activeProfile.position}</div></div>
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", color: "#6B7080", fontSize: 11, cursor: "pointer" }}>Çıkış</button>
        </div>
      </header>
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "calc(100vh - 60px)" }}>
        <nav className="hs" style={{ width: isMobile ? "100%" : 210, background: "rgba(255,255,255,0.02)", borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.06)", borderBottom: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none", padding: isMobile ? 12 : "20px 10px", flexShrink: 0, display: isMobile ? "flex" : "block", overflowX: isMobile ? "auto" : "visible" }}>
          {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, width: isMobile ? "auto" : "100%", background: tab === t.id ? "rgba(255,107,53,0.1)" : "transparent", border: tab === t.id ? "1px solid rgba(255,107,53,0.2)" : "1px solid transparent", borderRadius: 12, padding: isMobile ? "8px 14px" : "11px 14px", marginBottom: isMobile ? 0 : 3, marginRight: isMobile ? 8 : 0, color: tab === t.id ? "#FF6B35" : "#6B7080", fontSize: isMobile ? 13 : 14, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}><span style={{ fontSize: isMobile ? 14 : 16 }}>{t.icon}</span>{t.label}</button>))}
          {!isMobile && <div style={{ marginTop: 28, padding: 14, background: "rgba(123,104,238,0.08)", border: "1px solid rgba(123,104,238,0.2)", borderRadius: 12 }}><div style={{ fontSize: 11, color: "#7B68EE", fontWeight: 700 }}>🔮 Yakında</div><div style={{ fontSize: 10, color: "#6B7080" }}>Maç istatistikleri</div></div>}
        </nav>
        <main style={{ flex: 1, padding: isMobile ? 16 : "28px 36px", maxWidth: 1000, overflowY: "auto" }}>
          {tab === "dashboard" && <Dashboard data={data} profile={activeProfile} isMobile={isMobile} team={activeTeam} profiles={profiles} onOpenAttendance={() => setTab("attendance")} announcements={announcements} setAnnouncements={setAnnouncementsAndSave} />}
          {tab === "calendar" && <CalendarPage matches={matches} setMatches={setMatchesAndSave} profile={activeProfile} isMobile={isMobile} />}
          {tab === "quests" && <QuestsPage quests={quests} setQuests={setQuestsAndSave} profile={activeProfile} profiles={profiles} isMobile={isMobile} />}
          {tab === "goals" && <GoalsPage data={data} setData={setData} profileId={activeProfile.id} isMobile={isMobile} />}
          {tab === "training" && <TrainingPage data={data} setData={setData} profileId={activeProfile.id} isMobile={isMobile} />}
          {tab === "library" && <LibraryPage isMobile={isMobile} />}
          {tab === "attendance" && <AttendancePage team={activeTeam} profiles={profiles} isMobile={isMobile} />}
          {tab === "teams" && <TeamsPage teams={teams} setTeams={setTeamsAndSave} profiles={profiles} setProfiles={setProfilesAndSave} isMobile={isMobile} activeTeamId={activeTeamId} onSelectTeam={selectTeam} />}
          {tab === "tactics" && (
            <Suspense fallback={<div style={{ color: "#6B7080", fontSize: 13, padding: 24 }}>Saha yükleniyor…</div>}>
              <TacticsPage profiles={profiles} clubId={activeClub.id} isMobile={isMobile} team={activeTeam} netHeight={activeTeam ? teamNetHeight(activeTeam) : null} />
            </Suspense>
          )}
          {tab === "measurements" && <MeasurementsPage data={data} setData={setData} profile={activeProfile} profileId={activeProfile.id} isMobile={isMobile} />}
          {tab === "injuries" && <InjuryPage data={data} setData={setData} profileId={activeProfile.id} isMobile={isMobile} />}
          {tab === "progress" && <ProgressPage data={data} isMobile={isMobile} team={activeTeam} profiles={profiles} />}
        </main>
      </div>
    </div>
  );
}
