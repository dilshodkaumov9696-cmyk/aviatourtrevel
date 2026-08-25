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

// || а не ?? нарочно: пустая строка в NEXT_PUBLIC_API_URL (а не отсутствие
// переменной) — частый случай в .env-файлах — иначе шла бы в new URL() как есть
// и падала с "Failed to construct 'URL': Invalid URL".
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  stop_airports?: string[];
}

const IATA_CITY: Record<string, string> = {
  TBS: "Тбилиси", ALA: "Алматы", TAS: "Ташкент", MSQ: "Минск",
  IST: "Стамбул", SAW: "Стамбул", GYD: "Баку", FRU: "Бишкек",
  OSS: "Ош", SKD: "Самарканд", UGC: "Ургенч", NVI: "Навои", BHK: "Бухара",
  AYT: "Анталья", BJV: "Бодрум", ESB: "Анкара",
  SVO: "Москва", DME: "Москва", VKO: "Москва", ZIA: "Москва",
  LED: "Санкт-Петербург", SVX: "Екатеринбург", OVB: "Новосибирск",
  KUF: "Самара", UFA: "Уфа", KZN: "Казань", AER: "Сочи", KRR: "Краснодар",
  DYU: "Душанбе", LBD: "Худжанд", NQZ: "Астана", CIT: "Шымкент",
  DSS: "Дакар", CMN: "Касабланка", DXB: "Дубай", AUH: "Абу-Даби",
  DOH: "Доха", KWI: "Кувейт", BAH: "Бахрейн", AMM: "Амман",
  BEY: "Бейрут", CAI: "Каир", ADD: "Аддис-Абеба", NBO: "Найроби",
};

function parseTime(iso: string): string {
  return iso.slice(11, 16);
}

function daysBetween(departAt: string, arriveAt: string): number {
  const d1 = departAt.slice(0, 10);
  const d2 = arriveAt.slice(0, 10);
  if (d1 === d2) return 0;
  return Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000);
}

export interface OrderPassengerInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  gender: string;
  citizenship: string;
  docNumber: string;
  docExpiry?: string;
}

export interface CreatedOrder {
  ref: string;
  status: string;
  statusLabel: string;
  totalAmount: number;
  currency: string;
}

