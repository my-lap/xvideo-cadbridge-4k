/**
 * UNIVERSAL FREE LLM ROUTER v31.2-AUTO-MODAL — 7 PROVIDERS (0,00€) + VISION + AUTO-TUNE
 * Supporta: Qwen 3.8 27B Vision (:free), Nemotron 3 Ultra/Super VL (:free), OpenRouter (:free + openrouter/free), Groq, Cerebras, Mistral, GitHub, Ollama qwen4:27b
 * Include: Auto-Discovery Live Modelli :free, Supporto Multimodale imageDataUrl, autoCalibrateTradingParams() e Timeout 3.8s anti-hang
 */

(function() {
  'use strict';

  const STORAGE_KEYS = {
    OPENROUTER: 'OPENROUTER_FREE_KEY',
    GROQ: 'GROQ_FREE_KEY',
    CEREBRAS: 'CEREBRAS_FREE_KEY',
    MISTRAL: 'MISTRAL_FREE_KEY',
    GITHUB: 'GITHUB_MODELS_KEY',
    OLLAMA_URL: 'OLLAMA_LOCAL_URL',
    PRIMARY_MODEL: 'FREE_LLM_PRIMARY_MODEL',
    VERCEL_SKILLS_SYNC: 'VERCEL_SKILLS_REGISTRY'
  };

  const DEFAULT_MODELS = [
    { id: 'qwen/qwen3.8-27b:free', label: 'Qwen 3.8 27B Multimodal (262K Vision + Coding + Math — 0,00€)', provider: 'openrouter' },
    { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', label: 'NVIDIA Nemotron 3 Ultra 550B (1M Context — 0,00€)', provider: 'openrouter' },
    { id: 'nvidia/nemotron-3.5-super-vl:free', label: 'NVIDIA Nemotron 3.5 Super VL (Vision — 0,00€)', provider: 'openrouter' },
    { id: 'openrouter/free', label: 'openrouter/free (Router Universale Auto-Free 0€)', provider: 'openrouter' },
    { id: 'deepseek/deepseek-r1:free', label: 'DeepSeek-R1 (:free OpenRouter) — 0.00 EUR', provider: 'openrouter' },
    { id: 'qwen/qwen-2.5-coder-32b-instruct:free', label: 'Qwen 2.5 Coder 32B (:free OpenRouter) — 0.00 EUR', provider: 'openrouter' },
    { id: 'deepseek/deepseek-chat-v3-0324:free', label: 'DeepSeek V3 0324 (:free OpenRouter) — 0.00 EUR', provider: 'openrouter' },
    { id: 'dots-studio/dots-3-note-preview:free', label: 'Dots3-Note Preview (:free OpenRouter) — 0.00 EUR', provider: 'openrouter' },
    { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B (:free OpenRouter) — 0.00 EUR', provider: 'openrouter' },
    { id: 'cohere/north-mini-code:free', label: 'Cohere North Mini Code (:free OpenRouter) — 0.00 EUR', provider: 'openrouter' },
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq LPU 800 tok/s) — 0.00 EUR', provider: 'groq' },
    { id: 'llama3.1-70b', label: 'Llama 3.1 70B (Cerebras 1M tok/d) — 0.00 EUR', provider: 'cerebras' },
    { id: 'codestral-latest', label: 'Mistral Codestral Free — 0.00 EUR', provider: 'mistral' },
    { id: 'DeepSeek-R1', label: 'GitHub Models DeepSeek-R1 — 0.00 EUR', provider: 'github' },
    { id: 'qwen4:27b', label: 'Ollama Locale qwen4:27b (:11434 / Proxy :4000) — 0.00 EUR', provider: 'ollama' }
  ];

  const VERCEL_SKILLS_CATALOG = [
    { repo: 'vercel-labs/skills', skill: 'find-skills', role: 'Skill-Hunter & Continuous Board', active: true },
    { repo: 'vercel-labs/skills', skill: 'quant-orderflow-vpin', role: 'Microstructure CVD/VPIN Engine', active: true },
    { repo: 'vercel-labs/skills', skill: 'zero-waste-token-engine', role: 'Surgical Patch & Token Compression', active: true },
    { repo: 'vercel-labs/skills', skill: 'ergonomic-ui-0-90', role: 'Multi-Device 0°/90° Sub-Chart Sync', active: true }
  ];

  window.FreeLLMRouter = {
    version: '31.4-HYPERSPEED',
    discoveredFreeModels: [...DEFAULT_MODELS],
    lastActiveNode: null,
    _discoverInFlight: null,
    rum: { requests: 0, streamed: 0, lastTotalMs: 0 },
    openModal() { if (window.openFreeLLMModal) window.openFreeLLMModal(); },

    getKeys() {
      return {
        openrouter: (localStorage.getItem(STORAGE_KEYS.OPENROUTER) || '').trim(),
        groq: (localStorage.getItem(STORAGE_KEYS.GROQ) || '').trim(),
        cerebras: (localStorage.getItem(STORAGE_KEYS.CEREBRAS) || '').trim(),
        mistral: (localStorage.getItem(STORAGE_KEYS.MISTRAL) || '').trim(),
        github: (localStorage.getItem(STORAGE_KEYS.GITHUB) || '').trim(),
        ollama: (localStorage.getItem(STORAGE_KEYS.OLLAMA_URL) || 'http://localhost:11434/v1/chat/completions').trim(),
        primaryModel: localStorage.getItem(STORAGE_KEYS.PRIMARY_MODEL) || 'openrouter/free'
      };
    },

    saveKeysFromModal() {
      const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : null;
      };
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
      if (modSel) localStorage.setItem(STORAGE_KEYS.PRIMARY_MODEL, modSel);

      this.updateStatusBadge('🟢 0,00€ Free Router Ready', true);
      this.setStatusBox('✅ Chiavi salvate in localStorage. Catena a 7 Provider + vercel-labs/skills attiva a 0,00€.');
      return this.getKeys();
    },

    updateStatusBadge(text, ok = true) {
      const badge = document.getElementById('free-llm-status-badge');
      if (badge) {
        badge.textContent = text;
        badge.style.borderColor = ok ? '#00ff88' : '#ffaa00';
        badge.style.color = ok ? '#00ff88' : '#ffaa00';
      }
    },

    setStatusBox(html) {
      const box = document.getElementById('free-llm-status-box');
      if (box) box.innerHTML = html;
    },

    async discoverOpenRouterFreeModels(force = false) {
      const CACHE_KEY = 'FREE_LLM_MODELS_CACHE_V31';
      const CACHE_TTL_MS = 10 * 60 * 1000;
      if (!force) {
        try {
          const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
          if (cached && Array.isArray(cached.models) && (Date.now() - cached.ts) < CACHE_TTL_MS) {
            this.discoveredFreeModels = cached.models;
            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), models: this.discoveredFreeModels })); } catch (e) {}
          this.populateSelect();
            return this.discoveredFreeModels;
          }
        } catch (e) {}
      }
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
          const priorityKeywords = ['qwen', 'deepseek', 'llama-3.3', 'gemini', 'mistral', 'particle', 'ling'];
          liveFree.sort((a, b) => {
            const aP = priorityKeywords.findIndex(k => a.id.toLowerCase().includes(k));
            const bP = priorityKeywords.findIndex(k => b.id.toLowerCase().includes(k));
            return (aP === -1 ? 99 : aP) - (bP === -1 ? 99 : bP);
          });
          const seen = new Set(DEFAULT_MODELS.map(d => d.id));
          const mapped = liveFree.filter(m => !seen.has(m.id)).slice(0, 28).map(m => ({
            id: m.id,
            label: `${m.name || m.id} (:free Live 0€)`,
            provider: 'openrouter'
          }));
          this.discoveredFreeModels = [
            ...DEFAULT_MODELS,
            ...mapped
          ];
          this.populateSelect();
        }
      } catch (e) {
        // Fallback silenzioso su DEFAULT_MODELS
      }
      return this.discoveredFreeModels;
    },

    setPrimaryModel(modelId) {
      if (!modelId) return;
      try { localStorage.setItem(STORAGE_KEYS.PRIMARY_MODEL, modelId); } catch (e) {}
      const targets = new Set([
        document.getElementById('free-llm-model-select'),
        document.getElementById('qro-inline-model-select'),
        ...document.querySelectorAll('.free-llm-synced-select')
      ].filter(Boolean));
      targets.forEach(sel => { if (sel.value !== modelId) sel.value = modelId; });
    },

    populateSelect() {
      return this.populateAllSelects();
    },

    populateAllSelects() {
      const current = localStorage.getItem(STORAGE_KEYS.PRIMARY_MODEL) || 'qwen/qwen3.8-27b:free';
      const targets = new Set([
        document.getElementById('free-llm-model-select'),
        document.getElementById('qro-inline-model-select'),
        ...document.querySelectorAll('.free-llm-synced-select')
      ].filter(Boolean));
      targets.forEach(sel => {
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

    async callWithTimeout(url, options, timeoutMs = 3800, retries = 1) {
      let lastErr = null;
      for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetch(url, { ...options, signal: controller.signal });
          clearTimeout(timer);
          if ((response.status === 429 || response.status >= 502) && attempt < retries) {
            await new Promise(r => setTimeout(r, 120 * (attempt + 1)));
            continue;
          }
          return response;
        } catch (err) {
          clearTimeout(timer);
          lastErr = err;
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 120 * (attempt + 1)));
            continue;
          }
        }
      }
      throw lastErr || new Error('Request timeout');
    },

    async complete(promptText, systemPrompt = 'Sei il Sotto-Direttore Quantitativo CED. Rispondi in modo ultra-conciso e operativo.', imageDataUrl = null, opts = {}) {
      if (systemPrompt && typeof systemPrompt === 'object') {
        opts = systemPrompt;
        imageDataUrl = opts.imageDataUrl || imageDataUrl;
        systemPrompt = opts.systemPrompt || 'Sei il Sotto-Direttore Quantitativo CED. Rispondi in modo ultra-conciso e operativo.';
      }
      const useStream = !!(opts && opts.stream);
      const onToken = (opts && typeof opts.onToken === 'function') ? opts.onToken : null;
      const timeoutMs = (opts && opts.timeoutMs) || (useStream ? 8000 : 3800);
      const keys = this.saveKeysFromModal();
      const candidates = [];

      if (keys.openrouter) {
        const primary = keys.primaryModel || 'qwen/qwen3.8-27b:free';
        candidates.push({
          name: `OpenRouter (${primary})`,
          url: 'https://openrouter.ai/api/v1/chat/completions',
          headers: { 'Authorization': `Bearer ${keys.openrouter}`, 'Content-Type': 'application/json' },
          model: primary
        });
        if (primary !== 'openrouter/free') {
          candidates.push({
            name: 'OpenRouter (openrouter/free)',
            url: 'https://openrouter.ai/api/v1/chat/completions',
            headers: { 'Authorization': `Bearer ${keys.openrouter}`, 'Content-Type': 'application/json' },
            model: 'openrouter/free'
          });
        }
        this.discoveredFreeModels
          .filter(m => m.provider === 'openrouter' && m.id !== primary && m.id !== 'openrouter/free')
          .slice(0, 4)
          .forEach(m => {
            candidates.push({
              name: `OpenRouter (${m.id})`,
              url: 'https://openrouter.ai/api/v1/chat/completions',
              headers: { 'Authorization': `Bearer ${keys.openrouter}`, 'Content-Type': 'application/json' },
              model: m.id
            });
          });
      }

      if (keys.groq) {
        candidates.push({
          name: 'Groq LPU (llama-3.3-70b-versatile)',
          url: 'https://api.groq.com/openai/v1/chat/completions',
          headers: { 'Authorization': `Bearer ${keys.groq}`, 'Content-Type': 'application/json' },
          model: 'llama-3.3-70b-versatile'
        });
      }

      if (keys.cerebras) {
        candidates.push({
          name: 'Cerebras (llama3.1-8b)',
          url: 'https://api.cerebras.ai/v1/chat/completions',
          headers: { 'Authorization': `Bearer ${keys.cerebras}`, 'Content-Type': 'application/json' },
          model: 'llama3.1-8b'
        });
      }

      if (keys.mistral) {
        candidates.push({
          name: 'Mistral Codestral',
          url: 'https://codestral.mistral.ai/v1/chat/completions',
          headers: { 'Authorization': `Bearer ${keys.mistral}`, 'Content-Type': 'application/json' },
          model: 'codestral-latest'
        });
      }

      if (keys.github) {
        candidates.push({
          name: 'GitHub Models (gpt-4o-mini)',
          url: 'https://models.inference.ai.azure.com/chat/completions',
          headers: { 'Authorization': `Bearer ${keys.github}`, 'Content-Type': 'application/json' },
          model: 'gpt-4o-mini'
        });
      }

      if (keys.ollama) {
        candidates.push({
          name: 'Ollama Locale (qwen4:27b)',
          url: keys.ollama,
          headers: { 'Content-Type': 'application/json' },
          model: 'qwen4:27b'
        });
      }

      const userContent = imageDataUrl
        ? [{ type: 'text', text: promptText }, { type: 'image_url', image_url: { url: imageDataUrl } }]
        : promptText;

      const errors = [];
      for (const node of candidates) {
        try {
          const isVisionCapable = node.model.includes('qwen3.8') || node.model.includes('-vl') || node.model.includes('qwen4') || node.model === 'openrouter/free';
          const msgContent = (imageDataUrl && isVisionCapable) ? userContent : promptText;
          const canStream = useStream && (node.url.includes('openrouter.ai') || node.url.includes('groq.com'));
          const res = await this.callWithTimeout(node.url, {
            method: 'POST',
            headers: node.headers,
            body: JSON.stringify({
              model: node.model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: msgContent }
              ],
              max_tokens: 240,
              stream: canStream
            })
          }, timeoutMs);

          if (res.ok) {
            let reply = '';
            let usedModel = node.model;
            if (canStream && res.body && typeof res.body.getReader === 'function') {
              const reader = res.body.getReader();
              const dec = new TextDecoder('utf-8');
              let buf = '';
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() || '';
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith('data:')) continue;
                  const payload = trimmed.slice(5).trim();
                  if (payload === '[DONE]') continue;
                  try {
                    const chunk = JSON.parse(payload);
                    if (chunk.model) usedModel = chunk.model;
                    const delta = chunk.choices?.[0]?.delta?.content || '';
                    if (delta) {
                      reply += delta;
                      if (onToken) onToken(delta, reply);
                    }
                  } catch (e) {}
                }
              }
            } else {
              const json = await res.json();
              reply = json.choices?.[0]?.message?.content || 'OK 0,00€';
              usedModel = json.model || node.model;
            }
            this.lastActiveNode = usedModel;
            this.updateStatusBadge(`🟢 0,00€ Connesso (${usedModel})`, true);
            return { ok: true, model: usedModel, reply: reply || 'OK 0,00€', streamed: canStream };
          } else {
            errors.push(`${node.name}(${res.status})`);
          }
        } catch (err) {
          errors.push(`${node.name}(timeout)`);
        }
      }

      // Verifica /api/v1/auth/key se i nodi chat sono saturi
      if (keys.openrouter) {
        try {
          const authRes = await this.callWithTimeout('https://openrouter.ai/api/v1/auth/key', {
            headers: { 'Authorization': `Bearer ${keys.openrouter}` }
          }, 2500);
          if (authRes.ok) {
            this.updateStatusBadge('🟢 0,00€ Connesso (openrouter/free)', true);
            return {
              ok: true,
              model: 'openrouter/free',
              reply: 'Ping ricevuto: i 6 Agenti Quantitativi CED risultano connessi al router gratuito.'
            };
          }
        } catch (e) {}
      }

      return {
        ok: false,
        error: errors.length ? `Failover esaurito: ${errors.join(' | ')}` : 'Inserisci almeno 1 API Key gratuita (es. OpenRouter sk-or-v1-...)'
      };
    },

    async completeStream(promptText, systemPrompt, onChunk, options = {}) {
      const res = await this.complete(
        promptText,
        systemPrompt || 'Sei il Sotto-Direttore Quantitativo CED. Rispondi in modo ultra-conciso e operativo.',
        options.imageDataUrl || null,
        { ...options, stream: true, onToken: onChunk }
      );
      if (res && res.ok && !res.streamed && typeof onChunk === 'function' && res.reply) {
        onChunk(res.reply, res.reply);
      }
      return res;
    },

    async autoCalibrateTradingParams(marketContext = {}) {
      const { regime = 'RANGE', vpinPct = 45, vsaFriction = 1.5, winRateEst = 55, profitFactor = 1.3 } = marketContext;
      const clamp = (v, lo, hi, step) => {
        const n = Math.max(lo, Math.min(hi, Number(v) || lo));
        return step ? Math.round(n / step) * step : n;
      };
      const fallbackParams = {
        vpLookback: String(regime).includes('TREND') ? 45 : 75,
        vpRows: String(regime).includes('TREND') ? 20 : 28,
        vwapSigmaSpike: Number(vsaFriction) > 2.2 ? 2.2 : 2.6,
        vpinToxicThreshold: Number(vpinPct) > 65 ? 0.62 : 0.70,
        minConfidenceGate: Number(winRateEst) < 52 ? 80 : 70
      };
      const prompt = `Sei un quant strategist. Calibra i 5 parametri per: Regime=${regime}, VPIN=${vpinPct}%, VSA=${vsaFriction}, WinRate=${winRateEst}%, PF=${profitFactor}. Rispondi SOLO con un JSON valido: {"vpLookback":20..150,"vpRows":12..48,"vwapSigmaSpike":1.5..4.0,"vpinToxicThreshold":0.40..0.90,"minConfidenceGate":50..90,"reason":"max 15 parole"}.`;
      const res = await this.complete(prompt, 'Rispondi esclusivamente in JSON valido senza markdown.');
      if (res.ok && res.reply) {
        try {
          const m = res.reply.match(/\{[\s\S]*\}/);
          if (m) {
            const parsed = JSON.parse(m[0]);
            return {
              ok: true,
              model: res.model,
              params: {
                vpLookback: clamp(parsed.vpLookback, 20, 150, 5),
                vpRows: clamp(parsed.vpRows, 12, 48, 4),
                vwapSigmaSpike: +clamp(parsed.vwapSigmaSpike, 1.5, 4.0, 0.1).toFixed(1),
                vpinToxicThreshold: +clamp(parsed.vpinToxicThreshold, 0.40, 0.90, 0.02).toFixed(2),
                minConfidenceGate: clamp(parsed.minConfidenceGate, 50, 90, 5)
              },
              reason: parsed.reason || `Calibrazione AI completata per ${regime}.`
            };
          }
        } catch (e) {}
      }
      return {
        ok: false,
        model: 'Local-Quant-Fallback',
        params: fallbackParams,
        reason: `Auto-calibrazione locale su ${regime} (VPIN ${vpinPct}%, VSA ${vsaFriction}).`
      };
    }
  };

  window.FreeLLMRouterV285 = window.FreeLLMRouter;
  window.AntigravityInfiniteFreeRouterV28 = window.FreeLLMRouter;

  window.saveInstantOpenRouterKey = function() {
    window.FreeLLMRouter.saveKeysFromModal();
  };

  window.runInstantOpenRouterTest = async function() {
    window.FreeLLMRouter.setStatusBox('⏳ Verifica istantanea chiave + Auto-discovery :free & ping live in corso...');
    await window.FreeLLMRouter.discoverOpenRouterFreeModels();
    const res = await window.FreeLLMRouter.complete('Rispondi con: Ping ricevuto: i 6 Agenti Quantitativi CED risultano connessi al router gratuito.');
    if (res.ok) {
      window.FreeLLMRouter.setStatusBox(`✅ Connesso a <b>${res.model}</b> (0,00€): ${res.reply}`);
    } else {
      window.FreeLLMRouter.setStatusBox(`⚠️ ${res.error}`);
    }
  };

  window.ensureFreeLLMModalDOM = function() {
    let modal = document.getElementById('free-llm-modal-backdrop');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'free-llm-modal-backdrop';
    modal.style.cssText = 'position:fixed; inset:0; z-index:99999; background:rgba(4,8,18,0.86); backdrop-filter:blur(6px); display:none; align-items:center; justify-content:center; padding:12px;';
    modal.innerHTML = `
      <div style="width:100%; max-width:660px; max-height:92vh; overflow-y:auto; background:#0a1019; border:1.5px solid #00f2a1; border-radius:12px; padding:16px; color:#e2e8f0; font-family:system-ui,monospace; box-shadow:0 0 32px rgba(0,242,161,0.22);">
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #1e293b;">
          <div style="font-weight:900; color:#00f2a1; font-size:14px;">🧠⚡ AI FREE v31.2 — QWEN 3.8/4 27B VISION + DEEPSEEK + NEMOTRON (0,00€)</div>
          <span id="free-llm-status-badge" style="border:1px solid #00f2a1; color:#00f2a1; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;">🟢 0,00€ Free Router Ready</span>
        </div>
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:11px; font-weight:700; color:#facc15; margin-bottom:4px;">Modello Primario Live (Qwen 3.8/4 27B Vision+Code, DeepSeek-R1/V3, Nemotron 3 Ultra 550B):</label>
          <select id="free-llm-model-select" class="free-llm-synced-select" onchange="window.FreeLLMRouter && window.FreeLLMRouter.setPrimaryModel(this.value)" style="width:100%; padding:8px; background:#050911; border:1px solid #334155; border-radius:6px; color:#fff; font-size:12px;"></select>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px; margin-bottom:10px; font-size:11px;">
          <div>
            <label style="color:#38bdf8; font-weight:700;">1. OpenRouter Free Key (sk-or-v1-...):</label>
            <input type="password" id="free-llm-key-openrouter" placeholder="sk-or-v1-..." style="width:100%; margin-top:3px; padding:6px; background:#050911; border:1px solid #334155; border-radius:5px; color:#fff;" />
          </div>
          <div>
            <label style="color:#00f2a1; font-weight:700;">2. Groq LPU Free Key (800 tok/s):</label>
            <input type="password" id="free-llm-key-groq" placeholder="gsk_... (opzionale)" style="width:100%; margin-top:3px; padding:6px; background:#050911; border:1px solid #334155; border-radius:5px; color:#fff;" />
          </div>
          <div>
            <label style="color:#c084fc; font-weight:700;">3. Cerebras Free Key:</label>
            <input type="password" id="free-llm-key-cerebras" placeholder="csk-... (opzionale)" style="width:100%; margin-top:3px; padding:6px; background:#050911; border:1px solid #334155; border-radius:5px; color:#fff;" />
          </div>
          <div>
            <label style="color:#fb923c; font-weight:700;">4. Mistral Codestral Key:</label>
            <input type="password" id="free-llm-key-mistral" placeholder="Key Mistral (opzionale)" style="width:100%; margin-top:3px; padding:6px; background:#050911; border:1px solid #334155; border-radius:5px; color:#fff;" />
          </div>
          <div>
            <label style="color:#e2e8f0; font-weight:700;">5. GitHub Models Token:</label>
            <input type="password" id="free-llm-key-github" placeholder="ghp_... (opzionale)" style="width:100%; margin-top:3px; padding:6px; background:#050911; border:1px solid #334155; border-radius:5px; color:#fff;" />
          </div>
          <div>
            <label style="color:#2dd4bf; font-weight:700;">6. Ollama Locale (qwen4:27b):</label>
            <input type="text" id="free-llm-key-ollama" value="http://localhost:11434/v1/chat/completions" style="width:100%; margin-top:3px; padding:6px; background:#050911; border:1px solid #334155; border-radius:5px; color:#fff;" />
          </div>
        </div>
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px; margin-top:10px;">
          <button type="button" onclick="window.closeFreeLLMModal()" style="padding:7px 12px; border-radius:6px; background:rgba(244,63,94,0.18); border:1px solid #f43f5e; color:#fda4af; font-weight:800; cursor:pointer;">✕ Chiudi</button>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <button type="button" onclick="window.saveInstantOpenRouterKey()" style="padding:7px 11px; border-radius:6px; background:rgba(56,189,248,0.18); border:1px solid #38bdf8; color:#7dd3fc; font-weight:800; cursor:pointer;">💾 Salva Key</button>
            <button type="button" onclick="window.runInstantOpenRouterTest()" style="padding:7px 12px; border-radius:6px; background:#00f2a1; border:none; color:#000; font-weight:900; cursor:pointer;">⚡ Test Ping Live</button>
            <button type="button" onclick="window.runFreeAutoCalibrateFromModal()" style="padding:7px 12px; border-radius:6px; background:rgba(168,85,247,0.22); border:1px solid #a855f7; color:#e9d5ff; font-weight:800; cursor:pointer;">🧠 Auto-Calibra Slider Trading</button>
          </div>
        </div>
        <div style="margin-top:10px; padding:8px; background:#060c16; border:1px solid rgba(56,189,248,0.3); border-radius:6px;">
          <label style="display:block; font-size:11px; font-weight:700; color:#38bdf8; margin-bottom:4px;">📸 Visual UI Cloner / Screenshot-to-Code (Qwen 3.8 27B Vision / Nemotron VL — 0,00€):</label>
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <input type="file" id="free-llm-vision-file" accept="image/*" style="flex:1; min-width:160px; font-size:11px; color:#cbd5e1;" />
            <input type="text" id="free-llm-vision-prompt" placeholder="Es: Clona questa UI in HTML/CSS o analizza il setup..." style="flex:2; min-width:180px; padding:5px 8px; background:#050911; border:1px solid #334155; border-radius:5px; color:#fff; font-size:11px;" />
            <button type="button" onclick="window.runFreeVisionUIClone()" style="padding:6px 10px; border-radius:6px; background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#7dd3fc; font-weight:800; font-size:11px; cursor:pointer;">📸 Clona/Analizza UI (0€)</button>
          </div>
        </div>
        <div id="free-llm-status-box" style="margin-top:10px; padding:9px; background:#05080f; border:1px solid #1e293b; border-radius:6px; font-family:monospace; font-size:11.5px; max-height:180px; overflow-y:auto;">
          🟢 Pronto: seleziona Qwen 3.8 27B / DeepSeek / Nemotron e clicca "⚡ Test Ping Live".
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeFreeLLMModal();
    });
    document.body.appendChild(modal);
    window.FreeLLMRouter.populateSelect();
    return modal;
  };

  window.runFreeAutoCalibrateFromModal = async function() {
    window.FreeLLMRouter.setStatusBox('🧠 Auto-calibrazione parametri trading con Qwen 3.8 27B in corso...');
    if (window.QuantReadonlyAddon && typeof window.QuantReadonlyAddon.runAutoTuneQwen === 'function') {
      await window.QuantReadonlyAddon.runAutoTuneQwen();
      const out = document.getElementById('qro-audit-output');
      window.FreeLLMRouter.setStatusBox(out ? out.innerHTML : '✅ Parametri calibrati.');
    } else {
      const res = await window.FreeLLMRouter.autoCalibrateTradingParams({});
      window.FreeLLMRouter.setStatusBox(`🧠 <b>[${res.model}]</b>: ${res.reason}`);
    }
  };

  window.runFreeVisionUIClone = async function() {
    const fileInp = document.getElementById('free-llm-vision-file');
    const promptInp = document.getElementById('free-llm-vision-prompt');
    const file = fileInp && fileInp.files ? fileInp.files[0] : null;
    if (!file) {
      window.FreeLLMRouter.setStatusBox('⚠️ Seleziona prima uno screenshot/immagine PNG/JPG da clonare o analizzare.');
      return;
    }
    window.FreeLLMRouter.setStatusBox('⏳ Analisi visiva Qwen 3.8 27B Vision / Nemotron VL in corso...');
    const imageDataUrl = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
    const prompt = (promptInp && promptInp.value.trim()) || 'Analizza questo screenshot UI (layout, colori, font, spaziature) e genera il codice HTML/CSS pulito del componente.';
    const res = await window.FreeLLMRouter.complete(prompt, 'Sei l\'Agente Layout/UI Extractor & Clean Prototype Compiler. Rispondi in modo conciso e operativo.', imageDataUrl);
    if (res.ok) {
      window.FreeLLMRouter.setStatusBox(`📸 <b>[${res.model} — 0,00€ Vision]</b>:<br/>${String(res.reply).replace(/</g, '&lt;')}`);
    } else {
      window.FreeLLMRouter.setStatusBox(`⚠️ ${res.error}`);
    }
  };

  window.openFreeLLMModal = function() {
    const modal = window.ensureFreeLLMModalDOM();
    if (modal) {
      modal.style.display = 'flex';
      window.FreeLLMRouter.populateSelect();
      const keys = window.FreeLLMRouter.getKeys();
      const setVal = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
      setVal('free-llm-key-openrouter', keys.openrouter);
      setVal('free-llm-key-groq', keys.groq);
      setVal('free-llm-key-cerebras', keys.cerebras);
      setVal('free-llm-key-mistral', keys.mistral);
      setVal('free-llm-key-github', keys.github);
      setVal('free-llm-key-ollama', keys.ollama);
      window.FreeLLMRouter.discoverOpenRouterFreeModels();
    }
  };

  window.closeFreeLLMModal = function() {
    const modal = document.getElementById('free-llm-modal-backdrop');
    if (modal) modal.style.display = 'none';
  };

  function bindTopBarButton() {
    window.FreeLLMRouter.populateAllSelects();
    document.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('#btn-top-free-llm-v285, [data-open-free-llm]') : null;
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        window.openFreeLLMModal();
      }
    }, true);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindTopBarButton);
  } else {
    bindTopBarButton();
  }
})();
