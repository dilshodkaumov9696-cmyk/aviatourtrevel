export interface Airport {
  iata: string;
  city: string;
  name: string;
  country: string;
}

// Полная база (~4000 flightable-аэропортов) лежит в /public/airports.json
// и загружается один раз на клиенте. Кешируется на уровне модуля.
let cache: Airport[] | null = null;
let inflight: Promise<Airport[]> | null = null;

export function loadAirports(): Promise<Airport[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/airports.json")
      .then((r) => r.json())
      .then((data: Airport[]) => {
        cache = data;
        return data;
      })
      .catch((e) => {
        inflight = null;
        throw e;
      });
  }
  return inflight;
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