/** Оформление заявки. Возвращает код вида AV-7K2M9X — по нему клиент найдёт заявку. */
export async function createOrder(params: {
  email: string;
  phone: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  cabin?: string;
  airline?: string;
  flightNumber?: string;
  tariff: string;
  seat?: string;
  promo?: string;
  paymentMethod: string;
  totalAmount: number;
  passengers: OrderPassengerInput[];
}): Promise<CreatedOrder> {
  const res = await fetch(`${API_URL}/api/v1/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact_email: params.email,
      contact_phone: params.phone,
      origin: params.origin,
      destination: params.destination,
      depart_date: params.departDate,
      return_date: params.returnDate || null,
      cabin: params.cabin ?? "economy",
      airline: params.airline || null,
      flight_number: params.flightNumber || null,
      tariff: params.tariff,
      seat: params.seat || null,
      promo: params.promo || null,
      payment_method: params.paymentMethod,
      total_amount: params.totalAmount,
      passengers: params.passengers.map((p) => ({
        first_name: p.firstName,
        last_name: p.lastName,
        middle_name: p.middleName || null,
        dob: p.dob,
        gender: p.gender,
        citizenship: p.citizenship,
        doc_number: p.docNumber,
        doc_expiry: p.docExpiry || null,
      })),
    }),
  });

  if (!res.ok) throw new Error(await apiErrorMessage(res));

  const data = await res.json();
  return {
    ref: data.ref,
    status: data.status,
    statusLabel: data.status_label,
    totalAmount: data.total_amount,
    currency: data.currency,
  };
}

export interface OrderSummary {
  ref: string;
  status: string;
  statusLabel: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string | null;
  airline: string | null;
  flightNumber: string | null;
  tariff: string;
  seat: string | null;
  totalAmount: number;
  currency: string;
  paxCount: number;
  createdAt: string;
}

/** Заявки по адресу почты. До появления авторизации это единственный способ их найти. */
export async function listOrders(email: string): Promise<OrderSummary[]> {
  const res = await fetch(`${API_URL}/api/v1/orders?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(await apiErrorMessage(res));

  const data = await res.json();
  return (data as Record<string, unknown>[]).map((o) => ({
    ref: o.ref as string,
    status: o.status as string,
    statusLabel: o.status_label as string,
    origin: o.origin as string,
    destination: o.destination as string,
    departDate: o.depart_date as string,
    returnDate: (o.return_date as string) ?? null,
    airline: (o.airline as string) ?? null,
    flightNumber: (o.flight_number as string) ?? null,
    tariff: o.tariff as string,
    seat: (o.seat as string) ?? null,
    totalAmount: o.total_amount as number,
    currency: o.currency as string,
    paxCount: (o.passengers as unknown[]).length,
    createdAt: o.created_at as string,
  }));
}

/** Статус одной заявки: код дополняется email, чтобы нельзя было перебрать чужие данные. */
export async function getOrder(ref: string, email: string): Promise<OrderSummary> {
  const res = await fetch(`${API_URL}/api/v1/orders/${encodeURIComponent(ref)}?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(await apiErrorMessage(res));
  const o = await res.json() as Record<string, unknown>;
  return {
    ref: o.ref as string, status: o.status as string, statusLabel: o.status_label as string,
    origin: o.origin as string, destination: o.destination as string, departDate: o.depart_date as string,
    returnDate: (o.return_date as string) ?? null, airline: (o.airline as string) ?? null,
    flightNumber: (o.flight_number as string) ?? null, tariff: o.tariff as string,
    seat: (o.seat as string) ?? null, totalAmount: o.total_amount as number,
    currency: o.currency as string, paxCount: (o.passengers as unknown[]).length, createdAt: o.created_at as string,
  };
}

export async function listManagerOrders(key: string): Promise<OrderSummary[]> {
  const res = await fetch(`${API_URL}/api/v1/orders/admin`, { headers: { "X-Manager-Key": key } });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
  const data = await res.json() as Record<string, unknown>[];
  return data.map((o) => ({ ref: o.ref as string, status: o.status as string, statusLabel: o.status_label as string, origin: o.origin as string, destination: o.destination as string, departDate: o.depart_date as string, returnDate: (o.return_date as string) ?? null, airline: (o.airline as string) ?? null, flightNumber: (o.flight_number as string) ?? null, tariff: o.tariff as string, seat: (o.seat as string) ?? null, totalAmount: o.total_amount as number, currency: o.currency as string, paxCount: (o.passengers as unknown[]).length, createdAt: o.created_at as string }));
}

export async function resendOrderEmail(ref: string, key: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/orders/${encodeURIComponent(ref)}/resend-email`, { method: "POST", headers: { "X-Manager-Key": key } });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
}

/** Разбирает detail из FastAPI: строку от наших проверок либо список ошибок pydantic. */
async function apiErrorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  const detail = data?.detail;
  if (typeof detail === "string") return detail;

  const first = Array.isArray(detail) ? detail[0] : null;
  const field = String(first?.loc?.at(-1) ?? "");
  const RU: Record<string, string> = {
    email: "Проверьте адрес почты",
    contact_email: "Проверьте адрес почты",
    contact_phone: "Проверьте номер телефона",
    target_price: "Укажите цену больше нуля",
    total_amount: "Некорректная сумма заявки",
    depart_date: "Проверьте дату вылета",
    dob: "Проверьте дату рождения",
    doc_number: "Проверьте номер документа",
  };
  return RU[field] ?? first?.msg ?? `Ошибка ${res.status}`;
}

/** Подписка на цену: следим за маршрутом и пишем на почту, когда подешевеет. */
export async function createPriceAlert(params: {
  email: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  targetPrice: number;
  cabin?: string;
  currency?: string;
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: params.email,
      origin: params.origin,
      destination: params.destination,
      depart_date: params.departDate,
      return_date: params.returnDate || null,
      target_price: params.targetPrice,
      cabin: params.cabin ?? "economy",
      currency: params.currency ?? "RUB",
    }),
  });

  if (!res.ok) throw new Error(await apiErrorMessage(res));
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
}

function mapUser(data: Record<string, unknown>): AuthUser {
  return {
    id: data.id as number,
    email: data.email as string,
    fullName: (data.full_name as string) ?? null,
    avatarUrl: (data.avatar_url as string) ?? null,
    emailVerified: Boolean(data.email_verified),
  };
}

