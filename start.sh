#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "▶ Запуск Aviator..."

# Docker
if ! docker info > /dev/null 2>&1; then
  echo "  → Запуск Docker Desktop..."
  open -a Docker
  until docker info > /dev/null 2>&1; do sleep 2; done
fi

echo "  → Базы данных (Postgres + Redis)..."
docker compose -f "$ROOT/infra/docker-compose.yml" up -d

until docker inspect aviator_postgres --format '{{.State.Health.Status}}' 2>/dev/null | grep -q healthy; do
  sleep 2
done

# Backend
echo "  → Backend (FastAPI)..."
pkill -f "uvicorn app.main:app" 2>/dev/null || true
cd "$ROOT/backend"
"$ROOT/backend/venv/bin/uvicorn" app.main:app --reload --port 8000 > /tmp/aviator_backend.log 2>&1 &
BACKEND_PID=$!

until curl -s http://localhost:8000/health > /dev/null 2>&1; do sleep 1; done

echo "  → Воркер ценовых подписок..."
pkill -f "app.workers.price_watch" 2>/dev/null || true
"$ROOT/backend/venv/bin/python" -m app.workers.price_watch > /tmp/aviator_watch.log 2>&1 &
WATCH_PID=$!

# Frontend
echo "  → Frontend (Next.js)..."
pkill -f "next dev" 2>/dev/null || true
cd "$ROOT/frontend"
npm run dev > /tmp/aviator_frontend.log 2>&1 &
FRONTEND_PID=$!

until curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; do
  sleep 1
done

echo ""
echo "✓ Aviator запущен!"
echo "  Сайт:    http://localhost:3000"
echo "  API:     http://localhost:8000"
echo "  Swagger: http://localhost:8000/docs"
echo ""
echo "  Логи backend:  /tmp/aviator_backend.log"
echo "  Логи frontend: /tmp/aviator_frontend.log"
echo "  Логи watcher:  /tmp/aviator_watch.log"
echo ""
echo "  Нажми Ctrl+C чтобы остановить всё"
echo ""

open http://localhost:3000

trap "echo ''; echo 'Остановка...'; kill $BACKEND_PID $FRONTEND_PID $WATCH_PID 2>/dev/null; docker compose -f '$ROOT/infra/docker-compose.yml' stop; exit 0" INT TERM

wait
