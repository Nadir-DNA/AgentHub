# AgentHub

**Orchestrateur d'assistants IA métier pour TPE / PME / auto-entrepreneurs** — application desktop autonome (Tauri + React + Rust).

🌐 **Landing page :** [landing-five-rosy-79.vercel.app](https://landing-five-rosy-79.vercel.app)

## 🎯 Vision

AgentHub déploie une **équipe d'agents IA spécialisés** (Manager, Commercial, Marketing, Juridique, Tech & Data), pré-configurée pour le métier du client, et **facile à paramétrer** sans toucher au code. Un orchestrateur route les demandes en langage naturel vers le bon assistant.

**Local-first / BYOK :** tout tourne sur le poste du client, avec sa propre clé OpenCode Go. Aucune donnée ne quitte la machine (hors appels LLM), aucun serveur à héberger.

## 📦 Stack technique

| Couche | Techno |
|--------|--------|
| Desktop | Tauri 2 + React 19 + Tailwind v4 |
| Cœur métier | Rust (agents, orchestrateur, scheduler, LLM) |
| Persistance | SQLite local (rusqlite) + secret store hors webview |
| LLM | OpenCode Go (BYOK) — API OpenAI-compatible |
| Auto-update | tauri-plugin-updater (GitHub Releases) |

## 🏗️ Architecture

```
┌──────────────── Tauri App (1 binaire) ────────────────┐
│  React UI  ──invoke()──►  Rust Core                    │
│  Wizard / Hub / Agent /   ├─ orchestrator (routage)    │
│  AgentConfig / Settings   ├─ agents + packs métier     │
│                           ├─ llm (OpenCode Go, BYOK)   │
│                           ├─ scheduler (crontab)        │
│                           ├─ updater (GitHub Releases)  │
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
- **Settings** — modèle IA, clé API, usage, compte, **apparence** (thème, accent, langue).

## 🧩 Packs métier

Salon/Coiffure · Avocat · Garage · Restaurant · Médical · Auto-entrepreneur (générique). Chaque pack instancie les 5 agents du noyau, spécialisés par contexte, outils et déclencheurs.

## 🎨 Personnalisation (app)

- **Thème** : 6 couleurs d'accent (Orange, Émeraude, Bleu, Violet, Rose, Rouge)
- **Mode** : sombre / clair
- **Langue** : FR / EN (i18n ready, `t()` function dans `preferences.ts`)
- **Agents custom** : créer / modifier / supprimer via AgentConfig

## 💰 Pricing

| Plan | Prix | Agents | Packs métier | Support |
|------|------|--------|--------------|---------|
| **Starter** | 0€/mois | 1 | — | Communauté |
| **Pro** | 29€/mois | 5 | ✓ | Email |
| **Enterprise** | 99€/mois | ∞ | ✓ + custom | Prioritaire |

> Stripe en attente de clé secrète (`STRIPE_SECRET_KEY`). UI de pricing disponible, intégration backend à brancher.

## 🚀 Démarrage

```bash
# Frontend
npm install
npm run dev          # Vite dev server

# Desktop (Tauri)
cd src-tauri
cargo tauri dev      # Lance l'app desktop complète

# Build production
npm run build        # Frontend
cargo tauri build    # Desktop binary (Windows/macOS/Linux)
```

## 🔄 Auto-update

Configuré via `tauri-plugin-updater`. Le endpoint pointe vers :
```
https://github.com/Nadir-DNA/AgentHub/releases/latest/download/latest.json
```
Au lancement de l'app, `UpdateChecker` vérifie les releases GitHub et propose le téléchargement si une nouvelle version est disponible.

> ⚠️ La `pubkey` de signature est vide pour l'instant — à générer avec `tauri signer generate` avant la première release signée.

## 📁 Structure

```
agenthub/
├── landing/              # Landing page standalone (deploy Vercel)
│   └── index.html
├── src/                  # Frontend React
│   ├── components/       # AgentAvatar, AmbientCanvas, UpdateChecker, Layout
│   ├── pages/            # Hub, Agent, AgentConfig, Settings, Wizard
│   ├── services/         # api.ts (Tauri invoke), preferences.ts (theme+i18n), catalog.ts
│   └── assets/agents/    # PNG sprites pixel art
├── src-tauri/            # Backend Rust
│   └── src/
│       ├── agents.rs    # Logique agents + seed
│       ├── commands.rs   # Commandes Tauri (invoke handlers)
│       ├── db.rs         # SQLite init + schéma
│       ├── llm.rs        # Client OpenCode Go
│       ├── orchestrator.rs  # Routage multi-agents
│       ├── packs.rs      # Packs métier
│       └── scheduler.rs  # Crontab tâches planifiées
└── package.json
```

## 🔧 Configuration

Aucune variable d'environnement serveur — tout est local.

L'utilisateur fournit sa clé API OpenCode Go via le Wizard ou Settings. La clé est stockée dans le secret store de l'OS (hors webview).

## 📜 License

Proprietary — © Nadir DAOUDI