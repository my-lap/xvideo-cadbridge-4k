/**
 * CADBRIDGE PRO & XVIDEO AI 4K — QWEN-4 / DEEPSEEK 3D & BLENDER BRIDGE v31.4-HYPERSPEED
 * - Lazy-loaded Web Worker (js/cad_hyperspeed_worker.js) per calcoli CAD/Blender a 60 FPS.
 * - AI Token Streaming SSE (completeStream) + Skeleton Shimmer + Optimistic UI.
 * - Selettore sincronizzato #cad-inline-model-select (Topbar <-> Drawer inferiore).
 */
(function () {
  'use strict';

  let _worker = null;
  let _reqId = 0;
  const _pending = new Map();

  function getWorker() {
    if (_worker) return _worker;
    if (typeof Worker === 'undefined') return null;
    try {
      _worker = new Worker('js/cad_hyperspeed_worker.js?v=31.4-hyperspeed');
      _worker.onmessage = (ev) => {
        const { id, ok, result, error, elapsedMs } = ev.data || {};
        const p = _pending.get(id);
        if (!p) return;
        _pending.delete(id);
        if (ok) p.resolve({ ...result, elapsedMs });
        else p.reject(new Error(error || 'Worker error'));
      };
      _worker.onerror = () => { _worker = null; };
      return _worker;
    } catch (e) {
      return null;
    }
  }

  function runWorkerTask(type, payload) {
    const w = getWorker();
    if (!w) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const id = ++_reqId;
      _pending.set(id, { resolve, reject });
      w.postMessage({ id, type, payload });
      setTimeout(() => {
        if (_pending.has(id)) {
          _pending.delete(id);
          resolve(null);
        }
      }, 2500);
    });
  }

  function injectHyperSpeedStyles() {
    if (document.getElementById('cad-hyperspeed-css')) return;
    const st = document.createElement('style');
    st.id = 'cad-hyperspeed-css';
    st.textContent = `
      @keyframes cbShimmerV31 { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      .cb-skeleton-bar {
        height: 12px; border-radius: 6px; margin: 6px 0;
        background: linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%);
        background-size: 200% 100%; animation: cbShimmerV31 1.2s infinite linear;
      }
      #cad-qwen4-drawer { content-visibility: auto; contain-intrinsic-size: 160px; }
    `;
    document.head.appendChild(st);
  }

  function injectCADBridgeDrawer() {
    if (document.getElementById('cad-qwen4-drawer')) return;
    injectHyperSpeedStyles();

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
          <b style="color:#00e676; font-size:13px;">🏛️ CADBRIDGE PRO 4K — HYPER-SPEED 31 ENGINE (v31.4)</b>
          <span id="cad-active-model-pill" style="font-size:10.5px; color:#00ff88; background:#050911; padding:2px 8px; border-radius:4px; border:1px solid #00ff88;">🟢 0,00€ Ready</span>
          <span id="cad-rum-pill" style="font-size:10px; color:#38bdf8; background:#050911; padding:2px 7px; border-radius:4px; border:1px solid rgba(56,189,248,0.4);">⚡ 60FPS Worker</span>
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
        🟢 Hyper-Speed v31.4 attivo: Web Worker 60FPS + AI Token Streaming SSE + Cache Modelli 10m pronti a 0,00€.
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
      const rumPill = document.getElementById('cad-rum-pill');
      const t0 = performance.now();
      if (out) {
        out.innerHTML = `<div style="color:#38bdf8;font-weight:700;">⚡ Optimistic UI — Web Worker + Streaming Qwen-4 / DeepSeek (${mode})...</div><div class="cb-skeleton-bar" style="width:92%"></div><div class="cb-skeleton-bar" style="width:74%"></div>`;
      }

      // 1. Calcolo geometria & Blender .py nel Web Worker senza bloccare i 60 FPS
      const quotesRaw = (document.getElementById('mvQuotes')?.value || '540,0\n0,420\n-540,0\n0,-420')
        .split('\n').map(l => l.split(',').map(Number)).filter(a => a.length >= 2 && !isNaN(a[0]));
      const hCm = Number(document.getElementById('mvH')?.value) || 300;
      const winMq = Number(document.getElementById('mvWin')?.value) || 3.2;

      const workerGeom = await runWorkerTask('COMPUTE_GEOM', { quotes: quotesRaw, heightCm: hCm, windowsAreaMq: winMq });
      const workerPy = await runWorkerTask('BUILD_BLENDER_PY', { areaMq: workerGeom?.areaMq || 145.5, heightCm: hCm, mode });
      if (rumPill && workerGeom) {
        rumPill.textContent = `⚡ Worker ${workerGeom.elapsedMs}ms · ${workerGeom.areaMq}m²`;
      }

      if (!window.FreeLLMRouter) return;
      let snap = null;
      const cv = document.querySelector('canvas');
      if (cv) {
        try { snap = cv.toDataURL('image/webp', 0.65); } catch (e) {}
      }

      const sys = 'Sei Qwen-4 3D Architect & Digital Twin Engine. Genera camera path 3D, snippet Python Blender (bpy) e prompt 4K.';
      const prompt = `Modalità: ${mode}. Progetto: ${document.title}. Geometria: ${JSON.stringify(workerGeom || { areaMq: 145.5, heightCm: hCm })}.`;

      let firstTokenMs = 0;
      const res = (typeof window.FreeLLMRouter.completeStream === 'function')
        ? await window.FreeLLMRouter.completeStream(prompt, sys, (_delta, full) => {
            if (!firstTokenMs) firstTokenMs = Math.round(performance.now() - t0);
            if (rumPill) rumPill.textContent = `⚡ TTFT ${firstTokenMs}ms (SSE)`;
            if (out) out.textContent = `⚡ Streaming live (0,00€ | TTFT ${firstTokenMs}ms):\n${full}`;
          }, { imageDataUrl: snap })
        : await window.FreeLLMRouter.generateCAD3DAndVideoScene({ mode, project: document.title }, snap);

      if (out) {
        const totalMs = Math.round(performance.now() - t0);
        if (rumPill) rumPill.textContent = `⚡ ${firstTokenMs ? 'TTFT ' + firstTokenMs + 'ms / ' : ''}${totalMs}ms`;
        out.innerHTML = res.ok
          ? `🟢 <b>[${res.model} — 0,00€ · ${totalMs}ms]</b>:\n${res.reply}`
          : `🟢 <b>[Web Worker Offline Fallback — ${workerGeom?.elapsedMs || 0}ms]</b>:\n${workerPy?.py || res.error}`;
      }
    };

    document.getElementById('cad-btn-gen-3d').addEventListener('click', () => runTask('2D_TO_3D_BLENDER_SCRIPT'));
    document.getElementById('cad-btn-gen-video').addEventListener('click', () => runTask('4K_CAMERA_PATH_DIRECTOR'));

    if (window.FreeLLMRouter) window.FreeLLMRouter.populateAllSelects();
  }

  window.CADHyperSpeedBridgeV31 = { version: '31.4-HYPERSPEED', runWorkerTask };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCADBridgeDrawer);
  } else {
    injectCADBridgeDrawer();
  }
})();
