import { useEffect, useRef, useState } from "react";
import { mountTactics } from "../tactics/engine";

/* VolleyzUP pozisyon adları → taktik tahtası rol kodları */
const ROLE_MAP = {
  "Pasör": "P",
  "Smaçör": "S",
  "Orta Oyuncu": "O",
  "Karşı Köşe": "PÇ",
  "Çapraz": "PÇ",
  "Libero": "L"
};

export default function TacticsPage({ profiles = [], clubId, isMobile }) {
  const ref = useRef(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setErr(null);

    /* Kulüp kadrosu taktik tahtasına tohumlanır — isim ikinci kez girilmez */
    const players = profiles
      .filter(p => p.position !== "Antrenör")
      .slice(0, 14)
      .map((p, i) => ({
        name: (p.name || "").split(" ")[0],
        role: ROLE_MAP[p.position] || "S",
        num: String(i + 1)
      }));

    let unmount = null;
    try {
      unmount = mountTactics(el, {
        players,
        stateKey: `vball-tactics-${clubId}`,
        bookKey: `vball-tacticbook-${clubId}`,
        load: k => { try { return localStorage.getItem(k); } catch { return null; } },
        save: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { console.error(e); } }
      });
    } catch (e) {
      console.error("Taktik tahtası başlatılamadı:", e);
      setErr(e && e.stack ? e.stack : String(e));
      try { el.innerHTML = ""; el.classList.remove("t3d"); } catch (x) {}
    }

    return () => { if (unmount) { try { unmount(); } catch (e) { console.error(e); } } };
  }, [clubId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ color: "#F0F0F0", fontSize: 20, fontWeight: 800, margin: 0 }}>
          Taktik Tahtası
        </h2>
        <span style={{ color: "#6B7080", fontSize: 12, fontWeight: 500 }}>
          Oyuncuya dokun → düzenle · Sürükle → taşı · Boşluğu sürükle → sahayı çevir
        </span>
      </div>

      {err && (
        <div style={{
          background: "rgba(226,75,74,0.08)",
          border: "1px solid rgba(226,75,74,0.35)",
          borderRadius: 12, padding: 16, color: "#F09595",
          fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap",
          wordBreak: "break-word", fontFamily: "ui-monospace, Menlo, monospace"
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>
            Taktik tahtası açılamadı
          </div>
          {err}
        </div>
      )}

      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          height: err ? 0 : (isMobile ? "calc(100vh - 210px)" : "calc(100vh - 130px)"),
          minHeight: err ? 0 : 380,
          borderRadius: 14,
          overflow: "hidden",
          border: err ? "none" : "1px solid rgba(255,255,255,0.06)"
        }}
      />
    </div>
  );
}
