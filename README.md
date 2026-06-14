# AgentHub

Orchestrateur d'assistants IA métier pour TPE / PME / auto-entrepreneurs — application desktop autonome (Tauri + React + Rust).

## 🎯 Vision

AgentHub déploie une **équipe d'agents IA spécialisés** (Manager, Commercial, Marketing, Juridique, Tech & Data), pré-configurée pour le métier du client, et **facile à paramétrer** sans toucher au code. Un orchestrateur route les demandes en langage naturel vers le bon assistant.

**Local-first / BYOK :** tout tourne sur le poste du client, avec sa propre clé OpenCode Go. Aucune donnée ne quitte la machine (hors appels LLM), aucun serveur à héberger.

## 📦 Stack technique

| Couche | Technologie |
|--------|-------------|
| Desktop | Tauri 2 + React 19 + Tailwind v4 |
| Cœur métier | Rust (agents, orchestrateur, scheduler, LLM) |
| Persistance | SQLite local (rusqlite) + secret store hors webview |
| LLM | OpenCode Go (BYOK) — API OpenAI-compatible, défaut `deepseek-v4-flash` |

> ⚠️ Plus aucune dépendance Python : l'ancien gateway FastAPI + Hermes a été remplacé par un cœur Rust intégré au binaire.

## 🏗️ Architecture

```
┌──────────────── Tauri App (1 binaire) ────────────────┐
│  React UI  ──invoke()──►  Rust Core                    │
│  Wizard / Hub / Agent /   ├─ orchestrator (routage)    │
│  AgentConfig / Settings   ├─ agents + packs métier     │
│                           ├─ llm (OpenCode Go, BYOK)   │
│                           ├─ scheduler (crons)         │
│                           ├─ db (SQLite)               │
│                           └─ secret store (clé API)    │
└────────────────────────────────────────────────────────┘
         │ HTTPS BYOK
         ▼  opencode.ai/zen/go/v1/chat/completions
```

## 📱 Pages

- **Wizard** — onboarding : métier → aperçu du pack → clé API.
- **Hub** — dashboard : stats réelles, équipe d'agents, barre « Demander à l'équipe » (orchestrateur).
- **Agent** — chat avec un assistant (réponses réelles, historique persistant).
- **AgentConfig** — configuration guidée : nom, prompt, outils, tâches planifiées, agents custom.
- **Settings** — modèle IA, clé API, usage, compte.

## 🧩 Packs métier

Salon/Coiffure · Avocat · Garage · Restaurant · Médical · Auto-entrepreneur (générique).
Chaque pack instancie les 5 agents du noyau, spécialisés par contexte, outils et déclencheurs.

## 🚀 Développement

```bash
npm install
npm run tauri dev
```

## 🏗️ Build production

```bash
./build-package.sh        # ou : npm run tauri build
```

Binaires dans `src-tauri/target/release/bundle/`.

## ✅ Tests

```bash
cd src-tauri && cargo test   # cœur Rust (db, packs, orchestrateur…)
npm run test                 # front (vitest)
```

## 📄 Licence

Propriétaire — Nadir DAOUDI (Digital DNA) · dnadir23@gmail.com
