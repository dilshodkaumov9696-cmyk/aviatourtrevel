# Aviator Web

Сайт продажи авиабилетов. Next.js + FastAPI + PostgreSQL + Redis.

## Структура

```
aviator_web/
├── backend/      FastAPI (Python 3.11+)
│   ├── alembic/  миграции БД
│   └── app/
│       ├── api/v1/     ручки: search, alerts, orders
│       ├── db/         движок и сессии SQLAlchemy
│       ├── models/     Order, Passenger, PriceAlert
│       ├── providers/  интеграции (Travelpayouts)
│       ├── services/   кэш поиска, почта
│       └── workers/    фоновый воркер ценовых подписок
├── frontend/     Next.js 16 + TypeScript + Tailwind 4
├── infra/        docker-compose, nginx
└── docs/         документация
```

## Быстрый старт

Всё сразу — `./start.sh` в корне. Ниже по шагам.

### 1. Инфраструктура (Postgres + Redis)

```bash
docker compose -f infra/docker-compose.yml up -d
```

> **Postgres слушает на 5433, а не на 5432.** Порт занят нативным Postgres,
> который на многих машинах стоит локально и перехватывает `localhost`.
> Развели, чтобы не конфликтовать с другими проектами.

### 2. Backend

```bash
cd backend
cp .env.example .env          # заполни TRAVELPAYOUTS_TOKEN
./venv/bin/alembic upgrade head   # накатить миграции
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

### 4. Воркер ценовых подписок (опционально)

Отдельным процессом — проверяет цены и шлёт письма подписчикам:

```bash
cd backend
./venv/bin/python -m app.workers.price_watch
```

Пока `SMTP_HOST` в `.env` пуст, письма не уходят наружу, а печатаются в лог —
так воркер можно гонять локально, не заводя почтовый ящик.

## API

| Метод | Путь | Назначение |
|---|---|---|
| `GET` | `/health` | Проверка живости |
| `GET` | `/api/v1/search` | Поиск рейсов (кэш в Redis, TTL 30 мин) |
| `POST` | `/api/v1/alerts` | Подписаться на цену |
| `GET` | `/api/v1/alerts?email=` | Свои подписки |
| `DELETE` | `/api/v1/alerts/{id}?email=` | Отписаться |
| `POST` | `/api/v1/orders` | Оформить заявку |
| `GET` | `/api/v1/orders?email=` | Свои заявки |
| `GET` | `/api/v1/orders/{ref}?email=` | Заявка по коду |
| `PATCH` | `/api/v1/orders/{ref}/status` | Сменить статус (для менеджера) |

## Миграции

```bash
cd backend
./venv/bin/alembic revision --autogenerate -m "описание"
./venv/bin/alembic upgrade head
./venv/bin/alembic downgrade -1     # откатить последнюю
```

URL базы берётся из `DATABASE_URL` в `.env` — в `alembic.ini` он намеренно пуст,
чтобы адрес не утёк в репозиторий.

## Проверки перед коммитом

```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

## Этапы разработки

- [x] **Этап 0** — Каркас проекта
- [x] **Этап 1** — Рабочий поиск через провайдер (Travelpayouts)
- [ ] **Этап 2** — Пользователи, кабинет, алерты цен
      *(алерты готовы; авторизации и живого кабинета пока нет)*
- [ ] **Этап 3** — Приём заявок и оплата
      *(заявки принимаются и хранятся; оплата не подключена)*
- [ ] **Этап 4** — Реальная выписка билетов (после договора с консолидатором)

Подробный план: `~/Desktop/aviator_web_plan.pdf`

## Известные ограничения

- **Ролей пользователей пока нет.** `PATCH /orders/{ref}/status` защищена временным
  ключом `MANAGER_API_KEY` (заголовок `X-Manager-Key`) — когда появится личный
  кабинет с ролями, заменить на нормальную авторизацию менеджера.
- **Паспортные данные хранятся открытым текстом** в `passengers.doc_number` —
  на проде нужно шифрование столбца и ограничение доступа к таблице.
- **Оплата не подключена** — заявка доходит до статуса «Ожидает оплаты».
- Интеграция с Aviasales — **тестовая**, на время разработки.

## Стек

**Backend:** FastAPI, SQLAlchemy 2 (async), Alembic, PostgreSQL, Redis, httpx, JWT.
**Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4.
**Инфра:** Docker Compose, Nginx, Let's Encrypt, Cloudflare.

## Бренд

- Primary: `#2E6BFF` (синий)
- Accent: `#2FD98A` (зелёный CTA), текст на нём `#04331F`
- Шрифты: Inter (текст), Syne (заголовки), JetBrains Mono (моноширинный) —
  подключены через `next/font`, самохостятся, внешних запросов нет
