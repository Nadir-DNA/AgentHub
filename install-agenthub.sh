#!/bin/bash

# AgentHub Installer — Version Pote (Autonome)
# Usage: ./install-agenthub.sh VOTRE_CLE_OPENCODE_GO

set -e

echo "🤖 AgentHub — Installation autonome"
echo "═══════════════════════════════════"
echo ""

# Vérifications
if [ $# -lt 1 ]; then
    echo "❌ Usage: ./install-agenthub.sh [VOTRE_CLE_OPENCODE_GO]"
    echo ""
    echo "💡 Pas de clé ? Obtenez-la sur : https://opencode.ai/auth"
    exit 1
fi

# Vérifier Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 est requis. Installez-le avec : sudo apt install python3"
    exit 1
fi

API_KEY="$1"
PACKAGE_DIR="$(cd "$(dirname "$0")" && pwd)"
HERMES_HOME="$HOME/.hermes"
AGENTHUB_HOME="$HOME/.agenthub"

echo "📁 [1/7] Création des dossiers..."
mkdir -p "$HERMES_HOME/profiles"
mkdir -p "$HERMES_HOME/bin"
mkdir -p "$AGENTHUB_HOME/bin"
mkdir -p "$AGENTHUB_HOME/server"

echo "🖥️  [2/7] Installation de l'interface AgentHub..."
cp "$PACKAGE_DIR/AgentHub" "$AGENTHUB_HOME/bin/AgentHub"
chmod +x "$AGENTHUB_HOME/bin/AgentHub"

echo "👥 [3/7] Installation des assistants IA..."
cp -r "$PACKAGE_DIR/profiles/"* "$HERMES_HOME/profiles/"
echo "   ✅ Marc le Manager"
echo "   ✅ Simon le Comptable"
echo "   ✅ Sophie la Marketing"
echo "   ✅ Claude le Juridique"

echo "🐍 [4/7] Installation de Hermes Agent..."

# Créer environnement virtuel
python3 -m venv "$HERMES_HOME/venv"
source "$HERMES_HOME/venv/bin/activate"

# Installer Hermes depuis les wheels locales (hors-ligne)
echo "   📦 Installation des dépendances..."
pip install --no-index --find-links="$PACKAGE_DIR/wheels/" hermes_agent --quiet 2>&1

# Créer le lien hermes
ln -sf "$HERMES_HOME/venv/bin/hermes" "$HERMES_HOME/bin/hermes"

# Ajouter au PATH
if ! grep -q "HERMES_HOME" "$HOME/.bashrc" 2>/dev/null; then
    echo "" >> "$HOME/.bashrc"
    echo '# AgentHub' >> "$HOME/.bashrc"
    echo 'export PATH="$HOME/.hermes/bin:$PATH"' >> "$HOME/.bashrc"
fi

echo "   ✅ Hermes Agent v0.15.2"

echo "⚙️  [5/7] Configuration..."
cat > "$HERMES_HOME/config.yaml" <<EOF
providers:
  opencode-go:
    api: https://opencode.ai/zen/go/v1
    api_key: $API_KEY
    name: opencode-go

models:
  default: deepseek-v4-flash
  fallbacks:
    - grok-3
    - gpt-4o-mini

memory:
  persistent: true

scheduling:
  enabled: true
  timezone: Europe/Paris

gateways:
  api_server:
    enabled: true
    port: 8080
EOF

cat > "$HERMES_HOME/.env" <<EOF
HERMES_OPENCODE_GO_API_KEY=$API_KEY
EOF

chmod 600 "$HERMES_HOME/config.yaml"
chmod 600 "$HERMES_HOME/.env"

echo "   ✅ Configuration créée (fichiers protégés chmod 600)"

echo "🌐 [6/7] Installation du serveur local..."
mkdir -p "$HOME/.config/systemd/user"

cat > "$HOME/.config/systemd/user/agenthub-server.service" <<EOF
[Unit]
Description=AgentHub Server
After=network.target

[Service]
Type=simple
ExecStart=$HERMES_HOME/bin/hermes gateway run --port 8080
Restart=always
RestartSec=5
Environment=HERMES_HOME=$HERMES_HOME

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable agenthub-server.service 2>/dev/null || true
systemctl --user start agenthub-server.service 2>/dev/null || true

# Raccourci de bureau
mkdir -p "$HOME/.local/share/applications"
cat > "$HOME/.local/share/applications/agenthub.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=AgentHub
Comment=Vos assistants IA professionnels
Exec=$AGENTHUB_HOME/bin/AgentHub
Terminal=false
Categories=Office;Productivity;
StartupNotify=true
EOF

# Lancement rapide du gateway
$HERMES_HOME/bin/hermes gateway run --port 8080 --daemon 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ AgentHub — Installation terminée !"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Vos assistants sont prêts :"
echo "    🟢 Marc le Manager"
echo "    🟢 Simon le Comptable"
echo "    🟢 Sophie la Marketing"
echo "    🟢 Claude le Juridique"
echo ""
echo "  🌐 Serveur local : http://localhost:8080"
echo "  🔑 Clé API      : ${API_KEY:0:8}...${API_KEY: -4}"
echo ""
echo "  🚀 AgentHub est lancé !"
echo ""
