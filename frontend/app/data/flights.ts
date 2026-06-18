// Мок-данные рейсов для страницы результатов. Позже заменим на ответ API (affiliate).

export type BadgeTone = "deal" | "time" | "morning" | "exclusive" | "cheap" | "muted";

export interface Flight {
  id: string;
  airlineCode: string;
  airlineName: string;
  departTime: string;
  arriveTime: string;
  arriveDayOffset: number; // +1 если прилёт на следующий день
  durationMin: number;
  stops: number; // 0 = прямой
  stopLabel?: string; // "Ташкент" / "Минск" / "Стамбул, Анкара"
  pricePerPax: number;
  hasBaggage: boolean;
  baggageLabel: string;
  badges: { label: string; tone: BadgeTone }[];
}

const TEMPLATES: Omit<Flight, "id">[] = [
  {
    airlineCode: "SZ", airlineName: "Somon Air",
    departTime: "08:30", arriveTime: "09:15", arriveDayOffset: 0, durationMin: 45,
    stops: 0, pricePerPax: 3328, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    badges: [{ label: "Выгодная цена", tone: "deal" }, { label: "Удобно по времени", tone: "time" }, { label: "Вылет утром", tone: "morning" }],
  },
  {
    airlineCode: "DP", airlineName: "Pobeda",
    departTime: "22:10", arriveTime: "23:05", arriveDayOffset: 0, durationMin: 55,
    stops: 0, pricePerPax: 3290, hasBaggage: false, baggageLabel: "Только ручная кладь",
    badges: [{ label: "Дешевле всех", tone: "cheap" }],
  },
  {
    airlineCode: "S7", airlineName: "S7 Airlines",
    departTime: "06:15", arriveTime: "07:10", arriveDayOffset: 0, durationMin: 55,
    stops: 0, pricePerPax: 4100, hasBaggage: false, baggageLabel: "Только ручная кладь",
    badges: [{ label: "Вылет утром", tone: "morning" }],
  },
  {
    airlineCode: "SZ", airlineName: "Somon Air",
    departTime: "18:00", arriveTime: "18:45", arriveDayOffset: 0, durationMin: 45,
    stops: 0, pricePerPax: 3328, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    badges: [{ label: "Вылет вечером", tone: "muted" }],
  },
  {
    airlineCode: "S7", airlineName: "S7 Airlines",
    departTime: "15:20", arriveTime: "16:15", arriveDayOffset: 0, durationMin: 55,
    stops: 0, pricePerPax: 4450, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    badges: [{ label: "Удобно по времени", tone: "time" }],
  },
  {
    airlineCode: "HY", airlineName: "Uzbekistan Airways",
    departTime: "10:30", arriveTime: "14:30", arriveDayOffset: 0, durationMin: 240,
    stops: 1, stopLabel: "Ташкент", pricePerPax: 6450, hasBaggage: true, baggageLabel: "Багаж 23 кг",
    badges: [{ label: "Лазейка", tone: "exclusive" }],
  },
  {
    airlineCode: "KC", airlineName: "Air Astana",
    departTime: "07:40", arriveTime: "12:20", arriveDayOffset: 0, durationMin: 280,
    stops: 1, stopLabel: "Алматы", pricePerPax: 8200, hasBaggage: true, baggageLabel: "Багаж 23 кг",
    badges: [],
  },
  {
    airlineCode: "B2", airlineName: "Belavia",
    departTime: "13:00", arriveTime: "20:35", arriveDayOffset: 0, durationMin: 455,
    stops: 1, stopLabel: "Минск", pricePerPax: 7300, hasBaggage: false, baggageLabel: "Только ручная кладь",
    badges: [],
  },
  {
    airlineCode: "TK", airlineName: "Turkish Airlines",
    departTime: "09:00", arriveTime: "06:30", arriveDayOffset: 1, durationMin: 1290,
    stops: 2, stopLabel: "Стамбул, Анкара", pricePerPax: 12500, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    badges: [],
  },
];

export function getFlights(): Flight[] {
  return TEMPLATES.map((t, i) => ({ ...t, id: `f${i}` }));
}

export const AIRLINES = Array.from(
  new Map(TEMPLATES.map((t) => [t.airlineCode, t.airlineName])).entries()
).map(([code, name]) => ({ code, name }));

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

export function stopsLabel(stops: number): string {
  if (stops === 0) return "прямой";
  if (stops === 1) return "1 пересадка";
  return `${stops} пересадки`;
}
