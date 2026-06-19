export type BadgeTone = "deal" | "time" | "morning" | "exclusive" | "cheap" | "muted";

export interface Tariff {
  handKg: number;
  baggageKg: number | null;
  refundable: boolean;
  changeable: boolean;
  changeFee: number | null;
}

export interface Flight {
  id: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  aircraft: string;
  fareClass: string; // "Y/UOWSZ"
  seatsLeft: number;
  departTime: string;
  arriveTime: string;
  arriveDayOffset: number;
  departAirportIata?: string;
  arriveAirportIata?: string;
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

export interface Route {
  fromCity: string;
  fromIata: string;
  toCity: string;
  toIata: string;
}

// Один сегмент перелёта (одна посадка)
export interface Segment {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  aircraft: string;
  fromCity: string;
  fromIata: string;
  fromAirport: string;
  toCity: string;
  toIata: string;
  toAirport: string;
  departTime: string;
  departDayOffset: number;
  arriveTime: string;
  arriveDayOffset: number;
  durationMin: number;
}

// Пересадка между сегментами
export interface Layover {
  city: string;
  iata: string;
  airport: string;
  durationMin: number;
  smart: boolean;
}

const TEMPLATES: Omit<Flight, "id">[] = [
  {
    airlineCode: "SZ", airlineName: "Somon Air", flightNumber: "SZ 43", aircraft: "Boeing 737-800",
    fareClass: "Y/UOWSZ", seatsLeft: 9,
    departTime: "08:30", arriveTime: "09:15", arriveDayOffset: 0, durationMin: 45,
    stops: 0, isNight: false,
    pricePerPax: 3328, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    tariff: { handKg: 7, baggageKg: 20, refundable: true, changeable: true, changeFee: 1500 },
    badges: [{ label: "Выгодная цена", tone: "deal" }, { label: "Удобно по времени", tone: "time" }, { label: "Вылет утром", tone: "morning" }],
  },
  {
    airlineCode: "DP", airlineName: "Pobeda", flightNumber: "DP 407", aircraft: "Boeing 737-800",
    fareClass: "O/OZ0R", seatsLeft: 4,
    departTime: "22:10", arriveTime: "23:05", arriveDayOffset: 0, durationMin: 55,
    stops: 0, isNight: true,
    pricePerPax: 3290, hasBaggage: false, baggageLabel: "Только ручная кладь",
    tariff: { handKg: 5, baggageKg: null, refundable: false, changeable: false, changeFee: null },
    badges: [{ label: "Дешевле всех", tone: "cheap" }],
  },
  {
    airlineCode: "S7", airlineName: "S7 Airlines", flightNumber: "S7 112", aircraft: "Airbus A320",
    fareClass: "K/KSFO", seatsLeft: 9,
    departTime: "06:15", arriveTime: "07:10", arriveDayOffset: 0, durationMin: 55,
    stops: 0, isNight: false,
    pricePerPax: 4100, hasBaggage: false, baggageLabel: "Только ручная кладь",
    tariff: { handKg: 10, baggageKg: null, refundable: false, changeable: true, changeFee: 2000 },
    badges: [{ label: "Вылет утром", tone: "morning" }],
  },
  {
    airlineCode: "SZ", airlineName: "Somon Air", flightNumber: "SZ 41", aircraft: "Boeing 737-800",
    fareClass: "Y/UOWSZ", seatsLeft: 7,
    departTime: "18:00", arriveTime: "18:45", arriveDayOffset: 0, durationMin: 45,
    stops: 0, isNight: false,
    pricePerPax: 3328, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    tariff: { handKg: 7, baggageKg: 20, refundable: true, changeable: true, changeFee: 1500 },
    badges: [{ label: "Вылет вечером", tone: "muted" }],
  },
  {
    airlineCode: "S7", airlineName: "S7 Airlines", flightNumber: "S7 118", aircraft: "Airbus A319",
    fareClass: "M/MSFO", seatsLeft: 9,
    departTime: "15:20", arriveTime: "16:15", arriveDayOffset: 0, durationMin: 55,
    stops: 0, isNight: false,
    pricePerPax: 4450, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    tariff: { handKg: 10, baggageKg: 20, refundable: true, changeable: true, changeFee: 2000 },
    badges: [{ label: "Удобно по времени", tone: "time" }],
  },
  {
    airlineCode: "HY", airlineName: "Uzbekistan Airways", flightNumber: "HY 502", aircraft: "Airbus A320-200 Neo",
    fareClass: "Q/QOWUZ", seatsLeft: 6,
    departTime: "10:30", arriveTime: "14:30", arriveDayOffset: 0, durationMin: 240,
    stops: 1, stopLabel: "Ташкент", stopCities: ["TAS"], isNight: false,
    pricePerPax: 6450, hasBaggage: true, baggageLabel: "Багаж 23 кг",
    tariff: { handKg: 10, baggageKg: 23, refundable: true, changeable: true, changeFee: 3000 },
    badges: [{ label: "Эксклюзив", tone: "exclusive" }],
  },
  {
    airlineCode: "KC", airlineName: "Air Astana", flightNumber: "KC 132", aircraft: "Airbus A321",
    fareClass: "K/KSFO", seatsLeft: 9,
    departTime: "07:40", arriveTime: "12:20", arriveDayOffset: 0, durationMin: 280,
    stops: 1, stopLabel: "Алматы", stopCities: ["ALA"], isNight: false,
    pricePerPax: 8200, hasBaggage: true, baggageLabel: "Багаж 23 кг",
    tariff: { handKg: 8, baggageKg: 23, refundable: true, changeable: true, changeFee: 2500 },
    badges: [],
  },
  {
    airlineCode: "B2", airlineName: "Belavia", flightNumber: "B2 774", aircraft: "Embraer E175",
    fareClass: "T/TOWB2", seatsLeft: 5,
    departTime: "13:00", arriveTime: "20:35", arriveDayOffset: 0, durationMin: 455,
    stops: 1, stopLabel: "Минск", stopCities: ["MSQ"], isNight: false,
    pricePerPax: 7300, hasBaggage: false, baggageLabel: "Только ручная кладь",
    tariff: { handKg: 8, baggageKg: null, refundable: false, changeable: false, changeFee: null },
    badges: [],
  },
  {
    airlineCode: "TK", airlineName: "Turkish Airlines", flightNumber: "TK 415", aircraft: "Boeing 777",
    fareClass: "O/OH0R34", seatsLeft: 9,
    departTime: "09:00", arriveTime: "06:30", arriveDayOffset: 1, durationMin: 1290,
    stops: 2, stopLabel: "Стамбул, Анкара", stopCities: ["IST", "ESB"], isNight: false,
    pricePerPax: 12500, hasBaggage: true, baggageLabel: "Багаж 20 кг",
    tariff: { handKg: 8, baggageKg: 20, refundable: false, changeable: true, changeFee: 5000 },
    badges: [],
  },
];

export function getFlights(): Flight[] {
  const departAirports = ["SVO", "DME", "VKO"];
  const arriveAirports = ["IST", "SAW"];
  return TEMPLATES.map((t, i) => ({
    ...t,
    id: `f${i}`,
    departAirportIata: t.departAirportIata ?? departAirports[i % departAirports.length],
    arriveAirportIata: t.arriveAirportIata ?? arriveAirports[i % arriveAirports.length],
  }));
}

export const AIRLINES = Array.from(
  new Map(TEMPLATES.map((t) => [t.airlineCode, t.airlineName])).entries()
).map(([code, name]) => ({ code, name }));

// Названия аэропортов (позже из API)
export const AIRPORT_NAMES: Record<string, string> = {
  DYU: "Аэропорт Душанбе",
  LBD: "Аэропорт Худжанд",
  TAS: "Ташкент Южный",
  ALA: "Алматы Интернешнл",
  MSQ: "Минск Национальный",
  IST: "Стамбул Аэропорт",
  ESB: "Анкара Эсенбога",
  MOW: "Москва",
  SVO: "Шереметьево",
  DME: "Домодедово",
  VKO: "Внуково",
  SAW: "Сабиха Гёкчен",
  GYD: "Гейдар Алиев",
  OVB: "Толмачёво",
};

export function airportName(iata: string, city: string): string {
  return AIRPORT_NAMES[iata] ?? `Аэропорт ${city}`;
}

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

const WD = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const MON = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export function dateShort(iso: string, addDays = 0): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + addDays);
  return `${dt.getDate()} ${MON[dt.getMonth()]}, ${WD[dt.getDay()]}`;
}

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fromMin(total: number): { time: string; dayOffset: number } {
  const dayOffset = Math.floor(total / 1440);
  const mm = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(mm / 60);
  const m = mm % 60;
  return { time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`, dayOffset };
}

// Строим посегментный маршрут с пересадками из рейса + маршрута поиска
export function buildItinerary(f: Flight, route: Route): { segments: Segment[]; layovers: Layover[] } {
  const stopIatas = f.stopCities ?? [];
  const stopNames = (f.stopLabel ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const points = [
    { iata: route.fromIata, city: route.fromCity },
    ...stopIatas.map((iata, i) => ({ iata, city: stopNames[i] ?? iata })),
    { iata: route.toIata, city: route.toCity },
  ];

  const legCount = points.length - 1;
  const layoverMin = legCount > 1 ? 120 : 0;
  const totalLayover = layoverMin * (legCount - 1);
  const flying = Math.max(legCount * 40, f.durationMin - totalLayover);
  const legMin = Math.round(flying / legCount);

  const baseNum = parseInt((f.flightNumber.split(" ")[1] ?? "100"), 10) || 100;

  const segments: Segment[] = [];
  const layovers: Layover[] = [];
  let cursor = toMin(f.departTime);

  for (let i = 0; i < legCount; i++) {
    const a = points[i];
    const b = points[i + 1];
    const isLast = i === legCount - 1;

    const dep = fromMin(cursor);
    // Последний сегмент прибывает точно в заявленное время рейса
    const arr = isLast
      ? { time: f.arriveTime, dayOffset: f.arriveDayOffset }
      : fromMin(cursor + legMin);
    const segDur = isLast
      ? (f.arriveDayOffset * 1440 + toMin(f.arriveTime)) - cursor
      : legMin;

    segments.push({
      airlineCode: f.airlineCode,
      airlineName: f.airlineName,
      flightNumber: legCount === 1 ? f.flightNumber : `${f.airlineCode} ${baseNum + i}`,
      aircraft: f.aircraft,
      fromCity: a.city, fromIata: a.iata, fromAirport: airportName(a.iata, a.city),
      toCity: b.city, toIata: b.iata, toAirport: airportName(b.iata, b.city),
      departTime: dep.time, departDayOffset: dep.dayOffset,
      arriveTime: arr.time, arriveDayOffset: arr.dayOffset,
      durationMin: segDur,
    });

    cursor += legMin;
    if (!isLast) {
      layovers.push({
        city: b.city, iata: b.iata, airport: airportName(b.iata, b.city),
        durationMin: layoverMin, smart: layoverMin >= 180,
      });
      cursor += layoverMin;
    }
  }

  return { segments, layovers };
}
