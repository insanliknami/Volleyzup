import * as THREE from 'three';

/* ══════════════════════════════════════════════════════════════
   Saha 3D — Voleybol Taktik Tahtası motoru
   VolleyzUP içine gömülü çalışır. mountTactics(root, opts) çağrılır,
   temizlik fonksiyonu döner.

   opts = {
     players : [{name, role, num}]  → A takımı kadrosunu tohumlar
     load(k)  : string|null         → kalıcı okuma
     save(k,v): void                → kalıcı yazma
     stateKey, bookKey : string     → kulüp bazlı anahtarlar
   }
   ══════════════════════════════════════════════════════════════ */

const CSS = `.t3d{position:relative;width:100%;height:100%;overflow:hidden;background:#111318;color:#EAF0F8;font-family:'DM Sans',ui-sans-serif,system-ui,sans-serif;}
.t3d{--navy:#0B1A34;--yellow:#F4C430;--ink:#EAF0F8;--muted:#8FA4C0;--line:rgba(255,255,255,.12)}
.t3d *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.t3d{position:relative;width:100%;height:100%;overflow:hidden;background:#111318;
    font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#EAF0F8}
.t3d #t3d-c{display:block;width:100%;height:100%;touch-action:none}
.t3d .brand{position:absolute;top:calc(10px + env(safe-area-inset-top));right:12px;z-index:10;
    display:flex;align-items:center;gap:10px;padding:8px 14px 8px 10px;border-radius:999px;
    background:rgba(11,26,52,.72);backdrop-filter:blur(14px);border:1px solid var(--line)}
.t3d .brand i{width:9px;height:9px;border-radius:50%;background:var(--yellow);
    box-shadow:0 0 0 4px rgba(244,196,48,.18)}
.t3d .brand b{font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.t3d #t3d-cams{position:absolute;top:calc(10px + env(safe-area-inset-top));left:12px;z-index:10;
    display:flex;flex-direction:column;gap:5px;padding:6px;border-radius:16px;
    background:rgba(11,26,52,.72);backdrop-filter:blur(14px);border:1px solid var(--line)}
.t3d #t3d-cams button{width:58px;padding:8px 4px;border:0;border-radius:11px;cursor:pointer;
    background:transparent;color:var(--muted);font:700 9.5px/1.3 inherit;letter-spacing:.08em;
    text-transform:uppercase;display:flex;flex-direction:column;align-items:center;gap:3px}
.t3d #t3d-cams button svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.7}
.t3d #t3d-cams button.on{background:var(--yellow);color:var(--navy)}
.t3d #t3d-cams .sep{height:1px;background:rgba(255,255,255,.12);margin:2px 6px}
.t3d .vsep{flex:0 0 auto;width:1px;height:22px;background:rgba(255,255,255,.14);margin:0 3px}
.t3d #t3d-fsBtn{color:var(--yellow)}
/* Sözde tam ekran — iPhone dahil her yerde çalışır */
.t3d.fs{position:fixed !important;inset:0 !important;width:100vw !important;
  height:100vh !important;height:100dvh !important;z-index:99999 !important;
  border-radius:0 !important;border:0 !important;margin:0 !important}
.t3d #t3d-readout{position:absolute;top:calc(58px + env(safe-area-inset-top));right:12px;z-index:10;
    display:none;padding:10px 13px;border-radius:14px;background:rgba(11,26,52,.85);
    backdrop-filter:blur(12px);border:1px solid var(--line);min-width:168px}
.t3d #t3d-readout.show{display:block}
.t3d #t3d-readout div{display:flex;justify-content:space-between;gap:14px;
    font:600 11px/1.9 ui-monospace,Menlo,monospace}
.t3d #t3d-readout div b{color:var(--yellow);font-weight:800}
.t3d #t3d-readout .bad b{color:#FF8A7A}
.t3d #t3d-panel{position:absolute;left:0;right:0;bottom:0;z-index:10;
    padding:9px 10px calc(9px + env(safe-area-inset-bottom));
    background:linear-gradient(to top,rgba(6,15,30,.96),rgba(6,15,30,.82) 62%,transparent)}
.t3d .row{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;align-items:center}
.t3d .row::-webkit-scrollbar{display:none}
.t3d .row+.row{margin-top:6px}
.t3d .hid{display:none!important}
.t3d .chip{flex:0 0 auto;border:1px solid var(--line);border-radius:10px;cursor:pointer;
    background:rgba(255,255,255,.05);color:var(--ink);padding:9px 12px;
    font:700 11.5px/1 inherit;white-space:nowrap}
.t3d .chip.on{background:var(--yellow);color:var(--navy);border-color:var(--yellow)}
.t3d .chip.ghost{background:transparent;color:var(--muted)}
.t3d .chip:disabled{opacity:.38;cursor:default}
.t3d .chip.sm{padding:7px 9px;font-size:11px}
.t3d .lbl{flex:0 0 auto;font:800 9.5px/1 inherit;letter-spacing:.14em;text-transform:uppercase;
    color:var(--muted)}
.t3d select.chip{appearance:none;-webkit-appearance:none}
.t3d select.chip option{background:#12294C;color:#EAF0F8}
.t3d .stepper{flex:0 0 auto;display:flex;align-items:center;border:1px solid var(--line);
    border-radius:10px;overflow:hidden;background:rgba(255,255,255,.05)}
.t3d .stepper button{border:0;background:transparent;color:var(--ink);cursor:pointer;
    padding:9px 11px;font:700 13px/1 inherit}
.t3d .stepper span{font:800 11.5px/1 inherit;color:var(--yellow);min-width:28px;text-align:center}
.t3d .sld{flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:5px 11px;border-radius:10px;
    border:1px solid var(--line);background:rgba(255,255,255,.05)}
.t3d .sld span{font:800 9.5px/1 inherit;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.t3d .sld b{font:800 11px/1 ui-monospace,monospace;color:var(--yellow);min-width:44px;text-align:right}
.t3d input[type=range]{width:96px;accent-color:#F4C430;background:transparent}
.t3d input[type=color]{flex:0 0 auto;width:36px;height:32px;padding:0;border:1px solid var(--line);
    border-radius:10px;background:transparent;cursor:pointer}
.t3d input[type=color]::-webkit-color-swatch-wrapper{padding:3px}
.t3d input[type=color]::-webkit-color-swatch{border:0;border-radius:7px}
.t3d .sheet{position:absolute;left:0;right:0;bottom:0;z-index:20;transform:translateY(105%);
    transition:transform .28s cubic-bezier(.2,.8,.2,1);
    padding:14px 14px calc(16px + env(safe-area-inset-bottom));background:#0E1F3C;
    border-top:1px solid var(--line);border-radius:18px 18px 0 0;
    box-shadow:0 -18px 40px rgba(0,0,0,.45);max-height:80vh;overflow-y:auto}
.t3d .sheet.open{transform:translateY(0)}
.t3d .sheet .head{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.t3d .sheet .head .sw{width:26px;height:26px;border-radius:8px;border:2px solid rgba(255,255,255,.5)}
.t3d .sheet .head b{font:800 13px/1 inherit;letter-spacing:.1em;text-transform:uppercase;flex:1}
.t3d .sheet .head button{border:0;background:rgba(255,255,255,.08);color:var(--ink);
    width:30px;height:30px;border-radius:9px;cursor:pointer;font-size:15px}
.t3d .fld{display:flex;align-items:center;gap:7px;margin-bottom:9px;flex-wrap:wrap}
.t3d .fld>.lbl{width:56px}
.t3d .txt{padding:9px 10px;border-radius:10px;border:1px solid var(--line);
    background:rgba(255,255,255,.06);color:var(--ink);font:700 13px/1 inherit}
.t3d #t3d-numIn{width:60px;text-align:center;font-size:15px;font-weight:800}
.t3d #t3d-nameIn{flex:1;min-width:110px}
.t3d .sws{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;flex:1}
.t3d .sws::-webkit-scrollbar{display:none}
.t3d .sws b{flex:0 0 auto;width:28px;height:28px;border-radius:9px;cursor:pointer;
    border:2px solid transparent}
.t3d .sws b.on{border-color:#fff}
.t3d .hrow{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0}
.t3d .hrow::-webkit-scrollbar{display:none}
.t3d .bch{flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:7px 11px 7px 7px;
    border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.05);
    cursor:pointer;font:700 11.5px/1 inherit;white-space:nowrap}
.t3d .bch i{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;
    font:800 10px/1 inherit;color:#fff;font-style:normal}
.t3d textarea{width:100%;min-height:140px;padding:11px;border-radius:12px;
    border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--ink);
    font:500 12.5px/1.7 ui-monospace,Menlo,monospace;resize:vertical}
.t3d .note{font:500 11px/1.6 inherit;color:var(--muted);margin:2px 0 10px}
.t3d /* oyun kitabı matrisi */
  table{width:100%;border-collapse:separate;border-spacing:5px;margin-bottom:6px}
.t3d th{font:800 8.5px/1.3 inherit;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);
    padding-bottom:2px;font-weight:800}
.t3d td{padding:0}
.t3d .cell{width:100%;min-height:38px;border-radius:9px;border:1px solid var(--line);
    background:rgba(255,255,255,.04);color:var(--muted);cursor:pointer;
    font:800 11px/1 inherit;display:grid;place-items:center}
.t3d .cell.full{background:rgba(31,169,123,.22);border-color:rgba(31,169,123,.6);color:#8FE9C6}
.t3d .cell.sel{outline:2px solid var(--yellow);outline-offset:1px}
.t3d .rlab{font:800 11px/1 inherit;color:var(--yellow);width:26px;text-align:center}
.t3d #t3d-hint{position:absolute;left:50%;transform:translateX(-50%);bottom:152px;z-index:9;
    padding:7px 14px;border-radius:999px;font:600 11px/1 inherit;color:var(--ink);
    background:rgba(11,26,52,.9);border:1px solid var(--line);pointer-events:none;
    opacity:0;transition:opacity .45s;text-align:center;max-width:90vw}
.t3d #t3d-hint.show{opacity:1}
.t3d #t3d-boot{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:14px;padding:28px;text-align:center;background:#0B1A34;
    font-size:13px;line-height:1.65;color:var(--muted)}
.t3d #t3d-boot.hide{display:none}
.t3d #t3d-boot .spin{width:26px;height:26px;border:3px solid rgba(255,255,255,.15);
    border-top-color:var(--yellow);border-radius:50%;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.t3d #t3d-boot code{display:block;max-width:min(560px,92vw);margin-top:6px;padding:12px;border-radius:10px;
    background:rgba(255,255,255,.06);color:#FFB4A6;font:500 11px/1.55 ui-monospace,monospace;
    text-align:left;white-space:pre-wrap;word-break:break-word}
@media (max-width:520px){.t3d #t3d-cams button{width:50px;font-size:9px}}`;