/** Регистрация: почта + пароль. Сессия ставится сервером в httpOnly cookie. */
export async function registerUser(params: { email: string; password: string; fullName?: string }): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: params.email, password: params.password, full_name: params.fullName || null }),
  });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
  return mapUser(await res.json());
}

/** Вход по почте и паролю. */
export async function loginUser(params: { email: string; password: string }): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: params.email, password: params.password }),
  });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
  return mapUser(await res.json());
}

/** Кто сейчас вошёл, по cookie сессии. null — если гость. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch(`${API_URL}/api/v1/auth/me`, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await apiErrorMessage(res));
  return mapUser(await res.json());
}

/** Выход: сервер стирает cookie сессии. */
export async function logoutUser(): Promise<void> {
  await fetch(`${API_URL}/api/v1/auth/logout`, { method: "POST", credentials: "include" });
}

/** Подтверждение почты по ссылке из письма. */
export async function verifyEmail(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
}

/** Повторная отправка письма с подтверждением — только для текущего залогиненного пользователя. */
export async function resendVerification(): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/auth/resend-verification`, { method: "POST", credentials: "include" });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
}

/** Ссылка на вход через Google — редиректит на страницу согласия Google. */
export function googleLoginUrl(): string {
  return `${API_URL}/api/v1/auth/google/login`;
}

export async function getAuthProviders(): Promise<{ google: boolean }> {
  const res = await fetch(`${API_URL}/api/v1/auth/providers`);
  if (!res.ok) return { google: false };
  return res.json();
}

const cabinetFetch = (path: string, init?: RequestInit) => fetch(`${API_URL}/api/v1/cabinet${path}`, { credentials: "include", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
export async function cabinetData<T>(path: string, init?: RequestInit): Promise<T> { const r = await cabinetFetch(path, init); if (!r.ok) throw new Error(await apiErrorMessage(r)); return r.status === 204 ? undefined as T : r.json(); }
export type CabinetOrder = { ref:string; status:string; status_label:string; origin:string; destination:string; depart_date:string; return_date:string|null; airline:string|null; flight_number:string|null; total_amount:number; currency:string; pnr:string|null; passengers:number; tariff:string; depart_at?:string|null; arrive_at?:string|null; seat?:string|null };
export type SavedPassenger = { id:number; first_name:string; last_name:string; middle_name:string|null; dob:string; gender:string|null; citizenship:string; doc_number:string; doc_expiry:string|null };
export type CabinetAlert = { id:number; origin:string; destination:string; depart_date:string; target_price:number; currency:string; last_seen_price:number|null; is_active:boolean };
export type CabinetOrderDetail = Omit<CabinetOrder, "passengers"> & { passengers: { name:string; citizenship:string; document:string }[]; ticket_numbers:string|null; paid_at:string|null; issued_at:string|null };
export type SupportKind = "refund" | "exchange" | "question";
export type SupportStatus = "open" | "in_progress" | "closed";
export type SupportTicket = { id:number; kind:SupportKind; status:SupportStatus; message:string; order_ref:string; created_at:string };
export type AdminSupportTicket = SupportTicket & { user_email:string };

/** Запрос ссылки восстановления пароля. Ответ одинаков независимо от того, есть ли такой email. */
export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
}

/** Смена имени в кабинете. Возвращает обновлённого пользователя, чтобы обновить контекст авторизации. */
export async function updateProfile(fullName: string | null): Promise<AuthUser> {
  const res = await cabinetFetch("/profile", { method: "PATCH", body: JSON.stringify({ full_name: fullName }) });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
  return mapUser(await res.json());
}

export async function listManagerSupport(key: string, status?: SupportStatus): Promise<AdminSupportTicket[]> {
  const url = new URL(`${API_URL}/api/v1/cabinet/admin/support`);
  if (status) url.searchParams.set("status", status);
  const res = await fetch(url.toString(), { headers: { "X-Manager-Key": key } });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
  return res.json();
}

export async function updateManagerSupportStatus(id: number, status: SupportStatus, key: string): Promise<AdminSupportTicket> {
  const res = await fetch(`${API_URL}/api/v1/cabinet/admin/support/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Manager-Key": key },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await apiErrorMessage(res));
  return res.json();
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
      stopCities: offer.stop_airports?.length ? offer.stop_airports : undefined,
      stopLabel: offer.stop_airports?.length
        ? offer.stop_airports.map(iata => IATA_CITY[iata] ?? iata).join(", ")
        : undefined,
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
