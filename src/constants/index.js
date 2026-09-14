

export const ADMIN_PIN = "1234";
export const POSITIONS = ["Pasör", "Smaçör", "Orta Oyuncu", "Karşı Köşe", "Libero", "Çapraz", "Antrenör", "Diğer"];
export const TABS = [
  { id: "dashboard", label: "Panel", icon: "◉" },
  { id: "calendar", label: "Maç Takvimi", icon: "🗓️" },
  { id: "quests", label: "Görev Panosu", icon: "🎯" },
  { id: "goals", label: "Bireysel Hedefler", icon: "🏆" },
  { id: "training", label: "Antrenman", icon: "⚡" },
  { id: "library", label: "Kütüphane", icon: "📚" },
  { id: "tactics", label: "Taktik Tahtası", icon: "▦" },
  { id: "measurements", label: "Ölçümler", icon: "📏" },
  { id: "injuries", label: "Sakatlık Geçmişi", icon: "🩹" },
  { id: "progress", label: "Gelişim", icon: "📈" }
];
export const CATEGORIES = [
  { id: "plyometric", label: "Pliometri", color: "#FF6B35", icon: "⚡" },
  { id: "strength", label: "Kuvvet", color: "#E84855", icon: "🏋️" },
  { id: "olympic", label: "Olimpik Kaldırış", color: "#FF9F1C", icon: "🔥" },
  { id: "speed", label: "Hız & Çeviklik", color: "#00D4AA", icon: "🏃" },
  { id: "mobility", label: "Mobilite & Esneklik", color: "#7B68EE", icon: "🧘" },
  { id: "core", label: "Core", color: "#4ECDC4", icon: "🎯" },
  { id: "injury_prev", label: "Yaralanma Önleme", color: "#FF6B9D", icon: "🛡️" },
  { id: "conditioning", label: "Kondisyon", color: "#45B7D1", icon: "🔋" },
  { id: "volleyball", label: "Voleybol Teknik", color: "#FFD23F", icon: "🏐" },
  { id: "taktik", label: "Taktik & Sistem", color: "#9C27B0", icon: "🧠" },
  { id: "mental", label: "Mental Odak", color: "#00BCD4", icon: "🧘‍♂️" }
];

export const LEVEL_COLORS = { temel: "#00D4AA", orta: "#FFD23F", ileri: "#FF6B35" };
export const LEVEL_LABELS = { temel: "Temel", orta: "Orta", ileri: "İleri" };
export const MEASUREMENT_TYPES = [{ id: "height", label: "Boy", unit: "cm", icon: "📐" }, { id: "spike_reach", label: "Smaç Yüksekliği", unit: "cm", icon: "🏐" }, { id: "block_reach", label: "Blok Yüksekliği", unit: "cm", icon: "🖐️" }, { id: "standing_reach", label: "Uzanma Yüksekliği", unit: "cm", icon: "🧍" }, { id: "vertical_jump", label: "Dikey Sıçrama", unit: "cm", icon: "⬆️", auto: true, benchmarks: { beginner: 50, developing: 65, elite: 70 } }, { id: "sprint_20m", label: "20m Sprint", unit: "sn", icon: "🏃", benchmarks: { beginner: 3.2, developing: 3.0, elite: 2.8 }, lower: true }, { id: "agility_t", label: "T-Test", unit: "sn", icon: "🔀", benchmarks: { beginner: 10.5, developing: 10.0, elite: 9.5 }, lower: true }, { id: "squat_rm", label: "Squat 1RM/VA", unit: "×", icon: "🏋️", benchmarks: { beginner: 1.5, developing: 1.75, elite: 2.0 } }, { id: "weight", label: "Kilo", unit: "kg", icon: "⚖️" }, { id: "body_fat", label: "Yağ Oranı", unit: "%", icon: "📊", auto: true }, { id: "arm_span", label: "Kulaç", unit: "cm", icon: "↔️" }, { id: "shoulder_er", label: "Omuz ER Kuvveti", unit: "kg", icon: "💪", benchmarks: { beginner: 15, developing: 17.5, elite: 20 } }];

/* ════════ YARDIMCILAR ════════ */
export const INJURY_REGIONS = ["Ayak Bileği", "Diz", "Uyluk", "Kalça", "Bel", "Omuz", "Dirsek", "El Bileği", "Parmak", "Boyun", "Göğüs", "Karın", "Baldır", "Aşil", "Diğer"];
export const INJURY_TYPES = ["Burkulma", "Yırtık", "Tendinopati", "Kırık", "Çıkık", "Kontüzyon", "Kramp", "İmpingement", "Stres Kırığı", "Kas Zorlanması", "Diğer"];
export const INJURY_SEVERITY = [
  { id: "hafif", label: "Hafif", color: "#FFD23F", desc: "1-7 gün" },
  { id: "orta", label: "Orta", color: "#FF9F1C", desc: "1-4 hafta" },
  { id: "agir", label: "Ağır", color: "#FF6B6B", desc: "1+ ay" }
];

/* Navy method body fat */
