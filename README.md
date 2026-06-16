# Aviator Web

Сайт продажи авиабилетов. Next.js + FastAPI + PostgreSQL + Redis.

## Структура

```
aviator_web/
├── backend/      FastAPI (Python 3.11+)
├── frontend/     Next.js 16 + TypeScript + Tailwind 4
├── infra/        docker-compose, nginx
└── docs/         документация
```

## Быстрый старт

### 1. Инфраструктура (Postgres + Redis)

```bash
cd infra
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
./venv/bin/uvicorn app.main:app --reload --port 8000
```

Открой http://localhost:8000/docs — Swagger UI.
Проверка: http://localhost:8000/health

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm run dev
```

Открой http://localhost:3000

## Этапы разработки

- [x] **Этап 0** — Каркас проекта
- [ ] **Этап 1** — Рабочий поиск через провайдер (Travelpayouts)
- [ ] **Этап 2** — Пользователи, кабинет, алерты цен
- [ ] **Этап 3** — Приём заявок и оплата
- [ ] **Этап 4** — Реальная выписка билетов (после договора с консолидатором)

Подробный план: `~/Desktop/aviator_web_plan.pdf`

## Стек

**Backend:** FastAPI, SQLAlchemy 2 (async), Alembic, PostgreSQL, Redis, httpx, JWT.
**Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4.
**Инфра:** Docker Compose, Nginx, Let's Encrypt, Cloudflare.

## Бренд

- Primary: `#0F4C81` (синий)
- Accent: `#FF6B35` (оранжевый CTA)
- Шрифт: системный sans-serif
