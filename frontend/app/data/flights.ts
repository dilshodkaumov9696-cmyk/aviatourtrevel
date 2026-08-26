export type BadgeTone = "deal" | "time" | "morning" | "exclusive" | "cheap" | "muted";

/**
 * Доступность услуги/багажа. "unknown" — источник (реальный API) не предоставил
 * значение. Это НЕ "нет" — намеренно отдельное состояние, чтобы UI показывал
 * "Уточняется", а не выдумывал "included"/"not_included" там, где мы не знаем.
 */
export type Availability = "included" | "not_included" | "unknown";
/** То же самое, но для услуг, которые бывают платными отдельно от вкл./выкл. */
export type ServiceLevel = "included" | "paid" | "not_available" | "unknown";
export type YesNoUnknown = "yes" | "no" | "unknown";

export interface Dimensions3D {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

/** Зарегистрированный багаж. Условия конкретного Flight/тарифа, НЕ авиакомпании в целом. */
export interface BaggageAllowance {
  status: Availability;
  /** Piece-based: сколько мест багажа разрешено (1, 2…). null — неизвестно/неприменимо. */
  pieces: number | null;
  /** Вес одного места, если норма piece-based (напр. 23 при "1 × 23 кг"). */
  weightPerPieceKg: number | null;
  /** Weight-based норма без разбивки на места (напр. просто "20 кг"), если источник даёт только так. */
  totalWeightKg: number | null;
  dimensionsCm: Dimensions3D | null;
  /** Сумма трёх измерений одного места (напр. 158 см), если источник даёт только так. */
  maxTotalLinearCm: number | null;
  /** Стоимость докупки места багажа сверх нормы, если источник её даёт. */
  extraPrice: number | null;
  extraCurrency: string | null;
}

/** Ручная кладь. Намеренно отдельный тип от BaggageAllowance — их нельзя путать. */
export interface CarryOnAllowance {
  status: Availability;
  pieces: number | null;
  weightKg: number | null;
  dimensionsCm: Dimensions3D | null;
  extraPrice: number | null;
  extraCurrency: string | null;
}

export interface RefundExchangeTerm {
  allowed: YesNoUnknown;
  /** null при allowed="yes" = бесплатно; null при allowed="unknown" = не указано поставщиком. */
  penalty: number | null;
  currency: string | null;
}

/** Условия конкретного тарифа конкретного рейса (не общее правило авиакомпании). */
export interface FareConditions {
  /** "Economy Basic" / "Economy Standard" / "Economy Flex"… null → показываем общий "Эконом". */
  brandName: string | null;
  cabin: "economy" | "business" | "first" | null;
  baggage: BaggageAllowance;
  carryOn: CarryOnAllowance;
  refund: RefundExchangeTerm;
  exchange: RefundExchangeTerm;
  /** Условия при неявке на рейс, свободный текст поставщика. null — не указано. */
  noShow: string | null;
  seatSelection: ServiceLevel;
  meal: ServiceLevel;
  priorityBoarding: ServiceLevel;
  lounge: ServiceLevel;
  mileageAccrual: ServiceLevel;
  onlineCheckin: ServiceLevel;
}

/** Полностью "неизвестно" — источник не дал условий тарифа. Не выдумываем significant/false. */
export const UNKNOWN_FARE: FareConditions = {
  brandName: null,
  cabin: null,
  baggage: { status: "unknown", pieces: null, weightPerPieceKg: null, totalWeightKg: null, dimensionsCm: null, maxTotalLinearCm: null, extraPrice: null, extraCurrency: null },
  carryOn: { status: "unknown", pieces: null, weightKg: null, dimensionsCm: null, extraPrice: null, extraCurrency: null },
  refund: { allowed: "unknown", penalty: null, currency: null },
  exchange: { allowed: "unknown", penalty: null, currency: null },
  noShow: null,
  seatSelection: "unknown",
  meal: "unknown",
  priorityBoarding: "unknown",
  lounge: "unknown",
  mileageAccrual: "unknown",
  onlineCheckin: "unknown",
};

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
  /** Условия тарифа этого конкретного рейса. UNKNOWN_FARE, если источник их не дал. */
  fare: FareConditions;
  isNight: boolean;
  badges: { label: string; tone: BadgeTone }[];
  bookingUrl?: string;
}

/** "С багажом" в фильтрах — это именно baggage.status === "included", не "любое непустое поле". */
export function baggageIncluded(f: Flight): boolean {
  return f.fare.baggage.status === "included";
}

export function baggageShortLabel(b: BaggageAllowance): string {
  if (b.status === "unknown") return "Уточняется";
  if (b.status === "not_included") return b.extraPrice != null ? "Багаж платно" : "Без багажа";
  if (b.pieces && b.weightPerPieceKg) return `${b.pieces} × ${b.weightPerPieceKg} кг`;
  if (b.totalWeightKg) return `${b.totalWeightKg} кг`;
  return "Включён";
}

