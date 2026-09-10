# Типографика AVIATOR

Уже в продукте (не менять стек без нужды):

- **Заголовки:** Golos Text (`--font-heading`) — кириллица, editorial.
- **Текст / формы:** Inter (`--font-sans`).
- **Служебное (IATA, время):** JetBrains Mono (`--font-mono`) точечно.

Источник выбора кириллического гротеска: текущий `frontend/app/layout.tsx` и страница `frontend/app/devspec/page.tsx`.

## Иерархия (принцип Apple HIG)

Размер и вес, не цвет радуги, отделяют H1 от body.

- Display / H1: 1 роль на странице. На главной — короткий editorial title над поиском, **не** перекрывающий глобус.
- H2 секций (Популярные, Почему мы): заметно меньше H1, один вес.
- Body ≥ **16px**. Line-height ~**1.5** для абзацев.
- UI-подписи полей: 12–14px, но контраст как у текста, не «серый на сером».

Источник: [Apple HIG — Typography](https://developer.apple.com/design/human-interface-guidelines/typography): hierarchy via size/weight; Dynamic Type; избегать decor fonts в UI.  
Источник: [Apple / WWDC24 — Get started with Dynamic Type](https://developer.apple.com/videos/play/wwdc2024/10073/).  
Источник: [Material 3 — Typography](https://m3.material.io/styles/typography/overview): type scale, role-based styles.

## Веса

- Regular / Medium — body, поля, вторичный текст.
- Semibold / Bold — заголовки, цена в карточке рейса.
- Не ставить весь UI в ExtraBold: пропадает иерархия (HIG).

## Числа в авиа-UI

Время, длительность, цена — выравнивать так, чтобы глаз сканировал колонку.  
Моноширинный шрифт — только для IATA и часов, не для абзацев.

## Контраст и увеличение

- Обычный текст: contrast ratio **≥ 4.5:1** к фону.
- Крупный текст (≥18px regular / ≥14px bold): ≥ 3:1.
- Макет не должен разваливаться при увеличении текста пользователем.

Источник: [WCAG 2.2 — 1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum).  
Источник: [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility).

## Чего не делать

- Не подключать третий display-шрифт «для красоты».
- Не уменьшать body до 12–13px на desktop ради «премиальности» — это дешевит.
- Не писать длинные hero-абзацы поверх глобуса.
