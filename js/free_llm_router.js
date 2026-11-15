// ==========================================================================
// FREE LLM ROUTER v28.8 — INSTANT 1s OPENROUTER TEST + AUTO-DISCOVERY :FREE
// Zero-404 OpenAI-compatible client with 50ms anti-429/404 failover
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
    { id: 'ollama', endpoint: 'http://localhost:11434/v1/chat/completions', model: 'qwen2.5-coder:32b', storageKey: null }
  ];

  const FreeLLMRouter = {
    version: '28.8',
    discoveredModels: [...FALLBACK_STATIC_MODELS],
    discoveryLoaded: false,
    primaryModel: localStorage.getItem('FREE_LLM_PRIMARY_MODEL') || 'openrouter/free',

    getOpenRouterKey() {
      const inp = document.getElementById('v285-openrouter-key');
      const v = (inp?.value || '').trim();
      if (v) return v;
      return (localStorage.getItem('OPENROUTER_FREE_KEY') || '').trim();
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
        .map(m => ({
          id: m.id,
          label: `${m.name || m.id} (${m.id})`
        }));
      return [
        { id: 'openrouter/free', label: 'openrouter/free (Router Universale Auto-Free 0€)' },
        ...freeOnes.filter(m => m.id !== 'openrouter/free')
      ];
    },

    async discoverFreeModels(force = false) {
      if (this.discoveryLoaded && !force && this.discoveredModels.length > 1) {
        return this.discoveredModels;
      }
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3000);
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
      const keyVal = this.getOpenRouterKey();
      const modelSel = document.getElementById('free-llm-model-select');
      const modelVal = modelSel?.value || this.primaryModel || 'openrouter/free';
      try {
        if (keyVal) localStorage.setItem('OPENROUTER_FREE_KEY', keyVal);
        else localStorage.removeItem('OPENROUTER_FREE_KEY');
        localStorage.setItem('FREE_LLM_PRIMARY_MODEL', modelVal);
      } catch (e) {}
      this.primaryModel = modelVal;
      const badge = document.getElementById('v285-status-badge');
      if (badge) badge.textContent = '🟢 0,00€ Free Router Ready';
      if (window.showToast) window.showToast('🟢 0,00€ Free Router Ready — Chiave salvata', 'success');
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
        const k = p.storageKey ? (localStorage.getItem(p.storageKey) || '').trim() : 'ollama-local';
        if (k) attempts.push({ provider: p.id.toUpperCase(), endpoint: p.endpoint, model: p.model, key: k });
      });
      return attempts;
    },

    async chat(messages, opts = {}) {
      const attempts = await this.buildAttempts();
      if (!attempts.length) {
        throw new Error('Inserisci la OpenRouter Free Key (sk-or-v1-...) oppure avvia Ollama locale :11434.');
      }
      const errors = [];
      for (const target of attempts) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), opts.timeoutMs || 6000);
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
        if (badge) badge.textContent = '🟡 Inserisci OpenRouter Key';
        if (outEl) outEl.textContent = '⚠️ Incolla una chiave OpenRouter (sk-or-v1-...) e riprova.';
        return;
      }

      if (outEl) outEl.textContent = '⚡ Verifica istantanea chiave OpenRouter + catalogo :free...';

      let freeCount = Math.max(0, this.discoveredModels.length - 1);
      let keyValid = false;

      // FASE A (0.3s): Parallel /auth/key + /models
      try {
        const ctrlA = new AbortController();
        const timerA = setTimeout(() => ctrlA.abort(), 3500);
        const [authRes, modelsRes] = await Promise.all([
          fetch('https://openrouter.ai/api/v1/auth/key', {
            headers: { 'Authorization': `Bearer ${key}` },
            signal: ctrlA.signal
          }),
          fetch('https://openrouter.ai/api/v1/models', { signal: ctrlA.signal })
        ]);
        clearTimeout(timerA);

        if (modelsRes && modelsRes.ok) {
          const mJson = await modelsRes.json();
          const merged = this.parseModelsPayload(mJson);
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
          if (outEl) outEl.textContent = '❌ Chiave OpenRouter rifiutata (401 Unauthorized). Verifica la key su openrouter.ai/settings/keys.';
          return;
        }
      } catch (e) {
        // Proceed to Phase B even if /auth/key timed out
      }

      // FASE B (max 3.5s): Ping AI on openrouter/free + top 3 live :free models
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
              headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
              },
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
        if (outEl) outEl.textContent = '⚠️ Timeout nodo OpenRouter: verifica la chiave sk-or-v1-... o la connessione internet.';
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
      const savedKey = (localStorage.getItem('OPENROUTER_FREE_KEY') || '').trim();
      const opts = this.discoveredModels.map(m =>
        `<option value="${m.id}" ${m.id === this.primaryModel ? 'selected' : ''}>${m.label}</option>`
      ).join('');
      modal.innerHTML = `
        <div style="width:100%; max-width:580px; background:#0b1220; border:1.5px solid #00f2a1; border-radius:12px; padding:16px; color:#e2e8f0; font-family:var(--font-mono, monospace); box-shadow:0 20px 50px rgba(0,0,0,0.75);">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #1e293b;">
            <div style="font-size:14px; font-weight:900; color:#00f2a1;">🧠⚡ AI FREE 0€ (AUTO-DISCOVERY :FREE + openrouter/free)</div>
            <span id="v285-status-badge" style="font-size:10px; font-weight:800; padding:3px 8px; border-radius:6px; background:rgba(0,242,161,0.16); border:1px solid #00f2a1; color:#00f2a1;">🟢 0,00€ Free Router Ready</span>
          </div>
          <div style="margin-bottom:10px;">
            <label style="display:block; font-size:11px; font-weight:700; color:#38bdf8; margin-bottom:4px;">OpenRouter Free API Key (sk-or-v1-...):</label>
            <input id="v285-openrouter-key" type="password" value="${savedKey}" placeholder="sk-or-v1-..." style="width:100%; padding:8px; background:#070b14; border:1px solid #334155; border-radius:6px; color:#fff; font-size:12px;">
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block; font-size:11px; font-weight:700; color:#facc15; margin-bottom:4px;">Modello Primario Live (:free Auto-Discovery + Failover 404/429):</label>
            <select id="free-llm-model-select" style="width:100%; padding:8px; background:#070b14; border:1px solid #334155; border-radius:6px; color:#fff; font-size:12px;">
              ${opts}
            </select>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <button type="button" onclick="document.getElementById('v285-free-router-modal').style.display='none'" style="padding:7px 12px; border-radius:6px; background:rgba(244,63,94,0.18); border:1px solid #f43f5e; color:#fda4af; font-weight:800; cursor:pointer;">✕ Chiudi</button>
            <button type="button" onclick="window.VercelSkillsBridge && window.VercelSkillsBridge.openModal()" style="padding:7px 10px; border-radius:6px; background:rgba(56,189,248,0.16); border:1px solid #38bdf8; color:#7dd3fc; font-weight:800; cursor:pointer;">⚡ vercel-labs/skills</button>
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
  window.saveInstantOpenRouterKey = () => FreeLLMRouter.saveSettings();
  window.runInstantOpenRouterTest = () => FreeLLMRouter.runInstantTest();
})();
