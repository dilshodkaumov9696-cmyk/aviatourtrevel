#!/usr/bin/env bash
set -e

PAGE="frontend/app/page.tsx"

# 1. Логотип: добавляем лайм-обводку вокруг синего квадрата "A"
sed -i '' 's/rounded-xl bg-\[var(--color-primary)\] font-bold text-white shadow-sm">/rounded-xl border-2 border-[var(--color-accent)] bg-[var(--color-primary)] font-bold text-white shadow-sm">/' "$PAGE"

# 2. Активная категория: добавляем лайм-рамку к "bg-white text-primary-dark shadow-md"
sed -i '' 's/? "bg-white text-\[var(--color-primary-dark)\] shadow-md"/? "bg-white text-[var(--color-primary-dark)] shadow-md ring-2 ring-[var(--color-accent)]"/' "$PAGE"

echo "✓ Готово! Проверь: git diff frontend/app/page.tsx | cat"
