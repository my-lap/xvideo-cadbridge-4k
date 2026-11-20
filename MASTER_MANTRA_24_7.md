# MASTER MANTRA 24/7 — ARCHITETTURA OPERATIVA PERMANENTE

## 1. Vertice: 1 CEO Autonomo
- Coordina priorità, allocazione Zero-Waste Token, controllo qualità finale e rilascio continuo su `origin/main` senza regressioni.

## 2. Direzione Tecnica: 3 Sotto-Direttori CED
1. **CED 1 — Trading 60FPS Zero-Touch**: Presidia Grafico 1 (`js/chart.js`, `js/app.js`, `js/orderflow_engine.js` protetti) e la Sala Quantitativa Read-Only (`js/quant_addon_readonly.js`) con 5-Gate Filter, Free-Ride (`TP1→BE`), Rolling Backtest & Half-Kelly.
2. **CED 2 — CAD/ArchViz 3D 4K**: Presidia `xvideo-cadbridge-4k`, Architect's Prompt Vault, Camera Cube 3D e pipeline Render 4K.
3. **CED 3 — FreeLLMRouter v31.3-DUAL-SYNC & Nuovi Progetti**: Presidia il routing gratuito 0,00€ a 7 provider (`Qwen 3.8/4 27B Vision`, `DeepSeek-R1/V3`, `NVIDIA Nemotron 3 Ultra 550B`, `Nemotron 3.5 Super VL`, `openrouter/free`, Groq, Cerebras, Mistral, GitHub Models, Ollama `qwen4:27b`) e la sincronizzazione selettori top/bottom + Visual UI Cloner.

## 3. Squadra Operativa: 8 Agenti Specializzati (24/7)
1. **Multi-Input PNG/Figma/Video Ingestor**: Acquisisce screenshot, frame video e mockup UI in ingresso.
2. **Layout/Spacing/Font/Color Extractor**: Estrae griglie, spaziature, tipografia, contrasti e palette esatta.
3. **Screen-Recording Motion Cloner**: Replica transizioni, micro-interazioni e animazioni fluide a 60fps.
4. **Clean Prototype Compiler**: Compila HTML/CSS/JS pulito, modulare e senza dipendenze superflue.
5. **Live Canvas Iterate & Refine**: Rifinisce in tempo reale canvas HiDPI, slider, griglie e responsive 0°/90°.
6. **Qwen3.8/DeepSeek/Nemotron Free Vision Router**: Esegue audit visivi multimodali e code-gen a 0,00€.
7. **Find-Skills Scout**: Indicizza e aggiorna skill riutilizzabili (`vercel-labs/skills` + registro globale).
8. **Watchdog Zero-Regression & Git Deployer**: Verifica `git diff` sui file protetti, esegue `node --check` e deploya su `origin/main`.

## 4. Protocollo Permanente: Brag Launch Video Engine (20s)
- **Skill Globale**: `npx skills add https://github.com/latent-spaces/brag --skill brag -y` (`brag` / `letsbrag.app`).
- **Regola Operativa (1 CEO + 3 CED + 8 Agenti 24/24)**: per ogni progetto esistente o futuro, partendo da un singolo URL o repository, genera automaticamente il video lancio da ~20 secondi completo di:
  - Storyboard cinetico `hyperframes`
  - Musica sincronizzata al ritmo delle scene
  - Copy social pronto per il post tramite `brag` / `letsbrag.app` e `FreeLLMRouter v31.3-DUAL-SYNC`.

