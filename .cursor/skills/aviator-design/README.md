# AVIATOR Design Skill Pack

Дизайн-система **принципов** для Aviatour.travel (AVIATOR).  
Не копирует чужие сайты. Фиксирует, *почему* premium airline/travel UX работает, и как это переносить **поверх существующего продукта**.

## Когда применять

- Визуальная полировка: иерархия, типографика, spacing, контраст, формы, карточки рейсов.
- Проверка accessibility перед релизом визуальных правок.

## Когда НЕ применять

- Не удалять и не переносить существующие блоки (глобус, flight route, search, popular, WhyUs, destinations, results).
- Не менять бизнес-логику, API, routing, обработчики, state.
- Не прятать глобус за фото/оверлеем. Не убирать линию маршрута.
- Не клонировать layout Apple, Google Flights, Aviasales, Kayak, Emirates, Booking.

## Файлы

| Файл | Тема |
|---|---|
| [principles.md](./principles.md) | Иерархия, воздух, один фокус, честность цены |
| [typography.md](./typography.md) | Шкала, Golos + Inter, читаемость |
| [layout.md](./layout.md) | Grid, 8px spacing, секции, ширина форм |
| [colors.md](./colors.md) | Светлая основа, синий акцент, контраст WCAG |
| [components.md](./components.md) | Кнопки, поля, карточки, фильтры |
| [flight-search-ux.md](./flight-search-ux.md) | Поиск, даты, пассажиры, выдача |
| [responsive.md](./responsive.md) | Mobile, тач-цели, a11y |

## Существующие поверхности AVIATOR (не ломать)

1. Header + logo + навигация  
2. Hero + **глобус** + дуга маршрута  
3. Search bar (откуда / куда / даты / пассажиры / CTA)  
4. Popular directions  
5. Why Us  
6. Destination cards  
7. `/search` results + filters + FlightCard  
8. Footer  

Менять только визуал запрошенного блока. Соседние рабочие блоки не «подтягивать».

## Источники (актуально на 2025–2026)

См. каждый файл. Сводный список — в ответе агента / в конце `principles.md`.
