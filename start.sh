#!/bin/bash
# filepath: /root/cani-app/start.sh

MODE=${1:-DEV}
VALID_MODES=("DEV" "PROD")

if [[ ! " ${VALID_MODES[*]} " =~ " ${MODE} " ]]; then
  echo "❌ Usage: $0 [DEV|PROD]"
  exit 1
fi

echo "🔧 Mode sélectionné : $MODE"


#ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_DIR="/root/canicoif-app-react"

# --- INSTALLATION DES DÉPENDANCES ---
echo "📦 Installation des dépendances backend..."
cd "$ROOT_DIR/backend"
npm install

echo "📦 Installation des dépendances frontend..."
cd "$ROOT_DIR/frontend"
npm install

# --- LANCEMENT DES SERVEURS ---
if [[ "$MODE" == "DEV" ]]; then
  echo "🚀 DEV MODE : Lancement du backend (nodemon) et frontend (vite)..."
  (cd "$ROOT_DIR/backend" && npx nodemon server.js) &
  (cd "$ROOT_DIR/frontend" && npm run dev) &
else
  echo "🏗️  PROD MODE : Build du frontend..."
  cd "$ROOT_DIR/frontend"
  npm run build

  echo "🚀 Lancement du backend seul (il sert aussi le frontend)..."
  cd "$ROOT_DIR/backend"
  npm run start
fi

echo "✅ Tout est lancé en mode $MODE."
wait
