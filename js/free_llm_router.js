// ==========================================================================
// FREE LLM ROUTER v29.0 — 7-CHANNEL ZERO-COST FAILOVER + VERCEL SKILLS BRIDGE
// OpenRouter (:free) | Groq | Cerebras | Mistral | GitHub | AI Studio | Ollama/:4000
// ==========================================================================
(function () {
  const FALLBACK_STATIC_MODELS = [
    { id: 'openrouter/free', label: 'openrouter/free (Router Universale Auto-Free 0€)' },
    { id: 'qwen/qwen3-coder:free', label: 'Qwen3 Coder :free' },
    { id: 'deepseek/deepseek-r1-0528:free', label: 'DeepSeek R1 :free' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B :free' }
  ];

  const PRIORITY_PREFIXES = ['qwen', 'deepseek', 'llama', 'gemini', 'mistral'];

  const EXTRA_PROVIDERS = [
    { id: 'groq', endpoint: 'https://api.groq.com/openai/v1/chat/completions', model: 'qwen-qwq-32b', storageKey: 'GROQ_FREE_KEY' },
    { id: 'cerebras', endpoint: 'https://api.cerebras.ai/v1/chat/completions', model: 'qwen-3-32b', storageKey: 'CEREBRAS_FREE_KEY' },
    { id: 'mistral', endpoint: 'https://api.mistral.ai/v1/chat/completions', model: 'codestral-latest', storageKey: 'MISTRAL_FREE_KEY' },
    { id: 'github', endpoint: 'https://models.inference.ai.azure.com/chat/completions', model: 'DeepSeek-R1', storageKey: 'GITHUB_FREE_TOKEN' },
    { id: 'aistudio', endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: 'gemini-2.5-pro-exp-03-25', storageKey: 'GEMINI_FREE_KEY' },
    { id: 'ollama', endpoint: 'http://localhost:11434/v1/chat/completions', model: 'qwen2.5-coder:32b', storageKey: 'OLLAMA_FREE_URL', isUrl: true },
    { id: 'localproxy', endpoint: 'http://127.0.0.1:4000/v1/chat/completions', model: 'auto-free-pool', storageKey: 'LOCAL_PROXY_URL', isUrl: true }
  ];

  const FreeLLMRouter = {
    version: '29.0',
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
      return [
        { id: 'openrouter/free', label: 'openrouter/free (Router Universale Auto-Free 0€)' },
        ...freeOnes.filter(m => m.id !== 'openrouter/free')
      ];
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
      const sel = document.getElementById('free-llm-model-select');
      if (!sel) return;
      const current = this.primaryModel || 'openrouter/free';
      sel.innerHTML = this.discoveredModels.map(m =>
        `<option value="${m.id}" ${m.id === current ? 'selected' : ''}>${m.label}</option>`
      ).join('');
      if (!this.discoveredModels.some(m => m.id === current)) {
        sel.value = 'openrouter/free';
        this.primaryModel = 'openrouter/free';
      }
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

  window.FreeLLMRouterV285 = FreeLLMRouter;
  window.AntigravityInfiniteFreeRouterV28 = FreeLLMRouter;
  window.saveInstantOpenRouterKey = () => FreeLLMRouter.saveSettings();
  window.runInstantOpenRouterTest = () => FreeLLMRouter.runInstantTest();
})();
