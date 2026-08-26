/**
 * DEMO FIXTURES — не реальные данные Travelpayouts.
 *
 * Используются только как:
 *  1) fallback, когда реальный поиск не вернул результатов (см. SearchResults.tsx);
 *  2) fallback, когда реальный API ответил ошибкой;
 *  3) принудительно, через ?demo=1 (детерминированная ручная проверка интерфейса).
 *
 * Физически отделены от flights.ts (типов и хелперов, которыми пользуются и
 * настоящие данные тоже), чтобы это можно было выпилить из прод-бандла отдельно
 * и чтобы не перепутать demo-условия с реальными.
 *
 * В отличие от реального API (см. lib/api.ts, там условия тарифа честно "unknown"),
 * здесь у каждого рейса ПОЛНЫЕ тестовые условия тарифа — это нужно, чтобы можно было
 * проверить весь UI (багаж piece/weight-based, размеры, ручную кладь, возврат/обмен
 * со штрафами, доп. услуги). Один рейс (#9) намеренно частично "unknown" — чтобы
 * убедиться, что интерфейс корректно показывает "Уточняется" и внутри demo-режима.
 *
 * Аэропорты вылета/прилёта переприсваиваются под фактический маршрут поиска
 * (см. getDemoFlights) — шаблоны не привязаны к конкретному городу жёстко,
 * но подобраны так, чтобы для Москва → Стамбул выглядеть правдоподобно и
 * покрывать: дешёвый/дорогой прямой, 1 и 2 пересадки, все части суток,
 * разные бренды тарифа (Basic/Standard/Flex), багаж 0/1×20/1×23/2×23 кг,
 * разные варианты ручной клади и её размеров, возвратные/невозвратные и
 * обменные/необменные тарифы, разные условия места/питания, оба аэропорта
 * Стамбула (IST/SAW).
 */
import type { Flight } from "./flights";

