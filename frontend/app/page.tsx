"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { buildAviasalesUrl, searchFlights } from "./lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Глобус только на клиенте (MapLibre обращается к window/WebGL) — не блокирует
// первый рендер страницы, грузится отдельным чанком уже после монтирования.
const GlobeHero = dynamic(() => import("./components/GlobeHero"), { ssr: false });
import type { GlobeCitySelection } from "./components/GlobeHero";
import PopularDirectionsPanel from "./components/PopularDirectionsPanel";
import QuickRoutes from "./components/QuickRoutes";
import { useInViewAnimation } from "./hooks/useInViewAnimation";
import { useRecentSearches } from "./hooks/useRecentSearches";
import AirportInput from "./components/AirportInput";
import DateRangePicker from "./components/DateRangePicker";
import MultiCitySegments, { MultiSegment } from "./components/MultiCitySegments";
import PassengersPicker, { Passengers, CabinClass } from "./components/PassengersPicker";
import { IconPlane, IconPin, IconCalendar, IconSearch, IconSwap, IconRoute } from "./components/icons";

import ThemeToggle from "./components/ThemeToggle";
import LogoMark from "./components/Logo";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./context/auth";
import SettingsSwitcher from "./components/SettingsSwitcher";
import MobileMenu from "./components/MobileMenu";
import Footer from "./components/Footer";
import Counters from "./components/Counters";
import WhyUs from "./components/WhyUs";
import DirectionsCarousel from "./components/DirectionsCarousel";
import AirlinesMarquee from "./components/AirlinesMarquee";
import Reviews from "./components/Reviews";
import Subscribe from "./components/Subscribe";
import { Airport, loadAirports } from "./data/airports";

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

function fmtDate(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

// Ячейка единой строки поиска: без собственной рамки и фона — их даёт контейнер-бар,
// поля стыкуются вплотную и разделяются только 1px-дивайдерами.
const boxBase =
  "relative flex min-h-[60px] items-center gap-2.5 px-4 py-2 transition-colors duration-200 cursor-pointer hover:bg-[var(--color-surface)] focus-within:bg-[var(--color-surface)]";

// Фото города по ключевому слову (временно — позже заменим на свои/лицензионные)
const cityPhoto = (kw: string, lock: number) =>
  `https://loremflickr.com/640/480/${kw}?lock=${lock}`;

// Если loremflickr не ответит — подменяем на гарантированное фото
function photoFallback(e: React.SyntheticEvent<HTMLImageElement>, seed: string) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = `https://picsum.photos/seed/${seed}/640/480`;
}