export function carryOnShortLabel(c: CarryOnAllowance): string {
  if (c.status === "unknown") return "Уточняется";
  if (c.status === "not_included") return c.extraPrice != null ? "Платно" : "Не включена";
  if (c.pieces && c.weightKg) return `${c.pieces} × ${c.weightKg} кг`;
  if (c.weightKg) return `${c.weightKg} кг`;
  return "Включена";
}

/** Короткая сводка багажа для передачи в booking flow (BookingPage.tsx читает только строку). */
export function baggageSummaryForBooking(f: Flight): string {
  return baggageShortLabel(f.fare.baggage);
}

export function serviceLevelLabel(level: ServiceLevel): string {
  if (level === "included") return "Включено";
  if (level === "paid") return "Платно";
  if (level === "not_available") return "Недоступно";
  return "Уточняется";
}

export function dimensionsSummary(dims: Dimensions3D | null, maxLinearCm: number | null): string | undefined {
  if (dims) return `${dims.lengthCm} × ${dims.widthCm} × ${dims.heightCm} см`;
  if (maxLinearCm) return `${maxLinearCm} см по сумме измерений`;
  return undefined;
}

export function refundExchangeLabel(term: RefundExchangeTerm, kind: "refund" | "exchange"): string {
  const verb = kind === "refund" ? "Возврат" : "Обмен";
  if (term.allowed === "unknown") return `${verb} уточняется`;
  if (term.allowed === "no") return kind === "refund" ? "Невозвратный" : "Без обмена";
  return term.penalty ? `${verb} со штрафом` : `${verb} разрешён`;
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

// Demo-фикстуры (getDemoFlights/DEMO_AIRLINES) физически вынесены в
// flights.demo.ts — см. комментарий там. Здесь остаются только типы и
// хелперы, которыми пользуются и настоящие данные API тоже.

// Названия аэропортов (позже из API)
export const AIRPORT_NAMES: Record<string, string> = {
  // Центральная Азия
  DYU: "Аэропорт Душанбе",
  LBD: "Аэропорт Худжанд",
  TAS: "Ташкент Южный",
  SKD: "Аэропорт Самарканд",
  BHK: "Аэропорт Бухара",
  UGC: "Аэропорт Ургенч",
  NVI: "Аэропорт Навои",
  FRU: "Манас (Бишкек)",
  OSS: "Аэропорт Ош",
  NQZ: "Астана Интернешнл",
  ALA: "Алматы Интернешнл",
  CIT: "Аэропорт Шымкент",
  // Россия
  MOW: "Москва",
  SVO: "Шереметьево",
  DME: "Домодедово",
  VKO: "Внуково",
  ZIA: "Жуковский",
  LED: "Пулково (Санкт-Петербург)",
  SVX: "Кольцово (Екатеринбург)",
  OVB: "Толмачёво (Новосибирск)",
  KUF: "Курумоч (Самара)",
  UFA: "Аэропорт Уфа",
  KZN: "Аэропорт Казань",
  AER: "Аэропорт Сочи",
  KRR: "Аэропорт Краснодар",
  ROV: "Платов (Ростов-на-Дону)",
  // Кавказ
  GYD: "Гейдар Алиев (Баку)",
  TBS: "Тбилиси Руставели",
  EVN: "Звартноц (Ереван)",
  // Турция
  IST: "Стамбул Аэропорт",
  SAW: "Сабиха Гёкчен",
  ESB: "Эсенбога (Анкара)",
  AYT: "Аэропорт Анталья",
  BJV: "Миляс-Бодрум",
  ADB: "Аэропорт Измир",
  // Ближний Восток
  DXB: "Дубай Интернешнл",
  AUH: "Абу-Даби Интернешнл",
  DOH: "Хамад (Доха)",
  AMM: "Королева Алия (Амман)",
  BEY: "Рафик Харири (Бейрут)",
  // СНГ
  MSQ: "Минск Национальный",
  KBP: "Борисполь (Киев)",
};

export function airportName(iata: string, city: string): string {
  if (!iata) return city;
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
export function buildItinerary(f: Flight, route: Route): { segments: Segment[]; layovers: Layover[]; estimated: boolean } {
  const stopIatas = f.stopCities ?? [];
  const stopNames = (f.stopLabel ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  // estimated=true: промежуточные аэропорты неизвестны (показываем упрощённый вид в модалке)
  const estimated = f.stops > 0 && stopIatas.length === 0;

  const points = [
    { iata: route.fromIata, city: route.fromCity },
    ...stopIatas.map((iata, i) => ({ iata, city: stopNames[i] ?? (airportName(iata, iata)) })),
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

  return { segments, layovers, estimated };
}