const TEMPLATES: Omit<Flight, "id">[] = [
  // 1. Дешёвый прямой, утро, Economy Standard: багаж 1×20кг, возврат/обмен со штрафом
  {
    airlineCode: "SZ", airlineName: "Somon Air", flightNumber: "SZ 43", aircraft: "Boeing 737-800",
    fareClass: "Y/UOWSZ", seatsLeft: 9,
    departTime: "08:30", arriveTime: "09:15", arriveDayOffset: 0, durationMin: 45,
    stops: 0, isNight: false,
    pricePerPax: 3328,
    fare: {
      brandName: "Economy Standard", cabin: "economy",
      baggage: { status: "included", pieces: 1, weightPerPieceKg: 20, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: 158, extraPrice: null, extraCurrency: null },
      carryOn: { status: "included", pieces: 1, weightKg: 8, dimensionsCm: { lengthCm: 55, widthCm: 40, heightCm: 20 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "yes", penalty: 1500, currency: "RUB" },
      exchange: { allowed: "yes", penalty: 1500, currency: "RUB" },
      noShow: "Штраф 100% от стоимости тарифа",
      seatSelection: "paid", meal: "included", priorityBoarding: "not_available",
      lounge: "not_available", mileageAccrual: "included", onlineCheckin: "included",
    },
    badges: [{ label: "Выгодная цена", tone: "deal" }, { label: "Вылет утром", tone: "morning" }],
  },
  // 2. Дешёвый прямой, ночь, Economy Basic: без багажа, невозвратный, необменный
  {
    airlineCode: "DP", airlineName: "Pobeda", flightNumber: "DP 407", aircraft: "Boeing 737-800",
    fareClass: "O/OZ0R", seatsLeft: 4,
    departTime: "22:10", arriveTime: "23:05", arriveDayOffset: 0, durationMin: 55,
    stops: 0, isNight: true,
    pricePerPax: 3290,
    fare: {
      brandName: "Economy Basic", cabin: "economy",
      baggage: { status: "not_included", pieces: null, weightPerPieceKg: null, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: null, extraPrice: 1800, extraCurrency: "RUB" },
      carryOn: { status: "included", pieces: 1, weightKg: 10, dimensionsCm: { lengthCm: 36, widthCm: 30, heightCm: 27 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "no", penalty: null, currency: null },
      exchange: { allowed: "no", penalty: null, currency: null },
      noShow: "Билет сгорает без возврата",
      seatSelection: "paid", meal: "not_available", priorityBoarding: "not_available",
      lounge: "not_available", mileageAccrual: "not_available", onlineCheckin: "included",
    },
    badges: [{ label: "Дешевле всех", tone: "cheap" }],
  },
  // 3. Прямой, утро, Economy Basic: багаж не включён, но доступна докупка
  {
    airlineCode: "S7", airlineName: "S7 Airlines", flightNumber: "S7 112", aircraft: "Airbus A320",
    fareClass: "K/KSFO", seatsLeft: 9,
    departTime: "06:15", arriveTime: "07:10", arriveDayOffset: 0, durationMin: 55,
    stops: 0, isNight: false,
    pricePerPax: 4100,
    fare: {
      brandName: "Economy Basic", cabin: "economy",
      baggage: { status: "not_included", pieces: 1, weightPerPieceKg: 23, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: 158, extraPrice: 2200, extraCurrency: "RUB" },
      carryOn: { status: "included", pieces: 1, weightKg: 10, dimensionsCm: { lengthCm: 55, widthCm: 40, heightCm: 23 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "no", penalty: null, currency: null },
      exchange: { allowed: "yes", penalty: 2000, currency: "RUB" },
      noShow: "Условия авиакомпании",
      seatSelection: "paid", meal: "paid", priorityBoarding: "not_available",
      lounge: "not_available", mileageAccrual: "included", onlineCheckin: "included",
    },
    badges: [{ label: "Вылет утром", tone: "morning" }],
  },
  // 4. Прямой, вечер, Economy Flex: бесплатные возврат/обмен, всё включено
  {
    airlineCode: "SZ", airlineName: "Somon Air", flightNumber: "SZ 41", aircraft: "Boeing 737-800",
    fareClass: "Y/UOWSZ", seatsLeft: 7,
    departTime: "18:00", arriveTime: "18:45", arriveDayOffset: 0, durationMin: 45,
    stops: 0, isNight: false,
    pricePerPax: 3328,
    fare: {
      brandName: "Economy Flex", cabin: "economy",
      baggage: { status: "included", pieces: 1, weightPerPieceKg: 20, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: 158, extraPrice: null, extraCurrency: null },
      carryOn: { status: "included", pieces: 1, weightKg: 8, dimensionsCm: { lengthCm: 55, widthCm: 40, heightCm: 20 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "yes", penalty: 0, currency: "RUB" },
      exchange: { allowed: "yes", penalty: 0, currency: "RUB" },
      noShow: "Без штрафа при уведомлении заранее",
      seatSelection: "included", meal: "included", priorityBoarding: "included",
      lounge: "not_available", mileageAccrual: "included", onlineCheckin: "included",
    },
    badges: [{ label: "Гибкий тариф", tone: "exclusive" }],
  },
  // 5. Дорогой прямой, день, Economy Standard — эталонный пример из ТЗ
  {
    airlineCode: "TK", airlineName: "Turkish Airlines", flightNumber: "TK 401", aircraft: "Airbus A321neo",
    fareClass: "H/HOWTK", seatsLeft: 9,
    departTime: "09:15", arriveTime: "14:25", arriveDayOffset: 0, durationMin: 250,
    stops: 0, isNight: false, arriveAirportIata: "IST",
    pricePerPax: 9800,
    fare: {
      brandName: "Economy Standard", cabin: "economy",
      baggage: { status: "included", pieces: 1, weightPerPieceKg: 23, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: 158, extraPrice: null, extraCurrency: null },
      carryOn: { status: "included", pieces: 1, weightKg: 8, dimensionsCm: { lengthCm: 55, widthCm: 40, heightCm: 23 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "yes", penalty: 5000, currency: "RUB" },
      exchange: { allowed: "yes", penalty: 3000, currency: "RUB" },
      noShow: "Условия авиакомпании",
      seatSelection: "paid", meal: "included", priorityBoarding: "not_available",
      lounge: "not_available", mileageAccrual: "included", onlineCheckin: "included",
    },
    badges: [{ label: "Удобно по времени", tone: "time" }],
  },
  // 6. Самый дорогой прямой, флагман, Economy Flex: 2×23кг, всё включено
  {
    airlineCode: "TK", airlineName: "Turkish Airlines", flightNumber: "TK 405", aircraft: "Boeing 787-9",
    fareClass: "Y/YOWTK", seatsLeft: 3,
    departTime: "19:40", arriveTime: "00:55", arriveDayOffset: 1, durationMin: 255,
    stops: 0, isNight: true, arriveAirportIata: "IST",
    pricePerPax: 14200,
    fare: {
      brandName: "Economy Flex", cabin: "economy",
      baggage: { status: "included", pieces: 2, weightPerPieceKg: 23, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: 158, extraPrice: null, extraCurrency: null },
      carryOn: { status: "included", pieces: 1, weightKg: 8, dimensionsCm: { lengthCm: 55, widthCm: 40, heightCm: 23 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "yes", penalty: 0, currency: "RUB" },
      exchange: { allowed: "yes", penalty: 0, currency: "RUB" },
      noShow: "Без штрафа",
      seatSelection: "included", meal: "included", priorityBoarding: "included",
      lounge: "included", mileageAccrual: "included", onlineCheckin: "included",
    },
    badges: [{ label: "Гибкий тариф", tone: "exclusive" }],
  },
  // 7. Прямой в Сабиха Гёкчен (SAW), Economy Basic: без багажа, необменный
  {
    airlineCode: "PC", airlineName: "Pegasus", flightNumber: "PC 219", aircraft: "Boeing 737 MAX 8",
    fareClass: "T/TOWPC", seatsLeft: 9,
    departTime: "13:05", arriveTime: "17:55", arriveDayOffset: 0, durationMin: 230,
    stops: 0, isNight: false, arriveAirportIata: "SAW",
    pricePerPax: 5600,
    fare: {
      brandName: "Economy Basic", cabin: "economy",
      baggage: { status: "not_included", pieces: null, weightPerPieceKg: null, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: null, extraPrice: null, extraCurrency: null },
      carryOn: { status: "included", pieces: 1, weightKg: 8, dimensionsCm: { lengthCm: 40, widthCm: 30, heightCm: 15 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "no", penalty: null, currency: null },
      exchange: { allowed: "yes", penalty: 1800, currency: "RUB" },
      noShow: "Условия авиакомпании",
      seatSelection: "paid", meal: "paid", priorityBoarding: "not_available",
      lounge: "not_available", mileageAccrual: "not_available", onlineCheckin: "included",
    },
    badges: [],
  },
  // 8. 1 пересадка (Ташкент), Economy Standard: багаж включён, возврат/обмен со штрафом
  {
    airlineCode: "HY", airlineName: "Uzbekistan Airways", flightNumber: "HY 502", aircraft: "Airbus A320-200 Neo",
    fareClass: "Q/QOWUZ", seatsLeft: 6,
    departTime: "10:30", arriveTime: "17:30", arriveDayOffset: 0, durationMin: 420,
    stops: 1, stopLabel: "Ташкент", stopCities: ["TAS"], isNight: false, arriveAirportIata: "IST",
    pricePerPax: 6450,
    fare: {
      brandName: "Economy Standard", cabin: "economy",
      baggage: { status: "included", pieces: 1, weightPerPieceKg: 23, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: 158, extraPrice: null, extraCurrency: null },
      carryOn: { status: "included", pieces: 1, weightKg: 10, dimensionsCm: { lengthCm: 55, widthCm: 40, heightCm: 25 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "yes", penalty: 3000, currency: "RUB" },
      exchange: { allowed: "yes", penalty: 3000, currency: "RUB" },
      noShow: "Условия авиакомпании",
      seatSelection: "paid", meal: "included", priorityBoarding: "not_available",
      lounge: "not_available", mileageAccrual: "included", onlineCheckin: "included",
    },
    badges: [{ label: "Эксклюзив", tone: "exclusive" }],
  },
  // 9. 1 пересадка (Алматы), SAW — намеренно частично "Уточняется": проверка UI unknown-состояний
  {
    airlineCode: "KC", airlineName: "Air Astana", flightNumber: "KC 132", aircraft: "Airbus A321",
    fareClass: "K/KSFO", seatsLeft: 9,
    departTime: "07:40", arriveTime: "13:20", arriveDayOffset: 0, durationMin: 340,
    stops: 1, stopLabel: "Алматы", stopCities: ["ALA"], isNight: false, arriveAirportIata: "SAW",
    pricePerPax: 8200,
    fare: {
      brandName: "Economy Basic", cabin: "economy",
      baggage: { status: "not_included", pieces: null, weightPerPieceKg: null, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: null, extraPrice: null, extraCurrency: null },
      carryOn: { status: "unknown", pieces: null, weightKg: null, dimensionsCm: null, extraPrice: null, extraCurrency: null },
      refund: { allowed: "no", penalty: null, currency: null },
      exchange: { allowed: "unknown", penalty: null, currency: null },
      noShow: null,
      seatSelection: "unknown", meal: "unknown", priorityBoarding: "unknown",
      lounge: "unknown", mileageAccrual: "unknown", onlineCheckin: "unknown",
    },
    badges: [],
  },
  // 10. 1 пересадка (Минск), ночной вылет, Economy Standard: 1×20кг, необменный
  {
    airlineCode: "B2", airlineName: "Belavia", flightNumber: "B2 774", aircraft: "Embraer E175",
    fareClass: "T/TOWB2", seatsLeft: 5,
    departTime: "01:00", arriveTime: "08:35", arriveDayOffset: 0, durationMin: 455,
    stops: 1, stopLabel: "Минск", stopCities: ["MSQ"], isNight: true, arriveAirportIata: "IST",
    pricePerPax: 7300,
    fare: {
      brandName: "Economy Standard", cabin: "economy",
      baggage: { status: "included", pieces: 1, weightPerPieceKg: 20, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: 140, extraPrice: null, extraCurrency: null },
      carryOn: { status: "included", pieces: 1, weightKg: 8, dimensionsCm: { lengthCm: 55, widthCm: 40, heightCm: 20 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "no", penalty: null, currency: null },
      exchange: { allowed: "yes", penalty: 2500, currency: "RUB" },
      noShow: "Условия авиакомпании",
      seatSelection: "paid", meal: "included", priorityBoarding: "not_available",
      lounge: "not_available", mileageAccrual: "included", onlineCheckin: "included",
    },
    badges: [],
  },
  // 11. 2 пересадки (Минск, Баку), Economy Standard: багаж включён, необменный дешевле
  {
    airlineCode: "SU", airlineName: "Аэрофлот", flightNumber: "SU 1963", aircraft: "Airbus A330",
    fareClass: "O/OH0R34", seatsLeft: 9,
    departTime: "05:20", arriveTime: "16:45", arriveDayOffset: 0, durationMin: 685,
    stops: 2, stopLabel: "Минск, Баку", stopCities: ["MSQ", "GYD"], isNight: false, arriveAirportIata: "IST",
    pricePerPax: 11800,
    fare: {
      brandName: "Economy Standard", cabin: "economy",
      baggage: { status: "included", pieces: 1, weightPerPieceKg: 23, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: 158, extraPrice: null, extraCurrency: null },
      carryOn: { status: "included", pieces: 1, weightKg: 10, dimensionsCm: { lengthCm: 55, widthCm: 40, heightCm: 25 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "no", penalty: null, currency: null },
      exchange: { allowed: "yes", penalty: 4000, currency: "RUB" },
      noShow: "Условия авиакомпании",
      seatSelection: "paid", meal: "included", priorityBoarding: "paid",
      lounge: "not_available", mileageAccrual: "included", onlineCheckin: "included",
    },
    badges: [],
  },
  // 12. 2 пересадки (Стамбул, Анкара), самый долгий и дорогой из 2-стопных
  {
    airlineCode: "TK", airlineName: "Turkish Airlines", flightNumber: "TK 415", aircraft: "Boeing 777",
    fareClass: "O/OH0R34", seatsLeft: 9,
    departTime: "09:00", arriveTime: "06:30", arriveDayOffset: 1, durationMin: 1290,
    stops: 2, stopLabel: "Стамбул, Анкара", stopCities: ["IST", "ESB"], isNight: false, arriveAirportIata: "IST",
    pricePerPax: 12500,
    fare: {
      brandName: "Economy Standard", cabin: "economy",
      baggage: { status: "included", pieces: 1, weightPerPieceKg: 20, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: 158, extraPrice: null, extraCurrency: null },
      carryOn: { status: "included", pieces: 1, weightKg: 8, dimensionsCm: { lengthCm: 55, widthCm: 40, heightCm: 23 }, extraPrice: null, extraCurrency: null },
      refund: { allowed: "no", penalty: null, currency: null },
      exchange: { allowed: "yes", penalty: 5000, currency: "RUB" },
      noShow: "Условия авиакомпании",
      seatSelection: "paid", meal: "included", priorityBoarding: "not_available",
      lounge: "not_available", mileageAccrual: "included", onlineCheckin: "included",
    },
    badges: [],
  },
];

/**
 * DEMO fallback: аэропорты вылета/прилёта переприсваиваются под реальный
 * маршрут поиска (departIatas/arriveIatas из HUB_AIRPORTS), иначе рейсы,
 * подписанные под Стамбул, не прошли бы фильтр по аэропорту для другого
 * города назначения и выдало бы «0 рейсов».
 *
 * ⚠️ Это НЕ данные Travelpayouts. Не подмешивать к реальным результатам API —
 * вызывается только как fallback, когда реальных данных нет или запрос упал,
 * либо принудительно через ?demo=1.
 */
export function getDemoFlights(departIatas?: string[], arriveIatas?: string[]): Flight[] {
  const departAirports = departIatas?.length ? departIatas : ["SVO", "DME", "VKO"];
  const arriveAirports = arriveIatas?.length ? arriveIatas : ["IST", "SAW"];
  return TEMPLATES.map((t, i) => ({
    ...t,
    id: `demo-${i}`,
    departAirportIata: t.departAirportIata ?? departAirports[i % departAirports.length],
    arriveAirportIata: t.arriveAirportIata ?? arriveAirports[i % arriveAirports.length],
  }));
}

export const DEMO_AIRLINES = Array.from(
  new Map(TEMPLATES.map((t) => [t.airlineCode, t.airlineName])).entries()
).map(([code, name]) => ({ code, name }));
