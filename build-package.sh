#!/bin/bash

# Build du package AgentHub autonome (avec Hermes intégré)

set -e

echo "📦 AgentHub — Build du package autonome"
echo "========================================"
echo ""

PACKAGE_DIR="AgentHub-1.0.0-Linux"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# 1. Binaire Tauri
echo "📥 [1/5] Binaire AgentHub..."
cp src-tauri/target/release/app "$PACKAGE_DIR/AgentHub"
chmod +x "$PACKAGE_DIR/AgentHub"
echo "   ✅ $(ls -lh $PACKAGE_DIR/AgentHub | awk '{print $5}')"

# 2. Profiles Hermes
echo "👥 [2/5] Profiles assistants..."
cp -r profiles "$PACKAGE_DIR/"
echo "   ✅ Manager • Comptable • Marketing • Juridique"

# 3. Wheels Hermes
echo "🐍 [3/5] Hermes Agent (wheels)..."
mkdir -p "$PACKAGE_DIR/wheels"

# Télécharger Hermes + dépendances
pip download hermes-agent -d "$PACKAGE_DIR/wheels/" --quiet 2>&1
WHEELS_COUNT=$(ls "$PACKAGE_DIR/wheels/"*.whl 2>/dev/null | wc -l)
WHEELS_SIZE=$(du -sh "$PACKAGE_DIR/wheels/" | awk '{print $1}')
echo "   ✅ $WHEELS_COUNT wheels ($WHEELS_SIZE)"

# 4. Installateur
echo "🔧 [4/5] Scripts d'installation..."
cp install-agenthub.sh "$PACKAGE_DIR/"

# README
cat > "$PACKAGE_DIR/LISEZ-MOI.txt" <<'EOF'
═══════════════════════════════════════════════════════════════
  AGENTHUB — Installation (Version Pote)
═══════════════════════════════════════════════════════════════

  🤖 AgentHub = Interface graphique + Hermes Agent + 4 assistants
  pré-configurés (Manager, Comptable, Marketing, Juridique).

  Le package contient TOUT. Aucune installation manuelle nécessaire.

🎯 INSTALLATION (30 secondes) :

  1. Ouvrez un terminal dans CE dossier

  2. Tapez :
     chmod +x install-agenthub.sh
     ./install-agenthub.sh VOTRE_CLE_OPENCODE_GO

     (Remplacez VOTRE_CLE_OPENCODE_GO par votre vraie clé)

  3. C'est fini ! AgentHub s'ouvre automatiquement.

🔑 OBTENIR UNE CLÉ OPENCODE GO :

  → Allez sur https://opencode.ai/auth
  → Créez un compte (10€/mois)
  → Copiez votre clé API (commence par sk-...)

📦 CONTENU DU PACKAGE :

  AgentHub           → Interface graphique (Tauri + React)
  profiles/          → 4 assistants pré-configurés
  wheels/            → Hermes Agent + dépendances Python
  install-agenthub.sh → Installation automatique

🆘 BESOIN D'AIDE ?

  Contact : dnadir23@gmail.com

═══════════════════════════════════════════════════════════════
EOF

chmod +x "$PACKAGE_DIR/install-agenthub.sh"

echo "✅ [5/5] Création du tarball..."

# Compresser
tar -czf "$PACKAGE_DIR.tar.gz" "$PACKAGE_DIR" 2>&1 | tail -3

# Taille finale
FINAL_SIZE=$(du -sh "$PACKAGE_DIR.tar.gz" | awk '{print $1}')

# Nettoyer
rm -rf "$PACKAGE_DIR"

echo ""
echo "════════════════════════════════════════════════════════"
echo "  🎉 Package créé : $PACKAGE_DIR.tar.gz ($FINAL_SIZE)"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Contenu du package :"
echo "  - AgentHub (app desktop)"
echo "  - Hermes Agent v0.15.2 ($WHEELS_COUNT wheels / $WHEELS_SIZE)"
echo "  - 4 profiles assistants (Manager, Comptable, Marketing, Juridique)"
echo "  - Script d'installation 1 clic"
echo ""
echo "📤 Pour distribuer à tes potes :"
echo "   1. Envoie le fichier $PACKAGE_DIR.tar.gz"
echo "   2. Ils extraient l'archive"
echo "   3. Ils lancent :"
echo "      chmod +x install-agenthub.sh"
echo "      ./install-agenthub.sh LEUR_CLE_API"
echo ""
echo "💰 Monétisation :"
echo "   - Version gratuite : sans clé (démo)"
echo "   - Licence 29€ : inclut le package + support"
echo "   - Parrainage OpenCode Go : 10€/mois/clients"
echo ""
