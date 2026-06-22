import type { Flight } from "../data/flights";

const MARKER = "488971";

export function buildAviasalesUrl(params: {
  origin: string;
  destination: string;
  departDate: string;     // YYYY-MM-DD
  returnDate?: string;    // YYYY-MM-DD
  adults?: number;
}): string {
  const [, dm, dd] = params.departDate.split("-");
  let route = `${params.origin}${dd}${dm}${params.destination}`;
  if (params.returnDate) {
    const [, rm, rd] = params.returnDate.split("-");
    route += `${rd}${rm}`;
  }
  route += String(params.adults ?? 1);
  return `https://www.aviasales.ru/search/${route}?marker=${MARKER}`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const AIRLINE_NAMES: Record<string, string> = {
  // СНГ и Россия
  SU: "Аэрофлот",
  DP: "Победа",
  S7: "S7 Airlines",
  FV: "Россия",
  U6: "Уральские авиалинии",
  UT: "ЮТэйр",
  WZ: "Red Wings",
  N4: "Nordwind",
  "5N": "Smartavia",
  IV: "Wind Rose",
  // Центральная Азия
  SZ: "Somon Air",
  HY: "Uzbekistan Airways",
  KC: "Air Astana",
  DV: "SCAT Airlines",
  QH: "Air Koryo",
  // Ближний Восток
  EK: "Emirates",
  FZ: "flydubai",
  QR: "Qatar Airways",
  WY: "Oman Air",
  GF: "Gulf Air",
  EY: "Etihad Airways",
  SV: "Saudi Arabian Airlines",
  ME: "Middle East Airlines",
  RB: "Syrian Arab Airlines",
  // Турция и Южная Европа
  TK: "Turkish Airlines",
  PC: "Pegasus",
  XQ: "SunExpress",
  // СНГ: Беларусь, Армения, Грузия, Азербайджан
  B2: "Belavia",
  J2: "Azerbaijan Airlines",
  MH: "Georgian Airways",
  QN: "Armenian Airlines",
  // Европа
  LH: "Lufthansa",
  AF: "Air France",
  KL: "KLM",
  BA: "British Airways",
  LX: "Swiss",
  OS: "Austrian Airlines",
  SK: "SAS",
  AY: "Finnair",
  VY: "Vueling",
  FR: "Ryanair",
  U2: "easyJet",
  // Азия
  CX: "Cathay Pacific",
  TG: "Thai Airways",
  MH2: "Malaysia Airlines",
  SQ: "Singapore Airlines",
  // Африка
  AH: "Air Algérie",
  ET: "Ethiopian Airlines",
};

interface RawOffer {
  provider: string;
  price: number;
  currency: string;
  airline: string;
  flight_number: string;
  depart_at: string;
  arrive_at: string;
  duration_minutes: number;
  transfers: number;
  booking_url: string;
}

function parseTime(iso: string): string {
  return iso.slice(11, 16);
}

function daysBetween(departAt: string, arriveAt: string): number {
  const d1 = departAt.slice(0, 10);
  const d2 = arriveAt.slice(0, 10);
  if (d1 === d2) return 0;
  return Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000);
}

export async function searchFlights(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  currency?: string;
}): Promise<Flight[]> {
  const url = new URL(`${API_URL}/api/v1/search`);
  url.searchParams.set("origin", params.origin);
  url.searchParams.set("destination", params.destination);
  url.searchParams.set("depart_date", params.departDate);
  if (params.returnDate) url.searchParams.set("return_date", params.returnDate);
  if (params.adults) url.searchParams.set("adults", String(params.adults));
  if (params.currency) url.searchParams.set("currency", params.currency);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Ошибка API ${res.status}: ${res.statusText}`);
  const data = await res.json();

  return (data.offers as RawOffer[]).map((offer, i) => {
    const departTime = parseTime(offer.depart_at);
    const arriveTime = parseTime(offer.arrive_at);
    const hour = Number(departTime.split(":")[0]);

    return {
      id: `api-${i}-${offer.airline}-${offer.price}`,
      airlineCode: offer.airline,
      airlineName: AIRLINE_NAMES[offer.airline] ?? offer.airline,
      flightNumber: offer.flight_number || offer.airline,
      aircraft: "",
      fareClass: "",
      seatsLeft: 9,
      departTime,
      arriveTime,
      arriveDayOffset: daysBetween(offer.depart_at, offer.arrive_at),
      durationMin: offer.duration_minutes,
      stops: offer.transfers,
      pricePerPax: offer.price,
      hasBaggage: false,
      baggageLabel: "Уточняйте у авиакомпании",
      tariff: { handKg: 0, baggageKg: null, refundable: false, changeable: false, changeFee: null },
      isNight: hour >= 22 || hour < 6,
      badges: [],
      bookingUrl: offer.booking_url,
    } satisfies Flight;
  });
}
