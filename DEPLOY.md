# Деплой фронта на Vercel

Домен `aviatour.travel` уже смотрит на Vercel, но активного деплоя нет
(`DEPLOYMENT_NOT_FOUND`). Нужно один раз привязать этот репозиторий.

## Быстрый путь (через сайт Vercel)

1. Открой https://vercel.com/new
2. Import репозиторий `dilshodkaumov9696-cmyk/aviatourtrevel`
3. Root Directory: `frontend`
4. Framework: Next.js (подхватится сам)
5. Environment Variable (Production):
   - `NEXT_PUBLIC_API_URL` = URL твоего backend API (если API ещё нет — можно временно оставить пустым, шапка сайта всё равно откроется)
6. Deploy
7. Project → Settings → Domains → добавь `aviatour.travel` и `www.aviatour.travel`

После этого каждый push в `main` будет обновлять сайт автоматически
(через Git-интеграцию Vercel).

## Автодеплой через GitHub Actions

В репозитории уже есть `.github/workflows/deploy-frontend.yml`.

Нужны secrets в GitHub → Settings → Secrets and variables → Actions:

| Secret | Откуда взять |
|---|---|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | после `vercel link` в `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | там же → `projectId` |

Опционально Actions variable:

| Variable | Значение |
|---|---|
| `NEXT_PUBLIC_API_URL` | публичный URL backend |

Потом: Actions → **Deploy frontend to Vercel** → Run workflow.
