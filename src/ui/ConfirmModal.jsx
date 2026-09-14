

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1A1D24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "28px 32px", maxWidth: 380, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: "#E0E0E0", fontSize: 15, fontWeight: 600, margin: "0 0 20px", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 24px", color: "#8A8F98", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Vazgeç</button>
          <button onClick={onConfirm} style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 10, padding: "10px 24px", color: "#FF6B6B", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Evet, Sil</button>
        </div>
      </div>
    </div>
  );
}

/* ════════ KULÜP EKRANI ════════ */
