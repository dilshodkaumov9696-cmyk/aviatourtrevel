export interface Airport {
  iata: string;
  city: string;
  name: string;
  country: string;
}

export interface AirportSearchResult {
  airport: Airport;
  /** A city-level choice followed by its individual airport terminals. */
  kind: "city" | "airport";
  child: boolean;
}

// Полная база (~4000 flightable-аэропортов) лежит в /public/airports.json
// и загружается один раз на клиенте. Кешируется на уровне модуля.
let cache: Airport[] | null = null;
let inflight: Promise<Airport[]> | null = null;

// Метро-коды городов («все аэропорты»), которых нет в базе по отдельности,
// но которые использует приложение (поиск по умолчанию, хабы). Добавляем в начало,
// чтобы они находились при вводе «Москва» / «MOW».
const METRO_AIRPORTS: Airport[] = [
  { iata: "MOW", city: "Москва", name: "Все аэропорты", country: "Россия" },
];

export function loadAirports(): Promise<Airport[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/airports.json")
      .then((r) => r.json())
      .then((data: Airport[]) => {
        const have = new Set(data.map((a) => a.iata));
        const metro = METRO_AIRPORTS.filter((a) => !have.has(a.iata));
        cache = [...metro, ...data];
        return cache;
      })
      .catch((e) => {
        inflight = null;
        throw e;
      });
  }
  return inflight;
}

// Популярные направления — показываются при клике на поле, до ввода текста.
// Курируемый список (а не выборка из базы), чтобы метро-коды городов (напр. MOW —
// все аэропорты Москвы) отображались так же, как их понимает остальное приложение.
export const POPULAR_AIRPORTS: Airport[] = [
  { iata: "DYU", city: "Душанбе", name: "Душанбе", country: "Таджикистан" },
  { iata: "MOW", city: "Москва", name: "Все аэропорты", country: "Россия" },
  { iata: "IST", city: "Стамбул", name: "Аэропорт Стамбул", country: "Турция" },
  { iata: "DXB", city: "Дубай", name: "Дубай", country: "ОАЭ" },
  { iata: "TAS", city: "Ташкент", name: "Ташкент", country: "Узбекистан" },
  { iata: "LBD", city: "Худжанд", name: "Худжанд", country: "Таджикистан" },
  { iata: "ALA", city: "Алматы", name: "Алматы", country: "Казахстан" },
  { iata: "SKD", city: "Самарканд", name: "Самарканд", country: "Узбекистан" },
];

export function getPopularAirports(limit = 8, excludeIata?: string): Airport[] {
  return POPULAR_AIRPORTS.filter((a) => a.iata !== excludeIata).slice(0, limit);
}

// Ранжирование: точный IATA → начало города → начало названия → вхождение.
// excludeIata — исключить уже выбранный в паре аэропорт (чтобы не выбрать дважды).
export function rankAirports(
  list: Airport[],
  query: string,
  limit = 7,
  excludeIata?: string,
): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: { a: Airport; s: number }[] = [];
  for (const a of list) {
    if (excludeIata && a.iata === excludeIata) continue;
    const iata = a.iata.toLowerCase();
    const city = a.city.toLowerCase();
    const name = a.name.toLowerCase();
    const country = a.country.toLowerCase();

    let s = 99;
    if (iata === q) s = 0;
    else if (iata.startsWith(q)) s = 1;
    else if (city.startsWith(q)) s = 2;
    else if (name.startsWith(q)) s = 3;
    else if (city.includes(q)) s = 4;
    else if (name.includes(q)) s = 5;
    else if (country.includes(q)) s = 6;

    if (s < 99) scored.push({ a, s });
  }

  scored.sort((x, y) => x.s - y.s || x.a.city.length - y.a.city.length);
  return scored.slice(0, limit).map((x) => x.a);
}

function normalise(value: string): string {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е").trim();
}

function scoreAirport(airport: Airport, query: string): number | null {
  const iata = normalise(airport.iata);
  const city = normalise(airport.city);
  const name = normalise(airport.name);
  const country = normalise(airport.country);
  if (iata === query) return 0;
  if (iata.startsWith(query)) return 1;
  if (city.startsWith(query)) return 2;
  if (name.startsWith(query)) return 3;
  if (country.startsWith(query)) return 4;
  if (city.includes(query)) return 5;
  if (name.includes(query)) return 6;
  if (country.includes(query)) return 7;
  return null;
}

/**
 * Search over all terms a traveller is likely to know: a city, country,
 * airport name, or IATA code. A matching city with more than one airport is
 * expanded into a city-level "all airports" row and its individual terminals.
 */
export function searchAirports(
  list: Airport[],
  rawQuery: string,
  limit = 12,
  excludeIata?: string,
): AirportSearchResult[] {
  const query = normalise(rawQuery);
  if (query.length < 2) return [];

  const matches = list
    .filter((airport) => airport.iata !== excludeIata)
    .map((airport) => ({ airport, score: scoreAirport(airport, query) }))
    .filter((entry): entry is { airport: Airport; score: number } => entry.score !== null)
    .sort((a, b) => a.score - b.score || a.airport.city.localeCompare(b.airport.city, "ru"));

  const byCity = new Map<string, { airport: Airport; score: number }[]>();
  for (const entry of matches) {
    const key = `${normalise(entry.airport.city)}|${normalise(entry.airport.country)}`;
    byCity.set(key, [...(byCity.get(key) ?? []), entry]);
  }

  const result: AirportSearchResult[] = [];
  const used = new Set<string>();
  for (const entry of matches) {
    if (result.length >= limit) break;
    const key = `${normalise(entry.airport.city)}|${normalise(entry.airport.country)}`;
    if (used.has(key)) continue;
    used.add(key);
    const cityMatches = byCity.get(key) ?? [];
    const allCityAirports = list.filter((airport) =>
      airport.iata !== excludeIata && airport.name !== "Все аэропорты" && normalise(airport.city) === normalise(entry.airport.city) && normalise(airport.country) === normalise(entry.airport.country),
    );
    const cityWasTyped = normalise(entry.airport.city).includes(query) || normalise(entry.airport.country).includes(query);
    const metro = METRO_AIRPORTS.find((airport) => normalise(airport.city) === normalise(entry.airport.city));

    if (cityWasTyped && allCityAirports.length > 1) {
      result.push({ airport: metro ?? { ...entry.airport, name: "Все аэропорты" }, kind: "city", child: false });
      for (const airport of allCityAirports) {
        if (result.length >= limit) break;
        result.push({ airport, kind: "airport", child: true });
      }
    } else {
      for (const matched of cityMatches) {
        if (result.length >= limit) break;
        result.push({ airport: matched.airport, kind: "airport", child: false });
      }
    }
  }
  return result.slice(0, limit);
}
