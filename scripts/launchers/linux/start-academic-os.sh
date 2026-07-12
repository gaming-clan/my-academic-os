#!/usr/bin/env bash
set -e

# === NDRYSHO VETËM KËTË RRESHT ===
# Vendos këtu rrugën e plotë ku ke bërë 'git clone' të projektit my-academic-os
PROJECT_PATH="$HOME/Projects/my-academic-os"
# ==================================

PORT=3000

if [ ! -d "$PROJECT_PATH" ]; then
  echo "Gabim: rruga '$PROJECT_PATH' nuk ekziston. Ndrysho PROJECT_PATH në këtë skript."
  exit 1
fi

cd "$PROJECT_PATH"

if [ ! -d "node_modules" ]; then
  npm install
fi

if ! curl -s -o /dev/null "http://localhost:$PORT"; then
  nohup npm run dev > /tmp/academic-os-dev.log 2>&1 &
  disown
  sleep 5
fi

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:$PORT" >/dev/null 2>&1 &
fi
