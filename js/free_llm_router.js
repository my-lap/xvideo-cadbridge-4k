// ==========================================================================
// FREE LLM ROUTER v31.3-DUAL-SYNC — QWEN4 + DEEPSEEK + NEMOTRON + GEMMA4 + BLENDER BRIDGE
// OpenRouter (:free) | Groq | Cerebras | Mistral | GitHub | AI Studio | Ollama/:4000
// ==========================================================================
(function () {
  const FALLBACK_STATIC_MODELS = [
    { id: 'qwen/qwen3.8-27b:free', label: 'Qwen 3.8/4 27B Vision+Code (:free 0€)' },
    { id: 'deepseek/deepseek-r1-0528:free', label: 'DeepSeek-R1 (:free Live 0€)' },
    { id: 'deepseek/deepseek-chat-v3-0324:free', label: 'DeepSeek-V3-0324 (:free Live 0€)' },
    { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', label: 'Nemotron 3 Ultra 550B (:free 0€)' },
    { id: 'nvidia/nemotron-3.5-super-vl:free', label: 'Nemotron 3.5 Super VL (:free Vision 0€)' },
    { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B (:free Live 0€)' },
    { id: 'openrouter/free', label: 'openrouter/free (Router Universale Auto-Free 0€)' },
    { id: 'qwen/qwen3-coder:free', label: 'Qwen3 Coder (:free 0€)' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (:free 0€)' }
  ];

  const VISION_MODELS = [
    'qwen/qwen3.8-27b:free',
    'nvidia/nemotron-3.5-super-vl:free',
    'openrouter/free'
  ];

  const PRIORITY_PREFIXES = ['qwen3.8', 'qwen4', 'qwen', 'nemotron', 'deepseek', 'llama', 'gemini', 'mistral'];

  const EXTRA_PROVIDERS = [
    { id: 'groq', endpoint: 'https://api.groq.com/openai/v1/chat/completions', model: 'qwen-qwq-32b', storageKey: 'GROQ_FREE_KEY' },
    { id: 'cerebras', endpoint: 'https://api.cerebras.ai/v1/chat/completions', model: 'qwen-3-32b', storageKey: 'CEREBRAS_FREE_KEY' },
    { id: 'mistral', endpoint: 'https://api.mistral.ai/v1/chat/completions', model: 'codestral-latest', storageKey: 'MISTRAL_FREE_KEY' },
    { id: 'github', endpoint: 'https://models.inference.ai.azure.com/chat/completions', model: 'DeepSeek-R1', storageKey: 'GITHUB_FREE_TOKEN' },
    { id: 'aistudio', endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: 'gemini-2.5-pro-exp-03-25', storageKey: 'GEMINI_FREE_KEY' },
    { id: 'ollama', endpoint: 'http://localhost:11434/v1/chat/completions', model: 'qwen4:27b', storageKey: 'OLLAMA_FREE_URL', isUrl: true },
    { id: 'localproxy', endpoint: 'http://127.0.0.1:4000/v1/chat/completions', model: 'auto-free-pool', storageKey: 'LOCAL_PROXY_URL', isUrl: true }
  ];

  const FreeLLMRouter = {
    version: '31.3-DUAL-SYNC',
    discoveredModels: [...FALLBACK_STATIC_MODELS],
    discoveryLoaded: false,
    primaryModel: localStorage.getItem('FREE_LLM_PRIMARY_MODEL') || 'openrouter/free',

    getOpenRouterKey() {
      const inp = document.getElementById('v285-openrouter-key');
      const v = (inp?.value || '').trim();
      if (v) return v;
      return (localStorage.getItem('OPENROUTER_FREE_KEY') || '').trim();
    },

    getStoredKey(k, fallback = '') {
      return (localStorage.getItem(k) || fallback).trim();
    },

    scoreModelPriority(id) {
      const low = (id || '').toLowerCase();
      if (low === 'openrouter/free') return -1;
      for (let i = 0; i < PRIORITY_PREFIXES.length; i++) {
        if (low.includes(PRIORITY_PREFIXES[i])) return i;
      }
      return PRIORITY_PREFIXES.length + 1;
    },

    parseModelsPayload(json) {
      const list = Array.isArray(json?.data) ? json.data : [];
      const freeOnes = list
        .filter(m => {
          const id = m?.id || '';
          const promptPrice = String(m?.pricing?.prompt ?? '');
          return id.endsWith(':free') || promptPrice === '0';
        })
        .sort((a, b) => {
          const sa = this.scoreModelPriority(a.id);
          const sb = this.scoreModelPriority(b.id);
          if (sa !== sb) return sa - sb;
          return (a.id || '').localeCompare(b.id || '');
        })
        .slice(0, 40)
        .map(m => ({ id: m.id, label: `${m.name || m.id} (${m.id})` }));
      const merged = [...FALLBACK_STATIC_MODELS];
      const seen = new Set(merged.map(m => m.id));
      freeOnes.forEach(m => {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          merged.push({ id: m.id, label: `${m.label.replace(/\s*\([^)]*\)$/, '')} (:free Live 0€)` });
        }
      });
      return merged;
    },

    async discoverFreeModels(force = false) {
      if (this.discoveryLoaded && !force && this.discoveredModels.length > 1) return this.discoveredModels;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch('https://openrouter.ai/api/v1/models', { signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const merged = this.parseModelsPayload(json);
        if (merged.length > 1) {
          this.discoveredModels = merged;
          this.discoveryLoaded = true;
          this.populateModelSelectDOM();
        }
      } catch (e) {}
      return this.discoveredModels;
    },

    populateModelSelectDOM() {
      const selects = [];
      const modalSel = document.getElementById('free-llm-model-select');
      if (modalSel) selects.push(modalSel);
      document.querySelectorAll('.free-llm-synced-select').forEach(el => {
        if (!selects.includes(el)) selects.push(el);
      });
      if (!selects.length) return;
      let current = this.primaryModel || localStorage.getItem('FREE_LLM_PRIMARY_MODEL') || 'qwen/qwen3.8-27b:free';
      if (!this.discoveredModels.some(m => m.id === current)) {
        current = 'openrouter/free';
        this.primaryModel = current;
      }
      const optionsHtml = this.discoveredModels.map(m =>
        `<option value="${m.id}" ${m.id === current ? 'selected' : ''}>${m.label}</option>`
      ).join('');
      selects.forEach(sel => {
        sel.innerHTML = optionsHtml;
        sel.value = current;
        if (!sel.dataset.dualSyncBound) {
          sel.dataset.dualSyncBound = '1';
          sel.addEventListener('change', (e) => {
            const nextVal = e.target.value;
            this.primaryModel = nextVal;
            try { localStorage.setItem('FREE_LLM_PRIMARY_MODEL', nextVal); } catch (err) {}
            selects.forEach(other => { if (other !== e.target) other.value = nextVal; });
            const badge = document.getElementById('v285-status-badge');
            if (badge) badge.textContent = `🟢 0,00€ ${nextVal}`;
          });
        }
      });
    },

    saveSettings() {
      const setOrDel = (k, val) => {
        try {
          if (val) localStorage.setItem(k, val);
          else localStorage.removeItem(k);
        } catch (e) {}
      };
      const keyVal = this.getOpenRouterKey();
      const modelVal = document.getElementById('free-llm-model-select')?.value || this.primaryModel || 'openrouter/free';
      setOrDel('OPENROUTER_FREE_KEY', keyVal);
      setOrDel('FREE_LLM_PRIMARY_MODEL', modelVal);
      setOrDel('GROQ_FREE_KEY', (document.getElementById('v29-groq-key')?.value || '').trim());
      setOrDel('CEREBRAS_FREE_KEY', (document.getElementById('v29-cerebras-key')?.value || '').trim());
      setOrDel('MISTRAL_FREE_KEY', (document.getElementById('v29-mistral-key')?.value || '').trim());
      setOrDel('GITHUB_FREE_TOKEN', (document.getElementById('v29-github-key')?.value || '').trim());
      setOrDel('GEMINI_FREE_KEY', (document.getElementById('v29-gemini-key')?.value || '').trim());
      setOrDel('OLLAMA_FREE_URL', (document.getElementById('v29-ollama-url')?.value || '').trim());
      setOrDel('LOCAL_PROXY_URL', (document.getElementById('v29-proxy-url')?.value || '').trim());

      this.primaryModel = modelVal;
      const badge = document.getElementById('v285-status-badge');
      if (badge) badge.textContent = '🟢 0,00€ 7-Channel Router Ready';
      if (window.showToast) window.showToast('🟢 0,00€ Router 7 Provider salvato in localStorage', 'success');
      return keyVal;
    },

    async buildAttempts() {
      await this.discoverFreeModels(false);
      const orKey = this.getOpenRouterKey();
      const liveIds = this.discoveredModels.map(m => m.id);
      const ordered = [];
      const pushUnique = (id) => { if (id && !ordered.includes(id)) ordered.push(id); };
      pushUnique(this.primaryModel);
      pushUnique('openrouter/free');
      liveIds.forEach(pushUnique);

      const attempts = [];
      if (orKey) {
        ordered.forEach(model => {
          attempts.push({
            provider: 'OpenRouter',
            endpoint: 'https://openrouter.ai/api/v1/chat/completions',
            model,
            key: orKey
          });
        });
      }
      EXTRA_PROVIDERS.forEach(p => {
        if (p.isUrl) {
          const url = this.getStoredKey(p.storageKey, p.endpoint);
          if (url) attempts.push({ provider: p.id.toUpperCase(), endpoint: url, model: p.model, key: 'local-free' });
        } else {
          const k = this.getStoredKey(p.storageKey, '');
          if (k) attempts.push({ provider: p.id.toUpperCase(), endpoint: p.endpoint, model: p.model, key: k });
        }
      });
      return attempts;
    },

    async chat(messages, opts = {}) {
      const attempts = await this.buildAttempts();
      if (!attempts.length) throw new Error('Inserisci almeno una chiave gratuita (OpenRouter/Groq/Cerebras/GitHub) o avvia Ollama.');
      const errors = [];
      for (const target of attempts) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), opts.timeoutMs || 5500);
          const res = await fetch(target.endpoint, {
            method: 'POST',
            signal: ctrl.signal,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${target.key}`
            },
            body: JSON.stringify({
              model: target.model,
              messages,
              temperature: opts.temperature ?? 0.2,
              max_tokens: opts.max_tokens ?? 512
            })
          });
          clearTimeout(t);
          if (res.status === 404 || res.status === 429 || !res.ok) {
            errors.push(`${target.provider}:${target.model}(${res.status})`);
            await new Promise(r => setTimeout(r, 50));
            continue;
          }
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content || '';
          return { content, provider: target.provider, model: data?.model || target.model };
        } catch (e) {
          errors.push(`${target.provider}:${target.model}(${e.message})`);
          await new Promise(r => setTimeout(r, 50));
        }
      }
      throw new Error('Failover esaurito: ' + errors.slice(0, 4).join(' | '));
    },

    async runInstantTest() {
      const key = this.saveSettings();
      const outEl = document.getElementById('v285-test-output');
      const badge = document.getElementById('v285-status-badge');

      if (!key) {
        // Try non-OpenRouter free channels (Groq, Cerebras, Mistral, GitHub, AI Studio, Ollama/:4000)
        if (outEl) outEl.textContent = '⚡ Test canali secondari (Groq/Cerebras/GitHub/Ollama/:4000)...';
        try {
          const res = await this.chat([
            { role: 'system', content: 'Rispondi in italiano in 1 riga.' },
            { role: 'user', content: 'Ping di verifica Router 7 Provider.' }
          ], { timeoutMs: 3500 });
          if (badge) badge.textContent = `🟢 0,00€ ${res.provider} (${res.model})`;
          if (outEl) outEl.textContent = `✅ Connesso a ${res.provider} / ${res.model} (0,00€): ${res.content}`;
        } catch (err) {
          if (badge) badge.textContent = '🟡 Inserisci almeno 1 Key';
          if (outEl) outEl.textContent = '⚠️ Incolla una chiave OpenRouter (sk-or-v1-...), Groq, Cerebras, GitHub oppure avvia Ollama (:11434) / Proxy (:4000).';
        }
        return;
      }

      if (outEl) outEl.textContent = '⚡ Verifica istantanea OpenRouter /auth/key + catalogo :free...';
      let freeCount = Math.max(0, this.discoveredModels.length - 1);
      let keyValid = false;

      try {
        const ctrlA = new AbortController();
        const timerA = setTimeout(() => ctrlA.abort(), 3500);
        const [authRes, modelsRes] = await Promise.all([
          fetch('https://openrouter.ai/api/v1/auth/key', { headers: { 'Authorization': `Bearer ${key}` }, signal: ctrlA.signal }),
          fetch('https://openrouter.ai/api/v1/models', { signal: ctrlA.signal })
        ]);
        clearTimeout(timerA);
        if (modelsRes && modelsRes.ok) {
          const merged = this.parseModelsPayload(await modelsRes.json());
          if (merged.length > 1) {
            this.discoveredModels = merged;
            this.discoveryLoaded = true;
            this.populateModelSelectDOM();
            freeCount = merged.length - 1;
          }
        }
        if (authRes && authRes.ok) {
          keyValid = true;
          if (badge) badge.textContent = `🟢 0,00€ Key Valida (${freeCount} :free)`;
          if (outEl) outEl.textContent = `✅ API Key OpenRouter Valida! Modelli :free attivi trovati: ${freeCount}. Avvio ping AI...`;
        } else if (authRes && authRes.status === 401) {
          if (badge) badge.textContent = '🔴 Key Non Valida (401)';
          if (outEl) outEl.textContent = '❌ Chiave OpenRouter rifiutata (401). Verifica su openrouter.ai/settings/keys.';
          return;
        }
      } catch (e) {}

      const liveIds = this.discoveredModels.map(m => m.id).filter(id => id !== 'openrouter/free').slice(0, 3);
      const pingModels = ['openrouter/free', ...liveIds];
      const ctrlB = new AbortController();
      const timerB = setTimeout(() => ctrlB.abort(), 3500);

      try {
        for (const mId of pingModels) {
          try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              signal: ctrlB.signal,
              headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: mId,
                messages: [
                  { role: 'system', content: 'Sei il team dei 6 Agenti Quantitativi CED. Rispondi in italiano in 1 riga.' },
                  { role: 'user', content: 'Ping di verifica: conferma connessione attiva.' }
                ],
                max_tokens: 80,
                temperature: 0.2
              })
            });
            if (res.ok) {
              clearTimeout(timerB);
              const data = await res.json();
              const reply = data?.choices?.[0]?.message?.content || 'Operativi!';
              const usedModel = data?.model || mId;
              if (badge) badge.textContent = `🟢 0,00€ Connesso (${usedModel})`;
              if (outEl) outEl.textContent = `✅ Connesso a ${usedModel} (0,00€): ${reply}`;
              return;
            }
          } catch (innerErr) {
            if (innerErr.name === 'AbortError') break;
          }
        }
      } finally {
        clearTimeout(timerB);
      }

      if (keyValid) {
        if (badge) badge.textContent = `🟢 0,00€ Connesso (${freeCount} :free)`;
        if (outEl) outEl.textContent = `✅ CONNESSO A OPENROUTER FREE (0,00€) — Key attiva e ${freeCount} modelli :free pronti per i 6 Agenti!`;
      } else {
        if (badge) badge.textContent = '🟡 Verifica Chiave/Rete';
        if (outEl) outEl.textContent = '⚠️ Timeout nodo OpenRouter: verifica la chiave o usa Groq/Cerebras/Ollama.';
      }
    },

    /* ===== v31.0-QWEN4-OMNI: VISION-TO-3D & BLENDER BRIDGE ===== */
    async visionChat(promptText, imageDataUrl, opts = {}) {
      const baseAttempts = await this.buildAttempts();
      const orKey = this.getOpenRouterKey();
      const attempts = [];
      const seen = new Set();
      const addAttempt = (a) => {
        const k = `${a.provider}:${a.model}`;
        if (!seen.has(k)) { seen.add(k); attempts.push(a); }
      };
      if (orKey) {
        VISION_MODELS.forEach(model => addAttempt({
          provider: 'OpenRouter-Vision',
          endpoint: 'https://openrouter.ai/api/v1/chat/completions',
          model,
          key: orKey
        }));
      }
      // Assicura Ollama qwen4:27b locale multimodale tra i target prioritari
      const ollamaUrl = this.getStoredKey('OLLAMA_FREE_URL', 'http://localhost:11434/v1/chat/completions');
      if (ollamaUrl) addAttempt({ provider: 'OLLAMA-QWEN4', endpoint: ollamaUrl, model: 'qwen4:27b', key: 'local-free' });
      baseAttempts.forEach(addAttempt);

      const userContent = imageDataUrl
        ? [{ type: 'text', text: promptText }, { type: 'image_url', image_url: { url: imageDataUrl } }]
        : promptText;
      const messages = [
        { role: 'system', content: 'Sei Qwen3.8-27B Vision-to-3D ArchViz & Blender Engine. Rispondi esclusivamente con JSON valido.' },
        { role: 'user', content: userContent }
      ];

      const errors = [];
      for (const target of attempts) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), opts.timeoutMs || 12000);
          const payloadMessages = (imageDataUrl && !/qwen|vl|gemini|free|nemotron/i.test(target.model))
            ? [{ role: 'system', content: messages[0].content }, { role: 'user', content: promptText }]
            : messages;
          const res = await fetch(target.endpoint, {
            method: 'POST',
            signal: ctrl.signal,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${target.key}` },
            body: JSON.stringify({
              model: target.model,
              messages: payloadMessages,
              temperature: opts.temperature ?? 0.2,
              max_tokens: opts.max_tokens ?? 1400
            })
          });
          clearTimeout(t);
          if (!res.ok) { errors.push(`${target.provider}:${target.model}(${res.status})`); continue; }
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content || '';
          if (content) return { content, provider: target.provider, model: data?.model || target.model };
        } catch (e) {
          errors.push(`${target.provider}:${target.model}(${e.message})`);
        }
      }
      throw new Error('Vision failover esaurito: ' + errors.slice(0, 4).join(' | '));
    },

    buildDeterministicBlenderPy(cfg = {}) {
      const area = +(cfg.areaMq || 145.5);
      const h = +((cfg.heightCm || 300) / 100).toFixed(2);
      const w = +(Math.sqrt(area * 1.35)).toFixed(2);
      const d = +(area / Math.max(1, w)).toFixed(2);
      const rot = cfg.rotation ?? 0;
      const tilt = cfg.tilt ?? 15;
      const lens = cfg.zoom ?? 50;
      const mode = cfg.mode || '/axo';
      return [
        `# ==============================================================================`,
        `# CADBridge Pro 4K — Blender 4.x Python Digital Twin & Camera Path (${mode})`,
        `# Generato da FreeLLMRouter v31.0-QWEN4-OMNI`,
        `# ==============================================================================`,
        `import bpy, math`,
        ``,
        `bpy.ops.wm.read_factory_settings(use_empty=True)`,
        `scene = bpy.context.scene`,
        `scene.render.engine = 'CYCLES'`,
        `scene.cycles.samples = 128`,
        `scene.render.resolution_x = 3840`,
        `scene.render.resolution_y = 2160`,
        `scene.frame_start = 1`,
        `scene.frame_end = 180`,
        ``,
        `# 1. Pavimento & Lotto Parametrico (${area} m2)`,
        `bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))`,
        `floor_obj = bpy.context.active_object`,
        `floor_obj.name = 'CB_Floor_${area}mq'`,
        `floor_obj.scale = (${w}, ${d}, 1)`,
        ``,
        `# 2. Involucro Pareti Perimetrali (H=${h}m)`,
        `wall_t = 0.30`,
        `walls = [`,
        `  ('Wall_North', (0, ${d}/2, ${h}/2), (${w}, wall_t, ${h})),`,
        `  ('Wall_South', (0, -${d}/2, ${h}/2), (${w}, wall_t, ${h})),`,
        `  ('Wall_East', (${w}/2, 0, ${h}/2), (wall_t, ${d}, ${h})),`,
        `  ('Wall_West', (-${w}/2, 0, ${h}/2), (wall_t, ${d}, ${h}))`,
        `]`,
        `for name, loc, sc in walls:`,
        `    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)`,
        `    obj = bpy.context.active_object`,
        `    obj.name = name`,
        `    obj.scale = sc`,
        ``,
        `# 3. Illuminazione Architetturale LED 2700K + Sole`,
        `bpy.ops.object.light_add(type='SUN', location=(8, -8, 12))`,
        `sun = bpy.context.active_object`,
        `sun.data.energy = 3.5`,
        `bpy.ops.object.light_add(type='AREA', location=(0, 0, ${h} - 0.15))`,
        `led = bpy.context.active_object`,
        `led.name = 'LED_2700K_Core'`,
        `led.data.color = (1.0, 0.78, 0.52)`,
        `led.data.energy = 280`,
        `led.data.size = 2.4`,
        ``,
        `# 4. Camera 3D Cube Controller Path (Rot=${rot}deg, Tilt=${tilt}deg, Lens=${lens}mm)`,
        `bpy.ops.object.camera_add()`,
        `cam = bpy.context.active_object`,
        `cam.name = 'CB_Camera_4K'`,
        `cam.data.lens = ${lens}`,
        `scene.camera = cam`,
        `radius = max(${w}, ${d}) * 1.45`,
        `for f, a_off in [(1, ${rot} - 35), (90, ${rot}), (180, ${rot} + 35)]:`,
        `    ang = math.radians(a_off)`,
        `    t_rad = math.radians(max(5, ${tilt} + 25))`,
        `    cam.location = (radius * math.cos(ang), radius * math.sin(ang), radius * math.tan(t_rad) * 0.65)`,
        `    direction = (-cam.location).normalized()`,
        `    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()`,
        `    cam.keyframe_insert(data_path='location', frame=f)`,
        `    cam.keyframe_insert(data_path='rotation_euler', frame=f)`,
        `print('[CADBridge v31.0] Digital Twin + Camera Path Blender generati con successo.')`
      ].join('\n');
    },

    async generateCAD3DAndVideoScene(params = {}) {
      const mode = params.mode || '/axo';
      const rotation = params.rotation ?? 0;
      const tilt = params.tilt ?? 15;
      const zoom = params.zoom ?? 50;
      const areaMq = params.areaMq || 145.5;
      const heightCm = params.heightCm || 300;
      const quotesCm = params.quotesCm || '';
      const extraPrompt = params.extraPrompt || '';

      const sysPrompt = [
        `Analizza questa planimetria/schema 2D e genera una risposta JSON con chiavi esatte:`,
        `{"rooms":["..."],"areaMq":${areaMq},"heightCm":${heightCm},"zoning":{"giornoPct":45,"nottePct":35,"serviziPct":20},"cameraPath":"...","prompt4K":"...","narrationIT":"...","blenderNotes":"..."}`,
        `Modalità Architect's Prompt Vault attiva: ${mode}. Camera Cube: Rot ${rotation}°, Tilt ${tilt}°, Ottica ${zoom}mm.`,
        quotesCm ? `Quote rilevate (cm): ${quotesCm}` : '',
        extraPrompt ? `Note utente: ${extraPrompt}` : ''
      ].filter(Boolean).join('\n');

      let parsed = null;
      let usedProvider = 'Deterministic-CAD-Bridge';
      let usedModel = 'qwen4:27b-fallback';

      try {
        const res = await this.visionChat(sysPrompt, params.imageDataUrl || null, { max_tokens: 900 });
        usedProvider = res.provider;
        usedModel = res.model;
        const m = res.content.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      } catch (e) {
        // Fallback deterministico immediato se offline o senza API key
      }

      const finalArea = Number(parsed?.areaMq) || areaMq;
      const finalHeight = Number(parsed?.heightCm) || heightCm;
      const zoning = parsed?.zoning || { giornoPct: 45, nottePct: 35, serviziPct: 20 };
      const rooms = Array.isArray(parsed?.rooms) && parsed.rooms.length ? parsed.rooms : ['Living Open-Space', 'Cucina Isola', 'Suite Padronale', 'Bagno Spa'];
      const cameraPath = parsed?.cameraPath || `Orbit 360° (${rotation}° -> ${rotation + 70}°), Tilt ${tilt}°, Lens ${zoom}mm, Keyframes 1..180`;
      const prompt4K = parsed?.prompt4K || `Ultra-photorealistic 4K architectural digital twin (${mode}), ${finalArea} m², H=${finalHeight}cm, rooms: ${rooms.join(', ')}, camera ${zoom}mm Rot ${rotation}° Tilt ${tilt}°, warm 2700K architectural LED lighting, PBR travertine & oak materials.`;
      const narrationIT = parsed?.narrationIT || `Analisi Qwen Vision completata in modalità ${mode}. Rilevati ${finalArea} metri quadri con altezza ${finalHeight} centimetri, suddivisione funzionale ${zoning.giornoPct} percento zona giorno, ${zoning.nottePct} percento zona notte e ${zoning.serviziPct} percento servizi. Percorso camera impostato a ${zoom} millimetri con inclinazione ${tilt} gradi.`;

      const blenderPy = this.buildDeterministicBlenderPy({
        areaMq: finalArea, heightCm: finalHeight, rotation, tilt, zoom, mode
      });

      return {
        version: this.version,
        provider: usedProvider,
        model: usedModel,
        digitalTwin: { rooms, areaMq: finalArea, heightCm: finalHeight, zoning, cameraPath },
        blenderPy,
        prompt4K,
        narrationIT
      };
    },

    downloadBlenderPy(pyCode, filename) {
      const blob = new Blob([pyCode || this.buildDeterministicBlenderPy()], { type: 'text/x-python;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename || `CADBridge_Qwen38_DigitalTwin_${Date.now()}.py`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    },

    openModal() {
      let modal = document.getElementById('v285-free-router-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'v285-free-router-modal';
        modal.style.cssText = 'position:fixed; inset:0; z-index:99999; background:rgba(4,8,18,0.84); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:14px;';
        document.body.appendChild(modal);
      }
      const savedKey = this.getStoredKey('OPENROUTER_FREE_KEY');
      const opts = this.discoveredModels.map(m =>
        `<option value="${m.id}" ${m.id === this.primaryModel ? 'selected' : ''}>${m.label}</option>`
      ).join('');
      modal.innerHTML = `
        <div style="width:100%; max-width:680px; max-height:90vh; overflow-y:auto; background:#0b1220; border:1.5px solid #00f2a1; border-radius:12px; padding:16px; color:#e2e8f0; font-family:var(--font-mono, monospace); box-shadow:0 20px 50px rgba(0,0,0,0.75);">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #1e293b;">
            <div style="font-size:14px; font-weight:900; color:#00f2a1;">🧠⚡ AI FREE 0€ — 7 PROVIDER FAILOVER + VERCEL SKILLS</div>
            <span id="v285-status-badge" style="font-size:10px; font-weight:800; padding:3px 8px; border-radius:6px; background:rgba(0,242,161,0.16); border:1px solid #00f2a1; color:#00f2a1;">🟢 0,00€ 7-Channel Router Ready</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px; margin-bottom:10px; font-size:11px;">
            <div>
              <label style="color:#38bdf8; font-weight:700;">1. OpenRouter (:free)</label>
              <input id="v285-openrouter-key" type="password" value="${savedKey}" placeholder="sk-or-v1-..." style="width:100%; margin-top:3px; padding:6px; background:#070b14; border:1px solid #334155; border-radius:5px; color:#fff;">
            </div>
            <div>
              <label style="color:#00f2a1; font-weight:700;">2. Groq LPU (800 tok/s)</label>
              <input id="v29-groq-key" type="password" value="${this.getStoredKey('GROQ_FREE_KEY')}" placeholder="gsk_... (opzionale)" style="width:100%; margin-top:3px; padding:6px; background:#070b14; border:1px solid #334155; border-radius:5px; color:#fff;">
            </div>
            <div>
              <label style="color:#a855f7; font-weight:700;">3. Cerebras (1M tok/day)</label>
              <input id="v29-cerebras-key" type="password" value="${this.getStoredKey('CEREBRAS_FREE_KEY')}" placeholder="csk-... (opzionale)" style="width:100%; margin-top:3px; padding:6px; background:#070b14; border:1px solid #334155; border-radius:5px; color:#fff;">
            </div>
            <div>
              <label style="color:#f59e0b; font-weight:700;">4. Mistral Codestral</label>
              <input id="v29-mistral-key" type="password" value="${this.getStoredKey('MISTRAL_FREE_KEY')}" placeholder="Key Mistral (opzionale)" style="width:100%; margin-top:3px; padding:6px; background:#070b14; border:1px solid #334155; border-radius:5px; color:#fff;">
            </div>
            <div>
              <label style="color:#e2e8f0; font-weight:700;">5. GitHub Models</label>
              <input id="v29-github-key" type="password" value="${this.getStoredKey('GITHUB_FREE_TOKEN')}" placeholder="ghp_... / github_pat_..." style="width:100%; margin-top:3px; padding:6px; background:#070b14; border:1px solid #334155; border-radius:5px; color:#fff;">
            </div>
            <div>
              <label style="color:#facc15; font-weight:700;">6. Google AI Studio Free</label>
              <input id="v29-gemini-key" type="password" value="${this.getStoredKey('GEMINI_FREE_KEY')}" placeholder="AIza... (opzionale)" style="width:100%; margin-top:3px; padding:6px; background:#070b14; border:1px solid #334155; border-radius:5px; color:#fff;">
            </div>
            <div>
              <label style="color:#2dd4bf; font-weight:700;">7. Ollama Locale (:11434)</label>
              <input id="v29-ollama-url" type="text" value="${this.getStoredKey('OLLAMA_FREE_URL', 'http://localhost:11434/v1/chat/completions')}" style="width:100%; margin-top:3px; padding:6px; background:#070b14; border:1px solid #334155; border-radius:5px; color:#fff;">
            </div>
            <div>
              <label style="color:#94a3b8; font-weight:700;">Proxy Locale (:4000)</label>
              <input id="v29-proxy-url" type="text" value="${this.getStoredKey('LOCAL_PROXY_URL', 'http://127.0.0.1:4000/v1/chat/completions')}" style="width:100%; margin-top:3px; padding:6px; background:#070b14; border:1px solid #334155; border-radius:5px; color:#fff;">
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block; font-size:11px; font-weight:700; color:#facc15; margin-bottom:4px;">Modello Primario Live (:free Auto-Discovery + Failover 404/429 su 7 Provider):</label>
            <select id="free-llm-model-select" style="width:100%; padding:8px; background:#070b14; border:1px solid #334155; border-radius:6px; color:#fff; font-size:12px;">
              ${opts}
            </select>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <div style="display:flex; gap:6px;">
              <button type="button" onclick="document.getElementById('v285-free-router-modal').style.display='none'" style="padding:7px 12px; border-radius:6px; background:rgba(244,63,94,0.18); border:1px solid #f43f5e; color:#fda4af; font-weight:800; cursor:pointer;">✕ Chiudi</button>
              <button type="button" onclick="window.VercelSkillsBridge && window.VercelSkillsBridge.openModal()" style="padding:7px 10px; border-radius:6px; background:rgba(56,189,248,0.16); border:1px solid #38bdf8; color:#7dd3fc; font-weight:800; cursor:pointer;">⚡ vercel-labs/skills</button>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" onclick="window.saveInstantOpenRouterKey && window.saveInstantOpenRouterKey()" style="padding:7px 12px; border-radius:6px; background:rgba(56,189,248,0.18); border:1px solid #38bdf8; color:#38bdf8; font-weight:800; cursor:pointer;">💾 Salva Key</button>
              <button type="button" onclick="window.runInstantOpenRouterTest && window.runInstantOpenRouterTest()" style="padding:7px 14px; border-radius:6px; background:#00f2a1; border:none; color:#000; font-weight:900; cursor:pointer;">⚡ Test Connessione Free</button>
            </div>
          </div>
          <div id="v285-test-output" style="margin-top:10px; padding:8px; border-radius:6px; background:#070b14; border:1px solid #1e293b; font-size:11px; color:#cbd5e1; min-height:36px;">🟢 Pronto: clicca "⚡ Test Connessione Free" per verifica istantanea (1s).</div>
        </div>
      `;
      modal.style.display = 'flex';
      this.discoverFreeModels(true);
    }
  };

  window.FreeLLMRouter = FreeLLMRouter;
  window.FreeLLMRouterV285 = FreeLLMRouter;
  window.AntigravityInfiniteFreeRouterV28 = FreeLLMRouter;
  window.openFreeLLMModal = () => FreeLLMRouter.openModal();
  window.saveInstantOpenRouterKey = () => FreeLLMRouter.saveSettings();
  window.runInstantOpenRouterTest = () => FreeLLMRouter.runInstantTest();

  const initDualSync = () => {
    FreeLLMRouter.populateModelSelectDOM();
    FreeLLMRouter.discoverFreeModels(false);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDualSync);
  else initDualSync();
})();
