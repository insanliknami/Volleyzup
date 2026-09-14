

export function gid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
export function fmtDate(ds) { return new Date(ds).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }); }
export function fmtShort(ds) { return new Date(ds).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }); }
export function calcAge(bd) { if (!bd) return ""; const d = new Date(bd), now = new Date(); let a = now.getFullYear() - d.getFullYear(); if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a--; return a; }

export function calcNavyBF(gender, waist, neck, height, hip) {
  if (gender === "erkek") {
    if (!waist || !neck || !height) return null;
    return (86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76).toFixed(1);
  } else {
    if (!waist || !neck || !height || !hip) return null;
    return (163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387).toFixed(1);
  }
}
/* Skinfold 3-site Jackson-Pollock */
export function calcSkinfoldBF(gender, age, s1, s2, s3) {
  if (!age || !s1 || !s2 || !s3) return null;
  const sum = s1 + s2 + s3;
  let density;
  if (gender === "erkek") { density = 1.10938 - 0.0008267 * sum + 0.0000016 * sum * sum - 0.0002574 * age; }
  else { density = 1.0994921 - 0.0009929 * sum + 0.0000023 * sum * sum - 0.0001392 * age; }
  return ((495 / density) - 450).toFixed(1);
}

/* ════════ VERİTABANI ════════ */
/* ═══ KULÜP STORAGE ═══ */
export function genClubCode() { const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let code = ""; for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]; return code; }