const HTML = `<canvas id="t3d-c"></canvas>
<div class="brand"><i></i><b id="t3d-brandName">Saha 3D</b></div>

<div id="t3d-cams">
  <button data-view="persp" class="on"><svg viewBox="0 0 24 24"><path d="M2 8l10-5 10 5-10 5z"/><path d="M2 8v8l10 5 10-5V8"/></svg>3D</button>
  <button data-view="iso"><svg viewBox="0 0 24 24"><path d="M12 3l9 5.2v7.6L12 21l-9-5.2V8.2z"/><path d="M12 12l9-5.2M12 12v9M12 12L3 6.8"/></svg>İzo</button>
  <button data-view="top"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 12h18"/></svg>Üst</button>
  <button data-view="side"><svg viewBox="0 0 24 24"><path d="M2 18h20"/><path d="M12 18V6"/><path d="M4 8h16"/></svg>Yan</button>
  <button data-view="back"><svg viewBox="0 0 24 24"><path d="M2 19h20"/><ellipse cx="12" cy="11" rx="9" ry="5"/><path d="M12 19v-3"/></svg>Arka</button>
  <i class="sep"></i>
  <button id="t3d-fsBtn"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg><span id="t3d-fsLbl">Tam</span></button>
</div>

<div id="t3d-readout"></div>
<div id="t3d-hint"></div>

<div id="t3d-panel">
  <div class="row" id="t3d-modes">
    <button class="chip on" data-mode="arrange">Diziliş</button>
    <button class="chip" data-mode="teach">Anlat</button>
    <button class="chip" data-mode="play">Oynat</button>
    <button class="chip ghost" id="t3d-undoActBtn" style="margin-left:auto" disabled>Geri al</button>
    <button class="chip ghost" id="t3d-foldBtn">Ayarlar</button>
  </div>

  <div class="row" id="t3d-ctxArrange">
    <button class="chip on" data-form="base">Servis</button>
    <button class="chip" data-form="reception">Karşılama</button>
    <button class="chip" data-form="attack">Hücum geçişi</button>
    <button class="chip" data-form="defense">Blok–Savunma</button>
  </div>
  <div class="row" id="t3d-ctxArrange2">
    <div class="stepper"><button id="t3d-rotPrev">‹</button><span id="t3d-rotLbl">R1</span><button id="t3d-rotNext">›</button></div>
    <button class="chip" id="t3d-applyAll">6 rotasyona uygula</button>
    <button class="chip ghost" id="t3d-playRot">Rotasyonu oynat</button>
    <button class="chip ghost" id="t3d-legalBtn">Rotasyon kontrolü</button>
    <button class="chip ghost" id="t3d-blockTrio">File üçlüsü blok</button>
    <i class="vsep"></i>
    <span class="lbl">Ekipman</span>
    <button class="chip ghost" id="t3d-addCone">Huni</button>
    <button class="chip ghost" id="t3d-addCart">Sepet</button>
    <button class="chip ghost" id="t3d-addMat">Minder</button>
    <button class="chip ghost" id="t3d-clrGear">Temizle</button>
  </div>

  <div class="row hid" id="t3d-ctxTeach1">
    <button class="chip" id="t3d-trailBtn">İz: Kapalı</button>
    <button class="chip ghost" id="t3d-undoBtn">Son izi sil</button>
    <button class="chip ghost" id="t3d-clearBtn">İzleri sil</button>
    <i class="vsep"></i>
    <button class="chip ghost" id="t3d-rangeBtn">Kapsama</button>
    <div class="sld" id="t3d-rangeWrap" style="display:none"><span>Yarıçap</span><input type="range" id="t3d-rangeR" min="15" max="45" value="28"><b id="t3d-rangeRv">2.8 m</b></div>
    <button class="chip ghost" id="t3d-measBtn">Ölç</button>
    <button class="chip ghost" id="t3d-viewConeBtn">Görüş açısı</button>
    <i class="vsep"></i>
    <button class="chip ghost" id="t3d-noteBtn">Not ekle</button>
    <button class="chip ghost" id="t3d-noteClr">Notları sil</button>
  </div>

  <div class="row hid" id="t3d-ctxTeach2">
    <button class="chip on" id="t3d-modeTarget">Hedefe at</button>
    <button class="chip ghost" id="t3d-modeFree">Serbest</button>
    <div class="sld"><span>Açı</span><input type="range" id="t3d-angIn" min="-10" max="45" value="8"><b id="t3d-angV">8°</b></div>
    <div class="sld" id="t3d-spdWrap"><span>Hız</span><input type="range" id="t3d-spdIn" min="15" max="120" value="60"><b id="t3d-spdV">60 km/s</b></div>
    <div class="sld"><span>Falso</span><input type="range" id="t3d-spinIn" min="-120" max="160" value="60"><b id="t3d-spinV">60</b></div>
    <div class="sld"><span>Top yük.</span><input type="range" id="t3d-ballY" min="10" max="450" value="10"><b id="t3d-ballYv">0.10 m</b></div>
    <button class="chip" id="t3d-fireBtn">At</button>
  </div>

  <div class="row hid" id="t3d-ctxPlay">
    <button class="chip" id="t3d-bookBtn">Oyun kitabı</button>
    <button class="chip ghost" id="t3d-addStep">Adım ekle</button>
    <span class="lbl" id="t3d-stepInfo">0 adım</span>
    <button class="chip" id="t3d-playBtn">Oynat</button>
    <button class="chip ghost" id="t3d-clrSteps">Adımları sil</button>
    <div class="sld"><span>Süre</span><input type="range" id="t3d-durIn" min="6" max="40" value="16"><b id="t3d-durV">1.6 sn</b></div>
  </div>

  <div class="row hid" id="t3d-extra">
    <button class="chip" id="t3d-rosterBtn">Kadro</button>
    <button class="chip ghost" id="t3d-expBtn">Dosyaya aktar</button>
    <button class="chip ghost" id="t3d-impBtn">Dosyadan yükle</button>
    <input type="file" id="t3d-impIn" accept=".json,application/json" style="display:none">
    <select class="chip" id="t3d-netSel">
      <option value="2.43">File 2.43 — Erkek</option>
      <option value="2.35">File 2.35 — Karma</option>
      <option value="2.24" selected>File 2.24 — Kadın</option>
      <option value="2.15">File 2.15 — Midi</option>
      <option value="2.05">File 2.05 — Mini</option>
    </select>
    <select class="chip" id="t3d-themeSel">
      <option value="classic">Klasik saha</option>
      <option value="dev">Kulüp teması</option>
    </select>
    <button class="chip ghost" id="t3d-labelBtn">Etiket: Numara</button>
    <button class="chip ghost" id="t3d-shadowBtn">Blok gölgesi</button>
    <div class="sld"><span>Vuruş</span><input type="range" id="t3d-hitH" min="200" max="345" value="285"><b id="t3d-hitHv">2.85 m</b></div>
    <div class="sld"><span>Blok eli</span><input type="range" id="t3d-blkH" min="0" max="55" value="25"><b id="t3d-blkHv">+25 cm</b></div>
    <input type="color" id="t3d-colA" value="#12294c" title="A takımı">
    <input type="color" id="t3d-colB" value="#b33a2b" title="B takımı">
    <button class="chip ghost" id="t3d-shotBtn">Görüntü Al</button>
    <button class="chip ghost" id="t3d-resetBtn">Bu sekmeyi sıfırla</button>
  </div>
</div>

<div class="sheet" id="t3d-edit">
  <div class="head"><i class="sw" id="t3d-eSw"></i><b id="t3d-eTitle">Oyuncu</b><button id="t3d-eClose">✕</button></div>
  <div class="fld"><span class="lbl">Numara</span>
    <input id="t3d-numIn" class="txt" type="text" inputmode="numeric" maxlength="2" value="1">
    <input id="t3d-nameIn" class="txt" type="text" placeholder="İsim" maxlength="24"></div>
  <div class="fld"><span class="lbl">Rol</span>
    <select class="chip" id="t3d-roleIn">
      <option value="P">Pasör</option><option value="S">Smaçör</option>
      <option value="O">Orta</option><option value="PÇ">Pasör Çaprazı</option>
      <option value="L">Libero</option></select>
    <button class="chip" id="t3d-liberoBtn">Libero forması</button>
    <button class="chip ghost" id="t3d-teamBtn">Takım rengine dön</button></div>
  <div class="fld"><span class="lbl">Duruş</span>
    <button class="chip sm" data-pose="ready">Hazır</button>
    <button class="chip sm" data-pose="block">Blok</button>
    <button class="chip sm" data-pose="spike">Vuruş</button>
    <button class="chip sm" data-pose="dig">Savunma</button>
    <div class="sld"><span>Sıçrama</span><input type="range" id="t3d-jumpIn" min="0" max="90" value="0"><b id="t3d-jumpV">0 cm</b></div></div>
  <div class="fld"><span class="lbl">Forma</span><div class="sws" id="t3d-swatches"></div>
    <input type="color" id="t3d-jerseyIn" value="#12294c"></div>
  <div class="fld"><span class="lbl">Değiştir</span></div>
  <div class="hrow" id="t3d-benchList"></div>
</div>

<div class="sheet" id="t3d-scope">
  <div class="head"><b>6 rotasyona uygula</b><button id="t3d-scClose">✕</button></div>
  <p class="note">Bu dizilişteki bölge konumları altı rotasyonun hepsine yazılacak.
     Oyuncular bölgelerin içinden dönecek, diziliş şekli sabit kalacak.</p>
  <div class="fld">
    <button class="chip" id="t3d-scOne">Sadece bu sekme</button>
    <button class="chip ghost" id="t3d-scAll">Dört sekme birden</button>
  </div>
</div>

<div class="sheet" id="t3d-roster">
  <div class="head"><b>Kadro</b><button id="t3d-rClose">✕</button></div>
  <div class="fld">
    <button class="chip on" data-team="0">A Takımı</button>
    <button class="chip" data-team="1">B Takımı</button>
    <input id="t3d-clubIn" class="txt" type="text" placeholder="Kulüp adı" maxlength="28" style="flex:1;min-width:130px">
  </div>
  <p class="note">Her satır: <b>numara · isim · rol</b>. Roller: P, S, O, PÇ, L.<br>
     İlk 6 satır sahadaki diziliş — sırasıyla 1, 2, 3, 4, 5, 6 numaralı bölgeler.</p>
  <textarea id="t3d-rosterTxt" spellcheck="false"></textarea>
  <div class="fld" style="margin-top:10px"><button class="chip" id="t3d-applyRoster">Kadroyu uygula</button></div>
</div>

<div class="sheet" id="t3d-book">
  <div class="head"><b>Oyun Kitabı</b><button id="t3d-bClose">✕</button></div>
  <table id="t3d-bookTbl"></table>
  <div class="fld">
    <button class="chip" id="t3d-cellLoad">Yükle</button>
    <button class="chip ghost" id="t3d-cellSave">Bu kutuya kaydet</button>
    <button class="chip ghost" id="t3d-cellStep">Adıma ekle</button>
    <button class="chip ghost" id="t3d-cellDel">Sil</button>
  </div>
  <p class="note">Serbest kayıtlar — kalıba girmeyen denemeler için.</p>
  <div class="fld">
    <input id="t3d-freeName" class="txt" type="text" placeholder="Kayıt adı" style="flex:1;min-width:130px">
    <button class="chip" id="t3d-freeSave">Kaydet</button></div>
  <div class="hrow" id="t3d-freeList"></div>
</div>

`;

