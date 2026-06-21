import type { Flight } from "../data/flights";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const AIRLINE_NAMES: Record<string, string> = {
  SZ: "Somon Air",
  DP: "Победа",
  SU: "Аэрофлот",
  S7: "S7 Airlines",
  FV: "Россия",
  U6: "Уральские авиалинии",
  UT: "ЮТэйр",
  TK: "Turkish Airlines",
  HY: "Uzbekistan Airways",
  KC: "Air Astana",
  B2: "Belavia",
  QR: "Qatar Airways",
  EK: "Emirates",
  FZ: "flydubai",
  WZ: "Red Wings",
  N4: "Nordwind",
  "5N": "Smartavia",
  IV: "Wind Rose",
  AH: "Air Algérie",
  PC: "Pegasus",
  XQ: "SunExpress",
  LH: "Lufthansa",
  AF: "Air France",
  KL: "KLM",
  BA: "British Airways",
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
