# AgentHub

Assistant IA professionnel pour TPE/PME — version desktop légère (Tauri + React).

## 🎯 Vision

AgentHub propose des assistants IA spécialisés par métier (Manager, Compta, Marketing, Juridique) qui s'installent sur le poste de travail du client et automatisent ses tâches quotidiennes.

**Architecture Version Pote (autonome) :**
- **Desktop App** (Tauri 2 + React 19) — ~9 Mo, interface 4 pages
- **Gateway** (FastAPI) — bridge HTTP entre l'app et Hermes
- **Hermes Agent** (Python) — moteur IA avec profiles spécialisés

**Modèle :** BYOK (Bring Your Own Key) — le client utilise sa propre clé OpenCode Go.

## 📦 Stack technique

| Couche | Technologie |
|--------|-------------|
| Desktop | Tauri 2.x + React 19 + Tailwind v4 |
| Gateway | FastAPI (Python) |
| Agent Engine | Hermes Agent v0.15.2 |
| LLM | OpenCode Go (BYOK) — deepseek-v4-flash |
| Persistance | localStorage (config) + Hermes memory (conversations) |

## 🚀 Installation

### Prérequis

- Python 3.10+
- Linux (Ubuntu/Debian recommandé)

### Depuis le package autonome (pour les utilisateurs)

```bash
tar -xzf AgentHub-1.0.0-Linux.tar.gz
cd AgentHub-1.0.0-Linux
chmod +x install-agenthub.sh
./install-agenthub.sh VOTRE_CLE_OPENCODE_GO
```

### Depuis le code source (pour les développeurs)

```bash
chmod +x install-deps.sh
./install-deps.sh
npm install
npm run tauri dev
```

### Build production

```bash
npm run tauri build
```

Les binaires seront dans `src-tauri/target/release/bundle/`.

## 📱 Pages de l'app

### Wizard (1ère visite)
- Choix du métier (coiffeur, avocat, garage, restaurant, médical, autre)
- Sélection des assistants (Manager, Compta, Marketing, Juridique)
- Configuration de la clé API OpenCode Go

### Hub (Dashboard)
- Cartes personnages avec illustrations chibi SVG
- Effets hover (glow, animation, sparkles)
- Stats rapides (agents actifs, tâches programmées)
- Badge "Ajouter" pour les agents inactifs

### Agent (Chat)
- Interface de conversation avec l'assistant
- Indicateur de frappe (3 points rebondissants)
- Gestion d'erreur inline (message rouge si serveur down)
- Badge "Mode démo" si le serveur n'est pas connecté
- Prompts prédéfinis selon le métier

### Settings
- Choix du modèle IA
- Clé OpenCode Go
- Renommage des agents (crayon ✏️ → nom personnalisé persisté)
- Informations du compte

## 🏗️ Architecture des agents

### Profiles d'agents (config spécialisée)

| Agent | Outils autorisés | Outils désactivés | Gateways |
|-------|-----------------|-------------------|----------|
| **Manager** | web_search, memory | terminal, browser | telegram, whatsapp |
| **Comptable** | web_search, memory | terminal, browser | telegram |
| **Marketing** | web_search, browser, memory | terminal | telegram, whatsapp |
| **Juridique** | web_search, memory | terminal, browser | telegram |

### Skills par agent

- **Manager** — planning-briefing.md, relance-clients.md
- **Comptable** — gestion-factures.md, suivi-tresorerie.md
- **Marketing** — creation-contenu.md, gestion-avis-google.md
- **Juridique** — redaction-contrats.md, veille-reglementaire.md

## 🌐 Serveur Gateway

Le gateway FastAPI (`server/gateway.py`) écoute sur `localhost:8080`.

**Routes :**
- `GET /health` — vérifie que le serveur tourne
- `GET /profiles` — liste les profiles Hermes installés
- `POST /chat/{profile}` — envoie un message (avec retry 2 tentatives)
- `GET /history/{profile}` — historique des messages

**Sécurité :**
- CORS restreint aux origines Tauri
- Écoute sur `127.0.0.1` uniquement
- Clé API protégée par `chmod 600`

## 📋 Roadmap

- [x] Phase 0 — Fondations (architecture, modèles, stack)
- [x] Phase 1.1 — Init projet (Vite + React + Tauri)
- [x] Phase 1.2 — 4 pages (Wizard, Hub, Agent, Settings)
- [x] Phase 1.3 — Wizard d'installation
- [x] Phase 1.4 — Personnages chibi + animations
- [x] Phase 1.5 — Renommage des agents
- [x] Phase 1.6 — Audit + corrections (sécurité, erreurs, profiles)
- [ ] Phase 2 — Tests (Vitest + Playwright)
- [ ] Phase 3 — Historique persistant (SQLite local)
- [ ] Phase 4 — Mises à jour auto
- [ ] Phase 5 — Cross-platform (Windows, macOS)

## 📄 Licence

Propriétaire — Nadir DAOUDI (Digital DNA)

## 👤 Contact

- **Email :** dnadir23@gmail.com
- **SIRET :** 890 997 349 00026
