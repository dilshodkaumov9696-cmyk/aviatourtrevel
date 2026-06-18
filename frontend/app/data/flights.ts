export type BadgeTone = "deal" | "time" | "morning" | "exclusive" | "cheap" | "muted";

export interface Tariff {
  handKg: number;
  baggageKg: number | null;
  refundable: boolean;
  changeable: boolean;
  changeFee: number | null; // ₽
}

export interface Flight {
  id: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  aircraft: string;
  departTime: string;
  arriveTime: string;
  arriveDayOffset: number;
  durationMin: number;
  stops: number;
  stopLabel?: string;
  stopCities?: string[];
  pricePerPax: number;
  hasBaggage: boolean;
  baggageLabel: string;
  tariff: Tariff;
  isNight: boolean;
  badges: { label: string; tone: BadgeTone }[];
}

const TEMPLATES: Omit<Flight, "id">[] = [
  {
    airlineCode: "SZ", airlineName: "Somon Air", flightNumber: "SZ 43", aircraft: "Boeing 737-800",
    departTime: "08:30", arriveTime: "09:15", arriveDayOffset: 0, durationMin: 45,
    stops: 0, isNight: false,
    pricePerPax: 3328, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    tariff: { handKg: 5, baggageKg: 20, refundable: true, changeable: true, changeFee: 1500 },
    badges: [{ label: "Выгодная цена", tone: "deal" }, { label: "Удобно по времени", tone: "time" }, { label: "Вылет утром", tone: "morning" }],
  },
  {
    airlineCode: "DP", airlineName: "Pobeda", flightNumber: "DP 407", aircraft: "Boeing 737-800",
    departTime: "22:10", arriveTime: "23:05", arriveDayOffset: 0, durationMin: 55,
    stops: 0, isNight: true,
    pricePerPax: 3290, hasBaggage: false, baggageLabel: "Только ручная кладь",
    tariff: { handKg: 5, baggageKg: null, refundable: false, changeable: false, changeFee: null },
    badges: [{ label: "Дешевле всех", tone: "cheap" }],
  },
  {
    airlineCode: "S7", airlineName: "S7 Airlines", flightNumber: "S7 112", aircraft: "Airbus A320",
    departTime: "06:15", arriveTime: "07:10", arriveDayOffset: 0, durationMin: 55,
    stops: 0, isNight: false,
    pricePerPax: 4100, hasBaggage: false, baggageLabel: "Только ручная кладь",
    tariff: { handKg: 10, baggageKg: null, refundable: false, changeable: true, changeFee: 2000 },
    badges: [{ label: "Вылет утром", tone: "morning" }],
  },
  {
    airlineCode: "SZ", airlineName: "Somon Air", flightNumber: "SZ 41", aircraft: "Boeing 737-800",
    departTime: "18:00", arriveTime: "18:45", arriveDayOffset: 0, durationMin: 45,
    stops: 0, isNight: false,
    pricePerPax: 3328, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    tariff: { handKg: 5, baggageKg: 20, refundable: true, changeable: true, changeFee: 1500 },
    badges: [{ label: "Вылет вечером", tone: "muted" }],
  },
  {
    airlineCode: "S7", airlineName: "S7 Airlines", flightNumber: "S7 118", aircraft: "Airbus A319",
    departTime: "15:20", arriveTime: "16:15", arriveDayOffset: 0, durationMin: 55,
    stops: 0, isNight: false,
    pricePerPax: 4450, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    tariff: { handKg: 10, baggageKg: 20, refundable: true, changeable: true, changeFee: 2000 },
    badges: [{ label: "Удобно по времени", tone: "time" }],
  },
  {
    airlineCode: "HY", airlineName: "Uzbekistan Airways", flightNumber: "HY 502", aircraft: "Boeing 787",
    departTime: "10:30", arriveTime: "14:30", arriveDayOffset: 0, durationMin: 240,
    stops: 1, stopLabel: "Ташкент", stopCities: ["TAS"], isNight: false,
    pricePerPax: 6450, hasBaggage: true, baggageLabel: "Багаж 23 кг",
    tariff: { handKg: 10, baggageKg: 23, refundable: true, changeable: true, changeFee: 3000 },
    badges: [{ label: "Эксклюзив", tone: "exclusive" }],
  },
  {
    airlineCode: "KC", airlineName: "Air Astana", flightNumber: "KC 881", aircraft: "Airbus A321",
    departTime: "07:40", arriveTime: "12:20", arriveDayOffset: 0, durationMin: 280,
    stops: 1, stopLabel: "Алматы", stopCities: ["ALA"], isNight: false,
    pricePerPax: 8200, hasBaggage: true, baggageLabel: "Багаж 23 кг",
    tariff: { handKg: 8, baggageKg: 23, refundable: true, changeable: true, changeFee: 2500 },
    badges: [],
  },
  {
    airlineCode: "B2", airlineName: "Belavia", flightNumber: "B2 774", aircraft: "Embraer E175",
    departTime: "13:00", arriveTime: "20:35", arriveDayOffset: 0, durationMin: 455,
    stops: 1, stopLabel: "Минск", stopCities: ["MSQ"], isNight: false,
    pricePerPax: 7300, hasBaggage: false, baggageLabel: "Только ручная кладь",
    tariff: { handKg: 8, baggageKg: null, refundable: false, changeable: false, changeFee: null },
    badges: [],
  },
  {
    airlineCode: "TK", airlineName: "Turkish Airlines", flightNumber: "TK 415", aircraft: "Boeing 777",
    departTime: "09:00", arriveTime: "06:30", arriveDayOffset: 1, durationMin: 1290,
    stops: 2, stopLabel: "Стамбул, Анкара", stopCities: ["IST", "ESB"], isNight: false,
    pricePerPax: 12500, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    tariff: { handKg: 8, baggageKg: 20, refundable: false, changeable: true, changeFee: 5000 },
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
