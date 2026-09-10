# Цвета AVIATOR

Текущие токены (`frontend/app/globals.css`) — база. Не плодить вторую палитру.

## Светлая тема (основная, premium)

| Роль | Токен | Смысл |
|---|---|---|
| Фон страницы | `--color-bg` `#F7F8FA` | Бумага, не чисто клинический #FFF во весь экран |
| Поверхность | `--color-surface` `#FFFFFF` | Карточки, форма |
| Текст | `--color-text` `#121820` | Чернила |
| Вторичный текст | `--color-text-muted` `#5C6775` | Только если contrast ≥ 4.5:1 на своём фоне |
| Линии | `--color-border` `#E4E7EC` | Тихие разделители |
| Акцент / CTA | `--color-primary` `#1E4FD8` | **Единственный** цвет действия |

Синий — сигнал действия и фокуса, не заливка секций.  
Источник принципа «один акцент»: практика editorial + [NN/g hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) (цвет как один из признаков, не единственный).

## Тёмная тема

Существует (`.dark`). Не убивать.  
На тёмном: текст `#F2F4F7`, акцент светлее (`#6B8FE8`), поверхности `#1C232E`.  
Не возвращать neon/cyan glow.

## Контраст (обязательно)

- Текст и иконки на фоне: **WCAG 2.2 AA**, 4.5:1.
- Синяя кнопка: белый label (`--color-accent-foreground`). Проверять hover `#163CAB`.
- Placeholder не заменяет label и сам по себе часто проваливает contrast — label всегда видим.
- Focus ring: 2px, контрастный к фону (синий или ink), не полупрозрачный «намек».

Источник: [WCAG 2.2 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum), [1.4.11 Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast) (3:1 для UI).  
Источник: [Apple HIG — Accessibility / Color and Contrast](https://developer.apple.com/design/human-interface-guidelines/accessibility).  
Источник: [Material 3 — Color](https://m3.material.io/styles/color/overview): roles (primary, surface, on-surface), не радуга.

## Состояния

- Default / Hover / Active / Disabled / Focus — различимы без цвета как единственного канала (иконка + вес + ring).
- Ошибки формы: текст ошибки + граница, не только красная иконка.
- Успех/скидка: не кислотный green; достаточно ink + маленький badge.

## Чего не делать

- Не градиенты на кнопках и hero.
- Не glassmorphism и цветные тени.
- Не золото + синий + неон одновременно. `--color-gold` сейчас = primary — не возвращать металлик ради «авиапремиума».
- Не красить глобус CSS-фильтрами так, что пропадает маршрут.
