#!/usr/bin/env bash
# Build AgentHub v2 — application desktop autonome (Tauri + Rust).
# Aucune dépendance Python : le moteur d'agents tourne dans le binaire Rust.
set -euo pipefail

cd "$(dirname "$0")"

echo "🦀 Build AgentHub (Tauri release)…"
npm ci
npm run tauri build

echo
echo "✅ Terminé. Binaires dans :"
echo "   src-tauri/target/release/bundle/"
echo
echo "   • Linux  : .deb / .AppImage / .rpm selon la config bundle"
echo "   • Lancer : src-tauri/target/release/app"