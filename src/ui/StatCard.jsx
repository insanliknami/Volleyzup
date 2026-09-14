

export default function StatCard({ label, value, unit, accent }) { return (<div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: "16px 16px 0 0" }} /><div style={{ fontSize: 12, color: "#8A8F98", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div><div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontSize: 32, fontWeight: 700, color: "#F0F0F0" }}>{value}</span>{unit && <span style={{ fontSize: 14, color: "#6B7080" }}>{unit}</span>}</div></div>); }

/* ════════ MAÇ TAKVİMİ ════════ */
