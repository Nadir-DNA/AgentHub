#!/bin/bash

# AgentHub - Script d'installation des dépendances système
# Exécuter avec : chmod +x install-deps.sh && ./install-deps.sh

set -e

echo "🚀 Installation des dépendances système pour AgentHub (Tauri + React)..."
echo ""

# Vérifier si on est sur Ubuntu/Debian
if ! command -v apt-get &> /dev/null; then
    echo "❌ Ce script est conçu pour Ubuntu/Debian. Adaptez les commandes pour votre distribution."
    exit 1
fi

echo "📦 Mise à jour des paquets..."
sudo apt-get update

echo ""
echo "📦 Installation des dépendances Tauri..."
sudo apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libssl-dev \
    patchelf \
    pkg-config

echo ""
echo "✅ Dépendances installées !"
echo ""
echo "🔨 Vous pouvez maintenant builder l'app :"
echo "   npm run build        # Build frontend uniquement"
echo "   npm run tauri build  # Build complet (frontend + binaire Tauri)"
echo ""
echo "🚀 Ou lancer en mode dev :"
echo "   npm run tauri dev"
