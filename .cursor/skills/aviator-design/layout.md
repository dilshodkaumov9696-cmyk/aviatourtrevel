# Layout, grid, spacing

## Сетка

- Desktop: контентная колонка **~1120–1200px**, не растягивать текст на 1600px.
- Search bar — **уже**, чем full-bleed секции. Форма как объект, не как полоса во весь экран.
- Карточки направлений: регулярная сетка (2 / 3 / 4), одинаковые отступы.
- Results: список, не masonry. Сравнение важнее коллажа.

Источник: [Material 3 — Layout / window size classes](https://m3.material.io/foundations/layout/applying-layout/window-size-classes): consistent columns, 8dp grid.  
Источник: [Material 3 — Spacing and alignment](https://m3.material.io/foundations/layout/understanding-layout/spacing).  
Источник: [Material 3 — Text fields](https://m3.material.io/components/text-fields/guidelines): не full-width fields на широких экранах.

## Шкала отступов (8px)

Использовать 8 / 16 / 24 / 32 / 48 / 64 / 96.

| Роль | Рекомендация |
|---|---|
| Внутри поля / кнопки | 12–16 |
| Между полями в группе | 8–12 |
| Между группами формы (маршрут / даты / люди) | 16–24 |
| Между секциями главной | 64–96 |
| Внутри карточки | 16–20 |

Источник: Material 3 spacing (8dp).  
Источник: [NN/g — White Space](https://www.nngroup.com/articles/white-space/) — воздух между группами, не внутри лейбла.

## Главная: существующий порядок (не переставлять)

```
Header
Hero + Globe + route
Search
Popular directions
Why Us
Destinations
Footer
```

Визуальные правки — внутри секции. Не переносить search на другую страницу. Не менять порядок ради «как у Apple».

## Выдача `/search`

- Sticky или повторяемый summary запроса (маршрут + даты) в шапке результатов.
- Фильтры слева на desktop / sheet на mobile — не перекрывать карточки навсегда.
- Карточки одной ширины, одна визуальная «полоса цены».

Источник: [Baymard Airlines UX 2025](https://baymard.com/blog/airlines-ux-benchmark-2025); [Lyssna Booking vs Expedia](https://www.lyssna.com/blog/booking-vs-expedia/).

## Радиусы и тени (уже в токенах)

Текущие `--radius-sm/md/lg` небольшие — так и держать (editorial, не «пилюля»).  
Тени: 1–2px, без glow. Карточка отделяется границей/`--color-border`, не ореолом.

## Чего не делать

- Не оборачивать глобус+поиск+popular в один glass-container.
- Не добавлять второй горизонтальный скролл на desktop ради «журнальности».
- Не менять grid соседа, если чинится только одна карточка.