## 5. Protocollo Permanente: Hyper-Speed 31 Engine (`guide.infe.dev/app-veloce.html`)
- **CED 1 — Frontend 60FPS (1–10)**:
  1. Code Splitting & Lazy Loading moduli non critici (`defer` / dynamic import)
  2. Ottimizzazione immagini (`WebP`/`AVIF`, dimensioni esplicite, `loading="lazy"`)
  3. Virtualizzazione liste e tabelle ad alta densità
  4. Memoization & zero re-render superflui (Zero-Touch su Grafico 1)
  5. Debounce/Throttle su input, slider e resize
  6. Web Workers per calcoli pesanti (CAD/Quant/VPIN) fuori dal main thread
  7. GPU Compositing (`transform`/`opacity`) e `content-visibility: auto`
  8. Zero Layout Thrashing e sincronizzazione rigorosa su `requestAnimationFrame`
  9. Font ottimizzati (`font-display: swap`, preconnect)
  10. Service Worker strategico (Stale-While-Revalidate + cache-buster versionato)
- **CED 2 — Backend, DB, Cache & Job Queue (11–21)**:
  11. Indici DB mirati ed eliminazione query N+1
  12. Connection Pooling persistente
  13. Paginazione cursor-based (no `OFFSET` profondi)
  14. Projection stretta (solo colonne necessarie)
  15. Cache multi-livello (L1 memoria + L2 distribuita con TTL & SWR)
  16. Job Queue asincrona per export video/PDF/render pesanti
  17. Batching operazioni di lettura/scrittura
  18. Compressione risposte HTTP (`Brotli` / `Gzip`)
  19. Rate Limiting & Circuit Breaker anti-sovraccarico
  20. Read Replicas / partizionamento dati storici
  21. Viste materializzate / pre-aggregazione metriche
- **CED 3 — Network, AI Token-Streaming, OpenTelemetry & RUM (22–31)**:
  22. HTTP/2-HTTP/3 multiplexing & `Keep-Alive`
  23. CDN Edge Caching con `Cache-Control: immutable`
  24. `preconnect` / `dns-prefetch` verso endpoint critici
  25. **AI Token-Streaming SSE (`stream: true`)** su OpenRouter/Groq per TTFT istantaneo
  26. **Timeout rigorosi + Retry automatico + Failover multi-provider** su tutte le chiamate esterne
  27. Compressione payload JSON & Zero-Waste Token sui prompt
  28. OpenTelemetry distributed tracing end-to-end
  29. Real User Monitoring (RUM) Core Web Vitals (`LCP`, `INP`, `CLS`)
  30. Performance Budget continuo su bundle e FPS
  31. Watchdog Zero-Regression (`node --check` + `git diff` file protetti vuoto) prima di ogni deploy su `origin/main`.

## 5. Protocollo Permanente: Hyper-Speed 31 Engine (`guide.infe.dev/app-veloce.html`)
- **CED 1 — Frontend 60FPS (11 regole)**: Code-splitting & `defer`, CSS critico inline, immagini WebP/AVIF + `loading="lazy"`, zero layout shift (`CLS=0`), `contain: layout paint`, Canvas `{ alpha: false }`, `IntersectionObserver` fuori schermo, `requestAnimationFrame` throttling, virtualizzazione liste lunghe, fast-tap `touch-action: manipulation`, Web Workers per calcoli pesanti.
- **CED 2 — Backend / DB / Cache / Job Queue (10 regole)**: Indici mirati & zero N+1 query, paginazione keyset, pooling connessioni, cache multi-livello (RAM/Redis/Edge), SWR (`stale-while-revalidate`), compressione Brotli/Gzip, job queue asincrone per task pesanti, circuit breaker & backoff esponenziale, payload JSON minimali, pre-calcolo aggregati.
- **CED 3 — Network / AI Token-Streaming / OpenTelemetry / RUM (10 regole)**: HTTP/2-3 & keep-alive, CDN edge caching + SW cache-bust controllato, preconnect/dns-prefetch, timeout rigorosi (`AbortController`) + retry anti-429, **AI Token-Streaming (`stream: true` SSE)** su OpenRouter/Groq per TTFT < 400ms, failover multi-provider 0,00€, OpenTelemetry tracing, Real User Monitoring (LCP/INP/CLS), budget prestazioni CI, Zero-Regression Watchdog.
