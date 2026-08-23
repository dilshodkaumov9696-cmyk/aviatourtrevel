#!/usr/bin/env bash
set -e

GLOBALS="frontend/app/globals.css"
FLIGHTCARD="frontend/app/components/search/FlightCard.tsx"
PAGE="frontend/app/page.tsx"

# 1. Шрифт body: Inter -> Manrope
sed -i '' 's/font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;/font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;/' "$GLOBALS"

# 2. Заголовки: убираем несуществующий Syne, ставим Manrope с жирным весом
sed -i '' 's/font-family: "Syne", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;/font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n  font-weight: 800;/' "$GLOBALS"

# 3. Тёмная тема: оранжевый акцент -> лайм (единая палитра light/dark)
sed -i '' 's/--color-accent: #FF9B2E;/--color-accent: #C6F135;/' "$GLOBALS"
sed -i '' 's/--color-accent-dark: #E57A00;/--color-accent-dark: #A8D420;/' "$GLOBALS"

# 4. Хардкод оранжевого в FlightCard.tsx -> лайм-акцент
sed -i '' 's/bg-orange-50 px-2 py-0.5 text-\[11px\] font-medium text-\[#C65300\] dark:bg-orange-950\/30 dark:text-orange-300/bg-\[var(--color-accent)\]\/15 px-2 py-0.5 text-[11px] font-medium text-\[#7A8A1A\] dark:bg-\[var(--color-accent)\]\/20 dark:text-\[#C6F135\]/' "$FLIGHTCARD"

# 5. Хардкод оранжевого blur-пятна в hero -> лайм
sed -i '' 's/bg-orange-400\/10/bg-\[var(--color-accent)\]\/10/' "$PAGE"

echo "✓ Готово! Проверь diff командой: git diff"
