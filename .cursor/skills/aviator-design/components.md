# Компоненты: buttons, forms, cards

Править **классы/токены** существующих компонентов. Не заменять их новыми виджетами с другой логикой.

## Кнопки

- **Primary:** заливка `--color-primary`, текст белый, радиус как `--radius-md` (не stadium).
- **Secondary / ghost:** граница + ink, для «Назад», «Сбросить фильтры».
- Одна primary на группу действий.
- Высота **44–48px**. Не 32px «изящные» CTA.

Источник: [Material 3 — Buttons](https://m3.material.io/components/buttons/guidelines): одна prominent button; 48dp touch.  
Источник: [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons): ясная иерархия кнопок.  
Источник: [WCAG 2.2 — 2.5.8 Target Size](https://www.w3.org/TR/WCAG22/#target-size-minimum) ≥ 24×24 (цель AVIATOR — 44–48).

## Поля и search controls

Уже есть: `AirportInput`, календарь, пассажиры. Не переписывать поведение.

Визуал:

- Label **над** полем, всегда видимый (Откуда, Куда, Туда, Обратно, Пассажиры).
- Placeholder = пример («MOW, Берлин»), не единственная подпись.
- Одинаковая высота полей в одном ряду.
- Autocomplete: клавиатура ↑↓ / Enter, активный пункт контрастен.
- Swap origin/destination — отдельная 44px кнопка с `aria-label`.

Источник: [NN/g — form labels / white space](https://www.nngroup.com/articles/form-design-white-space/).  
Источник: [Material 3 — Text fields](https://m3.material.io/components/text-fields/guidelines).  
Источник: [WCAG 2.2 — 3.3.2 Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions).

## Календарь дат

- Календарь для ближайших дат **и** возможность ввести дату (не только пикер).
- Видно месяц целиком; disabled прошлые дни.
- Туда/обратно как пара, не два несвязанных виджета.
- Не прятать календарь за «flexible dates» как единственный режим.

Источник: [NN/g — Date-Input Form Fields](https://www.nngroup.com/articles/date-input/).

## Пассажиры

Stepper (+/−) с подписями взрослых/дети/младенцы.  
Не выпадающий список на 20 пунктов без пояснения.  
Hit area на +/− — 44px.

## Карточки

**Направления / Why Us:** белая поверхность, тонкая граница, мало тени, фото или иконка не спорят с заголовком.

**FlightCard (выдача):**

Сканируемые колонки (принцип, не чужой макет):

1. Время вылета → прилёта + IATA  
2. Длительность / пересадки  
3. Багаж (есть / нет / ручная)  
4. Цена + перевозчик  
5. CTA «Выбрать»

Цена визуально якорится в одном месте на всех карточках.

Источник: [Lyssna — baggage + price clarity](https://www.lyssna.com/blog/booking-vs-expedia/).  
Источник: [Baymard Airlines 2025](https://baymard.com/blog/airlines-ux-benchmark-2025).  
Источник: [PHPTravels flight search 2026](https://phptravels.com/blog/best-practices-for-flight-search-functionality-in-2026/) — comparable results.

## Фильтры

- Показывать **применённые** чипы (пересадки, багаж, время).
- Комбинируются, не взаимоисключающие без нужды.
- Счётчик «N рейсов» обновляется — не пустой экран без объяснения.

Не менять API фильтров. Только ясность UI.

## Фокус и клавиатура

`:focus-visible` ring 2px.  
Модалки календаря/пассажиров: focus trap + Escape (если уже есть — не ломать).

Источник: [WCAG 2.2 — 2.4.7 Focus Visible](https://www.w3.org/TR/WCAG22/#focus-visible); Apple HIG Accessibility.
