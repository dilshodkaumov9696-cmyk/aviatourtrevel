# Принципы UI/UX для AVIATOR

Идеи переносить в существующие блоки. Не собирать новый сайт.

## 1. Одна очевидная иерархия

Пользователь должен за секунду понять: что главное, что вторично, куда жать.

- **Один primary action** на экране. На главной это поиск билетов, не «ещё одна карточка».
- Заголовок → подзаголовок → действие. Не конкурирующие CTA одинакового веса.
- Размер, вес, цвет и пространство задают порядок чтения — не декоративные линии.

Источник: [NN/g — Visual Hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) (2024).  
Источник: [Apple HIG — Typography](https://developer.apple.com/design/human-interface-guidelines/typography) (обновлено 2025): размер и вес создают иерархию; Dynamic Type должен оставаться читаемым.

## 2. Воздух дороже декора

Premium travel/editorial ощущается за счёт **whitespace**, а не градиентов, glass и неона.

- Больше отступа между секциями, чем внутри карточки.
- Группировать связанные поля (откуда+куда, туда+обратно).
- Не заполнять пустоту лишними иконками, бейджами, обводками.

Источник: [NN/g — The Impact of White Space](https://www.nngroup.com/articles/white-space/) (2025): воздух снижает нагрузку и помогает группировать.  
Источник: [Material Design 3 — Applying layout](https://m3.material.io/foundations/layout/applying-layout/window-size-classes): 8dp-сетка, согласованные отступы.  
Референс настроения (не копировать макет): [Codrops — Spain Collection](https://tympanus.net/codrops/2025/07/15/case-study-crafting-a-unique-visual-system-for-the-spain-collection-website/), [Abduzeedo — Here & Away](https://abduzeedo.com/here-and-away-editorial-design-travel).

## 3. Формы читаются как разговор, не как панель приборов

- Видимые **label** над полем, не только placeholder.
- Одна колонка на мобиле; связанные поля можно в ряд на desktop.
- Не растягивать search-форму на всю ширину большого экрана — она теряет «якорь».

Источник: [NN/g — Web Form Design Guidelines](https://www.nngroup.com/articles/web-form-design-guidelines-original/) и [Top 10 Guidelines](https://www.nngroup.com/articles/web-form-usability/).  
Источник: [Material 3 — Text fields](https://m3.material.io/components/text-fields/guidelines): не full-bleed поля на wide screens; минимум ~48×48 touch.

## 4. Честная цена и сравнимые результаты

- Цена, которую видят в выдаче, не должна «прыгать» скрытыми сборами на следующем шаге.
- Карточка рейса: цена, пересадки, длительность, багаж — **сравнимы с первого взгляда**.
- Фильтры не прячут, что уже применено.

Источник: [Baymard — Hidden Costs](https://baymard.com/blog/current-state-of-checkout-ux) (~40% бросают checkout из‑за extra costs).  
Источник: [Baymard Airlines UX Benchmark 2025](https://baymard.com/blog/airlines-ux-benchmark-2025) (Lufthansa, Delta, Emirates и др.).  
Источник: [Lyssna — Booking vs Expedia flight search](https://www.lyssna.com/blog/booking-vs-expedia/) (2026): иконки багажа, ясные фильтры, цена.

## 5. Поиск не должен терять контекст

После «назад» / «изменить» города, даты и пассажиры остаются.  
У AVIATOR это уже есть через query (`/?fromIata=…`). **Не ломать.**

Источник: отраслевой паттерн в [PHPTravels — Flight Search UX 2026](https://phptravels.com/blog/best-practices-for-flight-search-functionality-in-2026/); подтверждается бенчмарком Baymard Airlines 2025.

## 6. Простота + контроль

Traveloka-стиль (мало шагов) выигрывает у перегруженных фильтров, если базовый поиск ясен. Мощные фильтры — для тех, кто уже в выдаче.

Источник: [ScienceDirect 2025 — Traveloka vs Tiket.com](https://www.sciencedirect.com/science/article/pii/S1877050925000808).

## 7. Доступность — часть premium, не «потом»

- Контраст текста ≥ 4.5:1 (обычный текст).
- Фокус клавиатуры виден.
- Интерфейс живёт при увеличении текста ~200%.
- Hit area кнопок/полей ≥ 24×24 CSS px (лучше 44–48).

Источник: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — 1.4.3 Contrast, 2.5.8 Target Size (Minimum), 3.3.2 Labels.  
Источник: [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) (2025): Dynamic Type, contrast, Reduce Motion.

## 8. Не копировать чужой бренд

Изучать **принципы** (иерархия, честная цена, ясные даты, сравнимые карточки).  
Макет AVIATOR остаётся своим: глобус + editorial search + существующие секции.

Анти-паттерн: стеклянная капсула, неон, фото вместо глобуса, гигантские pills, второй hero.
