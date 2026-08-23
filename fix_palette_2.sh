#!/usr/bin/env bash
set -e

PAGE="frontend/app/page.tsx"

# 1. Кнопка "Найти билеты": убираем остатки оранжевого градиента -> сплошной лайм
sed -i '' 's/bg-gradient-to-r from-\[var(--color-accent)\] via-\[#ff9b2e\] to-\[#ffb04d\]/bg-[var(--color-accent)]/g' "$PAGE"

# 2. Тень кнопки: была оранжевая (rgba 255,138,0) -> лаймовая
sed -i '' 's/shadow-\[0_12px_34px_rgba(255,138,0,0.24)\]/shadow-[0_12px_34px_rgba(198,241,53,0.35)]/g' "$PAGE"
sed -i '' 's/hover:shadow-\[0_16px_42px_rgba(255,138,0,0.28)\]/hover:shadow-[0_16px_42px_rgba(198,241,53,0.42)]/g' "$PAGE"

# 3. Ссылки навигации: лайм-текст (низкий контраст на белом) -> синий (--color-primary)
sed -i '' 's/hover:text-\[var(--color-accent)\]/hover:text-[var(--color-primary)]/g' "$PAGE"
sed -i '' 's/? "text-\[var(--color-accent)\]" : ""/? "text-[var(--color-primary)]" : ""/g' "$PAGE"

echo "✓ Готово! Проверь diff: git diff frontend/app/page.tsx"
