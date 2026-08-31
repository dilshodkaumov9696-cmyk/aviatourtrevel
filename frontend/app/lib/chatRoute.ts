/** Маршрут, который видит чат Анны. Только чтение экрана — поиск не вызываем. */

export const ANNA_PIN_FLIGHT = "anna-pin-flight";
export const ANNA_STORAGE_KEY = "aviator:anna-chat-v1";

const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export type ChatPage = "home" | "search" | "book" | "trip" | "other";

export interface ChatRoute {
  fromCity: string;
  fromIata: string;
  toCity: string;
  toIata: string;
  date: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  infantsSeat: number;
  cabin: string;
  page: ChatPage;
  orderRef?: string;
}

export interface PinnedFlight {
  airlineName: string;
  flightNumber: string;
  fromIata: string;
  toIata: string;
  dateISO: string;
  departTime: string;
  pricePerPax: number;
  bookHref: string;
  baggageLabel?: string;
}

export interface HomeRouteInput {
  fromCity: string;
  fromIata: string;
  toCity: string;
  toIata: string;
  date: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  infantsSeat: number;
  cabin: string;
}

export function paxTotal(r: Pick<ChatRoute, "adults" | "children" | "infants" | "infantsSeat">): number {
  return Math.max(0, r.adults + r.children + r.infants + r.infantsSeat);
}

export function fmtDateShort(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS_SHORT[Number(m) - 1]}`;
}

export function routeKey(r: ChatRoute | null): string {
  if (!r) return "";
  return [r.page, r.fromIata, r.toIata, r.date, r.returnDate, r.adults, r.children, r.infants, r.infantsSeat, r.cabin, r.orderRef ?? ""].join("|");
}

export function hasCities(r: ChatRoute | null): r is ChatRoute {
  return Boolean(r?.fromIata && r?.toIata);
}

export function routeTitle(r: ChatRoute | null): string {
  if (!r) return "Маршрут не выбран";
  if (!r.fromIata && !r.toIata) return "Маршрут не выбран";
  const from = r.fromCity || r.fromIata || "…";
  const to = r.toCity || r.toIata || "…";
  if (!r.fromIata || !r.toIata) return `${from} → ${to}`;
  const bits = [`${from} → ${to}`];
  if (r.date) bits.push(fmtDateShort(r.date) + (r.returnDate ? ` — ${fmtDateShort(r.returnDate)}` : ""));
  const n = paxTotal(r);
  if (n > 0) bits.push(`${n} пасс`);
  return bits.join(" · ");
}

export function searchHref(r: ChatRoute, dateOverride?: string): string {
  const date = dateOverride || r.date;
  const params = new URLSearchParams({
    fromCity: r.fromCity || r.fromIata,
    fromIata: r.fromIata,
    toCity: r.toCity || r.toIata,
    toIata: r.toIata,
    date,
    adults: String(Math.max(1, r.adults || 1)),
    children: String(r.children || 0),
    infants: String(r.infants || 0),
    infantsSeat: String(r.infantsSeat || 0),
    cabin: r.cabin || "economy",
  });
  if (r.returnDate) params.set("returnDate", r.returnDate);
  return `/search?${params.toString()}`;
}

function n(v: string | null, fallback = 0): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

export function pageFromPath(pathname: string): ChatPage {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/book")) return "book";
  if (pathname.startsWith("/account/trips/") || pathname.startsWith("/order/")) return "trip";
  return "other";
}

export function orderRefFromPath(pathname: string): string | undefined {
  const trip = pathname.match(/^\/account\/trips\/([^/]+)/);
  if (trip) return decodeURIComponent(trip[1]).toUpperCase();
  const order = pathname.match(/^\/order\/([^/]+)/);
  if (order) return decodeURIComponent(order[1]).toUpperCase();
  return undefined;
}

export function parseRouteFromUrl(pathname: string, search: string, home: HomeRouteInput | null): ChatRoute | null {
  const page = pageFromPath(pathname);
  const qs = new URLSearchParams(search);
  const orderRef = orderRefFromPath(pathname);

  if (page === "home" && home) {
    return {
      ...home,
      page,
      adults: Math.max(1, home.adults || 1),
    };
  }

  const fromIata = (qs.get("fromIata") || "").toUpperCase();
  const toIata = (qs.get("toIata") || "").toUpperCase();
  const date = qs.get("date") || qs.get("dateISO") || "";

  if (page === "other" && !orderRef) return null;

  return {
    fromCity: qs.get("fromCity") || fromIata,
    fromIata,
    toCity: qs.get("toCity") || toIata,
    toIata,
    date,
    returnDate: qs.get("returnDate") || "",
    adults: Math.max(1, n(qs.get("adults"), 1)),
    children: n(qs.get("children")),
    infants: n(qs.get("infants")),
    infantsSeat: n(qs.get("infantsSeat")),
    cabin: qs.get("cabin") || "economy",
    page,
    orderRef,
  };
}

export function pinnedFlightFromBookUrl(search: string): PinnedFlight | null {
  const qs = new URLSearchParams(search);
  const bookHref = `/book?${qs.toString()}`;
  const fromIata = (qs.get("fromIata") || "").toUpperCase();
  const toIata = (qs.get("toIata") || "").toUpperCase();
  const dateISO = qs.get("dateISO") || qs.get("date") || "";
  const flightNumber = qs.get("flightNumber") || "";
  if (!fromIata || !toIata || !flightNumber) return null;
  return {
    airlineName: qs.get("airlineName") || qs.get("airlineCode") || "Рейс",
    flightNumber,
    fromIata,
    toIata,
    dateISO,
    departTime: qs.get("departTime") || "",
    pricePerPax: n(qs.get("pricePerPax")),
    bookHref,
    baggageLabel: qs.get("baggageLabel") || undefined,
  };
}

export function cheapestDays(
  prices: Record<string, number>,
  selected: string,
  limit = 3,
): { date: string; price: number }[] {
  const selectedPrice = selected ? prices[selected] : undefined;
  const rows = Object.entries(prices)
    .filter(([, p]) => typeof p === "number" && p > 0)
    .map(([date, price]) => ({ date, price }))
    .sort((a, b) => a.price - b.price || a.date.localeCompare(b.date));
  const cheaper = selectedPrice
    ? rows.filter((r) => r.date !== selected && r.price < selectedPrice)
    : rows;
  const pool = cheaper.length ? cheaper : rows.filter((r) => r.date !== selected);
  return pool.slice(0, limit);
}
