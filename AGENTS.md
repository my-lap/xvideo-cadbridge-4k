# MANTRA PERMANENTE GIT AUTO-SYNC

Regola permanente attiva su ogni sessione (PC, Cloud, iPhone):

1. **Pull prima di iniziare:** esegui sempre `git pull origin main` prima di modificare qualsiasi file.
2. **Commit e push automatico su `main` a fine task:** al termine di ogni modifica completata, esegui `git add`, `git commit` con messaggio chiaro e `git push origin main`.
3. **Mai caricare `.env` o `node_modules`:** controlla sempre `git status` prima del commit e assicurati che `.env`, segreti e `node_modules/` non vengano mai tracciati né pushati su GitHub.

