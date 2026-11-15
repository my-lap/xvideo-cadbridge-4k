// ==========================================================================
// VERCEL-LABS/SKILLS BRIDGE v28.9 — DYNAMIC SKILL INDEXER & IMPORTER
// Syncs reusable skills, system prompts & UI components from vercel-labs/skills
// ==========================================================================
(function () {
  const REPO_API = 'https://api.github.com/repos/vercel-labs/skills/contents';
  const CACHE_KEY = 'VERCEL_LABS_SKILLS_INDEX_V289';
  const INSTALLED_KEY = 'VERCEL_LABS_SKILLS_ACTIVE_V289';

  const VercelSkillsBridge = {
    version: '28.9',
    repo: 'vercel-labs/skills',
    skillsIndex: [],
    activeSkills: [],

    init() {
      try {
        this.skillsIndex = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
        this.activeSkills = JSON.parse(localStorage.getItem(INSTALLED_KEY) || '[]');
      } catch (e) {}
    },

    async syncFromVercelLabs(force = false) {
      if (!force && this.skillsIndex.length > 0) return this.skillsIndex;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      try {
        const res = await fetch(REPO_API, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items = await res.json();
        const mapped = (Array.isArray(items) ? items : [])
          .filter(it => it && (it.type === 'dir' || (it.name || '').endsWith('.md') || (it.name || '').endsWith('.json')))
          .map(it => ({
            name: it.name,
            type: it.type,
            path: it.path,
            url: it.html_url || `https://github.com/vercel-labs/skills/tree/main/${it.path}`
          }));
        if (mapped.length) {
          this.skillsIndex = mapped;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(mapped)); } catch (e) {}
        }
      } catch (e) {
        clearTimeout(timer);
        if (!this.skillsIndex.length) {
          this.skillsIndex = [
            { name: 'skills', type: 'dir', path: 'skills', url: 'https://github.com/vercel-labs/skills/tree/main/skills' },
            { name: 'find-skills', type: 'dir', path: 'skills/find-skills', url: 'https://github.com/vercel-labs/skills' }
          ];
        }
      }
      return this.skillsIndex;
    },

    toggleSkill(name) {
      if (!name) return;
      const idx = this.activeSkills.indexOf(name);
      if (idx >= 0) this.activeSkills.splice(idx, 1);
      else this.activeSkills.push(name);
      try { localStorage.setItem(INSTALLED_KEY, JSON.stringify(this.activeSkills)); } catch (e) {}
      this.renderListDOM();
      if (window.showToast) {
        window.showToast(`⚡ Skill vercel-labs/${name}: ${idx >= 0 ? 'rimossa' : 'collegata'}`, 'info');
      }
    },

    renderListDOM() {
      const box = document.getElementById('v289-vercel-skills-list');
      if (!box) return;
      if (!this.skillsIndex.length) {
        box.innerHTML = '<div style="color:#94a3b8;font-size:11px;">Nessuna voce indicizzata. Clicca Sincronizza.</div>';
        return;
      }
      box.innerHTML = this.skillsIndex.slice(0, 18).map(s => {
        const active = this.activeSkills.includes(s.name);
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 7px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:11px;color:#e2e8f0;">
              <b>${s.name}</b> <span style="color:#64748b;font-size:10px;">(${s.type})</span>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <a href="${s.url}" target="_blank" rel="noopener" style="font-size:10px;color:#38bdf8;text-decoration:none;">GitHub</a>
              <button type="button" onclick="window.VercelSkillsBridge && window.VercelSkillsBridge.toggleSkill('${s.name.replace(/'/g, '')}')" style="padding:2px 8px;font-size:10px;font-weight:800;border-radius:4px;cursor:pointer;background:${active ? 'rgba(0,242,161,0.2)' : 'rgba(56,189,248,0.16)'};border:1px solid ${active ? '#00f2a1' : '#38bdf8'};color:${active ? '#00f2a1' : '#7dd3fc'};">
                ${active ? '✓ Attiva' : '+ Importa'}
              </button>
            </div>
          </div>
        `;
      }).join('');
    },

    async openModal() {
      this.init();
      let modal = document.getElementById('v289-vercel-skills-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'v289-vercel-skills-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(4,8,18,0.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;';
        document.body.appendChild(modal);
      }
      modal.innerHTML = `
        <div style="width:100%;max-width:580px;max-height:86vh;overflow-y:auto;background:#0b1220;border:1.5px solid #38bdf8;border-radius:12px;padding:16px;color:#e2e8f0;font-family:var(--font-mono, monospace);box-shadow:0 20px 50px rgba(0,0,0,0.75);">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #1e293b;">
            <div style="font-size:14px;font-weight:900;color:#38bdf8;">⚡ BRIDGE VERCEL-LABS/SKILLS (${this.activeSkills.length} Attive)</div>
            <button type="button" onclick="document.getElementById('v289-vercel-skills-modal').style.display='none'" style="padding:4px 10px;border-radius:6px;background:rgba(244,63,94,0.18);border:1px solid #f43f5e;color:#fda4af;font-weight:800;cursor:pointer;">✕ Chiudi</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;font-size:11px;color:#94a3b8;">
            <span>Repository: <b>vercel-labs/skills</b> • Router AI Free collegato</span>
            <button type="button" onclick="window.VercelSkillsBridge && window.VercelSkillsBridge.syncFromVercelLabs(true).then(() => window.VercelSkillsBridge.renderListDOM())" style="padding:5px 10px;border-radius:6px;background:rgba(0,242,161,0.18);border:1px solid #00f2a1;color:#00f2a1;font-weight:800;cursor:pointer;">🔄 Sincronizza Live</button>
          </div>
          <div id="v289-vercel-skills-list" style="background:#070b14;border:1px solid #1e293b;border-radius:8px;max-height:320px;overflow-y:auto;padding:4px;">⏳ Indicizzazione vercel-labs/skills...</div>
        </div>
      `;
      modal.style.display = 'flex';
      await this.syncFromVercelLabs(false);
      this.renderListDOM();
    }
  };

  VercelSkillsBridge.init();
  window.VercelSkillsBridge = VercelSkillsBridge;
})();
