/**
 * UNIVERSAL FREE LLM ROUTER v31.3-DUAL-SYNC
 * - Condiviso tra Trading Pro Ultimate & CADBridge Pro 4K.
 * - Popola e sincronizza in tempo reale TUTTI i menu <select> dei modelli Free:
 *   1. #free-llm-model-select (nel Modal superiore "🧠 ⚡ AI Free")
 *   2. #qro-inline-model-select (nella barra della Sala Quantitativa sotto)
 *   3. #cad-inline-model-select (nella barra inferiore di CADBridge Pro 4K)
 */
(function () {
  'use strict';

  const STORAGE_KEYS = {
    OPENROUTER: 'OPENROUTER_FREE_KEY',
    GROQ: 'GROQ_FREE_KEY',
    CEREBRAS: 'CEREBRAS_FREE_KEY',
    MISTRAL: 'MISTRAL_FREE_KEY',
    GITHUB: 'GITHUB_MODELS_KEY',
    OLLAMA_URL: 'OLLAMA_LOCAL_URL',
    PRIMARY_MODEL: 'FREE_LLM_PRIMARY_MODEL'
  };

  const DEFAULT_MODELS = [
    { id: 'qwen/qwen3.8-27b:free', label: 'Qwen 3.8 27B Multimodal (262K Vision + Coding + Math — 0,00€)', provider: 'openrouter', vision: true },
    { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', label: 'NVIDIA Nemotron 3 Ultra 550B (1M Context — 0,00€)', provider: 'openrouter', vision: false },
    { id: 'nvidia/nemotron-3.5-super-vl:free', label: 'NVIDIA Nemotron 3.5 Super VL (Vision — 0,00€)', provider: 'openrouter', vision: true },
    { id: 'openrouter/free', label: 'openrouter/free (Router Universale Auto-Free 0€)', provider: 'openrouter', vision: true },
    { id: 'DeepSeek-R1', label: 'DeepSeek-R1 (:free OpenRouter / GitHub) — 0.00 EUR', provider: 'deepseek_hybrid', vision: false },
    { id: 'Qwen-2.5-Coder-32B', label: 'Qwen 2.5 Coder 32B (:free OpenRouter) — 0.00 EUR', provider: 'openrouter', vision: false },
    { id: 'DeepSeek-V3-0324', label: 'DeepSeek V3 0324 (:free OpenRouter / GitHub) — 0.00 EUR', provider: 'deepseek_hybrid', vision: false },
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq LPU 800 tok/s) — 0.00 EUR', provider: 'groq', vision: false },
    { id: 'llama3.1-8b', label: 'Llama 3.1 70B/8B (Cerebras 1M tok/d) — 0.00 EUR', provider: 'cerebras', vision: false },
    { id: 'codestral-latest', label: 'Mistral Codestral Free — 0.00 EUR', provider: 'mistral', vision: false },
    { id: 'github/DeepSeek-R1', label: 'GitHub Models DeepSeek-R1 — 0.00 EUR', provider: 'github', vision: false },
    { id: 'qwen4:27b', label: 'Ollama Locale qwen4:27b (:11434 / Proxy :4000) — 0.00 EUR', provider: 'ollama', vision: true },
    { id: 'dots-studio/dots-3-note-preview:free', label: 'Dots Studio: Dots3-Note Preview (free) (:free Live 0€)', provider: 'openrouter', vision: true },
    { id: 'nvidia/nemotron-3.5-lightning:free', label: 'NVIDIA: Nemotron 3.5 Lightning (free) (:free Live 0€)', provider: 'openrouter', vision: false },
    { id: 'cohere/north-mini-code:free', label: 'Cohere: North Mini Code (free) (:free Live 0€)', provider: 'openrouter', vision: false },
    { id: 'nvidia/nemotron-3-nano-omni:free', label: 'NVIDIA: Nemotron 3 Nano Omni (free) (:free Live 0€)', provider: 'openrouter', vision: true },
    { id: 'google/gemma-4-26b-a4b:free', label: 'Google: Gemma 4 26B A4B (free) (:free Live 0€)', provider: 'openrouter', vision: true },
    { id: 'google/gemma-4-31b:free', label: 'Google: Gemma 4 31B (free) (:free Live 0€)', provider: 'openrouter', vision: true }
  ];

  window.FreeLLMRouter = {
    version: '31.3-DUAL-SYNC',
    discoveredFreeModels: [...DEFAULT_MODELS],
    lastActiveNode: null,

    getKeys() {
      return {
        openrouter: (localStorage.getItem(STORAGE_KEYS.OPENROUTER) || '').trim(),
        groq: (localStorage.getItem(STORAGE_KEYS.GROQ) || '').trim(),
        cerebras: (localStorage.getItem(STORAGE_KEYS.CEREBRAS) || '').trim(),
        mistral: (localStorage.getItem(STORAGE_KEYS.MISTRAL) || '').trim(),
        github: (localStorage.getItem(STORAGE_KEYS.GITHUB) || '').trim(),
        ollama: (localStorage.getItem(STORAGE_KEYS.OLLAMA_URL) || 'http://localhost:11434/v1/chat/completions').trim(),
        primaryModel: localStorage.getItem(STORAGE_KEYS.PRIMARY_MODEL) || 'qwen/qwen3.8-27b:free'
      };
    },

    setPrimaryModel(modelId) {
      if (!modelId) return;
      localStorage.setItem(STORAGE_KEYS.PRIMARY_MODEL, modelId);
      this.populateAllSelects();
      this.updateStatusBadge(`🟢 0,00€ (${modelId})`, true);
    },

    populateAllSelects() {
      const current = localStorage.getItem(STORAGE_KEYS.PRIMARY_MODEL) || 'qwen/qwen3.8-27b:free';
      const selectors = document.querySelectorAll(
        '#free-llm-model-select, #qro-inline-model-select, #cad-inline-model-select, .free-llm-synced-select'
      );
      selectors.forEach(sel => {
        sel.innerHTML = '';
        this.discoveredFreeModels.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.id;
          opt.textContent = m.label;
          if (m.id === current) opt.selected = true;
          sel.appendChild(opt);
        });
      });
    },

    populateSelect() {
      this.populateAllSelects();
    },

    ensureModalDOM() {
      let backdrop = document.getElementById('free-llm-modal-backdrop');
      if (backdrop) return backdrop;

      backdrop = document.createElement('div');
      backdrop.id = 'free-llm-modal-backdrop';
      backdrop.style.cssText = `
        display: none; position: fixed; inset: 0; background: rgba(2, 6, 14, 0.84);
        backdrop-filter: blur(6px); z-index: 999999; justify-content: center;
        align-items: center; padding: 14px; font-family: system-ui, -apple-system, monospace; color: #e2e8f0;
      `;

      const inStyle = `width:100%; background:#050911; color:#00e5ff; border:1px solid #334155; padding:8px 10px; border-radius:6px; font-size:12px; font-family:monospace; box-sizing:border-box; margin-top:4px;`;

      backdrop.innerHTML = `
        <div style="background:#09101d; border:2px solid #00e676; border-radius:12px; max-width:660px; width:100%; max-height:90vh; overflow-y:auto; padding:18px 20px; box-shadow:0 20px 60px rgba(0,0,0,0.85); box-sizing:border-box;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,230,118,0.25); padding-bottom:10px; margin-bottom:12px;">
            <div>
              <b style="color:#00e676; font-size:15px;">🧠 ⚡ ROUTER AI TOP-FREE (QWEN 4 / DEEPSEEK-R1 / NEMOTRON 550B)</b>
              <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Sincronizzato Sopra & Sotto • 0,00€ Garantiti • Vision & 3D Bridge</div>
            </div>
            <button type="button" id="free-llm-close-x" style="background:#1e293b; color:#f8fafc; border:1px solid #475569; border-radius:6px; padding:4px 10px; cursor:pointer; font-weight:800;">✕ Chiudi</button>
          </div>
          <div style="margin-bottom:12px;">
            <label style="font-size:11.5px; color:#ffd54f; font-weight:700;">Modello Primario Live (Qwen 3.8/4 27B Vision+Code, DeepSeek-R1/V3, Nemotron 3 Ultra 550B):</label>
            <select id="free-llm-model-select" class="free-llm-synced-select" style="${inStyle} color:#f8fafc; border-color:#38bdf8; font-weight:700;"></select>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:10px; margin-bottom:12px;">
            <div>
              <label style="font-size:11px; color:#cbd5e1; font-weight:700;">🔑 OpenRouter Key (:free Qwen 3.8 / Nemotron 550B):</label>
              <input type="password" id="free-llm-key-openrouter" placeholder="sk-or-v1-..." style="${inStyle}" />
            </div>
            <div>
              <label style="font-size:11px; color:#cbd5e1; font-weight:700;">🐋 GitHub Token (DeepSeek-R1 / DeepSeek-V3 Free):</label>
              <input type="password" id="free-llm-key-github" placeholder="ghp_... oppure github_pat_..." style="${inStyle}" />
            </div>
            <div>
              <label style="font-size:11px; color:#cbd5e1; font-weight:700;">🚀 Groq Cloud Key (Llama 3.3 70B 800 tok/s):</label>
              <input type="password" id="free-llm-key-groq" placeholder="gsk_..." style="${inStyle}" />
            </div>
            <div>
              <label style="font-size:11px; color:#cbd5e1; font-weight:700;">⚡ Cerebras / Mistral Codestral Key:</label>
              <input type="password" id="free-llm-key-cerebras" placeholder="csk-..." style="${inStyle}" />
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <label style="font-size:11px; color:#94a3b8;">🖥️ Endpoint Locale Ollama (Qwen4 27B / DeepSeek-R1 locale):</label>
            <input type="text" id="free-llm-key-ollama" value="http://localhost:11434/v1/chat/completions" style="${inStyle}" />
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
            <button type="button" id="free-llm-btn-save" style="flex:1; background:#065f46; color:#fff; border:1px solid #00e676; padding:9px 12px; border-radius:6px; cursor:pointer; font-weight:800; font-size:12px;">💾 Salva Chiavi & Modello</button>
            <button type="button" id="free-llm-btn-test" style="flex:1; background:#006064; color:#fff; border:1px solid #00e5ff; padding:9px 12px; border-radius:6px; cursor:pointer; font-weight:800; font-size:12px;">⚡ Test Ping Live (0,00€)</button>
          </div>
          <div style="margin-bottom:12px; padding:10px 12px; background:#050911; border:1px solid rgba(255,213,79,0.35); border-radius:8px;">
            <div style="font-size:11.5px; color:#ffd54f; font-weight:800; margin-bottom:6px;">📸 SCREENSHOT / IMMAGINE TO CODE (8 AGENTI + QWEN 3.8 27B / NEMOTRON 3.5 VL — 0,00€)</div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
              <input type="file" id="free-llm-visual-file" accept="image/*" style="font-size:11px; color:#cbd5e1; max-width:210px;" />
              <input type="text" id="free-llm-visual-prompt" placeholder="Istruzione (es: Clona layout HTML/CSS/JS o analizza UI)..." style="${inStyle} flex:1; min-width:170px; margin-top:0;" />
              <button type="button" id="free-llm-btn-clone-ui" style="background:#4c1d95; color:#fde047; border:1px solid #c084fc; padding:7px 11px; border-radius:6px; cursor:pointer; font-weight:800; font-size:11.5px;">🧬 Clona / Analizza UI (0€)</button>
            </div>
          </div>
          <div id="free-llm-status-box" style="background:#050911; border:1px solid rgba(0,229,255,0.3); border-radius:6px; padding:10px 12px; font-size:11.5px; color:#38bdf8; line-height:1.45; white-space:pre-wrap; max-height:220px; overflow-y:auto;">
            🟢 Connesso. Tutti i piani Free compaiono sia qui che nel selettore rapido in fondo alla pagina.
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) window.closeFreeLLMModal(); });
      document.getElementById('free-llm-close-x').addEventListener('click', () => window.closeFreeLLMModal());
      document.getElementById('free-llm-btn-save').addEventListener('click', () => this.saveKeysFromModal());
      document.getElementById('free-llm-btn-test').addEventListener('click', () => window.runInstantOpenRouterTest());
      document.getElementById('free-llm-model-select').addEventListener('change', (e) => this.setPrimaryModel(e.target.value));
      document.getElementById('free-llm-btn-clone-ui').addEventListener('click', () => this.runVisualClonerFromModal());

      this.populateAllSelects();
      return backdrop;
    },

    bindTopBarButton() {
      document.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('button, a, [role="button"], div[onclick]') : null;
        if (!btn) return;
        if (btn.closest('#free-llm-modal-backdrop') || btn.closest('#quant-readonly-drawer') || btn.closest('#cad-qwen4-drawer')) return;
        const txt = (btn.textContent || '').trim();
        const id = (btn.id || '').toLowerCase();
        if (txt.includes('AI Free') || txt.includes('Qwen/DeepSeek') || id.includes('free-llm') || id.includes('aifree')) {
          ev.preventDefault();
          ev.stopPropagation();
          window.openFreeLLMModal();
        }
      }, true);
    },

    saveKeysFromModal() {
      const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : null; };
      const orKey = getVal('free-llm-key-openrouter') ?? getVal('free-llm-key-input');
      if (orKey !== null) localStorage.setItem(STORAGE_KEYS.OPENROUTER, orKey);
      const groqKey = getVal('free-llm-key-groq');
      if (groqKey !== null) localStorage.setItem(STORAGE_KEYS.GROQ, groqKey);
      const cerKey = getVal('free-llm-key-cerebras');
      if (cerKey !== null) localStorage.setItem(STORAGE_KEYS.CEREBRAS, cerKey);
      const misKey = getVal('free-llm-key-mistral');
      if (misKey !== null) localStorage.setItem(STORAGE_KEYS.MISTRAL, misKey);
      const ghKey = getVal('free-llm-key-github');
      if (ghKey !== null) localStorage.setItem(STORAGE_KEYS.GITHUB, ghKey);
      const olUrl = getVal('free-llm-key-ollama');
      if (olUrl !== null) localStorage.setItem(STORAGE_KEYS.OLLAMA_URL, olUrl);
      const modSel = getVal('free-llm-model-select');
      if (modSel) this.setPrimaryModel(modSel);

      this.setStatusBox('✅ Impostazioni salvate e sincronizzate sopra e sotto! Modello attivo: <b>' + (modSel || this.getKeys().primaryModel) + '</b>');
      return this.getKeys();
    },

    updateStatusBadge(text, ok = true) {
      const badges = document.querySelectorAll('#free-llm-status-badge, #qro-active-model-pill, #cad-active-model-pill');
      badges.forEach(badge => {
        badge.textContent = text;
        badge.style.borderColor = ok ? '#00ff88' : '#ffaa00';
        badge.style.color = ok ? '#00ff88' : '#ffaa00';
      });
    },

    setStatusBox(html) {
      const box = document.getElementById('free-llm-status-box');
      if (box) box.innerHTML = html;
    },

    async discoverOpenRouterFreeModels() {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 3200);
        const res = await fetch('https://openrouter.ai/api/v1/models', { signal: controller.signal });
        clearTimeout(tid);
        if (!res.ok) return this.discoveredFreeModels;
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          const liveFree = data.data.filter(m =>
            (m.id && m.id.endsWith(':free')) ||
            (m.pricing && String(m.pricing.prompt) === '0' && String(m.pricing.completion) === '0')
          );
          const priorityKeywords = ['qwen', 'deepseek', 'nemotron', 'gemma-4', 'north-mini', 'dots-3', 'llama-3.3'];
          liveFree.sort((a, b) => {
            const aP = priorityKeywords.findIndex(k => a.id.toLowerCase().includes(k));
            const bP = priorityKeywords.findIndex(k => b.id.toLowerCase().includes(k));
            return (aP === -1 ? 99 : aP) - (bP === -1 ? 99 : bP);
          });
          const mapped = liveFree.slice(0, 30).map(m => ({
            id: m.id,
            label: `${m.name || m.id} (:free Live 0€)`,
            provider: 'openrouter',
            vision: /vl|vision|qwen3\.8|omni|dots|gemma-4/i.test(m.id)
          }));
          this.discoveredFreeModels = [
            ...DEFAULT_MODELS,
            ...mapped.filter(m => !DEFAULT_MODELS.some(d => d.id === m.id))
          ];
          this.populateAllSelects();
        }
      } catch (e) {}
      return this.discoveredFreeModels;
    },

    async callWithTimeout(url, options, timeoutMs = 4800) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return response;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    },

    async complete(promptText, systemPrompt = 'Sei il Direttore Quantitativo & Architetturale Qwen/DeepSeek. Rispondi in modo conciso e operativo.', options = {}) {
      const keys = this.getKeys();
      const imageDataUrl = options.imageDataUrl || null;
      const maxTokens = options.maxTokens || 280;
      const candidates = [];

      const buildUserContent = (supportsVision) => {
        if (imageDataUrl && supportsVision) {
          return [
            { type: 'text', text: promptText },
            { type: 'image_url', image_url: { url: imageDataUrl } }
          ];
        }
        return promptText;
      };

      const wantDeepSeek = /deepseek/i.test(keys.primaryModel);

      if (wantDeepSeek && keys.github) {
        candidates.push({
          name: `GitHub Models (${keys.primaryModel})`,
          url: 'https://models.inference.ai.azure.com/chat/completions',
          headers: { 'Authorization': `Bearer ${keys.github}`, 'Content-Type': 'application/json' },
          model: keys.primaryModel.includes('V3') ? 'DeepSeek-V3-0324' : 'DeepSeek-R1',
          vision: false
        });
      }

      if (keys.openrouter) {
        const cleanPrimary = (
          keys.primaryModel &&
          !keys.primaryModel.startsWith('DeepSeek-') &&
          !keys.primaryModel.startsWith('Qwen-2.5') &&
          !keys.primaryModel.startsWith('github/')
        ) ? keys.primaryModel : 'qwen/qwen3.8-27b:free';

        const orChain = [
          cleanPrimary,
          'qwen/qwen3.8-27b:free',
          'nvidia/nemotron-3.5-super-vl:free',
          'nvidia/nemotron-3-ultra-550b-a55b:free',
          'cohere/north-mini-code:free',
          'dots-studio/dots-3-note-preview:free',
          'google/gemma-4-31b:free',
          'openrouter/free'
        ];
        [...new Set(orChain)].forEach(modId => {
          candidates.push({
            name: `OpenRouter (${modId})`,
            url: 'https://openrouter.ai/api/v1/chat/completions',
            headers: { 'Authorization': `Bearer ${keys.openrouter}`, 'Content-Type': 'application/json' },
            model: modId,
            vision: /vl|qwen3\.8|omni|dots|gemma-4|free$/i.test(modId)
          });
        });
      }

      if (keys.github && !wantDeepSeek) {
        candidates.push({
          name: 'GitHub Models (DeepSeek-R1)',
          url: 'https://models.inference.ai.azure.com/chat/completions',
          headers: { 'Authorization': `Bearer ${keys.github}`, 'Content-Type': 'application/json' },
          model: 'DeepSeek-R1',
          vision: false
        });
      }

      if (keys.groq) {
        candidates.push({
          name: 'Groq LPU (llama-3.3-70b-versatile)',
          url: 'https://api.groq.com/openai/v1/chat/completions',
          headers: { 'Authorization': `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
          model: 'llama-3.3-70b-versatile',
          vision: false
        });
      }

      const errors = [];
      for (const node of candidates) {
        try {
          const res = await this.callWithTimeout(node.url, {
            method: 'POST',
            headers: node.headers,
            body: JSON.stringify({
              model: node.model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: buildUserContent(node.vision) }
              ],
              max_tokens: maxTokens
            })
          }, 4800);

          if (res.ok) {
            const json = await res.json();
            const reply = json.choices?.[0]?.message?.content || 'OK 0,00€';
            const usedModel = json.model || node.model;
            this.lastActiveNode = usedModel;
            this.updateStatusBadge(`🟢 0,00€ Connesso (${usedModel})`, true);
            return { ok: true, model: usedModel, reply };
          } else {
            errors.push(`${node.name}(${res.status})`);
          }
        } catch (err) {
          errors.push(`${node.name}(timeout)`);
        }
      }

      return {
        ok: false,
        error: errors.length ? `Failover: ${errors.join(' | ')}` : 'Inserisci la chiave gratuita nel pannello AI Free'
      };
    },

    async generateCAD3DAndVideoScene(cadSpecs, floorplanDataUrl = null) {
      const sys = `Sei Qwen-4 3D Architect & Digital Twin Engine. Genera:
      1) Parametri JSON camera path 3D (eye, target, fov, keyframes) e materiali PBR.
      2) Uno snippet Python Blender (bpy) pronto all'uso per estrudere i muri/volumi 3D.
      3) Il prompt cinematografico 4K con timecode per XviDeo AI Studio.`;
      const prompt = `Ricostruisci la scena 3D e il piano di regia 4K da queste specifiche: ${JSON.stringify(cadSpecs)}`;
      return await this.complete(prompt, sys, { imageDataUrl: floorplanDataUrl, maxTokens: 450 });
    },

    async cloneUIFromScreenshot(imageDataUrl, customPrompt = '') {
      const sys = `Sei la squadra di 8 Agenti Screenshot/Video-to-Code guidata da Qwen 3.8 27B Vision & Nemotron 3.5 Super VL.
      Estrai: 1) Layout, spacing, font e palette colori HEX; 2) Codice HTML5/CSS3/JS pulito e pronto all'uso per clonare o migliorare il componente mostrato.`;
      const prompt = customPrompt || 'Analizza questo screenshot e genera la specifica UI (layout, colori, font) e il codice HTML/CSS/JS modulare.';
      return await this.complete(prompt, sys, { imageDataUrl, maxTokens: 600 });
    },

    async runVisualClonerFromModal() {
      this.saveKeysFromModal();
      const fileIn = document.getElementById('free-llm-visual-file');
      const promptIn = document.getElementById('free-llm-visual-prompt');
      const customPrompt = (promptIn?.value || '').trim();
      const file = fileIn?.files?.[0];
      let dataUrl = window._last2DImageDataUrl || null;
      if (file) {
        dataUrl = await new Promise((resolve) => {
          const fr = new FileReader();
          fr.onload = (e) => resolve(e.target.result);
          fr.readAsDataURL(file);
        });
      }
      this.setStatusBox('⏳ Cloner UI Vision (Qwen 3.8 27B / Nemotron 3.5 Super VL — 0,00€) in elaborazione...');
      const res = await this.cloneUIFromScreenshot(dataUrl, customPrompt);
      if (res.ok) {
        this.setStatusBox(`🧬 <b>[${res.model} — Visual Cloner 0,00€]</b>:\n${res.reply}`);
      } else {
        this.setStatusBox(`⚠️ ${res.error}`);
      }
      return res;
    }
  };

  window.FreeLLMRouterV285 = window.FreeLLMRouter;
  window.AntigravityInfiniteFreeRouterV28 = window.FreeLLMRouter;
  window.saveInstantOpenRouterKey = function () { window.FreeLLMRouter.saveKeysFromModal(); };
  window.runInstantOpenRouterTest = async function () {
    window.FreeLLMRouter.ensureModalDOM();
    window.FreeLLMRouter.saveKeysFromModal();
    window.FreeLLMRouter.setStatusBox('⏳ Test live Qwen 3.8/4 + DeepSeek + Nemotron 550B (0,00€) in corso...');
    await window.FreeLLMRouter.discoverOpenRouterFreeModels();
    const res = await window.FreeLLMRouter.complete('Rispondi in una riga confermando il nome del modello attivo e che operi a 0,00€.');
    if (res.ok) {
      window.FreeLLMRouter.setStatusBox(`✅ Connesso a <b>${res.model}</b> (0,00€): ${res.reply}`);
    } else {
      window.FreeLLMRouter.setStatusBox(`⚠️ ${res.error}`);
    }
  };

  window.openFreeLLMModal = function () {
    const modal = window.FreeLLMRouter.ensureModalDOM();
    modal.style.display = 'flex';
    const keys = window.FreeLLMRouter.getKeys();
    const setVal = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
    setVal('free-llm-key-openrouter', keys.openrouter);
    setVal('free-llm-key-groq', keys.groq);
    setVal('free-llm-key-cerebras', keys.cerebras);
    setVal('free-llm-key-mistral', keys.mistral);
    setVal('free-llm-key-github', keys.github);
    setVal('free-llm-key-ollama', keys.ollama);
    window.FreeLLMRouter.populateAllSelects();
    window.FreeLLMRouter.discoverOpenRouterFreeModels();
  };

  window.closeFreeLLMModal = function () {
    const modal = document.getElementById('free-llm-modal-backdrop');
    if (modal) modal.style.display = 'none';
  };

  window.toggleFreeLLMModal = window.openFreeLLMModal;
  window.openAiFreeModal = window.openFreeLLMModal;

  const boot = () => {
    window.FreeLLMRouter.bindTopBarButton();
    window.FreeLLMRouter.populateAllSelects();
    setTimeout(() => window.FreeLLMRouter.discoverOpenRouterFreeModels(), 600);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
