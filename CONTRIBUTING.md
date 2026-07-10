# Contribuer à AgentHub

## Dev local

```bash
npm install
npm run dev          # frontend
cargo tauri dev      # desktop app
```

## Signer une release

```bash
# Générer la clé (une seule fois)
npx tauri signer generate -w ~/.tauri/agenthub.key

# Ajouter les secrets GitHub :
# TAURI_SIGNING_PRIVATE_KEY (contenu du .key)
# TAURI_SIGNING_PRIVATE_KEY_PASSWORD

# Tagger + push
git tag v2.0.0
git push origin v2.0.0
# → le workflow release.yml build + GitHub Release auto
```

## Avant de proposer une PR

```bash
npm run build
cd src-tauri && cargo check
```