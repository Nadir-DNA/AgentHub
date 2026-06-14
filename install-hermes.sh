#!/bin/bash

# Installation de Hermes Agent pour AgentHub
# Usage: ./install-hermes.sh [HOME_DIR]

set -e

HERMES_HOME="${1:-$HOME/.hermes}"
HERMES_DIR="$HERMES_HOME/hermes-agent"

echo "🔧 Installation de Hermes Agent..."

# Créer le dossier Hermes
mkdir -p "$HERMES_HOME"

# Copier Hermes Agent complet
echo "📦 Copie de Hermes Agent..."
cp -r "$(dirname "$0")/hermes-agent" "$HERMES_DIR/"

# Créer l'environnement virtuel et installer Hermes
echo "🐍 Création de l'environnement Python..."
python3 -m venv "$HERMES_DIR/venv"
source "$HERMES_DIR/venv/bin/activate"

echo "📥 Installation des dépendances..."
pip install -e "$HERMES_DIR" --quiet 2>&1 | tail -5

# Créer le lien symbolique hermes
ln -sf "$HERMES_DIR/venv/bin/hermes" "$HERMES_HOME/bin/hermes"
chmod +x "$HERMES_HOME/bin/hermes"

# Ajouter au PATH
if ! grep -q "HERMES_HOME" "$HOME/.bashrc" 2>/dev/null; then
    echo 'export PATH="$HOME/.hermes/bin:$PATH"' >> "$HOME/.bashrc"
    echo 'export HERMES_HOME="$HOME/.hermes"' >> "$HOME/.bashrc"
fi

echo "✅ Hermes Agent installé !"
echo "   Binaire : $HERMES_HOME/bin/hermes"
echo "   Config  : $HERMES_HOME/config.yaml"