export function mountTactics(root, opts) {
  root.classList.add('t3d');
  const style = document.createElement('style');
  style.textContent = CSS;
  root.appendChild(style);
  const holder = document.createElement('div');
  holder.innerHTML = HTML;
  while (holder.firstChild) root.appendChild(holder.firstChild);

  const $ = (id) => root.querySelector('#t3d-' + id);
  let alive = true;
  const listeners = [];
  const win = (ev, fn) => { window.addEventListener(ev, fn); listeners.push([ev, fn]); };

  /* ── Depolama: VolleyzUP deseni (kulüp bazlı localStorage) ── */
  var KEY=opts.stateKey, BKEY=opts.bookKey;
  function sGet(k){ return Promise.resolve(opts.load(k)); }
  function sSet(k,v){ try{opts.save(k,v);}catch(e){} return Promise.resolve(); }
  var saveT=null;
  function scheduleSave(){clearTimeout(saveT);saveT=setTimeout(function(){
    sSet(KEY,JSON.stringify(stateObj()));},700);}
  function saveBook(){sSet(BKEY,JSON.stringify(BOOK));}

  var canvas=$('c');
  if(!canvas) throw new Error('Saha tuvali bulunamadı (t3d-c)');
  var renderer;
  try{
    renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,preserveDrawingBuffer:true});
  }catch(e){
    throw new Error('WebGL başlatılamadı: '+(e && e.message ? e.message : e));
  }
  if(!renderer) throw new Error('WebGL bu tarayıcıda kullanılamıyor');
  /* sRGB çıktı: gamma düzeltmesi uygulanır, renkler tasarlandığı gibi çıkar */
  if('outputColorSpace' in renderer) renderer.outputColorSpace=THREE.SRGBColorSpace;
  if('useLegacyLights' in renderer) renderer.useLegacyLights=false;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;

  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(42,1,0.1,400);
  scene.add(new THREE.HemisphereLight(0xdfeaff,0x3d4a68,3.1));
  var sun=new THREE.DirectionalLight(0xffffff,3.0);sun.position.set(11,20,9);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;
  sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;sun.shadow.camera.far=60;
  sun.shadow.bias=-0.0015;scene.add(sun);
  var fl=new THREE.DirectionalLight(0xa8ccff,1.05);fl.position.set(-12,9,-10);scene.add(fl);

  /* ══════════ TEMA + SAHA ══════════ */
  var THEMES={
    classic:{court:0xD9762F,free:0x11748F,line:0xffffff,bg:0x111318},
    dev:{court:0x1D4A80,free:0x18855F,line:0xFFB000,bg:0x111318}
  };
  var theme='classic',clubName='';
  var outer=new THREE.Mesh(new THREE.PlaneGeometry(18,27),
    new THREE.MeshStandardMaterial({roughness:.92}));
  outer.rotation.x=-Math.PI/2;outer.position.y=-0.02;outer.receiveShadow=true;scene.add(outer);
  var court=new THREE.Mesh(new THREE.PlaneGeometry(9,18),
    new THREE.MeshStandardMaterial({roughness:.9}));
  court.rotation.x=-Math.PI/2;court.receiveShadow=true;scene.add(court);
  var lineMat=new THREE.MeshBasicMaterial();
  function line(w,l,x,z){var m=new THREE.Mesh(new THREE.PlaneGeometry(w,l),lineMat);
    m.rotation.x=-Math.PI/2;m.position.set(x,0.012,z);scene.add(m);}
  line(.05,18,-4.5,0);line(.05,18,4.5,0);line(9,.05,0,-9);line(9,.05,0,9);
  line(9,.05,0,0);line(9,.05,0,-3);line(9,.05,0,3);

  var clubPlane=null;
  function setTheme(k){
    theme=k;var t=THEMES[k];
    scene.background=new THREE.Color(t.bg);
    outer.material.color.setHex(t.free);court.material.color.setHex(t.court);
    lineMat.color.setHex(t.line);
    drawClub();
  }
  function drawClub(){
    if(clubPlane){scene.remove(clubPlane);clubPlane.geometry.dispose();
      clubPlane.material.map.dispose();clubPlane.material.dispose();clubPlane=null;}
    if(!clubName)return;
    var c=document.createElement('canvas');c.width=1024;c.height=128;var g=c.getContext('2d');
    g.fillStyle='#'+THEMES[theme].line.toString(16).padStart(6,'0');
    g.textAlign='center';g.textBaseline='middle';
    g.font='800 74px system-ui,sans-serif';
    g.globalAlpha=.55;g.fillText(clubName.toLocaleUpperCase('tr'),512,68);
    var tex=new THREE.CanvasTexture(c);
    clubPlane=new THREE.Mesh(new THREE.PlaneGeometry(9,1.12),
      new THREE.MeshBasicMaterial({map:tex,transparent:true}));
    clubPlane.rotation.x=-Math.PI/2;clubPlane.position.set(0,.013,-10.6);
    scene.add(clubPlane);
  }

  /* ══════════ FILE ══════════ */
  function netTex(){var c=document.createElement('canvas');c.width=c.height=64;
    var g=c.getContext('2d');g.strokeStyle='rgba(18,22,30,.9)';g.lineWidth=2.5;
    for(var i=0;i<=64;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,64);g.stroke();
      g.beginPath();g.moveTo(0,i);g.lineTo(64,i);g.stroke();}
    var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(38,4);return t;}
  var netG=new THREE.Group();scene.add(netG);
  var nmesh=new THREE.Mesh(new THREE.PlaneGeometry(9.5,1),new THREE.MeshBasicMaterial(
    {map:netTex(),transparent:true,side:THREE.DoubleSide,opacity:.95}));
  nmesh.position.y=-0.5;netG.add(nmesh);
  var bandM=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7});
  var bt=new THREE.Mesh(new THREE.BoxGeometry(9.5,.07,.02),bandM);netG.add(bt);
  var bb=new THREE.Mesh(new THREE.BoxGeometry(9.5,.05,.02),bandM);bb.position.y=-1;netG.add(bb);
  [-4.5,4.5].forEach(function(x){for(var i=0;i<9;i++){
    var s=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.2,8),
      new THREE.MeshStandardMaterial({color:(i%2)?0xffffff:0xD94F3D,roughness:.5}));
    s.position.set(x,-1+.1+i*.2,0);netG.add(s);}});
  var postMat=new THREE.MeshStandardMaterial({color:0x9AA8BD,metalness:.55,roughness:.4});
  var posts=[-5.3,5.3].map(function(x){
    var p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,1,14),postMat);
    p.position.x=x;p.castShadow=true;scene.add(p);return p;});

  var category='2.24',netTop=2.24,ballR=.105,ballM=.27;
  function setNet(v){
    category=String(v);netTop=parseFloat(v);
    netG.position.y=netTop;
    posts.forEach(function(p){p.scale.y=netTop+.12;p.position.y=(netTop+.12)/2;});
    var four=netTop<2.2;
    ballR=four?.100:.105; ballM=four?.21:.27;
    bs.scale.setScalar(ballR/.105);
    if(ball.position.y<1)ball.position.y=ballR;
    // kategoriye göre varsayılan vuruş yüksekliği
    var def=Math.round((netTop+0.55)*100);
    $('hitH').value=Math.max(200,Math.min(345,def));syncHit();
  }

  /* ══════════ RENK ══════════ */
  function lum(hex){var n=parseInt(hex.slice(1),16);
    return .299*((n>>16)&255)+.587*((n>>8)&255)+.114*(n&255);}
  function contrast(hex){return lum(hex)>150?'#111820':'#ffffff';}

  /* ══════════ KADRO VERİSİ ══════════ */
  var ROLES=['P','S','O','PÇ','L'];
  var ROLE_FULL={'P':'Pasör','S':'Smaçör','O':'Orta','PÇ':'Pasör Çaprazı','L':'Libero'};
  var uid=0;function nid(){return 'm'+(++uid);}
  var START_ROLE={1:'P',2:'O',3:'S',4:'PÇ',5:'L',6:'S'};
  var BENCH_ROLE=['S','O','P','L','S','O','PÇ','S'];
  function newMember(num,name,role,jersey){
    return {id:nid(),num:String(num),name:name||'',role:role||'S',jersey:jersey,custom:false};}
  var TEAMS=[{name:'A',col:'#2E5FB5',sign:-1,roster:[]},
             {name:'B',col:'#D14A33',sign: 1,roster:[]}];
  TEAMS.forEach(function(t,ti){
    var r=[],i,seed=(ti===0&&opts.players&&opts.players.length)?opts.players:null;
    for(i=0;i<14;i++){
      var role=i<6?START_ROLE[i+1]:BENCH_ROLE[i-6];
      var nm='',num=i+1;
      if(seed&&seed[i]){nm=seed[i].name||'';role=seed[i].role||role;
        if(seed[i].num)num=seed[i].num;}
      r.push(newMember(num,nm,role,t.col));
    }
    t.roster=r;
  });

  /* ══════════ FİGÜR ══════════ */
  var POSES={
    ready:{sh:-0.30,el:-0.42,hip:-0.06,knee:0.12,drop:0.03,spread:0.13,arm2:0,armZ:0.10},
    block:{sh:-3.02,el:-0.02,hip: 0.00,knee:0.03,drop:0.00,spread:0.06,arm2:0,armZ:0.05},
    spike:{sh:-2.65,el:-0.25,hip:-0.12,knee:0.20,drop:0.00,spread:0.11,arm2:1.15,armZ:0.13},
    dig:  {sh:-1.22,el:-0.06,hip:-0.62,knee:0.98,drop:0.30,spread:0.46,arm2:0,armZ:-0.17}
  };
  function darken(hex,a){
    var n=parseInt(hex.slice(1),16);
    var r=Math.round(((n>>16)&255)*(1-a)),g=Math.round(((n>>8)&255)*(1-a)),b=Math.round((n&255)*(1-a));
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }
  function seg(len,rt,rb,mat,y){
    var m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,len,12),mat);
    m.position.y=y;return m;
  }
  /* Referans üsluba göre: yumuşak silindir uzuvlar, yüz detayı yok,
     alın bandı (yön göstergesi), kolluk, dizüstü çorap, kalın ayakkabı. */
  function buildFigure(mats){
    var root=new THREE.Group(),parts=new THREE.Group();root.add(parts);
    // gövde — atlet
    var torso=new THREE.Mesh(new THREE.CylinderGeometry(.172,.196,.46,16),mats.jersey);
    torso.position.y=1.37;torso.castShadow=true;parts.add(torso);
    var chest=new THREE.Mesh(new THREE.SphereGeometry(.172,16,12),mats.jersey);
    chest.scale.set(1,.55,1);chest.position.y=1.60;parts.add(chest);
    // şort
    var shorts=new THREE.Mesh(new THREE.CylinderGeometry(.196,.186,.27,16),mats.shorts);
    shorts.position.y=1.05;shorts.castShadow=true;parts.add(shorts);
    // boyun + kafa
    parts.add(seg(.09,.056,.062,mats.skin,1.66));
    var head=new THREE.Mesh(new THREE.SphereGeometry(.145,20,16),mats.skin);
    head.scale.set(1,1.1,.96);head.position.y=1.80;head.castShadow=true;parts.add(head);
    var band=new THREE.Mesh(new THREE.CylinderGeometry(.150,.150,.062,20,1,true),mats.trim);
    band.position.y=1.815;parts.add(band);
    var cap=new THREE.Mesh(new THREE.SphereGeometry(.146,20,12,0,Math.PI*2,0,Math.PI/2.5),mats.trim);
    cap.scale.set(1,1.05,.96);cap.position.y=1.815;parts.add(cap);
    // burun yönü belirtici (küçük, alın bandının üstünde)
    var nose=new THREE.Mesh(new THREE.SphereGeometry(.032,10,8),mats.skin);
    nose.position.set(0,1.79,.142);parts.add(nose);

    var arms=[],legs=[],i,sg;
    for(i=0;i<2;i++){
      sg=i?1:-1;
      var shG=new THREE.Group();shG.position.set(sg*.185,1.545,0);
      shG.add(new THREE.Mesh(new THREE.SphereGeometry(.072,12,10),mats.skin));
      shG.add(seg(.30,.062,.055,mats.skin,-.16));
      shG.add(seg(.11,.070,.066,mats.trim,-.27));          // kolluk
      var elG=new THREE.Group();elG.position.y=-.31;shG.add(elG);
      elG.add(seg(.28,.053,.046,mats.skin,-.14));
      var hand=new THREE.Mesh(new THREE.SphereGeometry(.062,12,10),mats.skin);
      hand.position.y=-.29;elG.add(hand);
      parts.add(shG);arms.push({sh:shG,el:elG,side:sg});
    }
    for(i=0;i<2;i++){
      sg=i?1:-1;
      var hpG=new THREE.Group();hpG.position.set(sg*.105,1.00,0);
      hpG.add(seg(.42,.092,.076,mats.skin,-.21));
      var knG=new THREE.Group();knG.position.y=-.42;hpG.add(knG);
      knG.add(new THREE.Mesh(new THREE.SphereGeometry(.080,12,10),mats.skin));
      knG.add(seg(.46,.074,.062,mats.skin,-.23));
      knG.add(seg(.22,.080,.070,mats.trim,-.35));          // dizüstü çorap
      var shoe=new THREE.Mesh(new THREE.BoxGeometry(.145,.135,.30),mats.jersey);
      shoe.position.set(0,-.50,.055);shoe.castShadow=true;knG.add(shoe);
      var toe=new THREE.Mesh(new THREE.SphereGeometry(.075,12,10),mats.jersey);
      toe.scale.set(.97,.9,1.1);toe.position.set(0,-.50,.185);knG.add(toe);
      parts.add(hpG);legs.push({hp:hpG,kn:knG,side:sg});
    }
    var hit=new THREE.Mesh(new THREE.CylinderGeometry(.64,.64,2.5,10),
      new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    hit.position.y=1.2;root.add(hit);
    var shadow=new THREE.Mesh(new THREE.CircleGeometry(.32,20),
      new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.20}));
    shadow.rotation.x=-Math.PI/2;root.add(shadow);
    var warn=new THREE.Mesh(new THREE.RingGeometry(.36,.47,26),
      new THREE.MeshBasicMaterial({color:0xD94F3D,side:THREE.DoubleSide,transparent:true,opacity:.95}));
    warn.rotation.x=-Math.PI/2;warn.visible=false;root.add(warn);
    return {root:root,parts:parts,arms:arms,legs:legs,shadow:shadow,warn:warn};
  }
  function applyPose(fig,pose,jump){
    var p=POSES[pose]||POSES.ready;
    fig.parts.position.y=-p.drop+jump;
    fig.arms.forEach(function(a,i){
      a.sh.rotation.set(p.sh+(i===1?p.arm2:0),0,a.side*p.armZ);
      a.el.rotation.x=p.el;
    });
    fig.legs.forEach(function(l){
      l.hp.rotation.set(p.hip,0,l.side*p.spread);
      l.kn.rotation.x=p.knee;
    });
    fig.shadow.position.y=.014;
    fig.warn.position.y=.020;
    fig.shadow.scale.setScalar(1-Math.min(.42,jump*.4));
    fig.shadow.material.opacity=.24-Math.min(.15,jump*.15);
  }

  /* ══════════ SLOTLAR ══════════ */
  var slots=[],labelMode=0;
  function labelSprite(text,bg,wide){
    var W=wide?360:160,H=wide?150:160;
    var c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d');
    g.fillStyle=bg;
    if(wide){var r=54,x=6,y=20,w=W-12,h=108;
      g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);
      g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fill();}
    else{g.beginPath();g.arc(80,80,72,0,Math.PI*2);g.fill();}
    g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=6;g.stroke();
    g.fillStyle=contrast(bg);g.textAlign='center';g.textBaseline='middle';
    var fs=wide?(text.length>10?36:46):(text.length>2?48:74);
    g.font='800 '+fs+'px system-ui,sans-serif';g.fillText(text,W/2,wide?76:84);
    var s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),
      depthTest:false,transparent:true}));
    s.scale.set(wide?1.4:.62,wide?.58:.62,1);s.renderOrder=10;return s;
  }
  var skinMat=new THREE.MeshStandardMaterial({color:0xF0C79B,roughness:.78});
  TEAMS.forEach(function(team){
    for(var z=1;z<=6;z++){
      var mats={jersey:new THREE.MeshStandardMaterial({roughness:.6}),
                shorts:new THREE.MeshStandardMaterial({roughness:.7}),
                trim:new THREE.MeshStandardMaterial({roughness:.62}),
                skin:skinMat};
      var fig=buildFigure(mats);
      fig.root.userData={team:team,zone:z,member:team.roster[z-1],fig:fig,
        mats:mats,pose:'ready',jump:0,sprite:null,drag:true};
      applyPose(fig,'ready',0);
      scene.add(fig.root);slots.push(fig.root);paint(fig.root);
    }
  });
  function paint(s){
    var u=s.userData,m=u.member;
    u.mats.jersey.color.set(m.jersey);
    u.mats.trim.color.set(darken(m.jersey,.34));
    u.mats.shorts.color.set(lum(m.jersey)<60?'#3A4252':darken(m.jersey,.72));
    if(u.sprite){s.remove(u.sprite);u.sprite=null;}
    if(labelMode<4){
      var txt=labelMode===0?m.num:(labelMode===1?(m.name||m.num):
              (labelMode===2?m.role:String(u.zone)));
      u.sprite=labelSprite(txt,labelMode===3?'#0E1F3C':m.jersey,labelMode===1&&!!m.name);
      u.sprite.position.y=2.42;s.add(u.sprite);
    }
  }
  function repaintAll(){slots.forEach(paint);}
  /* Oyuncular topa döner; blok duruşundakiler file'a bakar. */
  function faceBall(){
    slots.forEach(function(s){
      var sg=s.userData.team.sign;
      if(s.userData.pose==='block'){s.rotation.y=sg<0?0:Math.PI;return;}
      var dx=ball.position.x-s.position.x, dz=ball.position.z-s.position.z;
      if(Math.abs(dx)+Math.abs(dz)<0.05){s.rotation.y=sg<0?0:Math.PI;return;}
      s.rotation.y=Math.atan2(dx,dz);
    });
  }
  function onCourtIds(team){var a=[];
    slots.forEach(function(s){if(s.userData.team===team)a.push(s.userData.member.id);});return a;}
  function slotOf(team,zone){
    for(var i=0;i<slots.length;i++)
      if(slots[i].userData.team===team&&slots[i].userData.zone===zone)return slots[i];
    return null;
  }

  /* ══════════ TOP ══════════ */
  var ball=new THREE.Group();
  var bs=new THREE.Mesh(new THREE.SphereGeometry(.105,22,18),
    new THREE.MeshStandardMaterial({color:0xF4C430,roughness:.45}));
  bs.castShadow=true;ball.add(bs);
  ball.add(new THREE.Mesh(new THREE.SphereGeometry(.5,10,8),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})));
  ball.position.set(0,.105,-6.2);ball.userData={drag:true,isBall:true};scene.add(ball);

  var ring=new THREE.Mesh(new THREE.RingGeometry(.34,.44,32),
    new THREE.MeshBasicMaterial({color:0xF4C430,side:THREE.DoubleSide,transparent:true}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.02;ring.visible=false;scene.add(ring);

  var targetM=new THREE.Mesh(new THREE.RingGeometry(.30,.42,28),
    new THREE.MeshBasicMaterial({color:0x1FA97B,side:THREE.DoubleSide,transparent:true,opacity:.9}));
  targetM.rotation.x=-Math.PI/2;targetM.position.set(0,.03,5.5);targetM.visible=false;
  targetM.userData={drag:true,isTarget:true};scene.add(targetM);

  /* ══════════ İZLER ══════════ */
  var trailsOn=false,trailG=new THREE.Group();scene.add(trailG);
  var TRAILS=[],recPts=null,recLine=null,recColor='#F4C430',recOwner=null;
  function startTrail(o){
    if(!trailsOn||o.userData.isTarget)return;
    recOwner=o.userData.isBall?'ball':o.userData.member.id;
    recColor=o.userData.isBall?'#F4C430':o.userData.member.jersey;
    recPts=[new THREE.Vector3(o.position.x,.05,o.position.z)];
    recLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(recPts),
      new THREE.LineBasicMaterial({color:recColor}));
    trailG.add(recLine);
  }
  function feedTrail(o){
    if(!recPts)return;
    var p=new THREE.Vector3(o.position.x,.05,o.position.z);
    if(p.distanceTo(recPts[recPts.length-1])<.18)return;
    recPts.push(p);recLine.geometry.dispose();
    recLine.geometry=new THREE.BufferGeometry().setFromPoints(recPts);
  }
  function endTrail(){
    if(!recPts)return;
    if(recPts.length<3){trailG.remove(recLine);recPts=null;recLine=null;return;}
    trailG.remove(recLine);
    var grp=new THREE.Group();
    grp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(recPts),
      Math.min(140,recPts.length*6),.045,7,false),new THREE.MeshBasicMaterial({color:recColor})));
    var a=recPts[recPts.length-2],b=recPts[recPts.length-1];
    var cone=new THREE.Mesh(new THREE.ConeGeometry(.13,.34,14),
      new THREE.MeshBasicMaterial({color:recColor}));
    cone.position.copy(b);cone.lookAt(b.clone().add(b.clone().sub(a).normalize()));
    cone.rotateX(Math.PI/2);grp.add(cone);
    trailG.add(grp);
    TRAILS.push({owner:recOwner,pts:recPts.slice(),obj:grp});
    recPts=null;recLine=null;
  }
  function disposeObj(o){o.traverse(function(c){
    if(c.geometry)c.geometry.dispose();if(c.material)c.material.dispose();});}
  function undoTrail(){
    var t=TRAILS.pop();if(!t)return;trailG.remove(t.obj);disposeObj(t.obj);}
  function clearTrails(){
    while(TRAILS.length){var t=TRAILS.pop();trailG.remove(t.obj);disposeObj(t.obj);}
    while(trailG.children.length){var c=trailG.children.pop();disposeObj(c);}
  }
  function trailFor(id,from,to){
    for(var i=TRAILS.length-1;i>=0;i--){
      var t=TRAILS[i];if(t.owner!==id)continue;
      var p0=t.pts[0],p1=t.pts[t.pts.length-1];
      if(Math.hypot(p0.x-from.x,p0.z-from.z)<1.3&&Math.hypot(p1.x-to.x,p1.z-to.z)<1.3)return t.pts;
    }
    return null;
  }

  /* ══════════ DİZİLİŞLER ══════════ */
  var BASE={1:[-3,-7],2:[-3,-1.5],3:[0,-1.5],4:[3,-1.5],5:[3,-7],6:[0,-7]};
  /* Şablonlar rol farkındadır: her nokta hangi rolü istediğini söyler,
     oyuncular rollerine göre yerleşir. row alanı ön/arka hattı zorunlu kılar. */
  var PRESETS={
    reception:[
      {x:-2.2,z:-1.2,pose:'ready',want:['P']},
      {x: 0.9,z:-1.5,pose:'ready',want:['O'],row:'front'},
      {x: 3.5,z:-2.5,pose:'ready',want:['PÇ','S']},
      {x:-3.2,z:-5.6,pose:'dig',want:['S','L']},
      {x: 0.0,z:-6.8,pose:'dig',want:['L','S']},
      {x: 3.2,z:-5.6,pose:'dig',want:['S','L']}],
    attack:[
      {x:-1.0,z:-1.2,pose:'ready',want:['P']},
      {x: 0.9,z:-1.7,pose:'spike',want:['O'],row:'front'},
      {x: 3.7,z:-2.3,pose:'spike',want:['S'],row:'front'},
      {x:-3.7,z:-2.5,pose:'ready',want:['PÇ']},
      {x: 1.4,z:-5.6,pose:'ready',want:['S','L']},
      {x:-1.6,z:-6.2,pose:'dig',want:['L','S']}],
    defense:[
      {x:-2.7,z:-0.75,pose:'block',want:['PÇ','O'],row:'front'},
      {x: 0.0,z:-0.75,pose:'block',want:['O','S'],row:'front'},
      {x: 2.7,z:-0.75,pose:'block',want:['S','O'],row:'front'},
      {x: 3.8,z:-4.8,pose:'dig',want:['S','L'],row:'back'},
      {x:-3.8,z:-4.8,pose:'dig',want:['S','L'],row:'back'},
      {x: 0.0,z:-7.4,pose:'dig',want:['L','S'],row:'back'}]
  };
  var FRONTZ=[2,3,4],BACKZ=[1,5,6];
  function applyPreset(k){
    TEAMS.forEach(function(t){
      var sg=t.sign,z,s2;
      if(k==='base'||!PRESETS[k]){
        for(z=1;z<=6;z++){s2=slotOf(t,z);if(!s2)continue;
          var c=BASE[z];
          s2.position.set(sg<0?c[0]:-c[0],0,sg<0?c[1]:-c[1]);
          s2.userData.pose='ready';s2.userData.jump=0;}
        return;
      }
      var pool=[];
      for(z=1;z<=6;z++){s2=slotOf(t,z);if(s2)pool.push(s2);}
      PRESETS[k].forEach(function(sp){
        var cands=pool.filter(function(x){
          if(sp.row==='front')return FRONTZ.indexOf(x.userData.zone)>=0;
          if(sp.row==='back') return BACKZ.indexOf(x.userData.zone)>=0;
          return true;});
        if(!cands.length)cands=pool;
        var best=cands[0],bs=1e9;
        cands.forEach(function(x){
          var ri=sp.want.indexOf(x.userData.member.role);
          var tx=sg<0?sp.x:-sp.x, tz=sg<0?sp.z:-sp.z;
          var sc=(ri<0?9:ri)*100+Math.hypot(x.position.x-tx,x.position.z-tz);
          if(sc<bs){bs=sc;best=x;}});
        pool.splice(pool.indexOf(best),1);
        best.position.set(sg<0?sp.x:-sp.x,0,sg<0?sp.z:-sp.z);
        best.userData.pose=sp.pose;
        best.userData.jump=sp.pose==='block'?0.30:(sp.pose==='spike'?0.38:0);
      });
    });
    slots.forEach(function(x){applyPose(x.userData.fig,x.userData.pose,x.userData.jump);});
    if(k==='attack')ball.position.set(1.0,2.60,-1.9);
    else if(k==='defense')ball.position.set(0,ballR,5.5);
    else ball.position.set(0,ballR,-6.2);
  }

  /* Sekme hafızası: her rotasyon × sekme kendi düzenini saklar.
     Sekme değişince mevcut düzen kaydedilir, gidilen sekmeninki geri gelir. */
  var curForm='base',rotIdx=1,selected=null,WORK={},LASTROT={};
  /* Bir kayıttan bölge→konum haritası çıkar (A takımı referans alınır).
     Avrupa rotasyonu: 1→6→5→4→3→2→1. Konumlar bölgeye aittir,
     oyuncular bölgelerin içinden geçerek döner. */
  function zmapFrom(p){
    var m={};
    if(!p||!p.slots)return m;
    p.slots.forEach(function(sd){
      if(sd.t!==0)return;
      m[sd.z]={x:sd.x,z:sd.zz,pose:sd.pose||'ready',jump:sd.jump||0};
    });
    return m;
  }
  function applyZMapObj(m){
    if(!m||!m[1])return false;
    TEAMS.forEach(function(t){
      var sg=t.sign;
      for(var z=1;z<=6;z++){
        var s2=slotOf(t,z),c=m[z];if(!s2||!c)continue;
        s2.position.set(sg<0?c.x:-c.x,0,sg<0?c.z:-c.z);
        s2.userData.pose=c.pose;s2.userData.jump=c.jump;
        applyPose(s2.userData.fig,c.pose,c.jump);
      }
    });
    return true;
  }
  /* Bu sekmenin referans dizilişi = en son üzerinde çalıştığın rotasyon */
  function sourcePose(k){
    var lr=LASTROT[k];
    if(lr&&WORK[wkey(lr,k)])return WORK[wkey(lr,k)];
    for(var r=1;r<=6;r++) if(WORK[wkey(r,k)]) return WORK[wkey(r,k)];
    return null;
  }
  function wkey(r,f){return 'R'+r+'|'+f;}
  function syncWork(){ if(!curForm)return;
    WORK[wkey(rotIdx,curForm)]=capture();LASTROT[curForm]=rotIdx; }
  function loadPhase(k,fresh){
    var w=fresh?null:WORK[wkey(rotIdx,k)];
    if(w) restore(w,true);
    else{
      var src=fresh?null:sourcePose(k);
      if(!src||!applyZMapObj(zmapFrom(src))) applyPreset(k);
      WORK[wkey(rotIdx,k)]=capture();
      if(fresh)LASTROT[k]=rotIdx;
    }
    syncBallY();faceBall();refreshShadow();refreshRange();scheduleSave();
  }
  /* Bu dizilişi altı rotasyona yay: bölge haritası yazılır, eski kayıtlar temizlenir */
  function spreadToAll(keys){
    syncWork();
    keys.forEach(function(k){
      var keep=(k===curForm)?rotIdx:LASTROT[k];
      if(!keep||!WORK[wkey(keep,k)])return;
      for(var r=1;r<=6;r++) if(r!==keep) delete WORK[wkey(r,k)];
      LASTROT[k]=keep;
    });
    scheduleSave();
  }
  function applyFormation(k){
    if(curForm&&k!==curForm) syncWork();
    curForm=k;loadPhase(k,false);
  }
  var NEXT={1:6,6:5,5:4,4:3,3:2,2:1},PREV={6:1,5:6,4:5,3:4,2:3,1:2};
  function rotationSequence(){
    var start=rotIdx,seq=[];
    for(var i=0;i<7;i++){ seq.push(capture()); rotate(1); }
    while(rotIdx!==start) rotate(1);
    return seq;
  }
  function rotate(dir){
    syncWork();
    slots.forEach(function(s){s.userData.zone=(dir>0?NEXT:PREV)[s.userData.zone];});
    rotIdx=dir>0?(rotIdx%6)+1:(rotIdx===1?6:rotIdx-1);
    $('rotLbl').textContent='R'+rotIdx;
    loadPhase(curForm,false);buildBook();
  }

  /* ══════════ ROTASYON SERBEST ALANI ══════════ */
  var legalOn=false,legalCv=null,legalTex=null,legalMesh=null;
  var LG=0.14, LW=Math.round(9.4/0.14), LH=Math.round(9.4/0.14);
  var FRONT=[4,3,2],BACK=[5,6,1];
  function ensureLegal(){
    if(legalMesh)return;
    legalCv=document.createElement('canvas');legalCv.width=LW;legalCv.height=LH;
    legalTex=new THREE.CanvasTexture(legalCv);
    legalMesh=new THREE.Mesh(new THREE.PlaneGeometry(9.4,9.4),
      new THREE.MeshBasicMaterial({map:legalTex,transparent:true,depthWrite:false}));
    legalMesh.rotation.x=-Math.PI/2;legalMesh.position.y=.018;legalMesh.visible=false;
    scene.add(legalMesh);
  }
  /* Takım yerel koordinatı: L soldan sağa, D file'a uzaklık (negatif) */
  function legalRange(s){
    var t=s.userData.team,sg=t.sign,z=s.userData.zone;
    function L(o){return sg<0?o.position.x:-o.position.x;}
    function D(o){return sg<0?o.position.z:-o.position.z;}
    var row=FRONT.indexOf(z)>=0?FRONT:BACK,i=row.indexOf(z);
    var lo=-4.45,hi=4.45,zlo=-8.95,zhi=-0.05;
    if(i>0){var a=slotOf(t,row[i-1]);if(a)hi=Math.min(hi,L(a)-0.05);}
    if(i<2){var b=slotOf(t,row[i+1]);if(b)lo=Math.max(lo,L(b)+0.05);}
    var pair=FRONT.indexOf(z)>=0?BACK[FRONT.indexOf(z)]:FRONT[BACK.indexOf(z)];
    var o=slotOf(t,pair);
    if(o){if(FRONT.indexOf(z)>=0)zlo=Math.max(zlo,D(o)+0.05);
          else zhi=Math.min(zhi,D(o)-0.05);}
    return {lo:lo,hi:hi,zlo:zlo,zhi:zhi,sg:sg};
  }
  function isLegal(s){
    var r=legalRange(s),sg=r.sg;
    var L=sg<0?s.position.x:-s.position.x, D=sg<0?s.position.z:-s.position.z;
    return (L>=r.lo&&L<=r.hi&&D>=r.zlo&&D<=r.zhi);
  }
  function hideLegal(){
    if(legalMesh)legalMesh.visible=false;
    slots.forEach(function(s){s.userData.fig.warn.visible=false;});
  }
  /* Sahanın tamamı boyanır: serbest alan yeşil, yasak alan kırmızı */
  function showLegal(s){
    if(!legalOn||!s||s.userData.isBall||s.userData.isTarget){if(legalMesh)legalMesh.visible=false;return;}
    ensureLegal();
    var r=legalRange(s),sg=r.sg;
    var g=legalCv.getContext('2d');
    var img=g.createImageData(LW,LH),d=img.data;
    for(var j=0;j<LH;j++){
      var D=-9.15+(j+.5)*LG;                 // file'a uzaklık (yerel, negatif)
      for(var i=0;i<LW;i++){
        var L=-4.7+(i+.5)*LG;
        var ok=(L>=r.lo&&L<=r.hi&&D>=r.zlo&&D<=r.zhi);
        var inC=(Math.abs(L)<=4.5&&D<=0&&D>=-9);
        var o=(j*LW+i)*4;
        if(!inC){d[o+3]=0;continue;}
        if(ok){d[o]=31;d[o+1]=169;d[o+2]=123;d[o+3]=86;}
        else  {d[o]=214;d[o+1]=62;d[o+2]=48;d[o+3]=64;}
      }
    }
    g.putImageData(img,0,0);legalTex.needsUpdate=true;
    legalMesh.position.set(0,.018,sg<0?-4.65:4.65);
    legalMesh.rotation.z=sg<0?0:Math.PI;
    legalMesh.visible=true;
    slots.forEach(function(x){
      x.userData.fig.warn.visible=(x.userData.team===s.userData.team)&&!isLegal(x);});
  }

  /* ══════════ BLOK GÖLGESİ — çokgen çizim ══════════ */
  /* Geometri: smaçörün vuruş noktasından çıkan düz çizgiler.
     Derinlik sınırı file'a paralel tek bir çizgi, yan sınırlar
     smaçörün ayağından blok elinin kenarlarından geçen ışınlar. */
  var shadowOn=false,shadowG=new THREE.Group();scene.add(shadowG);
  function hitHeight(){return parseInt($('hitH').value,10)/100;}
  function blockReach(){return parseInt($('blkH').value,10)/100;}
  function findAttacker(){
    var best=null,bd=1e9;
    slots.forEach(function(s){
      if(s.userData.pose!=='spike')return;
      var d=Math.hypot(s.position.x-ball.position.x,s.position.z-ball.position.z);
      if(d<bd){bd=d;best=s;}});
    return best;
  }
  function clearShadow(){
    while(shadowG.children.length){var c=shadowG.children.pop();disposeObj(c);}
  }
  /* Kenarları A'(ax, -a) noktasından (xe,0) üzerinden geçen ışın:
     px(d) = ax + (xe-ax)*(a+d)/a  */
  /* Çokgeni dikdörtgene kırp (Sutherland–Hodgman) — kama sahayı taşmasın */
  function clipPoly(pts,xmin,xmax,dmin,dmax){
    function pass(list,inside,cut){
      var out=[];
      for(var i=0;i<list.length;i++){
        var A=list[i],B=list[(i+1)%list.length],ai=inside(A),bi=inside(B);
        if(ai)out.push(A);
        if(ai!==bi)out.push(cut(A,B));
      }
      return out;
    }
    function cx(A,B,x){var t=(x-A[0])/((B[0]-A[0])||1e-9);return [x,A[1]+(B[1]-A[1])*t];}
    function cd(A,B,d){var t=(d-A[1])/((B[1]-A[1])||1e-9);return [A[0]+(B[0]-A[0])*t,d];}
    var p=pts;
    p=pass(p,function(P){return P[0]>=xmin;},function(A,B){return cx(A,B,xmin);});
    if(p.length<3)return [];
    p=pass(p,function(P){return P[0]<=xmax;},function(A,B){return cx(A,B,xmax);});
    if(p.length<3)return [];
    p=pass(p,function(P){return P[1]>=dmin;},function(A,B){return cd(A,B,dmin);});
    if(p.length<3)return [];
    p=pass(p,function(P){return P[1]<=dmax;},function(A,B){return cd(A,B,dmax);});
    return p.length<3?[]:p;
  }
  /* Kenarlar: A'(ax) noktasından (xe,0) üzerinden geçen ışın
     px(d) = ax + (xe-ax)*(a+d)/a
     DİKKAT: Shape XY düzleminde; zemine yatırmak için X'te -90° döndürülüyor,
     bu da şeklin +Y'sini dünyanın -Z'sine eşliyor. Derinlik bu yüzden ters işaretli. */
  function wedge(ax,a,x1,x2,dMax,u,fill,stroke,op){
    var dm=Math.min(dMax,12.2);
    if(dm<=0.06)return;
    var f=function(xe,d){return ax+(xe-ax)*(a+d)/a;};
    var poly=clipPoly([[f(x1,0.03),0.03],[f(x2,0.03),0.03],[f(x2,dm),dm],[f(x1,dm),dm]],
                      -6.3,6.3,0.03,dm);
    if(!poly.length)return;
    var sh=new THREE.Shape(),i;
    sh.moveTo(poly[0][0],-u*poly[0][1]);
    for(i=1;i<poly.length;i++) sh.lineTo(poly[i][0],-u*poly[i][1]);
    sh.closePath();
    var m=new THREE.Mesh(new THREE.ShapeGeometry(sh),
      new THREE.MeshBasicMaterial({color:fill,transparent:true,opacity:op,
        side:THREE.DoubleSide,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.position.y=.017;shadowG.add(m);
    var vs=[];
    for(i=0;i<poly.length;i++) vs.push(new THREE.Vector3(poly[i][0],.021,u*poly[i][1]));
    vs.push(vs[0].clone());
    shadowG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vs),
      new THREE.LineBasicMaterial({color:stroke})));
  }
  function refreshShadow(){
    clearShadow();
    if(!shadowOn)return;
    var atk=findAttacker();if(!atk)return;
    var sg=atk.userData.team.sign,u=-sg;              // u: savunan tarafın yönü
    var ax=atk.position.x, a=Math.max(.25,-u*atk.position.z);   // file'a uzaklık
    var ah=hitHeight()+atk.userData.jump;
    /* derinlik sınırı: yc = ah*d/(a+d) ≥ h  →  d ≤ a*h/(ah-h) */
    var depth=function(h){ return ah<=h?14:Math.min(13,a*h/(ah-h)); };
    // 1) file'a takma bölgesi
    wedge(ax,a,-4.75,4.75,depth(netTop),u,0xF08C3C,0xFFB066,.30);
    // 2) blok duvarları
    slots.forEach(function(s){
      if(s.userData.team.sign===sg)return;
      if(s.userData.pose!=='block')return;
      var hy=netTop+blockReach()+s.userData.jump;
      wedge(ax,a,s.position.x-.45,s.position.x+.45,depth(hy),u,0xD94F3D,0xFF7A66,.34);
    });
    // 3) vuruş noktası işareti
    var mk=new THREE.Mesh(new THREE.RingGeometry(.16,.24,20),
      new THREE.MeshBasicMaterial({color:0xF4C430,side:THREE.DoubleSide}));
    mk.rotation.x=-Math.PI/2;mk.position.set(ax,.022,atk.position.z);shadowG.add(mk);
  }

  /* ══════════ KAPSAMA HALKALARI ══════════ */
  /* Oyuncunun yetişebileceği alan. Duruş etkiler: savunma duruşu geniş,
     blok ve vuruş dar; havadaysa daralır. */
  var rangeOn=false,rangeG=new THREE.Group();scene.add(rangeG);
  var POSE_R={ready:1.00,dig:1.22,block:0.55,spike:0.62};
  function clearRange(){
    while(rangeG.children.length){var c=rangeG.children.pop();disposeObj(c);}
  }
  function refreshRange(){
    clearRange();
    if(!rangeOn)return;
    var base=parseInt($('rangeR').value,10)/10;
    slots.forEach(function(sl){
      var r=base*(POSE_R[sl.userData.pose]||1)*(1-Math.min(.45,sl.userData.jump*0.9));
      if(r<0.2)return;
      var col=new THREE.Color(sl.userData.member.jersey);
      var fill=new THREE.Mesh(new THREE.CircleGeometry(r,40),
        new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.13,
          side:THREE.DoubleSide,depthWrite:false}));
      fill.rotation.x=-Math.PI/2;fill.position.set(sl.position.x,.015,sl.position.z);
      rangeG.add(fill);
      var rg=new THREE.Mesh(new THREE.RingGeometry(Math.max(.02,r-.045),r,44),
        new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,
          side:THREE.DoubleSide,depthWrite:false}));
      rg.rotation.x=-Math.PI/2;rg.position.set(sl.position.x,.019,sl.position.z);
      rangeG.add(rg);
    });
  }

  /* ══════════ ÖLÇÜM ══════════ */
  /* İki noktaya dokun → mesafe. Üçüncü dokunuş yeni ölçüme başlar. */
  var measOn=false,measA=null,measG=new THREE.Group();scene.add(measG);
  function clearMeas(){
    while(measG.children.length){var c=measG.children.pop();disposeObj(c);}
  }
  function measDot(p){
    var m=new THREE.Mesh(new THREE.RingGeometry(.10,.17,20),
      new THREE.MeshBasicMaterial({color:0x4DD6A0,side:THREE.DoubleSide}));
    m.rotation.x=-Math.PI/2;m.position.set(p.x,.024,p.z);measG.add(m);
  }
  function measLabel(txt,cx,cz){
    var c=document.createElement('canvas');c.width=320;c.height=96;
    var g=c.getContext('2d');
    g.fillStyle='rgba(10,22,40,.92)';
    if(g.roundRect){g.beginPath();g.roundRect(6,18,308,60,16);g.fill();
      g.strokeStyle='#4DD6A0';g.lineWidth=3;g.stroke();}
    else{g.fillRect(6,18,308,60);}
    g.fillStyle='#EAF6F1';g.textAlign='center';g.textBaseline='middle';
    g.font='800 42px ui-monospace,monospace';g.fillText(txt,160,49);
    var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),
      depthTest:false,transparent:true}));
    sp.scale.set(1.75,.52,1);sp.position.set(cx,1.05,cz);sp.renderOrder=20;
    measG.add(sp);
  }
  function measureTo(p){
    if(!measA){clearMeas();measA=p.clone();measDot(measA);return;}
    var d=Math.hypot(p.x-measA.x,p.z-measA.z);
    measDot(p);
    measG.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(measA.x,.024,measA.z),new THREE.Vector3(p.x,.024,p.z)]),
      new THREE.LineBasicMaterial({color:0x4DD6A0})));
    measLabel(d.toFixed(2)+' m',(measA.x+p.x)/2,(measA.z+p.z)/2);
    measA=null;
  }

  /* ══════════ EKİPMAN ══════════ */
  /* Antrenman kurgusu için: huni, top sepeti, minder. Sürüklenebilir,
     kaydedilir; oyuncu değil, sahne öğesi. */
  var gearG=new THREE.Group();scene.add(gearG);
  var GEAR=[];
  function buildGear(kind){
    var g=new THREE.Group(),m;
    if(kind==='cone'){
      m=new THREE.Mesh(new THREE.ConeGeometry(.17,.38,16),
        new THREE.MeshStandardMaterial({color:0xFF7A1A,roughness:.6}));
      m.position.y=.19;m.castShadow=true;g.add(m);
      var base=new THREE.Mesh(new THREE.CylinderGeometry(.26,.28,.035,18),
        new THREE.MeshStandardMaterial({color:0xE05A0A,roughness:.7}));
      base.position.y=.018;g.add(base);
    }else if(kind==='cart'){
      var body=new THREE.Mesh(new THREE.BoxGeometry(.85,.55,.60),
        new THREE.MeshStandardMaterial({color:0x3D4658,roughness:.65}));
      body.position.y=.52;body.castShadow=true;g.add(body);
      for(var i=0;i<7;i++){
        var b=new THREE.Mesh(new THREE.SphereGeometry(.095,10,8),
          new THREE.MeshStandardMaterial({color:i%2?0xF4C430:0xE8E8E8,roughness:.5}));
        b.position.set((i%3-1)*.24,.86+(i>3?.13:0),((i%2)-.5)*.26);g.add(b);
      }
      [[-.33,-.22],[.33,-.22],[-.33,.22],[.33,.22]].forEach(function(w){
        var wh=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.05,12),
          new THREE.MeshStandardMaterial({color:0x1A1D24,roughness:.8}));
        wh.rotation.z=Math.PI/2;wh.position.set(w[0],.075,w[1]);g.add(wh);});
    }else{
      m=new THREE.Mesh(new THREE.BoxGeometry(1.6,.14,1.0),
        new THREE.MeshStandardMaterial({color:0x2D7FD4,roughness:.85}));
      m.position.y=.07;m.castShadow=true;g.add(m);
    }
    var hit=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.2,8),
      new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    hit.position.y=.6;g.add(hit);
    g.userData={drag:true,isGear:true,kind:kind};
    gearG.add(g);GEAR.push(g);return g;
  }
  function addGear(kind,x,z){
    var g=buildGear(kind);
    g.position.set(x!==undefined?x:(Math.random()*4-2),0,z!==undefined?z:-10.4);
    scheduleSave();return g;
  }
  function clearGear(){
    while(GEAR.length){var g=GEAR.pop();gearG.remove(g);disposeObj(g);}
    scheduleSave();
  }

  /* ══════════ GÖRÜŞ AÇISI ══════════ */
  /* Seçili oyuncunun baktığı yön ve gördüğü alan. Duruşa göre açı değişir. */
  var coneOn=false,coneG=new THREE.Group();scene.add(coneG);
  var POSE_FOV={ready:1.75,dig:1.95,block:1.15,spike:1.45};
  function clearCone(){
    while(coneG.children.length){var c=coneG.children.pop();disposeObj(c);}
  }
  function refreshCone(sl){
    clearCone();
    if(!coneOn||!sl||sl.userData.isBall||sl.userData.isTarget||sl.userData.isGear)return;
    var fov=POSE_FOV[sl.userData.pose]||1.75, R=7.5, yaw=sl.rotation.y;
    var col=new THREE.Color(sl.userData.member.jersey);
    var sh=new THREE.Shape(),N=26,i,a;
    sh.moveTo(0,0);
    for(i=0;i<=N;i++){
      a=yaw-fov/2+fov*i/N;
      sh.lineTo(Math.sin(a)*R,-Math.cos(a)*R);
    }
    sh.closePath();
    var m=new THREE.Mesh(new THREE.ShapeGeometry(sh),
      new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.16,
        side:THREE.DoubleSide,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.position.set(sl.position.x,.016,sl.position.z);
    coneG.add(m);
    var vs=[new THREE.Vector3(sl.position.x,.022,sl.position.z)];
    for(i=0;i<=N;i++){
      a=yaw-fov/2+fov*i/N;
      vs.push(new THREE.Vector3(sl.position.x+Math.sin(a)*R,.022,sl.position.z+Math.cos(a)*R));
    }
    vs.push(vs[0].clone());
    coneG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vs),
      new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.7})));
  }

  /* ══════════ NOTLAR ══════════ */
  /* Sahaya metin etiketi. Ekran görüntüsü kendini anlatsın diye. */
  var noteMode=false,noteG=new THREE.Group();scene.add(noteG);
  var NOTES=[];
  function makeNote(txt,x,z){
    var c=document.createElement('canvas'),pad=18;
    var g=c.getContext('2d');
    g.font='800 40px system-ui,sans-serif';
    var w=Math.min(620,g.measureText(txt).width+pad*2);
    c.width=w+8;c.height=86;
    g=c.getContext('2d');
    g.fillStyle='rgba(244,196,48,.95)';
    if(g.roundRect){g.beginPath();g.roundRect(4,10,w,60,14);g.fill();}
    else g.fillRect(4,10,w,60);
    g.fillStyle='#141A24';g.textAlign='center';g.textBaseline='middle';
    g.font='800 36px system-ui,sans-serif';g.fillText(txt,(w+8)/2,41);
    var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),
      depthTest:false,transparent:true}));
    var sc=Math.min(3.4,(w+8)/150);
    sp.scale.set(sc,sc*86/(w+8)*2.2,1);
    sp.position.set(x,1.55,z);sp.renderOrder=22;
    sp.userData={isNote:true,txt:txt};
    noteG.add(sp);NOTES.push({txt:txt,x:x,z:z,obj:sp});
    scheduleSave();
  }
  function clearNotes(){
    while(NOTES.length){var n=NOTES.pop();noteG.remove(n.obj);
      if(n.obj.material.map)n.obj.material.map.dispose();n.obj.material.dispose();}
    scheduleSave();
  }

  /* ══════════ FİZİK ══════════ */
  var traj=null,landMark=null;
  function simulate(p0,v0,spin){
    var rho=1.225,Cd=0.22,A=Math.PI*ballR*ballR,Cm=0.35;
    var kD=0.5*rho*Cd*A/ballM, kM=0.5*rho*A*ballR*Cm/ballM;
    var p=p0.clone(),v=v0.clone(),dt=0.002,t=0,pts=[p.clone()];
    var clear=null,netStop=false,land=null;
    var w=new THREE.Vector3(),tmp=new THREE.Vector3();
    while(t<6){
      var hv=Math.hypot(v.x,v.z)||1e-6;
      w.set(-v.z/hv,0,v.x/hv).multiplyScalar(-spin);  // topspin ekseni
      var sp=v.length();
      var a=new THREE.Vector3(0,-9.81,0);
      a.addScaledVector(v,-kD*sp);
      tmp.crossVectors(w,v).multiplyScalar(kM);
      a.add(tmp);
      var pz=p.z;
      v.addScaledVector(a,dt);p.addScaledVector(v,dt);t+=dt;
      if(pz*p.z<=0&&clear===null&&Math.abs(p.x)<5.2){
        clear=p.y-netTop;
        if(p.y<netTop&&p.y>0&&Math.abs(p.x)<4.75){netStop=true;pts.push(p.clone());break;}
      }
      if(t%0.01<dt)pts.push(p.clone());
      if(p.y<=ballR){land=p.clone();pts.push(p.clone());break;}
      if(Math.abs(p.x)>14||Math.abs(p.z)>20)break;
    }
    return {pts:pts,t:t,clear:clear,netStop:netStop,land:land};
  }
  function drawTraj(r){
    if(traj){scene.remove(traj);disposeObj(traj);traj=null;}
    if(landMark){scene.remove(landMark);disposeObj(landMark);landMark=null;}
    if(r.pts.length<2)return;
    var col=r.netStop?0xD94F3D:0xF4C430;
    traj=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(r.pts),
      Math.min(220,r.pts.length),.038,7,false),new THREE.MeshBasicMaterial({color:col}));
    scene.add(traj);
    if(r.land){
      var inC=Math.abs(r.land.x)<=4.5&&Math.abs(r.land.z)<=9;
      landMark=new THREE.Mesh(new THREE.RingGeometry(.22,.36,26),
        new THREE.MeshBasicMaterial({color:inC?0x1FA97B:0xD94F3D,side:THREE.DoubleSide}));
      landMark.rotation.x=-Math.PI/2;landMark.position.set(r.land.x,.02,r.land.z);
      scene.add(landMark);
    }
  }
  function showReadout(r,kmh,ang){
    var el=$('readout'),h='';
    h+='<div><span>Hız</span><b>'+kmh.toFixed(0)+' km/s</b></div>';
    h+='<div><span>Açı</span><b>'+ang.toFixed(0)+'°</b></div>';
    h+='<div><span>Uçuş</span><b>'+r.t.toFixed(2)+' sn</b></div>';
    if(r.clear!==null)
      h+='<div class="'+(r.clear<0?'bad':'')+'"><span>File payı</span><b>'+
         (r.clear>=0?'+':'')+Math.round(r.clear*100)+' cm</b></div>';
    if(r.netStop)h+='<div class="bad"><span>Sonuç</span><b>FİLE</b></div>';
    else if(r.land){
      var inC=Math.abs(r.land.x)<=4.5&&Math.abs(r.land.z)<=9;
      h+='<div class="'+(inC?'':'bad')+'"><span>Sonuç</span><b>'+(inC?'İÇERİ':'DIŞARI')+'</b></div>';
    }
    el.innerHTML=h;el.classList.add('show');
  }
  var ballMode='target';
  function fire(){
    var ang=parseInt($('angIn').value,10)*Math.PI/180;
    var spin=parseInt($('spinIn').value,10);
    var h=ball.position.y>0.35?ball.position.y:contactHeight();
    var p0=new THREE.Vector3(ball.position.x,h,ball.position.z);
    var dx=targetM.position.x-p0.x,dz=targetM.position.z-p0.z;
    var hd=Math.hypot(dx,dz)||1e-6;
    var dir=new THREE.Vector3(dx/hd,0,dz/hd);
    function velFor(sp){
      return new THREE.Vector3(dir.x*sp*Math.cos(ang),sp*Math.sin(ang),dir.z*sp*Math.cos(ang));}
    var sp,r;
    if(ballMode==='target'){
      var lo=4,hi=45,best=null;
      for(var k=0;k<26;k++){
        sp=(lo+hi)/2;r=simulate(p0,velFor(sp),spin);
        var d=r.land?Math.hypot(r.land.x-p0.x,r.land.z-p0.z):999;
        if(r.netStop)d=0;
        if(d<hd)lo=sp;else hi=sp;
        best=r;
      }
      sp=(lo+hi)/2;r=simulate(p0,velFor(sp),spin);
      $('spdIn').value=Math.round(Math.min(120,sp*3.6));syncSpd();
    }else{
      sp=parseInt($('spdIn').value,10)/3.6;r=simulate(p0,velFor(sp),spin);
    }
    drawTraj(r);showReadout(r,sp*3.6,parseInt($('angIn').value,10));
    return r;
  }
  function contactHeight(){
    // topa en yakın oyuncunun rolüne göre temas yüksekliği
    var best=null,bd=3.0;
    slots.forEach(function(s){
      var d=Math.hypot(s.position.x-ball.position.x,s.position.z-ball.position.z);
      if(d<bd){bd=d;best=s;}});
    if(!best)return 1.0;
    var r=best.userData.member.role,j=best.userData.jump;
    if(best.userData.pose==='spike'||best.userData.pose==='block')return hitHeight()+j;
    if(r==='L')return 0.7+j;
    if(r==='P')return 1.15+j;
    return 1.0+j;
  }
  function clearBall(){
    if(traj){scene.remove(traj);disposeObj(traj);traj=null;}
    if(landMark){scene.remove(landMark);disposeObj(landMark);landMark=null;}
    $('readout').classList.remove('show');
  }

  /* ══════════ KAMERA ══════════ */
  var target=new THREE.Vector3(0,1.1,0);
  var VIEWS={persp:{r:26.5,th:.62,ph:.98},iso:{r:44,th:Math.PI/4,ph:0.6155,ortho:true},
    top:{r:24,th:0,ph:.02},side:{r:26,th:Math.PI/2,ph:1.24},back:{r:25.5,th:0,ph:1.16}};
  var ocam=new THREE.OrthographicCamera(-1,1,1,-1,.1,200);
  var pcam=camera,isOrtho=false;
  function fitOrtho(){
    var w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;
    var size=cur.r*0.55,a=w/h;
    ocam.left=-size*a/2;ocam.right=size*a/2;ocam.top=size/2;ocam.bottom=-size/2;
    ocam.updateProjectionMatrix();
  }
  var cur={r:26.5,th:.62,ph:.98},dst={r:26.5,th:.62,ph:.98},curView='persp';
  /* Sahayı kaydır: bakış hedefini kamera düzleminde ötele.
     Piksel→dünya ölçeği kamera türüne ve uzaklığa göre hesaplanır. */
  var panR=new THREE.Vector3(),panF=new THREE.Vector3(),panU=new THREE.Vector3(0,1,0);
  function panBy(dx,dy){
    var h=canvas.clientHeight||1;
    var scale=isOrtho ? (cur.r*0.55)/h
                      : 2*Math.tan(pcam.fov*Math.PI/360)*cur.r/h;
    camera.getWorldDirection(panF); panF.y=0;
    if(panF.lengthSq()<1e-6) panF.set(0,0,1);
    panF.normalize();
    panR.crossVectors(panF,panU).normalize();
    target.addScaledVector(panR,-dx*scale);
    target.addScaledVector(panF, dy*scale);
    target.x=Math.max(-13,Math.min(13,target.x));
    target.z=Math.max(-17,Math.min(17,target.z));
  }
  function setView(k){
    target.set(0,1.1,0);
    curView=k;dst.r=VIEWS[k].r;dst.th=VIEWS[k].th;dst.ph=VIEWS[k].ph;
    isOrtho=!!VIEWS[k].ortho;camera=isOrtho?ocam:pcam;
    var b=root.querySelectorAll('#t3d-cams button');
    for(var i=0;i<b.length;i++)b[i].classList.toggle('on',b[i].getAttribute('data-view')===k);
    scheduleSave();
  }

  /* ══════════ MOD ══════════ */
  var mode='arrange';
  var CTX={arrange:['ctxArrange','ctxArrange2'],teach:['ctxTeach1','ctxTeach2'],play:['ctxPlay']};
  function setMode(m){
    mode=m;
    for(var k in CTX)CTX[k].forEach(function(id){$(id).classList.toggle('hid',k!==m);});
    root.querySelectorAll('[data-mode]').forEach(function(b){
      b.classList.toggle('on',b.getAttribute('data-mode')===m);});
    closeSheets();
    targetM.visible=(m==='teach');
    if(m!=='teach')clearBall();
    if(m!=='arrange')hideLegal();
    if(m!=='teach'){
      if(measOn){measOn=false;$('measBtn').classList.remove('on');clearMeas();measA=null;}
      if(rangeOn){rangeOn=false;$('rangeBtn').classList.remove('on');
        $('rangeWrap').style.display='none';clearRange();}
      if(coneOn){coneOn=false;$('viewConeBtn').classList.remove('on');clearCone();}
      if(noteMode){noteMode=false;$('noteBtn').classList.remove('on');}
    }
    refreshShadow();
    if(m!=='teach'&&trailsOn){trailsOn=false;
      $('trailBtn').textContent='İz: Kapalı';$('trailBtn').classList.remove('on');}
    if(m==='play')buildBook();
  }

  /* ══════════ ETKİLEŞİM ══════════ */
  var ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
  var ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),hp=new THREE.Vector3();
  var orbit=false,orbitPending=false,panning=false,lx=0,ly=0,pinch=0,panMid=null;
  var downX=0,downY=0,downT=0,moved=false;
  function panWanted(e){return e.button===1||e.button===2||e.shiftKey;}
  var tmpV=new THREE.Vector3();
  function ndc(e){var r=canvas.getBoundingClientRect();
    ptr.x=((e.clientX-r.left)/r.width)*2-1;ptr.y=-((e.clientY-r.top)/r.height)*2+1;}
  function draggables(){
    var a=slots.concat([ball]);if(targetM.visible)a.push(targetM);
    return a.concat(GEAR);}
  function nearestOnScreen(cx,cy,maxPx){
    var r=canvas.getBoundingClientRect(),best=null,bd=maxPx,all=draggables();
    for(var i=0;i<all.length;i++){
      tmpV.copy(all[i].position);if(!all[i].userData.isTarget)tmpV.y+=0.9;
      tmpV.project(camera);
      var sx=r.left+(tmpV.x*.5+.5)*r.width, sy=r.top+(-tmpV.y*.5+.5)*r.height;
      var d=Math.hypot(sx-cx,sy-cy);
      if(d<bd){bd=d;best=all[i];}
    }
    return best;
  }
  function syncBallY(){
    var v=Math.round(ball.position.y*100);
    var el=$('ballY');if(!el)return;
    el.value=Math.max(10,Math.min(450,v));
    $('ballYv').textContent=(ball.position.y).toFixed(2)+' m';
  }
  var vPlane=new THREE.Plane();
  function useVertical(o){
    // Yandan/arkadan bakarken top dikey düzlemde sürüklenir
    return o.userData.isBall && cur.ph>0.85;
  }
  function grab(o){
    selected=o;
    if(coneOn&&!o.userData.isBall&&!o.userData.isTarget&&!o.userData.isGear)refreshCone(o);
    if(!o.userData.isTarget){ring.visible=true;ring.position.set(o.position.x,.02,o.position.z);}
    startTrail(o);showLegal(o);
  }
  canvas.addEventListener('pointerdown',function(e){
    if(anim.on)return;
    try{canvas.setPointerCapture(e.pointerId);}catch(x){}
    ndc(e);downX=e.clientX;downY=e.clientY;downT=Date.now();moved=false;armUndo();
    ray.setFromCamera(ptr,camera);
    var hits=ray.intersectObjects(draggables(),true);
    if(hits.length){
      var o=hits[0].object;while(o.parent&&!o.userData.drag)o=o.parent;
      if(o.userData.drag){grab(o);return;}
    }
    if(noteMode&&!panWanted(e)){
      ray.setFromCamera(ptr,camera);
      if(ray.ray.intersectPlane(ground,hp)){
        var q=prompt('Not metni:');
        if(q&&q.trim())makeNote(q.trim().slice(0,40),hp.x,hp.z);
        return;
      }
    }
    if(measOn&&!panWanted(e)){
      ray.setFromCamera(ptr,camera);
      if(ray.ray.intersectPlane(ground,hp)){measureTo(hp.clone());return;}
    }
    var near=nearestOnScreen(e.clientX,e.clientY,46);
    if(near&&!panWanted(e)){grab(near);return;}
    closeSheets();
    if(panWanted(e)) panning=true; else orbitPending=true;
    lx=e.clientX;ly=e.clientY;
  });
  canvas.addEventListener('pointermove',function(e){
    var dd=Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY);
    if(dd>8){if(!moved&&selected)commitUndo();moved=true;}
    if(selected){
      ndc(e);ray.setFromCamera(ptr,camera);
      if(useVertical(selected)){
        var n=new THREE.Vector3();camera.getWorldDirection(n);n.y=0;n.normalize();
        vPlane.setFromNormalAndCoplanarPoint(n,selected.position);
        if(ray.ray.intersectPlane(vPlane,hp)){
          selected.position.x=Math.max(-8.2,Math.min(8.2,hp.x));
          selected.position.z=Math.max(-12.2,Math.min(12.2,hp.z));
          selected.position.y=Math.max(ballR,Math.min(4.5,hp.y));
          ring.position.set(selected.position.x,.02,selected.position.z);
          syncBallY();faceBall();
        }
        return;
      }
      if(ray.ray.intersectPlane(ground,hp)){
        var x=Math.max(-8.2,Math.min(8.2,hp.x)),z=Math.max(-12.2,Math.min(12.2,hp.z));
        selected.position.x=x;selected.position.z=z;
        if(!selected.userData.isTarget)ring.position.set(x,.02,z);
        feedTrail(selected);showLegal(selected);
        if(rangeOn)refreshRange();
        if(coneOn&&!selected.userData.isGear)refreshCone(selected);
        if(selected.userData.isBall)faceBall();
      }
      return;
    }
    if(panning){ panBy(e.clientX-lx,e.clientY-ly); lx=e.clientX;ly=e.clientY; return; }
    if(orbitPending&&dd>8){orbit=true;orbitPending=false;lx=e.clientX;ly=e.clientY;}
    if(orbit){
      dst.th-=(e.clientX-lx)*.006;
      dst.ph=Math.max(.02,Math.min(1.52,dst.ph-(e.clientY-ly)*.005));
      lx=e.clientX;ly=e.clientY;curView='';
      var b=root.querySelectorAll('#t3d-cams button');
      for(var i=0;i<b.length;i++)b[i].classList.remove('on');
    }
  });
  function up(){
    if(selected){
      endTrail();
      var tap=(!moved&&Date.now()-downT<450);
      if(tap&&!selected.userData.isBall&&!selected.userData.isTarget&&!selected.userData.isGear){
        if(mode==='block'){atkSlot=selected;refreshShadow();
          toast((selected.userData.member.name||selected.userData.member.num)+' smaçör seçildi');}
        else openEdit(selected);
      }else{
        faceBall();refreshShadow();refreshRange();
        if(mode==='teach')fire();
        scheduleSave();
      }
    }
    selected=null;orbit=false;orbitPending=false;panning=false;
  }
  ['pointerup','pointercancel','pointerleave'].forEach(function(t){canvas.addEventListener(t,up);});
  canvas.addEventListener('wheel',function(e){e.preventDefault();
    dst.r=Math.max(7,Math.min(60,dst.r*(1+e.deltaY*.0011)));},{passive:false});
  canvas.addEventListener('touchstart',function(e){
    if(e.touches.length===2){selected=null;orbit=false;orbitPending=false;panning=false;
      pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,
                       e.touches[0].clientY-e.touches[1].clientY);
      panMid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,
              y:(e.touches[0].clientY+e.touches[1].clientY)/2};}},{passive:true});
  canvas.addEventListener('touchmove',function(e){
    if(e.touches.length===2&&pinch){e.preventDefault();
      var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,
                       e.touches[0].clientY-e.touches[1].clientY);
      var mx=(e.touches[0].clientX+e.touches[1].clientX)/2,
          my=(e.touches[0].clientY+e.touches[1].clientY)/2;
      if(panMid) panBy(mx-panMid.x,my-panMid.y);
      panMid={x:mx,y:my};
      dst.r=Math.max(7,Math.min(60,dst.r*(pinch/d)));pinch=d;}},{passive:false});
  canvas.addEventListener('touchend',function(){pinch=0;panMid=null;},{passive:true});
  canvas.addEventListener('contextmenu',function(e){e.preventDefault();});

  /* ══════════ DÜZENLEYİCİ ══════════ */
  var editEl=$('edit'),rosterEl=$('roster'),bookEl=$('book'),editing=null;
  var SW=['#12294C','#B33A2B','#EDEFF2','#16181D','#F4C430','#1FA97B','#2D6BD1','#E07A2B','#7B3FA0','#00A6A6'];
  var swBox=$('swatches');
  SW.forEach(function(hex){var b=document.createElement('b');b.style.background=hex;
    b.setAttribute('data-hex',hex);b.addEventListener('click',function(){setJersey(hex);});
    swBox.appendChild(b);});
  function closeSheets(){
    editEl.classList.remove('open');rosterEl.classList.remove('open');bookEl.classList.remove('open');
    $('scope').classList.remove('open');
    editing=null;ring.visible=false;hideLegal();}
  function markSw(hex){var b=swBox.children;
    for(var i=0;i<b.length;i++)
      b[i].classList.toggle('on',b[i].getAttribute('data-hex').toLowerCase()===hex.toLowerCase());}
  function openEdit(s){
    editing=s;var m=s.userData.member;
    $('eTitle').textContent='Takım '+s.userData.team.name+' · Bölge '+s.userData.zone;
    $('eSw').style.background=m.jersey;
    $('numIn').value=m.num;$('nameIn').value=m.name;$('roleIn').value=m.role;
    $('jerseyIn').value=m.jersey.toLowerCase();
    $('jumpIn').value=Math.round(s.userData.jump*100);
    $('jumpV').textContent=Math.round(s.userData.jump*100)+' cm';
    root.querySelectorAll('[data-pose]').forEach(function(b){
      b.classList.toggle('on',b.getAttribute('data-pose')===s.userData.pose);});
    markSw(m.jersey);buildBench(s);editEl.classList.add('open');
  }
  function buildBench(s){
    var box=$('benchList');box.innerHTML='';
    var team=s.userData.team,ids=onCourtIds(team);
    var bench=team.roster.filter(function(m){return ids.indexOf(m.id)<0;});
    if(!bench.length){box.innerHTML='<span class="note">Yedek yok.</span>';return;}
    bench.forEach(function(m){
      var b=document.createElement('button');b.className='bch';
      b.innerHTML='<i style="background:'+m.jersey+';color:'+contrast(m.jersey)+'">'+m.num+'</i>'+
        (m.name||ROLE_FULL[m.role]);
      b.addEventListener('click',function(){
        pushUndo();s.userData.member=m;paint(s);openEdit(s);
        toast((m.name||m.num)+' sahaya girdi');scheduleSave();});
      box.appendChild(b);});
  }
  function setJersey(hex){
    if(!editing)return;var m=editing.userData.member;
    m.jersey=hex;m.custom=true;
    $('eSw').style.background=hex;$('jerseyIn').value=hex.toLowerCase();
    markSw(hex);paint(editing);scheduleSave();
  }
  $('jerseyIn').addEventListener('input',function(e){setJersey(e.target.value);});
  $('numIn').addEventListener('input',function(e){
    if(!editing)return;var v=e.target.value.replace(/[^0-9]/g,'').slice(0,2);
    e.target.value=v;editing.userData.member.num=v||'0';paint(editing);scheduleSave();});
  $('nameIn').addEventListener('input',function(e){
    if(!editing)return;editing.userData.member.name=e.target.value;paint(editing);scheduleSave();});
  $('roleIn').addEventListener('change',function(e){
    if(!editing)return;editing.userData.member.role=e.target.value;paint(editing);scheduleSave();});
  $('liberoBtn').addEventListener('click',function(){
    if(!editing)return;editing.userData.member.role='L';$('roleIn').value='L';
    setJersey(lum(editing.userData.team.col)>110?'#16181D':'#F4C430');
    toast('Libero forması uygulandı');});
  $('teamBtn').addEventListener('click',function(){
    if(!editing)return;setJersey(editing.userData.team.col);
    editing.userData.member.custom=false;scheduleSave();});
  root.querySelectorAll('[data-pose]').forEach(function(b){
    b.addEventListener('click',function(){
      if(!editing)return;pushUndo();
      editing.userData.pose=b.getAttribute('data-pose');
      applyPose(editing.userData.fig,editing.userData.pose,editing.userData.jump);
      root.querySelectorAll('[data-pose]').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');faceBall();refreshShadow();refreshRange();scheduleSave();});
  });
  $('jumpIn').addEventListener('pointerdown',armUndo);
  $('jumpIn').addEventListener('change',commitUndo);
  $('jumpIn').addEventListener('input',function(e){
    if(!editing)return;var j=parseInt(e.target.value,10)/100;
    editing.userData.jump=j;$('jumpV').textContent=Math.round(j*100)+' cm';
    applyPose(editing.userData.fig,editing.userData.pose,j);refreshShadow();scheduleSave();});
  $('eClose').addEventListener('click',closeSheets);
  $('rClose').addEventListener('click',closeSheets);
  $('bClose').addEventListener('click',closeSheets);

  /* ══════════ KADRO ══════════ */
  var rosterTeam=0;
  function rosterToText(ti){
    var t=TEAMS[ti],ids=onCourtIds(t),lines=[];
    for(var z=1;z<=6;z++){var s=slotOf(t,z);if(s){var m=s.userData.member;
      lines.push(m.num+' '+(m.name||'')+' '+m.role);}}
    t.roster.forEach(function(m){if(ids.indexOf(m.id)<0)
      lines.push(m.num+' '+(m.name||'')+' '+m.role);});
    return lines.map(function(l){return l.replace(/\s+/g,' ').trim();}).join('\n');
  }
  function parseRoster(ti,text){
    var t=TEAMS[ti],old=t.roster.slice(),out=[];
    text.split('\n').forEach(function(raw){
      var ln=raw.trim();if(!ln)return;
      var tk=ln.split(/\s+/),num='',role='S';
      if(/^\d{1,2}$/.test(tk[0]))num=tk.shift();
      var last=(tk[tk.length-1]||'').toLocaleUpperCase('tr').replace('PC','PÇ');
      var full={'PASÖR':'P','SMAÇÖR':'S','ORTA':'O','LİBERO':'L','LIBERO':'L','KÖŞE':'S'};
      if(ROLES.indexOf(last)>=0){role=last;tk.pop();}
      else if(full[last]){role=full[last];tk.pop();}
      var name=tk.join(' ');
      if(!num)num=String(out.length+1);
      var prev=null;
      for(var i=0;i<old.length;i++)if(old[i].num===num){prev=old[i];break;}
      var m=newMember(num,name,role,prev&&prev.custom?prev.jersey:t.col);
      if(prev){m.id=prev.id;if(prev.custom)m.custom=true;}
      out.push(m);
    });
    while(out.length<6)out.push(newMember(out.length+1,'','S',t.col));
    t.roster=out;
    for(var z=1;z<=6;z++){var s=slotOf(t,z);if(s){s.userData.member=out[z-1];paint(s);}}
    scheduleSave();
  }
  function openRoster(){
    $('rosterTxt').value=rosterToText(rosterTeam);
    $('clubIn').value=clubName;rosterEl.classList.add('open');}
  $('rosterBtn').addEventListener('click',openRoster);
  root.querySelectorAll('[data-team]').forEach(function(b){
    b.addEventListener('click',function(){
      parseRoster(rosterTeam,$('rosterTxt').value);
      rosterTeam=parseInt(b.getAttribute('data-team'),10);
      root.querySelectorAll('[data-team]').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');$('rosterTxt').value=rosterToText(rosterTeam);});
  });
  $('applyRoster').addEventListener('click',function(){
    pushUndo();parseRoster(rosterTeam,$('rosterTxt').value);
    $('rosterTxt').value=rosterToText(rosterTeam);toast('Kadro uygulandı');});
  $('clubIn').addEventListener('input',function(e){
    clubName=e.target.value;$('brandName').textContent=clubName||'Saha 3D';
    drawClub();scheduleSave();});

  /* ══════════ OYUN KİTABI ══════════ */
  var PHASES=['Servis','Karşılama','Hücum geçişi','Blok–savunma'];
  var FORMKEY=['base','reception','attack','defense'];
  var BOOK={cells:{},free:[]},selCell=null,STEPS=[],QUEUE=[];
  function capture(){
    return {slots:slots.map(function(s){return {t:TEAMS.indexOf(s.userData.team),
        z:s.userData.zone,mid:s.userData.member.id,
        x:+s.position.x.toFixed(3),zz:+s.position.z.toFixed(3),
        pose:s.userData.pose,jump:s.userData.jump};}),
      ball:{x:+ball.position.x.toFixed(3),y:+ball.position.y.toFixed(3),
            z:+ball.position.z.toFixed(3)},
      rot:rotIdx,view:curView,net:category};
  }
  /* live=true → sekme geçişi: yalnız konum/duruş/top yüklenir.
     Kadro değişiklikleri ve bölgeler tüm sekmelerde ortaktır, dokunulmaz. */
  function restore(p,live){
    if(!p||!p.slots)return;
    if(!live){
      if(p.net&&p.net!==category){$('netSel').value=p.net;setNet(p.net);}
      if(typeof p.rot==='number'){rotIdx=p.rot;$('rotLbl').textContent='R'+rotIdx;}
    }
    p.slots.forEach(function(sd,i){
      var s=slots[i];if(!s)return;
      if(!live){
        s.userData.zone=sd.z;
        var r=TEAMS[sd.t].roster,f=null;
        for(var k=0;k<r.length;k++)if(r[k].id===sd.mid){f=r[k];break;}
        if(f)s.userData.member=f;
        paint(s);
      }
      s.position.set(sd.x,0,sd.zz);
      s.userData.pose=sd.pose||'ready';s.userData.jump=sd.jump||0;
      applyPose(s.userData.fig,s.userData.pose,s.userData.jump);
    });
    ball.position.set(p.ball.x,p.ball.y||ballR,p.ball.z);
    syncBallY();faceBall();
    if(!live&&p.view&&VIEWS[p.view])setView(p.view);
    refreshShadow();scheduleSave();
  }
  /* Oyun kitabından yükleme, aktif sekmenin hafızasına da yazılır */
  function bookLoad(p){restore(p,false);WORK[wkey(rotIdx,curForm)]=capture();}
  function buildBook(){
    var tb=$('bookTbl');
    var h='<tr><th></th>';
    PHASES.forEach(function(p){h+='<th>'+p+'</th>';});
    h+='</tr>';
    for(var r=1;r<=6;r++){
      h+='<tr><td class="rlab">R'+r+'</td>';
      for(var c=0;c<4;c++){
        var k='R'+r+'|'+c,full=!!BOOK.cells[k];
        h+='<td><div class="cell'+(full?' full':'')+(selCell===k?' sel':'')+
          '" data-cell="'+k+'">'+(full?'✓':'+')+'</div></td>';
      }
      h+='</tr>';
    }
    tb.innerHTML=h;
    tb.querySelectorAll('[data-cell]').forEach(function(el){
      el.addEventListener('click',function(){
        selCell=el.getAttribute('data-cell');buildBook();
        if(BOOK.cells[selCell]){bookLoad(BOOK.cells[selCell]);toast('Yüklendi');}
      });
    });
    buildFree();
    $('stepInfo').textContent=STEPS.length+' adım';
  }
  function buildFree(){
    var box=$('freeList');box.innerHTML='';
    BOOK.free.forEach(function(f,i){
      var b=document.createElement('button');b.className='bch';b.textContent=f.name;
      b.addEventListener('click',function(){bookLoad(f.pose);toast(f.name+' yüklendi');});
      b.addEventListener('contextmenu',function(ev){ev.preventDefault();
        BOOK.free.splice(i,1);saveBook();buildFree();});
      box.appendChild(b);
    });
    if(!BOOK.free.length)box.innerHTML='<span class="note">Henüz serbest kayıt yok.</span>';
  }
  $('bookBtn').addEventListener('click',function(){buildBook();bookEl.classList.add('open');});
  $('cellSave').addEventListener('click',function(){
    if(!selCell){toast('Önce bir kutu seç');return;}
    BOOK.cells[selCell]=capture();saveBook();buildBook();toast('Kaydedildi');});
  $('cellLoad').addEventListener('click',function(){
    if(!selCell||!BOOK.cells[selCell]){toast('Bu kutu boş');return;}
    bookLoad(BOOK.cells[selCell]);toast('Yüklendi');});
  $('cellDel').addEventListener('click',function(){
    if(!selCell)return;delete BOOK.cells[selCell];saveBook();buildBook();toast('Silindi');});
  $('cellStep').addEventListener('click',function(){
    if(!selCell||!BOOK.cells[selCell]){toast('Bu kutu boş');return;}
    STEPS.push(BOOK.cells[selCell]);$('stepInfo').textContent=STEPS.length+' adım';
    toast('Adım eklendi ('+STEPS.length+')');});
  $('freeSave').addEventListener('click',function(){
    var n=$('freeName').value.trim();if(!n){toast('Bir isim yaz');return;}
    BOOK.free.push({name:n,pose:capture()});saveBook();buildFree();
    $('freeName').value='';toast('Kaydedildi');});

  /* ══════════ ANİMASYON ══════════ */
  var anim={on:false,from:null,to:null,t:0,dur:1.6,idx:0,paths:null};
  function easeInOut(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}
  function samplePath(pts,u){
    var total=0,i,segs=[];
    for(i=1;i<pts.length;i++){var d=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z);
      segs.push(d);total+=d;}
    if(total<1e-6)return {x:pts[0].x,z:pts[0].z};
    var want=u*total,acc=0;
    for(i=0;i<segs.length;i++){
      if(acc+segs[i]>=want){
        var f=(want-acc)/(segs[i]||1);
        return {x:pts[i].x+(pts[i+1].x-pts[i].x)*f,z:pts[i].z+(pts[i+1].z-pts[i].z)*f};
      }
      acc+=segs[i];
    }
    return {x:pts[pts.length-1].x,z:pts[pts.length-1].z};
  }
  function startStep(i){
    if(i>=QUEUE.length){anim.on=false;toast('Bitti');return;}
    anim.idx=i;anim.t=0;
    anim.from=slots.map(function(s){return {x:s.position.x,z:s.position.z};});
    anim.from.push({x:ball.position.x,y:ball.position.y,z:ball.position.z});
    anim.to=QUEUE[i];
    anim.paths=slots.map(function(s,k){
      var sd=QUEUE[i].slots[k];if(!sd)return null;
      return trailFor(s.userData.member.id,anim.from[k],{x:sd.x,z:sd.zz});
    });
    anim.on=true;
  }
  function tickAnim(dt){
    if(!anim.on)return;
    anim.t+=dt;
    var u=Math.min(1,anim.t/anim.dur),e=easeInOut(u);
    slots.forEach(function(s,k){
      var sd=anim.to.slots[k];if(!sd)return;
      if(anim.paths[k]){var p=samplePath(anim.paths[k],e);s.position.x=p.x;s.position.z=p.z;}
      else{s.position.x=anim.from[k].x+(sd.x-anim.from[k].x)*e;
           s.position.z=anim.from[k].z+(sd.zz-anim.from[k].z)*e;}
    });
    var bf=anim.from[anim.from.length-1],by=anim.to.ball.y||ballR;
    ball.position.x=bf.x+(anim.to.ball.x-bf.x)*e;
    ball.position.z=bf.z+(anim.to.ball.z-bf.z)*e;
    var dist=Math.hypot(anim.to.ball.x-bf.x,anim.to.ball.z-bf.z);
    var arc=Math.max(0,Math.min(2.6,dist*0.20-Math.max(bf.y,by)*0.25));
    ball.position.y=(bf.y||ballR)+(by-(bf.y||ballR))*e+arc*Math.sin(Math.PI*e);
    faceBall();
    if(u>=1){
      restore(anim.to);
      setTimeout(function(){startStep(anim.idx+1);},250);
      anim.on=false;
      if(anim.idx+1<QUEUE.length)anim.on=true;
    }
  }
  $('playBtn').addEventListener('click',function(){
    if(!STEPS.length){toast('Önce oyun kitabından adım ekle');return;}
    anim.dur=parseInt($('durIn').value,10)/10;
    QUEUE=STEPS;restore(QUEUE[0]);setTimeout(function(){startStep(1);},300);
    if(STEPS.length<2)toast('En az iki adım gerekli');
  });
  $('addStep').addEventListener('click',function(){
    STEPS.push(capture());$('stepInfo').textContent=STEPS.length+' adım';
    toast('Şu anki hal adım oldu ('+STEPS.length+')');});
  $('clrSteps').addEventListener('click',function(){
    STEPS=[];$('stepInfo').textContent='0 adım';toast('Adımlar silindi');});
  $('durIn').addEventListener('input',function(e){
    anim.dur=parseInt(e.target.value,10)/10;$('durV').textContent=anim.dur.toFixed(1)+' sn';});

  /* ══════════ GERİ ALMA ══════════ */
  var UNDO=[],UNDOMAX=20,undoing=false,pendingSnap=null;
  function snap(){try{return JSON.stringify(stateObj());}catch(e){return null;}}
  function updUndo(){
    var b=$('undoActBtn');if(!b)return;
    b.disabled=!UNDO.length;
    b.textContent=UNDO.length?('Geri al ('+UNDO.length+')'):'Geri al';
  }
  function pushUndo(){
    if(undoing)return;
    var v=snap();if(!v)return;
    if(UNDO[UNDO.length-1]===v)return;
    UNDO.push(v);if(UNDO.length>UNDOMAX)UNDO.shift();
    updUndo();
  }
  function armUndo(){ if(!undoing) pendingSnap=snap(); }
  function commitUndo(){
    if(undoing||!pendingSnap)return;
    if(UNDO[UNDO.length-1]!==pendingSnap){
      UNDO.push(pendingSnap);if(UNDO.length>UNDOMAX)UNDO.shift();updUndo();}
    pendingSnap=null;
  }
  function doUndo(){
    if(!UNDO.length){toast('Geri alınacak bir şey yok');return;}
    undoing=true;
    try{loadState(JSON.parse(UNDO.pop()));}catch(e){}
    undoing=false;updUndo();toast('Geri alındı');
  }

  /* ══════════ PANEL BAĞLANTILARI ══════════ */
  var hintEl=$('hint'),ht;
  function toast(t){hintEl.textContent=t;hintEl.classList.add('show');
    clearTimeout(ht);ht=setTimeout(function(){hintEl.classList.remove('show');},2200);}
  root.querySelectorAll('[data-mode]').forEach(function(b){
    b.addEventListener('click',function(){setMode(b.getAttribute('data-mode'));});});
  (function(){var b=root.querySelectorAll('#t3d-cams button');
    for(var i=0;i<b.length;i++)(function(x){x.addEventListener('click',function(){
      setView(x.getAttribute('data-view'));});})(b[i]);})();
  root.querySelectorAll('[data-form]').forEach(function(b){
    b.addEventListener('click',function(){
      root.querySelectorAll('[data-form]').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');pushUndo();applyFormation(b.getAttribute('data-form'));
      closeSheets();toast(b.textContent.trim()+' yüklendi');});});
  /* ── Tam ekran + yatay çevirme ── */
  var fsOn=false;
  function applyFs(on){
    fsOn=on; root.classList.toggle('fs',on);
    var l=$('fsLbl'); if(l) l.textContent=on?'Çık':'Tam';
    setTimeout(resize,60); setTimeout(resize,320);
  }
  function enterFs(){
    applyFs(true);
    var req=root.requestFullscreen||root.webkitRequestFullscreen||root.msRequestFullscreen;
    if(req){ try{ var pr=req.call(root); if(pr&&pr.catch)pr.catch(function(){}); }catch(e){} }
    if(screen.orientation&&screen.orientation.lock){
      var q=screen.orientation.lock('landscape');
      if(q&&q.catch)q.catch(function(){
        if(innerHeight>innerWidth) toast('Telefonu yana çevir — saha genişler');});
    }else if(innerHeight>innerWidth){
      toast('Telefonu yana çevir — saha genişler');
    }
  }
  function exitFs(){
    applyFs(false);
    if(document.fullscreenElement||document.webkitFullscreenElement){
      var ex=document.exitFullscreen||document.webkitExitFullscreen;
      if(ex){ try{ ex.call(document); }catch(e){} }
    }
    if(screen.orientation&&screen.orientation.unlock){
      try{ screen.orientation.unlock(); }catch(e){}
    }
  }
  $('fsBtn').addEventListener('click',function(){ fsOn?exitFs():enterFs(); });
  win('keydown',function(e){ if(e.key==='Escape'&&fsOn) exitFs(); });
  win('fullscreenchange',function(){
    if(!document.fullscreenElement&&fsOn) applyFs(false); });
  win('orientationchange',function(){ setTimeout(resize,300); });

  $('rotNext').addEventListener('click',function(){pushUndo();rotate(1);});
  $('applyAll').addEventListener('click',function(){$('scope').classList.add('open');});
  $('scClose').addEventListener('click',function(){$('scope').classList.remove('open');});
  $('scOne').addEventListener('click',function(){
    pushUndo();spreadToAll([curForm]);$('scope').classList.remove('open');
    toast('Bu diziliş altı rotasyona uygulandı');});
  $('scAll').addEventListener('click',function(){
    pushUndo();spreadToAll(['base','reception','attack','defense']);$('scope').classList.remove('open');
    toast('Dört sekme de altı rotasyona uygulandı');});
  $('playRot').addEventListener('click',function(){
    anim.dur=parseInt($('durIn').value,10)/10;
    QUEUE=rotationSequence();
    restore(QUEUE[0],true);setTimeout(function(){startStep(1);},250);
    toast('Rotasyon dönüyor');});
  $('rotPrev').addEventListener('click',function(){pushUndo();rotate(-1);});
  $('undoActBtn').addEventListener('click',doUndo);
  win('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();doUndo();}});
  $('foldBtn').addEventListener('click',function(){$('extra').classList.toggle('hid');});
  $('netSel').addEventListener('change',function(e){
    setNet(e.target.value);refreshShadow();
    toast('File '+e.target.value+' m · '+(parseFloat(e.target.value)<2.2?'4 no top':'5 no top'));
    scheduleSave();});
  $('themeSel').addEventListener('change',function(e){setTheme(e.target.value);scheduleSave();});
  $('labelBtn').addEventListener('click',function(){
    labelMode=(labelMode+1)%5;
    $('labelBtn').textContent='Etiket: '+['Numara','İsim','Rol','Bölge','Kapalı'][labelMode];
    repaintAll();scheduleSave();});
  $('legalBtn').addEventListener('click',function(){
    legalOn=!legalOn;$('legalBtn').classList.toggle('on',legalOn);
    if(!legalOn)hideLegal();else if(selected)showLegal(selected);
    toast(legalOn?'Servis anı pozisyon kontrolü açık':'Kontrol kapalı');});
  $('trailBtn').addEventListener('click',function(){
    trailsOn=!trailsOn;$('trailBtn').textContent='İz: '+(trailsOn?'Açık':'Kapalı');
    $('trailBtn').classList.toggle('on',trailsOn);});
  $('undoBtn').addEventListener('click',function(){undoTrail();});
  $('clearBtn').addEventListener('click',function(){clearTrails();toast('İzler silindi');});
  $('rangeBtn').addEventListener('click',function(){
    rangeOn=!rangeOn;
    $('rangeBtn').classList.toggle('on',rangeOn);
    $('rangeWrap').style.display=rangeOn?'':'none';
    refreshRange();
    toast(rangeOn?'Kapsama açık — savunmadaki boşluklar görünür':'Kapsama kapalı');});
  $('rangeR').addEventListener('input',function(e){
    $('rangeRv').textContent=(parseInt(e.target.value,10)/10).toFixed(1)+' m';
    refreshRange();});
  $('viewConeBtn').addEventListener('click',function(){
    coneOn=!coneOn;
    $('viewConeBtn').classList.toggle('on',coneOn);
    if(!coneOn)clearCone(); else if(selected)refreshCone(selected);
    toast(coneOn?'Bir oyuncuya dokun — ne gördüğünü gösterir':'Görüş açısı kapalı');});
  $('noteBtn').addEventListener('click',function(){
    noteMode=!noteMode;
    $('noteBtn').classList.toggle('on',noteMode);
    toast(noteMode?'Sahada bir noktaya dokun — not yaz':'Not ekleme kapalı');});
  $('noteClr').addEventListener('click',function(){clearNotes();toast('Notlar silindi');});
  $('addCone').addEventListener('click',function(){pushUndo();addGear('cone');toast('Huni eklendi — sürükle');});
  $('addCart').addEventListener('click',function(){pushUndo();addGear('cart');toast('Top sepeti eklendi');});
  $('addMat').addEventListener('click',function(){pushUndo();addGear('mat');toast('Minder eklendi');});
  $('clrGear').addEventListener('click',function(){pushUndo();clearGear();toast('Ekipman temizlendi');});
  $('measBtn').addEventListener('click',function(){
    measOn=!measOn;
    $('measBtn').classList.toggle('on',measOn);
    if(!measOn){clearMeas();measA=null;}
    toast(measOn?'İki noktaya dokun — mesafeyi ölçer':'Ölçüm kapalı');});
  $('shadowBtn').addEventListener('click',function(){
    shadowOn=!shadowOn;$('shadowBtn').classList.toggle('on',shadowOn);
    refreshShadow();
    toast(shadowOn?(findAttacker()?'Blok gölgesi açık':
      'Gölge açık — bir oyuncuyu "Vuruş" duruşuna al'):'Blok gölgesi kapalı');});
  $('blockTrio').addEventListener('click',function(){
    pushUndo();var atk=findAttacker();
    var def=atk?-atk.userData.team.sign:1,team=TEAMS[def<0?0:1],n=0;
    [4,3,2].forEach(function(z,i){
      var s=slotOf(team,z);if(!s)return;
      s.position.set(def<0?(i-1)*2.6:-(i-1)*2.6,0,def*0.75);
      s.userData.pose='block';s.userData.jump=.35;
      applyPose(s.userData.fig,'block',.35);n++;});
    faceBall();refreshShadow();refreshRange();toast(n+' blokçu file önünde');scheduleSave();});
  function syncHit(){$('hitHv').textContent=(parseInt($('hitH').value,10)/100).toFixed(2)+' m';}
  function syncSpd(){$('spdV').textContent=$('spdIn').value+' km/s';}
  $('hitH').addEventListener('input',function(){syncHit();refreshShadow();});
  $('blkH').addEventListener('input',function(){
    $('blkHv').textContent='+'+$('blkH').value+' cm';refreshShadow();});
  $('angIn').addEventListener('input',function(){$('angV').textContent=$('angIn').value+'°';fire();});
  $('spdIn').addEventListener('input',function(){syncSpd();if(ballMode==='free')fire();});
  $('spinIn').addEventListener('input',function(){$('spinV').textContent=$('spinIn').value;fire();});
  $('ballY').addEventListener('input',function(e){
    ball.position.y=parseInt(e.target.value,10)/100;
    $('ballYv').textContent=ball.position.y.toFixed(2)+' m';
    if(mode==='teach')fire();scheduleSave();});
  $('fireBtn').addEventListener('click',function(){fire();});
  $('modeTarget').addEventListener('click',function(){
    ballMode='target';$('modeTarget').classList.add('on');$('modeTarget').classList.remove('ghost');
    $('modeFree').classList.remove('on');$('modeFree').classList.add('ghost');fire();});
  $('modeFree').addEventListener('click',function(){
    ballMode='free';$('modeFree').classList.add('on');$('modeFree').classList.remove('ghost');
    $('modeTarget').classList.remove('on');$('modeTarget').classList.add('ghost');fire();});
  function teamColor(i,hex){
    TEAMS[i].col=hex;
    TEAMS[i].roster.forEach(function(m){if(!m.custom)m.jersey=hex;});
    repaintAll();scheduleSave();}
  $('colA').addEventListener('input',function(e){teamColor(0,e.target.value);});
  $('colB').addEventListener('input',function(e){teamColor(1,e.target.value);});
  $('resetBtn').addEventListener('click',function(){
    pushUndo();delete WORK[wkey(rotIdx,curForm)];
    loadPhase(curForm,true);closeSheets();
    toast('Bu sekme şablona döndürüldü');});
  $('shotBtn').addEventListener('click',function(){
    ring.visible=false;renderer.render(scene,camera);
    try{var a=document.createElement('a');a.download='dizilis-'+Date.now()+'.png';
      a.href=renderer.domElement.toDataURL('image/png');a.click();toast('Görüntü indirildi');}
    catch(x){toast('Görüntü alınamadı');}});

  /* ══════════ DOSYA ══════════ */
  function stateObj(){
    syncWork();
    return {v:15,work:WORK,lastrot:LASTROT,
      gear:GEAR.map(function(g){return {k:g.userData.kind,
        x:+g.position.x.toFixed(2),z:+g.position.z.toFixed(2)};}),
      notes:NOTES.map(function(n){return {t:n.txt,x:+n.x.toFixed(2),z:+n.z.toFixed(2)};}),cat:category,form:curForm,rot:rotIdx,label:labelMode,view:curView,
      theme:theme,club:clubName,
      teams:TEAMS.map(function(t){return {name:t.name,col:t.col,
        roster:t.roster.map(function(m){return {id:m.id,num:m.num,name:m.name,role:m.role,
          jersey:m.jersey,custom:m.custom};})};}),
      slots:slots.map(function(s){return {t:TEAMS.indexOf(s.userData.team),z:s.userData.zone,
        mid:s.userData.member.id,x:+s.position.x.toFixed(3),zz:+s.position.z.toFixed(3),
        pose:s.userData.pose,jump:s.userData.jump};}),
      ball:{x:+ball.position.x.toFixed(3),y:+ball.position.y.toFixed(3),
            z:+ball.position.z.toFixed(3)},
      book:BOOK};
  }
  function loadState(o){
    if(!o||!o.teams)return;
    o.teams.forEach(function(td,i){
      TEAMS[i].name=td.name||TEAMS[i].name;TEAMS[i].col=td.col||TEAMS[i].col;
      TEAMS[i].roster=td.roster.map(function(m){
        if(m.id&&/^m\d+$/.test(m.id)){var n=parseInt(m.id.slice(1),10);if(n>uid)uid=n;}
        return {id:m.id||nid(),num:m.num,name:m.name||'',role:m.role||'S',
          jersey:m.jersey||td.col,custom:!!m.custom};});
    });
    $('colA').value=TEAMS[0].col.toLowerCase();$('colB').value=TEAMS[1].col.toLowerCase();
    if(o.slots)o.slots.forEach(function(sd,i){
      var s=slots[i];if(!s)return;
      s.userData.team=TEAMS[sd.t];s.userData.zone=sd.z;
      var r=TEAMS[sd.t].roster,f=null;
      for(var k=0;k<r.length;k++)if(r[k].id===sd.mid){f=r[k];break;}
      s.userData.member=f||r[0];
      s.position.set(sd.x,0,sd.zz);s.rotation.y=TEAMS[sd.t].sign<0?0:Math.PI;
      s.userData.pose=sd.pose||'ready';s.userData.jump=sd.jump||0;
      applyPose(s.userData.fig,s.userData.pose,s.userData.jump);
    });
    category=o.cat||'2.24';curForm=o.form||'base';rotIdx=o.rot||1;labelMode=o.label||0;
    clubName=o.club||'';theme=o.theme||'classic';
    $('netSel').value=category;setNet(category);
    $('themeSel').value=theme;setTheme(theme);
    $('brandName').textContent=clubName||'Saha 3D';
    $('rotLbl').textContent='R'+rotIdx;
    $('labelBtn').textContent='Etiket: '+['Numara','İsim','Rol','Bölge','Kapalı'][labelMode];
    root.querySelectorAll('[data-form]').forEach(function(b){
      b.classList.toggle('on',b.getAttribute('data-form')===curForm);});
    if(o.ball){ball.position.set(o.ball.x,o.ball.y||ballR,o.ball.z);syncBallY();}
    faceBall();
    if(o.view&&VIEWS[o.view])setView(o.view);
    if(o.book&&o.book.cells){BOOK=o.book;saveBook();}
    if(o.work)WORK=o.work;
    if(o.lastrot)LASTROT=o.lastrot;
    clearGear();clearNotes();
    if(o.gear)o.gear.forEach(function(g){addGear(g.k,g.x,g.z);});
    if(o.notes)o.notes.forEach(function(n){makeNote(n.t,n.x,n.z);});
    repaintAll();
  }
  $('expBtn').addEventListener('click',function(){
    try{
      var blob=new Blob([JSON.stringify(stateObj(),null,2)],{type:'application/json'});
      var a=document.createElement('a');a.href=URL.createObjectURL(blob);
      a.download='saha3d-'+new Date().toISOString().slice(0,10)+'.json';a.click();
      setTimeout(function(){URL.revokeObjectURL(a.href);},2000);toast('Dosya indirildi');
    }catch(e){toast('Dışa aktarılamadı');}});
  $('impBtn').addEventListener('click',function(){$('impIn').click();});
  $('impIn').addEventListener('change',function(e){
    var f=e.target.files&&e.target.files[0];if(!f)return;
    var fr=new FileReader();
    fr.onload=function(){try{loadState(JSON.parse(fr.result));
      $('rosterTxt').value=rosterToText(rosterTeam);toast('Dosya yüklendi');
      sSet(KEY,JSON.stringify(stateObj()));}catch(x){toast('Dosya okunamadı');}};
    fr.readAsText(f);e.target.value='';});

  /* ══════════ BAŞLAT ══════════ */
  function resize(){var w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;
    renderer.setSize(w,h,false);
    pcam.aspect=w/h;pcam.updateProjectionMatrix();fitOrtho();}
  win('resize',resize);resize();
  if(window.ResizeObserver){var ro=new ResizeObserver(function(){resize();});ro.observe(root);
    listeners.push(['__ro',function(){ro.disconnect();}]);}
  setTheme('classic');setNet('2.24');applyFormation('base');syncBallY();faceBall();

  var lastT=performance.now();
  (function loop(){
    if(!alive)return;
    requestAnimationFrame(loop);
    var now=performance.now(),dt=Math.min(.05,(now-lastT)/1000);lastT=now;
    tickAnim(dt);
    cur.r+=(dst.r-cur.r)*.12;cur.th+=(dst.th-cur.th)*.12;cur.ph+=(dst.ph-cur.ph)*.12;
    var sp=Math.sin(cur.ph);
    camera.position.set(target.x+cur.r*sp*Math.sin(cur.th),target.y+cur.r*Math.cos(cur.ph),
      target.z+cur.r*sp*Math.cos(cur.th));
    camera.lookAt(target);
    if(isOrtho)fitOrtho();
    renderer.render(scene,camera);
  })();

  Promise.all([sGet(KEY),sGet(BKEY)]).then(function(res){
    if(res[1]){try{var b=JSON.parse(res[1]);if(b&&b.cells)BOOK=b;}catch(e){}}
    if(res[0]){try{loadState(JSON.parse(res[0]));}catch(e){}}
  
    setTimeout(function(){toast(res[0]?'Son bıraktığın hal yüklendi':
      'Oyuncuya dokun → düzenle · Sürükle → taşı');},500);
  }).catch(function(){});


  return function unmount() {
    alive = false;
    try { if (fsOn) exitFs(); } catch (e) {}
    listeners.forEach(([ev, fn]) => { if (ev === '__ro') fn(); else window.removeEventListener(ev, fn); });
    try { renderer.dispose(); } catch (e) {}
    root.classList.remove('t3d');
    root.innerHTML = '';
  };
}
