import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Kulüp kadrosu taktik tahtasına tohumlanır — isim ikinci kez girilmez */
    const players = profiles
      .filter(p => p.position !== "Antrenör")
      .slice(0, 14)
      .map((p, i) => ({
        name: (p.name || "").split(" ")[0],
        role: ROLE_MAP[p.position] || "S",
        num: String(i + 1)
      }));

    const unmount = mountTactics(el, {
      players,
      stateKey: `vball-tactics-${clubId}`,
      bookKey: `vball-tacticbook-${clubId}`,
      load: k => { try { return localStorage.getItem(k); } catch { return null; } },
      save: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { console.error(e); } }
    });

    return unmount;
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
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          height: isMobile ? "calc(100vh - 210px)" : "calc(100vh - 130px)",
          minHeight: 380,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)"
        }}
      />
    </div>
  );
}