function futureDateISO(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

const MONTHS_SHORT_RU = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${parseInt(d, 10)} ${MONTHS_SHORT_RU[parseInt(m, 10) - 1]}`;
}

// Хабы, из которых летает сервис — используются для smart-default «ближайший город вылета».
const DEPARTURE_HUBS = [
  { iata: "MOW", lat: 55.7558, lon: 37.6173 },
  { iata: "DYU", lat: 38.5598, lon: 68.7870 },
  { iata: "TAS", lat: 41.2995, lon: 69.2401 },
];

// Единственный источник направлений для панели «Популярные направления» и «Быстрых
// маршрутов» под формой — оба берут отсюда города и делят один и тот же кэш цен
// (см. popularPrices), чтобы не заводить две параллельные системы данных.
const POPULAR_DESTS = [
  { city: "Стамбул", country: "Турция", iata: "IST" },
  { city: "Душанбе", country: "Таджикистан", iata: "DYU" },
  { city: "Дубай", country: "ОАЭ", iata: "DXB" },
  { city: "Ташкент", country: "Узбекистан", iata: "TAS" },
  { city: "Баку", country: "Азербайджан", iata: "GYD" },
];
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function searchHref(
  toCity: string,
  toIata: string,
  date = futureDateISO(14),
  fromCity = "Москва",
  fromIata = "MOW",
): string {
  const params = new URLSearchParams({
    fromCity,
    fromIata,
    toCity,
    toIata,
    date,
    adults: "1",
    children: "0",
    infants: "0",
    cabin: "economy",
  });
  return `/search?${params.toString()}`;
}

const ORIGIN_DEALS = {
  MOW: {
    city: "Москва",
    iata: "MOW",
    items: [
      { city: "Стамбул", country: "Турция", iata: "IST", price: "4 500", x: "58%", y: "44%" },
      { city: "Дубай", country: "ОАЭ", iata: "DXB", price: "9 900", x: "68%", y: "58%" },
      { city: "Анталья", country: "Турция", iata: "AYT", price: "6 200", x: "56%", y: "51%" },
      { city: "Алматы", country: "Казахстан", iata: "ALA", price: "7 300", x: "78%", y: "48%" },
    ],
  },
  DYU: {
    city: "Душанбе",
    iata: "DYU",
    items: [
      { city: "Москва", country: "Россия", iata: "MOW", price: "8 900", x: "48%", y: "34%" },
      { city: "Стамбул", country: "Турция", iata: "IST", price: "12 400", x: "55%", y: "45%" },
      { city: "Дубай", country: "ОАЭ", iata: "DXB", price: "10 700", x: "66%", y: "59%" },
      { city: "Алматы", country: "Казахстан", iata: "ALA", price: "5 600", x: "76%", y: "47%" },
    ],
  },
  TAS: {
    city: "Ташкент",
    iata: "TAS",
    items: [
      { city: "Москва", country: "Россия", iata: "MOW", price: "7 800", x: "48%", y: "34%" },
      { city: "Дубай", country: "ОАЭ", iata: "DXB", price: "11 900", x: "66%", y: "59%" },
      { city: "Стамбул", country: "Турция", iata: "IST", price: "13 200", x: "55%", y: "45%" },
      { city: "Бангкок", country: "Таиланд", iata: "BKK", price: "25 400", x: "86%", y: "66%" },
    ],
  },
} as const;

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { items: recentSearches, add: addRecentSearch } = useRecentSearches();
  // Режим формы: обычный (туда + опц. обратно) или сложный маршрут
  const [mode, setMode] = useState<"simple" | "multi">("simple");

  // Простой маршрут
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destAirport, setDestAirport] = useState<Airport | null>(null);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Анимация взлёта кнопки «Найти» перед переходом к результатам
  const [searching, setSearching] = useState(false);
  // Свернуть форму поиска в маленькую кнопку — открывает больше вида на глобус
  const [formCollapsed, setFormCollapsed] = useState(false);


  // Пассажиры / класс
  const [cabin, setCabin] = useState<CabinClass>("economy");
  const [passengers, setPassengers] = useState<Passengers>({ adults: 1, children: 0, infants: 0 });

  // Сложный маршрут
  const [segments, setSegments] = useState<MultiSegment[]>([
    { id: 1, from: null, to: null, date: "" },
    { id: 2, from: null, to: null, date: "" },
  ]);
  const segIdRef = useRef(3);

  // Календарь
  const [datepickerOpen, setDatepickerOpen] = useState(false);
  const [datepickerField, setDatepickerField] = useState<"depart" | "return">("depart");
  const datepickerRef = useRef<HTMLDivElement>(null);

  // Ошибки валидации
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Модалка авторизации
  const [authOpen, setAuthOpen] = useState(false);
  const [localOrigin, setLocalOrigin] = useState<keyof typeof ORIGIN_DEALS>("MOW");

  // Sticky header на скролле
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<"search" | "directions" | "deals" | "help">("search");

  // Анимации при скролле для основных секций
  const { ref: directionsRef, isInView: dirInView } = useInViewAnimation<HTMLElement>();
  const { ref: dealsRef, isInView: dealsInView } = useInViewAnimation<HTMLElement>();
  const { ref: helpRef, isInView: helpInView } = useInViewAnimation<HTMLElement>();
  const localDeals = ORIGIN_DEALS[localOrigin];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (datepickerRef.current && !datepickerRef.current.contains(e.target as Node)) {
        setDatepickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Smart defaults: пустая форма — враг конверсии. Подставляем ближайший хаб
  // вылета (по гео, с фоллбэком на Москву) и дату «через 2 недели на 7 дней».
  // Направление не трогаем — это должен выбрать сам пользователь.
  useEffect(() => {
    if (originAirport || departDate) return;

    function applyDefaults(hubIata: string) {
      loadAirports()
        .then((all) => {
          const hub = all.find((a) => a.iata === hubIata);
          if (hub) setOriginAirport((cur) => cur ?? hub);
        })
        .catch(() => {});
      setDepartDate((cur) => cur || futureDateISO(14));
      setReturnDate((cur) => cur || futureDateISO(21));
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      applyDefaults("MOW");
      return;
    }

    let done = false;
    const fallback = window.setTimeout(() => {
      if (!done) { done = true; applyDefaults("MOW"); }
    }, 2500);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (done) return;
        done = true;
        window.clearTimeout(fallback);
        const { latitude, longitude } = pos.coords;
        let nearest = DEPARTURE_HUBS[0];
        let best = Infinity;
        for (const hub of DEPARTURE_HUBS) {
          const dist = haversineKm(latitude, longitude, hub.lat, hub.lon);
          if (dist < best) { best = dist; nearest = hub; }
        }
        applyDefaults(nearest.iata);
      },
      () => {
        if (done) return;
        done = true;
        window.clearTimeout(fallback);
        applyDefaults("MOW");
      },
      { timeout: 2000, maximumAge: 10 * 60 * 1000 }
    );

    return () => window.clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Изменить" на /search передаёт текущий маршрут через query-параметры
  // (см. changeHref в SearchResults.tsx) — здесь их читаем и заполняем форму,
  // иначе кнопка "Изменить" всегда открывала пустую форму поиска.
  // Через window.location.search (не useSearchParams()), чтобы не переводить
  // всю главную страницу в динамический рендеринг ради этого узкого случая.
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const qFromIata = qs.get("fromIata");
    const qToIata = qs.get("toIata");
    if (!qFromIata && !qToIata) return;

    if (qFromIata) {
      const qFromCity = qs.get("fromCity") || qFromIata;
      setOriginAirport({ iata: qFromIata, city: qFromCity, name: qFromCity, country: "" });
    }
    if (qToIata) {
      const qToCity = qs.get("toCity") || qToIata;
      setDestAirport({ iata: qToIata, city: qToCity, name: qToCity, country: "" });
    }
    const qDate = qs.get("date");
    if (qDate) setDepartDate(qDate);
    const qReturnDate = qs.get("returnDate");
    if (qReturnDate) setReturnDate(qReturnDate);
    const qCabin = qs.get("cabin");
    if (qCabin === "economy" || qCabin === "business" || qCabin === "first") setCabin(qCabin);
    const qAdults = qs.get("adults");
    const qChildren = qs.get("children");
    const qInfants = qs.get("infants");
    if (qAdults || qChildren || qInfants) {
      setPassengers({
        adults: Math.max(1, Number(qAdults) || 1),
        children: Math.max(0, Number(qChildren) || 0),
        infants: Math.max(0, Number(qInfants) || 0),
      });
    }
  }, []);

  // Цены для «Популярные направления» + «Быстрые маршруты»: реальный поиск (тот же
  // searchFlights, что и на /search) от текущего города вылета к каждому из POPULAR_DESTS,
  // параллельно, не блокируя рендер. ?demo=1 — тестовые фикстуры вместо реального API.
  // Ничего не выдумываем: пока цена не пришла или запрос не удался — null → "Цена уточняется".
  const [popularPrices, setPopularPrices] = useState<Record<string, number | null>>({});
  useEffect(() => {
    const originIata = originAirport?.iata || "MOW";
    const date = departDate || futureDateISO(14);
    const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
    let cancelled = false;
    setPopularPrices({});

    if (isDemo) {
      import("./data/flights.demo").then(({ getDemoFlights }) => {
        if (cancelled) return;
        const next: Record<string, number | null> = {};
        for (const d of POPULAR_DESTS) {
          if (d.iata === originIata) continue;
          const flights = getDemoFlights([originIata], [d.iata]);
          next[d.iata] = flights.length ? Math.min(...flights.map((f) => f.pricePerPax)) : null;
        }
        setPopularPrices(next);
      });
      return () => { cancelled = true; };
    }

    for (const d of POPULAR_DESTS) {
      if (d.iata === originIata) continue;
      searchFlights({ origin: originIata, destination: d.iata, departDate: date, adults: 1 })
        .then((flights) => {
          if (cancelled) return;
          const min = flights.length ? Math.min(...flights.map((f) => f.pricePerPax)) : null;
          setPopularPrices((prev) => ({ ...prev, [d.iata]: min }));
        })
        .catch(() => {
          if (cancelled) return;
          setPopularPrices((prev) => ({ ...prev, [d.iata]: null }));
        });
    }
    return () => { cancelled = true; };
  }, [originAirport?.iata, departDate]);

  // Куда прилетает клик по городу — единая точка входа для панели «Популярные направления»,
  // «Быстрых маршрутов» и клика по точке на глобусе (см. ниже) — весь поиск городов идёт
  // через уже существующий loadAirports(), никакой второй системы состояния не заводим.
  function resolveAirport(iata: string, cityFallback: string, countryFallback = ""): Promise<Airport> {
    return loadAirports()
      .then((all) => all.find((a) => a.iata === iata) ?? { iata, city: cityFallback, name: cityFallback, country: countryFallback })
      .catch(() => ({ iata, city: cityFallback, name: cityFallback, country: countryFallback }));
  }

  // Клик по «Популярным направлениям» / «Быстрым маршрутам»: всегда заполняет именно Куда
  // (см. ТЗ) — Откуда остаётся тем, что уже выбрано (или smart-default).
  function selectDestination(city: string, iata: string, country: string) {
    resolveAirport(iata, city, country).then((a) => {
      setDestAirport(a);
      setErrors((p) => ({ ...p, destination: "" }));
    });
  }

  // Клик по точке на глобусе: если Откуда ещё не выбрано — становится Откуда (ТЗ п.7);
  // иначе (и это не текущее Откуда) — становится Куда. Один state с формой, отдельного
  // состояния для глобуса не создаём.
  function handleGlobeCityClick(city: string, iata: string) {
    if (!originAirport) {
      resolveAirport(iata, city).then((a) => {
        setOriginAirport(a);
        setErrors((p) => ({ ...p, origin: "" }));
      });
    } else if (originAirport.iata !== iata) {
      selectDestination(city, iata, "");
    }
  }

  const globeOrigin: GlobeCitySelection | null = originAirport ? { iata: originAirport.iata, city: originAirport.city } : null;
  const globeDestination: GlobeCitySelection | null = destAirport ? { iata: destAirport.iata, city: destAirport.city } : null;

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 10);
      if (window.scrollY < 420) {
        setActiveSection("search");
      } else if (window.scrollY < 980) {
        setActiveSection("directions");
      } else if (window.scrollY < 1580) {
        setActiveSection("deals");
      } else {
        setActiveSection("help");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openDatePicker(field: "depart" | "return") {
    setDatepickerField(field);
    setDatepickerOpen(true);
  }

  function swap() {
    setOriginAirport(destAirport);
    setDestAirport(originAirport);
  }

  // --- Сложный маршрут ---
  function updateSegment(id: number, patch: Partial<MultiSegment>) {
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, ...patch } : seg)));
    setErrors((p) => {
      const next = { ...p };
      Object.keys(patch).forEach((k) => delete next[`${k}${id}`]);
      return next;
    });
  }
  function swapSegment(id: number) {
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, from: seg.to, to: seg.from } : seg)));
  }
  function addSegment() {
    setSegments((s) => (s.length >= 6 ? s : [...s, { id: segIdRef.current++, from: null, to: null, date: "" }]));
  }
  function removeSegment(id: number) {
    setSegments((s) => (s.length <= 2 ? s : s.filter((seg) => seg.id !== id)));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (mode === "multi") {
      segments.forEach((seg) => {
        if (!seg.from) e[`from${seg.id}`] = "Укажите город";
        if (!seg.to) e[`to${seg.id}`] = "Укажите город";
        if (!seg.date) e[`date${seg.id}`] = "Дата";
      });
    } else {
      if (!originAirport) e.origin = "Укажите город вылета";
      if (!destAirport) e.destination = "Укажите город прилёта";
      if (!departDate) e.departDate = "Укажите дату";
      // дата возврата — опциональна (нет = в одну сторону)
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "multi") {
      // Сложный маршрут → открываем первый сегмент на Aviasales
      const first = segments[0];
      if (first?.from && first?.to && first?.date) {
        const url = buildAviasalesUrl({
          origin: first.from.iata,
          destination: first.to.iata,
          departDate: first.date,
          adults: passengers.adults,
        });
        window.open(url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    const params = new URLSearchParams({
      fromCity: originAirport!.city,
      fromIata: originAirport!.iata,
      toCity: destAirport!.city,
      toIata: destAirport!.iata,
      date: departDate,
      adults: String(passengers.adults),
      children: String(passengers.children),
      infants: String(passengers.infants),
      cabin,
    });
    if (returnDate) params.set("returnDate", returnDate);

    addRecentSearch({
      fromCity: originAirport!.city,
      fromIata: originAirport!.iata,
      toCity: destAirport!.city,
      toIata: destAirport!.iata,
      date: departDate,
      returnDate: returnDate || undefined,
      adults: passengers.adults,
    });

    // Открываем полный поиск Aviasales с маркером
    const aviasalesUrl = buildAviasalesUrl({
      origin: originAirport!.iata,
      destination: destAirport!.iata,
      departDate,
      returnDate: returnDate || undefined,
      adults: passengers.adults,
    });
    window.open(aviasalesUrl, "_blank", "noopener,noreferrer");

    setSearching(true);
    setTimeout(() => router.push(`/search?${params.toString()}`), 620);
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header
        className={`sticky top-0 z-40 border-b border-[var(--color-ink-border)] transition-all duration-300 ${isScrolled ? "shadow-xl shadow-black/20" : ""}`}
        style={{ background: "linear-gradient(180deg, var(--color-ink) 0%, var(--color-ink-soft) 100%)" }}
      >
        <div className={`mx-auto flex max-w-[1400px] items-center justify-between px-6 transition-all duration-200 sm:px-8 ${isScrolled ? "py-2.5" : "py-4"}`}>
          <a href="#search" className="flex items-center gap-2.5">
            <LogoMark size={38} />
            <span className="font-heading text-xl font-bold tracking-tight text-white">Aviator</span>
          </a>
          <nav className="hidden lg:flex items-center gap-5 text-[13px] font-medium text-white/70 xl:gap-6">
            <a
              href="#search"
              className={`whitespace-nowrap transition-colors hover:text-white ${activeSection === "search" ? "text-[var(--color-gold)]" : ""}`}
            >
              Авиабилеты
            </a>
            {/* Остальные вертикали пока не реализованы — заглушки без перехода, как и раньше в пилюлях под hero. */}
            {["Отели", "Туры", "eSIM", "Страхование", "Билеты на поезд", "Трансферы"].map((label) => (
              <button
                key={label}
                type="button"
                className="whitespace-nowrap text-white/50 transition-colors hover:text-white"
              >
                {label}
              </button>
            ))}
            <a
              href="#deals"
              className={`whitespace-nowrap transition-colors hover:text-white ${activeSection === "deals" ? "text-[var(--color-gold)]" : ""}`}
            >
              Акции
            </a>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="tel:+78005550199"
              className="mr-1 hidden items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[12px] font-medium text-white/80 transition hover:border-[var(--color-gold)] hover:text-white xl:inline-flex"
            >
              <span aria-hidden className="text-[var(--color-gold)]">☎</span>
              <span>
                Поддержка 24/7<br />
                <span className="font-mono text-[11px] font-semibold text-white">+7 800 555-01-99</span>
              </span>
            </a>
            <ThemeToggle />
            <div className="hidden items-center lg:flex">
              <SettingsSwitcher variant="dark" />
            </div>
            {user ? (
              <Link
                href="/account"
                className="ml-1 hidden items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-[13px] font-semibold text-white transition hover:border-[var(--color-gold)] lg:inline-flex"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-gold)] text-[10px] font-bold text-[var(--color-ink)]">
                  {(user.fullName || user.email)[0]?.toUpperCase()}
                </span>
                {user.fullName || user.email.split("@")[0]}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="ml-1 hidden rounded-xl border border-transparent bg-[var(--color-gold)] px-4 py-2 text-[13px] font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-gold-dark)] lg:inline-block"
              >
                Войти
              </button>
            )}
            <MobileMenu activeSection={activeSection} onLogin={() => setAuthOpen(true)} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="search"
        className="relative overflow-hidden px-4 py-14 text-white md:py-16"
        style={{
          background:
            "radial-gradient(circle at 15% 12%, rgba(47,217,138,0.10) 0%, transparent 30%), radial-gradient(circle at 88% 8%, rgba(46,107,255,0.20) 0%, transparent 35%), linear-gradient(160deg, #050b18 0%, #0a1730 55%, #0d1f3d 100%)",
        }}
      >
        {/* Декоративные пятна — просто цветовые акценты, без глобуса на весь фон
            (глобус теперь отдельный ограниченный блок ниже, а не подложка секции). */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -top-8 right-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        {/* Свернуть/развернуть форму поиска */}
        <button
          type="button"
          onClick={() => setFormCollapsed((v) => !v)}
          className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 md:right-6 md:top-6"
        >
          {formCollapsed ? (
            <>
              <IconSearch size={14} className="shrink-0" />
              Поиск
            </>
          ) : (
            <>
              Свернуть
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </>
          )}
        </button>

        {!formCollapsed && (
          <>
            {/* Живой глобус маршрутов + Популярные направления рядом с ним (десктоп).
                Один state с формой: клик по точке/панели двигает originAirport/destAirport,
                а форма отражает то же самое — никакой второй системы поиска. */}
            <div className="animate-fade-in-down relative z-10 mx-auto mt-8 grid w-full max-w-[1440px] gap-3 px-4 lg:grid-cols-[1fr_300px]">
              <div className="relative h-[300px] overflow-hidden rounded-3xl border border-white/10 sm:h-[360px] md:h-[420px]">
                <GlobeHero origin={globeOrigin} destination={globeDestination} onCityClick={handleGlobeCityClick} />
              </div>
              <div className="hidden lg:block">
                <PopularDirectionsPanel destinations={POPULAR_DESTS} prices={popularPrices} onSelect={selectDestination} />
              </div>
            </div>

            {/* Search card */}
            <form
              onSubmit={handleSearch}
              noValidate
              className="animate-fade-in-down relative z-10 mx-auto mt-10 w-full max-w-[1440px] overflow-visible text-left"
            >
            {/* Верхняя строка: переключатель сложного маршрута */}
            <div className="px-5 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setMode(mode === "multi" ? "simple" : "multi")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  mode === "multi"
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
                }`}
                title="Перелёты с пересадками в нескольких городах"
              >
                <IconRoute size={16} />
                {mode === "multi" ? "Обычный поиск" : "Сложный маршрут"}
              </button>
            </div>

            {/* --- Обычный поиск (карточки-боксы, одна строка) --- */}
            {mode === "simple" && (
              <div className="px-4 pb-4">
                <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] xl:flex-row xl:divide-x xl:divide-y-0">
                {/* Маршрут: Откуда + Куда со свапом */}
                <div className="relative flex flex-col divide-y divide-[var(--color-border)] sm:flex-row sm:divide-x sm:divide-y-0 xl:flex-[3] min-w-0">
                  {/* Скругления по брейкпоинтам: <sm — верхняя ячейка колонки, sm..xl — левый
                      верхний угол бара, xl+ — левый торец строки. */}
                  <div className={`relative flex-1 min-w-0 ${boxBase} rounded-t-2xl sm:rounded-tr-none xl:rounded-bl-2xl ${errors.origin ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}>
                    <IconPlane className="text-[var(--color-primary)] shrink-0" />
                    <AirportInput
                      airport={originAirport}
                      onChange={(a) => {
                        setOriginAirport(a);
                        setErrors((p) => ({ ...p, origin: "" }));
                      }}
                      label=""
                      placeholder={errors.origin || "Откуда"}
                      excludeIata={destAirport?.iata}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={swap}
                    title="Поменять местами"
                    className="absolute z-10 top-1/2 -translate-y-1/2 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm hover:bg-[var(--color-primary-light)] hover:shadow-md transition"
                  >
                    <IconSwap size={15} className="rotate-90 sm:rotate-0 hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* sm..xl «Куда» замыкает правый верхний угол бара, на xl+ — рядовая ячейка */}
                  <div className={`relative flex-1 min-w-0 ${boxBase} sm:rounded-tr-2xl xl:rounded-tr-none ${errors.destination ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}>
                    <IconPin className="text-[var(--color-primary)] shrink-0" />
                    <AirportInput
                      airport={destAirport}
                      onChange={(a) => {
                        setDestAirport(a);
                        setErrors((p) => ({ ...p, destination: "" }));
                      }}
                      label=""
                      placeholder={errors.destination || "Куда"}
                      excludeIata={originAirport?.iata}
                    />
                  </div>
                </div>

                {/* Даты */}
                <div ref={datepickerRef} className="relative flex divide-x divide-[var(--color-border)] xl:flex-[2] min-w-0">
                  {/* Туда */}
                  <div
                    className={`flex-1 min-w-0 ${boxBase} ${errors.departDate ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}
                    onClick={() => openDatePicker("depart")}
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className={`text-[15px] truncate ${departDate ? "text-[var(--color-text)] font-medium" : errors.departDate ? "text-red-500 font-medium" : "text-[var(--color-text-muted)]"}`}>
                        {departDate ? fmtDate(departDate) : errors.departDate ? errors.departDate : "Дата вылета"}
                      </div>
                    </div>
                    <IconCalendar className="text-[var(--color-primary)] shrink-0" />
                  </div>

                  {/* Обратно */}
                  <div
                    className={`flex-1 min-w-0 ${boxBase}`}
                    onClick={() => openDatePicker("return")}
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className={`text-[15px] truncate ${returnDate ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                          {returnDate ? fmtDate(returnDate) : "Обратно"}
                        </span>
                        {returnDate && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReturnDate("");
                            }}
                            title="Убрать обратный билет"
                            className="ml-1 shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs leading-none"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <IconCalendar className={`shrink-0 ${returnDate ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
                  </div>

                  {datepickerOpen && (
                    <div className="absolute top-full left-0 mt-2 z-50">
                      <DateRangePicker
                        mode="range"
                        departDate={departDate}
                        returnDate={returnDate}
                        onDepartChange={(d) => {
                          setDepartDate(d);
                          setErrors((p) => ({ ...p, departDate: "" }));
                        }}
                        onReturnChange={(d) => setReturnDate(d)}
                        initialField={datepickerField}
                        onClose={() => setDatepickerOpen(false)}
                        originIata={originAirport?.iata}
                        destinationIata={destAirport?.iata}
                      />
                    </div>
                  )}
                </div>

                {/* Пассажиры */}
                <PassengersPicker
                  passengers={passengers}
                  cabin={cabin}
                  onPassengers={setPassengers}
                  onCabin={setCabin}
                  align="right"
                  variant="bar"
                  className="xl:flex-1 min-w-0"
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={searching}
                  className="relative flex min-h-[60px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-bl-2xl rounded-br-2xl bg-[var(--color-accent)] px-8 font-bold text-[var(--color-accent-foreground)] transition-colors duration-200 hover:brightness-[1.06] active:brightness-95 disabled:cursor-default xl:w-auto xl:rounded-bl-none xl:rounded-tr-2xl"
                >
                  {searching ? (
                    <>
                      <IconPlane size={18} className="plane-takeoff" />
                      Взлетаем…
                    </>
                  ) : (
                    <>
                      <IconSearch size={18} />
                      Найти билеты
                    </>
                  )}
                </button>
                </div>
              </div>
            )}

            {/* --- Сложный маршрут --- */}
            {mode === "multi" && (
              <>
                <MultiCitySegments
                  segments={segments}
                  errors={errors}
                  onUpdate={updateSegment}
                  onSwap={swapSegment}
                  onAdd={addSegment}
                  onRemove={removeSegment}
                />
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 px-4 pb-4">
                  <PassengersPicker
                    passengers={passengers}
                    cabin={cabin}
                    onPassengers={setPassengers}
                    onCabin={setCabin}
                    align="left"
                    className="md:w-64"
                  />
                  <button
                    type="submit"
                    className="flex min-h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-accent)] px-8 font-bold text-[var(--color-accent-foreground)] shadow-[0_12px_34px_rgba(47,217,138,0.35)] ring-1 ring-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_42px_rgba(47,217,138,0.42)] active:scale-[0.98]"
                  >
                    <IconSearch size={18} />
                    Найти билеты
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Быстрые маршруты — рабочие шорткаты (не декор), заполняют Откуда/Куда и
              синхронизируют глобус. Показываем только пока нет истории поиска — она
              для тех же целей и полезнее (свои реальные маршруты), не дублируем оба ряда. */}
          {recentSearches.length === 0 && originAirport && (
            <div className="relative z-10 mx-auto mt-4 w-full max-w-[1440px] overflow-x-auto scrollbar-hide">
              <QuickRoutes
                originCity={originAirport.city}
                originIata={originAirport.iata}
                destinations={POPULAR_DESTS}
                prices={popularPrices}
                onSelect={selectDestination}
              />
            </div>
          )}

          {/* Популярные направления — компактный вариант для мобильных/планшетов, где
              боковой панели рядом с глобусом нет места (см. `hidden lg:block` выше). */}
          <div className="relative z-10 mx-auto mt-3 w-full max-w-[1440px] lg:hidden">
            <PopularDirectionsPanel destinations={POPULAR_DESTS} prices={popularPrices} onSelect={selectDestination} />
          </div>

          {recentSearches.length > 0 && (
            <div className="relative z-10 mx-auto mt-4 flex w-full max-w-[1440px] gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
              {recentSearches.map((s) => (
                <button
                  key={`${s.fromIata}-${s.toIata}`}
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams({
                      fromCity: s.fromCity,
                      fromIata: s.fromIata,
                      toCity: s.toCity,
                      toIata: s.toIata,
                      date: s.date,
                      adults: String(s.adults),
                    });
                    if (s.returnDate) params.set("returnDate", s.returnDate);
                    router.push(`/search?${params.toString()}`);
                  }}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <span className="font-mono text-[13px]">{s.fromIata}</span>
                  <IconPlane size={11} className="rotate-90 opacity-70" />
                  <span className="font-mono text-[13px]">{s.toIata}</span>
                  <span className="opacity-60">·</span>
                  <span className="opacity-90">{formatShortDate(s.date)}</span>
                </button>
              ))}
            </div>
          )}
          </>
        )}
      </section>

      {/* Counters — статистика */}
      <Counters />

      {/* Почему выбирают нас */}
      <WhyUs />

      {/* Карусель направлений */}
      <DirectionsCarousel />

      {/* Карта направлений */}
      <section className="bg-[var(--color-bg)] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text)]">Карта направлений</h2>
              <p className="mt-2 text-[var(--color-text-muted)]">Выберите город вылета и смотрите, куда выгодно лететь сейчас</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(ORIGIN_DEALS).map((origin) => (
                <button
                  key={origin.iata}
                  type="button"
                  onClick={() => setLocalOrigin(origin.iata as keyof typeof ORIGIN_DEALS)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    localOrigin === origin.iata
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {origin.city}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
              <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "url('/world-map.svg')", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div className="absolute left-[42%] top-[42%] z-10 rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                {localDeals.city}
              </div>
              {localDeals.items.map((deal) => (
                <Link
                  key={deal.iata}
                  href={searchHref(deal.city, deal.iata, futureDateISO(14), localDeals.city, localDeals.iata)}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/50 bg-white/90 px-3 py-2 text-xs font-bold text-[#1A2B3A] shadow-lg transition hover:-translate-y-[55%] hover:bg-[var(--color-accent)]"
                  style={{ left: deal.x, top: deal.y }}
                >
                  {deal.city}
                  <span className="ml-2 text-[var(--color-primary)]">от {deal.price} ₽</span>
                </Link>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h3 className="mb-4 text-lg font-bold text-[var(--color-text)]">Популярно из города {localDeals.city}</h3>
              <div className="space-y-3">
                {localDeals.items.map((deal) => (
                  <Link
                    key={deal.iata}
                    href={searchHref(deal.city, deal.iata, futureDateISO(14), localDeals.city, localDeals.iata)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3 transition hover:border-[var(--color-primary)]"
                  >
                    <span>
                      <span className="block text-sm font-bold text-[var(--color-text)]">{localDeals.city} → {deal.city}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{deal.country} · {deal.iata}</span>
                    </span>
                    <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-sm font-bold text-[var(--color-accent-foreground)]">
                      от {deal.price} ₽
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Популярные направления — иммерсивные плитки с фото */}
      <section id="directions" ref={directionsRef} className={`bg-[var(--color-bg-soft)] py-16 transition-all duration-700 ${dirInView ? "opacity-100" : "opacity-0 translate-y-10"}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">Популярные направления</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Куда летают чаще всего — выбирайте и ищите билеты</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { city: "Стамбул", country: "Турция", iata: "IST", price: "4 500", kw: "istanbul,city", lock: 11 },
              { city: "Дубай", country: "ОАЭ", iata: "DXB", price: "9 900", kw: "dubai,skyline", lock: 12 },
              { city: "Анталья", country: "Турция", iata: "AYT", price: "6 200", kw: "antalya,beach", lock: 13 },
              { city: "Ереван", country: "Армения", iata: "EVN", price: "3 800", kw: "yerevan,armenia", lock: 14 },
              { city: "Тбилиси", country: "Грузия", iata: "TBS", price: "4 100", kw: "tbilisi,city", lock: 15 },
              { city: "Бангкок", country: "Таиланд", iata: "BKK", price: "28 500", kw: "bangkok,temple", lock: 16 },
              { city: "Алматы", country: "Казахстан", iata: "ALA", price: "7 300", kw: "almaty,mountains", lock: 17 },
              { city: "Сочи", country: "Россия", iata: "AER", price: "3 200", kw: "sochi,sea", lock: 18 },
            ].map((d) => (
              <Link
                key={d.city}
                href={searchHref(d.city, d.iata)}
                className="group relative block h-72 overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={cityPhoto(d.kw, d.lock)}
                  alt={d.city}
                  onError={(e) => photoFallback(e, d.kw)}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <span className="absolute right-3 top-3 rounded-lg bg-white/20 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {d.iata}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="text-xs text-white/80">Москва →</div>
                  <div className="text-2xl font-bold">{d.city}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-white/85">{d.country}</span>
                    <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-sm font-bold text-[var(--color-accent-foreground)]">
                      от {d.price} ₽
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Горящие предложения — карточки рейсов со скидками */}
      <section id="deals" ref={dealsRef} className={`bg-[var(--color-bg)] py-16 transition-all duration-700 ${dealsInView ? "opacity-100" : "opacity-0 translate-y-10"}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text)]">🔥 Горящие предложения</h2>
              <p className="mt-2 text-[var(--color-text-muted)]">Лучшие цены на ближайшие даты — успейте забронировать</p>
            </div>
            <a href="#search" className="hidden text-sm font-semibold text-[var(--color-primary)] hover:underline sm:block">
              Смотреть все →
            </a>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { route: "Москва — Стамбул", city: "Стамбул", iata: "IST", disc: "−45%", time: "09:50 — 14:15", dur: "5ч 25м", stops: "прямой", days: "Пн · Ср · Сб", price: "4 500", kw: "istanbul,city", lock: 21 },
              { route: "Москва — Дубай", city: "Дубай", iata: "DXB", disc: "−30%", time: "22:30 — 04:05", dur: "5ч 35м", stops: "прямой", days: "Ежедневно", price: "9 900", kw: "dubai,skyline", lock: 22 },
              { route: "Москва — Анталья", city: "Анталья", iata: "AYT", disc: "−52%", time: "08:15 — 12:40", dur: "4ч 25м", stops: "прямой", days: "Вт · Чт · Сб", price: "6 200", kw: "antalya,beach", lock: 23 },
            ].map((d) => (
              <div key={d.route} className="overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-md transition hover:shadow-xl">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={cityPhoto(d.kw, d.lock)}
                    alt={d.route}
                    onError={(e) => photoFallback(e, d.kw)}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                    🔥 Скидка {d.disc}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-[var(--color-text)]">{d.route}</div>
                    <div className="text-lg font-bold text-[var(--color-primary)]">{d.price} ₽</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                    <span>{d.time}</span>
                    <span>{d.dur} · {d.stops}</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-muted)]">{d.days}</div>
                  <div className="mt-4 flex gap-2">
                    <Link href={searchHref(d.city, d.iata)} className="flex-1 rounded-lg border border-[var(--color-border)] py-2 text-center text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)]">
                      О городе
                    </Link>
                    <Link href={searchHref(d.city, d.iata)} className="flex-1 rounded-lg bg-[var(--color-primary)] py-2 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]">
                      Выбрать
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Отзывы клиентов */}
      <Reviews />

      {/* Помощь */}
      <section id="help" ref={helpRef} className={`bg-[var(--color-bg-soft)] py-16 transition-all duration-700 ${helpInView ? "opacity-100" : "opacity-0 translate-y-10"}`}>
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">Помощь и поддержка</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Ответы на частые вопросы</p>
          </div>
          <div className="space-y-3">
            {[
              { q: "Как вернуть или обменять билет?", a: "Откройте раздел «Мои заказы», выберите нужный билет и нажмите «Вернуть» или «Обменять». Условия зависят от тарифа авиакомпании." },
              { q: "Что входит в багаж и ручную кладь?", a: "Нормы провоза зависят от тарифа и авиакомпании. Точные лимиты по весу и габаритам показываются на этапе выбора билета." },
              { q: "Как пройти онлайн-регистрацию?", a: "Регистрация открывается за 24–48 часов до вылета. Ссылка придёт на email, либо зарегистрируйтесь на сайте авиакомпании по номеру брони." },
              { q: "Можно ли выбрать место заранее?", a: "Да, для большинства рейсов место можно выбрать при оформлении или позже в личном кабинете. На части тарифов услуга платная." },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 transition hover:border-[var(--color-primary)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-[var(--color-text)]">
                  {f.q}
                  <span className="ml-4 text-xl text-[var(--color-primary)] transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[var(--color-primary)] px-6 py-5 text-white sm:flex-row">
            <div>
              <div className="font-bold">Не нашли ответ?</div>
              <div className="text-sm text-white/80">Поддержка на связи круглосуточно</div>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-white/90"
            >
              Написать в поддержку
            </button>
          </div>
        </div>
      </section>

      {/* Подписка на рассылку + приложение */}
      <Subscribe />

      {/* Бегущая строка партнёров — перед футером */}
      <AirlinesMarquee />

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
