# Responsive + accessibility

## Брейкпоинты (ориентир)

- < 640px: одна колонка. Search поля стеком. Глобус сохраняет высоту, не схлопывается в 80px.
- 640–1024: форма может быть 2×2 (маршрут / даты), CTA на всю ширину колонки формы.
- ≥ 1024: форма в один ряд **если** поля не сжимаются ниже ~140px. Иначе перенос, не микро-поля.

Источник: [Material 3 window size classes](https://m3.material.io/foundations/layout/applying-layout/window-size-classes).

## Touch

- Кнопки, swap, +/- пассажиры, дни календаря: **44–48px**.
- WCAG минимум 24×24 с отступом ([2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum)).
- Не вешать клик только на иконку 16px.

Источник: Material 3 48dp; [Apple HIG — Layout / hit targets](https://developer.apple.com/design/human-interface-guidelines/layout) (исторически ~44pt).

## Mobile search

- Стекать, не горизонт-скролл всей формы.
- Календарь и пассажиры — sheet/popover существующий, на весь ширина экрана.
- Primary CTA «Найти» всегда видима после заполнения (в конце формы, не уехала за клавиатуру без scroll).

## Mobile results

- Фильтры: кнопка «Фильтры» + bottom sheet, не узкая колонка 120px.
- Карточка: цена не должна выпадать за правый край; CTA на всю ширину карточки.
- Не отключать popular / Why Us на мобиле — только стек.

## Глобус на мобиле

Оставить. Уменьшить высоту секции, не `display:none`.  
Reduce Motion: уважать `prefers-reduced-motion` для авто-вращения, если уже есть хук — не убирать глобус.

Источник: [Apple HIG — Accessibility / Motion](https://developer.apple.com/design/human-interface-guidelines/accessibility).  
Источник: [WCAG 2.2 — 2.3.3 Animation from Interactions](https://www.w3.org/TR/WCAG22/#animation-from-interactions) (AAA, но Reduce Motion — хорошая практика).

## Accessibility checklist

- [ ] Контраст текста 4.5:1, UI 3:1  
- [ ] Видимый focus  
- [ ] Label у каждого контрола (не только placeholder)  
- [ ] `html lang="ru"` (уже в layout — не снимать)  
- [ ] Картинки направлений: осмысленный `alt`  
- [ ] Клавиатура: поиск, autocomplete, календарь, результаты  
- [ ] Текст увеличивается ~200% без обрезки CTA  
- [ ] Ошибки связаны с полем (`aria-describedby` / текст под полем)

Источник: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).  
Источник: [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) (200% text, contrast, Dynamic Type).  
Источник: [Material a11y в компонентах](https://m3.material.io/components/text-fields/guidelines).

## Чего не делать

- Не `overflow: hidden` на hero, если это режет focus ring или календарь.
- Не фиксировать высоту текстовых блоков в px так, что кириллица обрезается.
- Не уменьшать тач-цели, чтобы «влезло как на desktop».
