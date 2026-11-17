/**
 * CADBRIDGE PRO & XVIDEO AI 4K — QWEN-4 / DEEPSEEK 3D & BLENDER BRIDGE v31.3
 * - Inietta il selettore sincronizzato di tutti i modelli Free (#cad-inline-model-select)
 *   sia nella barra superiore che nel pannello inferiore di CADBridge Pro 4K.
 */
(function () {
  'use strict';

  function injectCADBridgeDrawer() {
    if (document.getElementById('cad-qwen4-drawer')) return;

    const drawer = document.createElement('section');
    drawer.id = 'cad-qwen4-drawer';
    drawer.style.cssText = `
      width: 100%; box-sizing: border-box; background: #050912;
      border-top: 2px solid #00e676; border-bottom: 2px solid #38bdf8;
      padding: 12px 14px; font-family: system-ui, -apple-system, monospace;
      color: #e2e8f0; margin-top: 14px;
    `;

    drawer.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; background:#09101d; padding:8px 12px; border-radius:8px; border:1px solid rgba(0,230,118,0.3);">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <b style="color:#00e676; font-size:13px;">🏛️ CADBRIDGE PRO 4K — QWEN 4 / DEEPSEEK 2D-TO-3D & BLENDER ENGINE (v31.3)</b>
          <span id="cad-active-model-pill" style="font-size:10.5px; color:#00ff88; background:#050911; padding:2px 8px; border-radius:4px; border:1px solid #00ff88;">🟢 0,00€ Ready</span>
        </div>
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          <select id="cad-inline-model-select" class="free-llm-synced-select" style="background:#050911; color:#00e5ff; border:1px solid #00e5ff; padding:4px 8px; border-radius:5px; font-weight:700; font-size:11px; max-width:280px;"></select>
          <button type="button" id="cad-btn-gen-3d" style="background:#065f46; color:#fff; border:1px solid #00e676; padding:4px 10px; border-radius:5px; cursor:pointer; font-weight:800; font-size:11px;">
            📐 Genera 3D + Script Blender (.py)
          </button>
          <button type="button" id="cad-btn-gen-video" style="background:#3b0764; color:#fde047; border:1px solid #e040fb; padding:4px 10px; border-radius:5px; cursor:pointer; font-weight:800; font-size:11px;">
            🎬 Regia 4K + Camera Path
          </button>
          <button type="button" id="cad-btn-open-keys" style="background:#0f172a; color:#38bdf8; border:1px solid #38bdf8; padding:4px 9px; border-radius:5px; cursor:pointer; font-weight:700; font-size:11px;">
            🧠 ⚡ AI Free (Chiavi)
          </button>
        </div>
      </div>
      <div id="cad-qwen4-output" style="margin-top:8px; background:#080d16; border:1px solid rgba(56,189,248,0.25); border-radius:6px; padding:10px 12px; font-size:11.5px; color:#cbd5e1; white-space:pre-wrap; line-height:1.45;">
        🟢 Seleziona qualsiasi modello Free dalla tendina qui sopra (Qwen 3.8/4 27B Vision+Code, DeepSeek-R1/V3, Nemotron 3 Ultra 550B, Gemma 4 31B) per convertire piante 2D in scene 3D Blender e regia 4K a 0,00€.
      </div>
    `;

    document.body.appendChild(drawer);

    const sel = document.getElementById('cad-inline-model-select');
    if (sel) {
      sel.addEventListener('change', (e) => {
        if (window.FreeLLMRouter) window.FreeLLMRouter.setPrimaryModel(e.target.value);
      });
    }

    document.getElementById('cad-btn-open-keys').addEventListener('click', () => {
      if (typeof window.openFreeLLMModal === 'function') window.openFreeLLMModal();
    });

    const runTask = async (mode) => {
      const out = document.getElementById('cad-qwen4-output');
      if (out) out.innerHTML = '⏳ Elaborazione Qwen-4 / DeepSeek 3D in corso a 0,00€...';
      if (!window.FreeLLMRouter) return;
      let snap = null;
      const cv = document.querySelector('canvas');
      if (cv) {
        try { snap = cv.toDataURL('image/webp', 0.65); } catch (e) {}
      }
      const res = await window.FreeLLMRouter.generateCAD3DAndVideoScene({ mode, project: document.title }, snap);
      if (out) {
        out.innerHTML = res.ok
          ? `🟢 <b>[${res.model} — 0,00€]</b>:\n${res.reply}`
          : `⚠️ ${res.error}`;
      }
    };

    document.getElementById('cad-btn-gen-3d').addEventListener('click', () => runTask('2D_TO_3D_BLENDER_SCRIPT'));
    document.getElementById('cad-btn-gen-video').addEventListener('click', () => runTask('4K_CAMERA_PATH_DIRECTOR'));

    if (window.FreeLLMRouter) window.FreeLLMRouter.populateAllSelects();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCADBridgeDrawer);
  } else {
    injectCADBridgeDrawer();
  }
})();
