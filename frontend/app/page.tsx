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
import PopularDirectionsPanel, { type PopularRoute } from "./components/PopularDirectionsPanel";
import { useInViewAnimation } from "./hooks/useInViewAnimation";
import { useRecentSearches } from "./hooks/useRecentSearches";
import AirportInput from "./components/AirportInput";
import DateRangePicker from "./components/DateRangePicker";
import MultiCitySegments, { MultiSegment } from "./components/MultiCitySegments";
import PassengersPicker, { Passengers, CabinClass, EMPTY_PASSENGERS } from "./components/PassengersPicker";
import { IconPlane, IconPin, IconCalendar, IconSearch, IconSwap, IconRoute } from "./components/icons";
import { Airplane, Buildings, MapTrifold, SimCard, ShieldCheck, Train, Car, Percent, Headset, Moon, Sun, User } from "@phosphor-icons/react";

import LogoMark from "./components/Logo";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./context/auth";
import { useSettings } from "./context/settings";
import { usePublishHomeRoute } from "./context/chatRoute";
import SettingsSwitcher from "./components/SettingsSwitcher";
import MobileMenu from "./components/MobileMenu";
import Footer from "./components/Footer";
import WhyUs from "./components/WhyUs";
import DirectionsCarousel from "./components/DirectionsCarousel";
import AirlinesMarquee from "./components/AirlinesMarquee";
import Reviews from "./components/Reviews";
import Subscribe from "./components/Subscribe";
import { Airport, loadAirports } from "./data/airports";
import { cityPhotoFallback, cityPhotoUrl } from "./data/cityPhotos";

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

function fmtDate(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

// Ячейка единой строки поиска: без собственной рамки и фона — их даёт контейнер-бар,
// поля стыкуются вплотную и разделяются только 1px-дивайдерами.
function flightsWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "перелёт";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "перелёта";
  return "перелётов";
}

const boxBase =
  "relative flex min-h-[72px] items-center gap-2.5 px-3.5 py-3 transition-colors duration-200 cursor-pointer hover:bg-[var(--color-surface)] focus-within:bg-[var(--color-surface)] sm:min-h-[76px] sm:gap-3 sm:px-5 xl:min-h-[84px] xl:px-6";

const HEADER_NAV_BTN =
  "group inline-flex items-center gap-2 rounded-full px-3.5 py-3 text-[13px] font-medium tracking-[0.01em] whitespace-nowrap transition-all duration-200 2xl:gap-2.5 2xl:px-4 2xl:text-[13.5px]";
const HEADER_NAV_IDLE =
  "bg-white/[0.045] text-white/78 ring-1 ring-inset ring-white/10 hover:bg-white/14 hover:text-white hover:ring-white/22 hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]";
const HEADER_NAV_ACTIVE =
  "bg-white/16 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-inset ring-white/28";

const HEADER_NAV_ICONS = [
  ["flights", Airplane],
  ["hotels", Buildings],
  ["tours", MapTrifold],
  ["esim", SimCard],
  ["insurance", ShieldCheck],
  ["trains", Train],
  ["transfers", Car],
  ["deals", Percent],
] as const;

function HeaderThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  }

  if (dark === null) {
    return <div className="h-10 w-10 rounded-full border border-white/20 bg-white/10" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      {dark ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />}
    </button>
  );
}

function futureDateISO(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

const POPULAR_ROUTES = [
  { fromCity: "Ташкент", fromCountry: "Узбекистан", fromIata: "TAS", toCity: "Лондон", toCountry: "Великобритания", toIata: "LON" },
  { fromCity: "Душанбе", fromCountry: "Таджикистан", fromIata: "DYU", toCity: "Мюнхен", toCountry: "Германия", toIata: "MUC" },
  { fromCity: "Ташкент", fromCountry: "Узбекистан", fromIata: "TAS", toCity: "Нью-Йорк", toCountry: "США", toIata: "JFK" },
  { fromCity: "Душанбе", fromCountry: "Таджикистан", fromIata: "DYU", toCity: "Париж", toCountry: "Франция", toIata: "PAR" },
  { fromCity: "Ташкент", fromCountry: "Узбекистан", fromIata: "TAS", toCity: "Дубай", toCountry: "ОАЭ", toIata: "DXB" },
  { fromCity: "Душанбе", fromCountry: "Таджикистан", fromIata: "DYU", toCity: "Стамбул", toCountry: "Турция", toIata: "IST" },
] as const;

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
  const { t, format } = useSettings();
  const { add: addRecentSearch } = useRecentSearches();
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
  const [passengers, setPassengers] = useState<Passengers>(EMPTY_PASSENGERS);

  // Сложный маршрут
  const [segments, setSegments] = useState<MultiSegment[]>([
    { id: 1, from: null, to: null, date: "" },
    { id: 2, from: null, to: null, date: "" },
  ]);
  const segIdRef = useRef(3);
  // Итог по сложному маршруту: список перелётов со своей ссылкой на Aviasales для
  // каждого. Раньше кнопка «Найти билеты» открывала Aviasales только по первому
  // перелёту, а остальные сегменты молча терялись — нет ни объединённого мультигорода
  // у Aviasales, который мы могли бы честно построить, ни своего поиска на несколько
  // городов. Так хотя бы ни один введённый перелёт не пропадает.
  const [multiRoutePlan, setMultiRoutePlan] = useState<MultiSegment[] | null>(null);

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
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<"search" | "directions" | "deals" | "help">("search");

  // Анимации при скролле для основных секций
  const { ref: directionsRef, isInView: dirInView } = useInViewAnimation<HTMLElement>();
  const { ref: dealsRef, isInView: dealsInView } = useInViewAnimation<HTMLElement>();
  const { ref: helpRef, isInView: helpInView } = useInViewAnimation<HTMLElement>();
  const localDeals = ORIGIN_DEALS[localOrigin];

  usePublishHomeRoute({
    fromCity: originAirport?.city || "",
    fromIata: originAirport?.iata || "",
    toCity: destAirport?.city || "",
    toIata: destAirport?.iata || "",
    date: departDate,
    returnDate,
    adults: passengers.adults,
    children: passengers.children,
    infants: passengers.infants,
    infantsSeat: passengers.infantsSeat,
    cabin,
  });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (datepickerRef.current && !datepickerRef.current.contains(e.target as Node)) {
        setDatepickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
    const qInfantsSeat = qs.get("infantsSeat");
    if (qAdults || qChildren || qInfants || qInfantsSeat) {
      setPassengers({
        adults: Math.max(1, Number(qAdults) || 1),
        children: Math.max(0, Number(qChildren) || 0),
        infants: Math.max(0, Number(qInfants) || 0),
        infantsSeat: Math.max(0, Number(qInfantsSeat) || 0),
      });
    }
  }, []);

  // Цены для «Популярные направления»: реальный поиск по каждой паре маршрута.
  const [popularPrices, setPopularPrices] = useState<Record<string, number | null>>({});
  useEffect(() => {
    const date = departDate || futureDateISO(14);
    const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
    let cancelled = false;
    setPopularPrices({});

    if (isDemo) {
      import("./data/flights.demo").then(({ getDemoFlights }) => {
        if (cancelled) return;
        const next: Record<string, number | null> = {};
        for (const d of POPULAR_ROUTES) {
          const key = `${d.fromIata}-${d.toIata}`;
          const flights = getDemoFlights([d.fromIata], [d.toIata]);
          next[key] = flights.length ? Math.min(...flights.map((f) => f.pricePerPax)) : null;
        }
        setPopularPrices(next);
      });
      return () => { cancelled = true; };
    }

    for (const d of POPULAR_ROUTES) {
      const key = `${d.fromIata}-${d.toIata}`;
      searchFlights({ origin: d.fromIata, destination: d.toIata, departDate: date, adults: 1 })
        .then((flights) => {
          if (cancelled) return;
          const min = flights.length ? Math.min(...flights.map((f) => f.pricePerPax)) : null;
          setPopularPrices((prev) => ({ ...prev, [key]: min }));
        })
        .catch(() => {
          if (cancelled) return;
          setPopularPrices((prev) => ({ ...prev, [key]: null }));
        });
    }
    return () => { cancelled = true; };
  }, [departDate]);

  function resolveAirport(iata: string, cityFallback: string, countryFallback = ""): Promise<Airport> {
    return loadAirports()
      .then((all) => all.find((a) => a.iata === iata) ?? { iata, city: cityFallback, name: cityFallback, country: countryFallback })
      .catch(() => ({ iata, city: cityFallback, name: cityFallback, country: countryFallback }));
  }

  function selectDestination(city: string, iata: string, country: string) {
    resolveAirport(iata, city, country).then((a) => {
      setDestAirport(a);
      setErrors((p) => ({ ...p, destination: "" }));
    });
  }

  function selectPopularRoute(route: PopularRoute) {
    const fromNow: Airport = { iata: route.fromIata, city: route.fromCity, name: route.fromCity, country: route.fromCountry };
    const toNow: Airport = { iata: route.toIata, city: route.toCity, name: route.toCity, country: route.toCountry };
    setOriginAirport(fromNow);
    setDestAirport(toNow);
    setErrors((p) => ({ ...p, origin: "", destination: "" }));
    void Promise.all([
      resolveAirport(route.fromIata, route.fromCity, route.fromCountry),
      resolveAirport(route.toIata, route.toCity, route.toCountry),
    ]).then(([from, to]) => {
      setOriginAirport((cur) => (cur?.iata === from.iata ? from : cur));
      setDestAirport((cur) => (cur?.iata === to.iata ? to : cur));
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
  // Правки после «Найти билеты» гасят показанный план — иначе он молча разойдётся
  // с тем, что сейчас в форме.
  function updateSegment(id: number, patch: Partial<MultiSegment>) {
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, ...patch } : seg)));
    setErrors((p) => {
      const next = { ...p };
      Object.keys(patch).forEach((k) => delete next[`${k}${id}`]);
      return next;
    });
    setMultiRoutePlan(null);
  }
  function swapSegment(id: number) {
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, from: seg.to, to: seg.from } : seg)));
    setMultiRoutePlan(null);
  }
  function addSegment() {
    setSegments((s) => (s.length >= 6 ? s : [...s, { id: segIdRef.current++, from: null, to: null, date: "" }]));
    setMultiRoutePlan(null);
  }
  function removeSegment(id: number) {
    setSegments((s) => (s.length <= 2 ? s : s.filter((seg) => seg.id !== id)));
    setMultiRoutePlan(null);
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
      // Сложный маршрут: у Aviasales нет единого мультигородского поиска, который
      // мы могли бы честно собрать в одну ссылку, а свой поиск такое не считает —
      // поэтому показываем маршрут целиком и даём ссылку на Aviasales по каждому
      // перелёту отдельно, вместо того чтобы открывать только первый и терять
      // остальные (так было раньше).
      setMultiRoutePlan(segments);
      document.getElementById("multi-route-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      infantsSeat: String(passengers.infantsSeat),
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

    setSearching(true);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
          isScrolled ? "border-white/10 shadow-[0_12px_40px_rgba(2,8,20,0.45)]" : "border-white/[0.06]"
        }`}
        style={{
          background: isScrolled
            ? "linear-gradient(180deg, #06101f 0%, #0a1c38 100%)"
            : "linear-gradient(180deg, #071428 0%, #0a1d3c 58%, #0c274c 100%)",
        }}
      >
        <div className={`mx-auto flex max-w-[1760px] items-center gap-3 px-3 transition-all duration-200 sm:px-5 xl:gap-5 xl:px-6 2xl:px-8 ${isScrolled ? "py-4" : "py-6"}`}>
          <a href="#search" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <LogoMark size={38} className="xl:hidden" />
            <LogoMark size={42} className="hidden xl:block" />
            <span className="font-heading text-lg font-bold tracking-tight text-white sm:text-[22px]">Aviator</span>
          </a>
          <nav className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
            <div className="flex max-w-full items-center justify-center gap-1 2xl:gap-1.5">
              {HEADER_NAV_ICONS.map(([key, Icon]) => {
                const label = t(`nav.${key}`);
                const isLink = key === "flights" || key === "deals";
                const active = key === "flights" ? activeSection === "search" : key === "deals" ? activeSection === "deals" : comingSoon === label;
                const iconClass = active ? "text-[var(--color-accent)]" : "text-white/70 group-hover:text-white";
                const className = `${HEADER_NAV_BTN} ${active ? HEADER_NAV_ACTIVE : HEADER_NAV_IDLE}`;
                const inner = (
                  <>
                    <Icon size={16} weight="regular" className={iconClass} />
                    {label}
                  </>
                );
                if (isLink) {
                  return (
                    <a key={key} href={key === "flights" ? "#search" : "#deals"} className={className}>
                      {inner}
                    </a>
                  );
                }
                return (
                  <div key={key} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setComingSoon(label);
                        window.setTimeout(() => setComingSoon((cur) => (cur === label ? null : cur)), 1600);
                      }}
                      className={className}
                    >
                      {inner}
                    </button>
                    {comingSoon === label && (
                      <span className="animate-fade-in-down pointer-events-none absolute left-1/2 top-full z-30 mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-ink)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg ring-1 ring-white/10">
                        {t("nav.coming_soon")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
              className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2.5 text-white/90 transition hover:border-white/40 hover:bg-white/10 2xl:inline-flex 2xl:px-3.5"
            >
              <Headset size={20} weight="regular" className="shrink-0 text-[var(--color-accent)]" />
              <span className="leading-tight text-left">
                <span className="block text-[13px] font-semibold">{t("nav.support")}</span>
                <span className="block text-[11px] font-bold tracking-wide text-white">{t("nav.support_247")}</span>
              </span>
            </button>
            <HeaderThemeToggle />
            <div className="hidden items-center xl:flex">
              <SettingsSwitcher variant="dark" />
            </div>
            {user ? (
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:inline-flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-[var(--color-accent-foreground)]">
                  {(user.fullName || user.email)[0]?.toUpperCase()}
                </span>
                <span className="max-w-[7.5rem] truncate">{user.fullName || user.email.split("@")[0]}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="hidden items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-accent-foreground)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:inline-flex"
              >
                <User size={18} weight="regular" />
                {t("nav.login")}
              </button>
            )}
            <MobileMenu activeSection={activeSection} onLogin={() => setAuthOpen(true)} />
          </div>
        </div>
      </header>

      {/* Глобус теперь фон не только hero, а всего этого блока: hero + статистика + "Почему
          выбирают нас" сидят на одном непрерывном полотне карты, без переключения на белый фон
          между ними — попросили, чтобы глобус было видно и за карточками ниже, а не только
          в самом верху. */}
      <div
        className="relative text-white"
        style={{
          background:
            "radial-gradient(circle at 15% 12%, rgba(47,217,138,0.10) 0%, transparent 30%), radial-gradient(circle at 88% 8%, rgba(46,107,255,0.20) 0%, transparent 35%), linear-gradient(160deg, #050b18 0%, #0a1730 55%, #0d1f3d 100%)",
        }}
      >
        <div className="absolute inset-x-0 top-0 z-0 h-[620px] overflow-hidden sm:h-[700px] md:h-full">
          <GlobeHero origin={globeOrigin} destination={globeDestination} onCityClick={handleGlobeCityClick} />
        </div>

        {/* Hero */}
        <section id="search" className="relative z-10 overflow-visible px-3 pb-12 pt-6 sm:px-4 sm:pb-16 sm:pt-10 md:px-6 md:pb-20 md:pt-12 lg:px-8">
          <button
            type="button"
            onClick={() => setFormCollapsed((v) => !v)}
            className="absolute right-3 top-3 z-20 flex min-h-10 items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 sm:right-4 sm:top-4 md:right-6 md:top-6"
          >
            {formCollapsed ? (
              <>
                <IconSearch size={14} className="shrink-0" />
                {t("form.expand_search")}
              </>
            ) : (
              <>
                {t("form.collapse")}
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </>
            )}
          </button>

          {!formCollapsed && (
            <>
            <form
              onSubmit={handleSearch}
              noValidate
              className="animate-fade-in-down relative z-30 mx-auto mt-6 w-full min-w-0 max-w-[1760px] overflow-visible text-left sm:mt-10"
            >
            <div className="mb-5 max-w-xl pr-20 sm:mb-6 sm:pr-28">
              <h1 className="font-heading text-[1.75rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[2.55rem]">
                {t("hero.title")}
                <span className="mt-1 block text-white/90">{t("hero.title_line2")}</span>
              </h1>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">{t("hero.subtitle")}</p>
            </div>
            {mode === "simple" && (
              <div className="min-w-0">
              <div className="mb-2 flex min-w-0 items-center">
              <button
                type="button"
                onClick={() => {
                  setMode("multi");
                  setMultiRoutePlan(null);
                }}
                className="group inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors duration-300 hover:text-[var(--color-text)]"
                title="Перелёты с пересадками в нескольких городах"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] transition-all duration-300 group-hover:rotate-12 group-hover:bg-[var(--color-gold)]/15 group-hover:text-[var(--color-gold)]">
                  <IconRoute size={14} />
                </span>
                {t("form.complex")}
              </button>
              </div>
              <div className="flex min-w-0 flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_24px_60px_rgba(10,27,56,0.28)] xl:flex-row xl:items-stretch xl:divide-x xl:divide-y-0 dark:bg-[var(--color-bg-soft)]">
                {/* Маршрут: Откуда + Куда со свапом */}
                <div className="relative flex min-w-0 flex-col divide-y divide-[var(--color-border)] sm:flex-row sm:divide-x sm:divide-y-0 xl:min-w-[26rem] xl:flex-[2.6]">
                  {/* Скругления по брейкпоинтам: <sm — верхняя ячейка колонки, sm..xl — левый
                      верхний угол бара, xl+ — левый торец строки. */}
                  <div className={`relative min-w-0 flex-1 ${boxBase} rounded-t-2xl sm:rounded-tr-none xl:rounded-bl-2xl ${errors.origin ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}>
                    <IconPlane size={22} className="text-[var(--color-primary)] shrink-0" />
                    <AirportInput
                      airport={originAirport}
                      onChange={(a) => {
                        setOriginAirport(a);
                        setErrors((p) => ({ ...p, origin: "" }));
                      }}
                      label={t("form.from")}
                      placeholder={errors.origin || t("form.pick_city")}
                      excludeIata={destAirport?.iata}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={swap}
                    title="Поменять местами"
                    className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-md hover:bg-[var(--color-primary-light)] hover:shadow-lg transition"
                  >
                    <IconSwap size={15} className="rotate-90 sm:rotate-0 hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* sm..xl «Куда» замыкает правый верхний угол бара, на xl+ — рядовая ячейка */}
                  <div className={`relative min-w-0 flex-1 ${boxBase} sm:rounded-tr-2xl xl:rounded-tr-none ${errors.destination ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}>
                    <IconPin size={22} className="text-[var(--color-primary)] shrink-0" />
                    <AirportInput
                      airport={destAirport}
                      onChange={(a) => {
                        setDestAirport(a);
                        setErrors((p) => ({ ...p, destination: "" }));
                      }}
                      label={t("form.to")}
                      placeholder={errors.destination || t("form.pick_city")}
                      excludeIata={originAirport?.iata}
                    />
                  </div>
                </div>

                {/* Даты */}
                <div ref={datepickerRef} className="relative flex min-w-0 divide-x divide-[var(--color-border)] xl:min-w-[18rem] xl:flex-[1.9]">
                  {/* Туда */}
                  <div
                    className={`flex-1 min-w-0 ${boxBase} ${errors.departDate ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}
                    onClick={() => openDatePicker("depart")}
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className={`text-[15px] truncate ${departDate ? "text-[var(--color-text)] font-medium" : errors.departDate ? "text-red-500 font-medium" : "text-[var(--color-text-muted)]"}`}>
                        {departDate ? fmtDate(departDate) : errors.departDate ? errors.departDate : t("form.depart_date")}
                      </div>
                    </div>
                    <IconCalendar size={22} className="text-[var(--color-primary)] shrink-0" />
                  </div>

                  {/* Обратно */}
                  <div
                    className={`flex-1 min-w-0 ${boxBase}`}
                    onClick={() => openDatePicker("return")}
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className={`text-[15px] truncate ${returnDate ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                          {returnDate ? fmtDate(returnDate) : t("form.pick_return")}
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
                    <IconCalendar size={22} className={`shrink-0 ${returnDate ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
                  </div>

                  {datepickerOpen && (
                    <div className="fixed inset-0 z-[240] flex items-end justify-center p-3 sm:items-center md:absolute md:inset-auto md:top-full md:left-0 md:mt-2 md:block md:p-0">
                      <button
                        type="button"
                        aria-label="Close"
                        className="absolute inset-0 bg-black/45 md:hidden"
                        onClick={() => setDatepickerOpen(false)}
                      />
                      <div className="relative z-10 w-full max-w-[calc(100vw-1.5rem)] md:max-w-none">
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
                  className="xl:min-w-[13.5rem] xl:flex-[1.15] min-w-0"
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={searching}
                  className="relative flex min-h-[56px] w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-bl-2xl rounded-br-2xl bg-[var(--color-accent)] px-6 text-[16px] font-bold text-[var(--color-accent-foreground)] transition-colors duration-200 hover:brightness-[1.06] active:brightness-95 disabled:cursor-default sm:min-h-[76px] sm:px-10 xl:min-h-[84px] xl:w-[11.5rem] xl:rounded-bl-none xl:rounded-tr-2xl"
                >
                  {searching ? (
                    <>
                      <IconPlane size={18} className="plane-takeoff" />
                      {t("form.searching")}
                    </>
                  ) : (
                    <>
                      <IconSearch size={18} />
                      {t("form.search")}
                    </>
                  )}
                </button>
              </div>
              </div>
            )}

            {/* --- Сложный маршрут --- */}
            {mode === "multi" && (
              <div className="min-w-0 overflow-visible rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_24px_60px_rgba(10,27,56,0.28)] dark:bg-[var(--color-bg-soft)]">
                <div className="flex min-w-0 items-center px-4 pt-2.5 sm:px-5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("simple");
                      setMultiRoutePlan(null);
                    }}
                    className="group inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-light)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors duration-300"
                    title="Вернуться к обычному поиску"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] text-white">
                      <IconRoute size={14} />
                    </span>
                    {t("form.simple")}
                  </button>
                </div>
                <MultiCitySegments
                  segments={segments}
                  errors={errors}
                  onUpdate={updateSegment}
                  onSwap={swapSegment}
                  onAdd={addSegment}
                  onRemove={removeSegment}
                />
                <div className="flex min-w-0 flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-end sm:px-5">
                  <PassengersPicker
                    passengers={passengers}
                    cabin={cabin}
                    onPassengers={setPassengers}
                    onCabin={setCabin}
                    align="right"
                    className="w-full min-w-0 sm:w-64"
                  />
                  <button
                    type="submit"
                    className="flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-accent)] px-6 font-bold text-[var(--color-accent-foreground)] shadow-[0_12px_34px_rgba(47,217,138,0.35)] ring-1 ring-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_42px_rgba(47,217,138,0.42)] active:scale-[0.98] sm:w-auto sm:min-w-[12.5rem] sm:px-8"
                  >
                    <IconSearch size={18} />
                    {t("form.search")}
                  </button>
                </div>

                {/* Итог по маршруту: своей ссылки Aviasales на несколько городов сразу нет,
                    поэтому честно даём отдельную ссылку на каждый перелёт вместо того чтобы
                    молча искать только первый. */}
                {multiRoutePlan && (
                  <div id="multi-route-plan" className="mx-4 mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
                    <div className="mb-1 text-sm font-semibold text-[var(--color-text)]">
                      Ваш маршрут — {multiRoutePlan.length} {flightsWord(multiRoutePlan.length)}
                    </div>
                    <p className="mb-3 text-xs text-[var(--color-text-muted)]">
                      Единого поиска на несколько городов у нас пока нет — откройте Aviasales отдельно по каждому перелёту.
                    </p>
                    <ul className="space-y-2">
                      {multiRoutePlan.map((seg, i) =>
                        seg.from && seg.to && seg.date ? (
                          <li
                            key={seg.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
                                {i + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-[var(--color-text)]">
                                  {seg.from.city} → {seg.to.city}
                                </div>
                                <div className="text-xs text-[var(--color-text-muted)]">
                                  {new Date(seg.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                                </div>
                              </div>
                            </div>
                            <a
                              href={buildAviasalesUrl({
                                origin: seg.from.iata,
                                destination: seg.to.iata,
                                departDate: seg.date,
                                adults: passengers.adults,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                            >
                              Открыть на Aviasales →
                            </a>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Популярные направления: клик подставляет оба города в форму и сразу
              рисует дугу на глобусе. Даты и пассажиры не меняются. */}
          <div className="relative z-20 mx-auto mt-4 flex w-full max-w-[1760px] justify-end">
            <div className="w-full lg:w-[300px]">
              <PopularDirectionsPanel routes={POPULAR_ROUTES} prices={popularPrices} onSelect={selectPopularRoute} />
            </div>
          </div>

            </>
          )}
        </section>

        <div className="relative z-10">
          <WhyUs />
        </div>
      </div>

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
                    <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]">
                      {popularPrices[`${localDeals.iata}-${deal.iata}`] != null
                        ? `${t("filters.price_from")} ${format(popularPrices[`${localDeals.iata}-${deal.iata}`]!)}`
                        : t("popular.price_tba")}
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
              { city: "Стамбул", country: "Турция", iata: "IST" },
              { city: "Дубай", country: "ОАЭ", iata: "DXB" },
              { city: "Анталья", country: "Турция", iata: "AYT" },
              { city: "Ереван", country: "Армения", iata: "EVN" },
              { city: "Тбилиси", country: "Грузия", iata: "TBS" },
              { city: "Бангкок", country: "Таиланд", iata: "BKK" },
              { city: "Алматы", country: "Казахстан", iata: "ALA" },
              { city: "Сочи", country: "Россия", iata: "AER" },
            ].map((d) => (
              <Link
                key={d.city}
                href={searchHref(d.city, d.iata)}
                className="group relative block h-72 overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={cityPhotoUrl(d.iata)}
                  alt={d.city}
                  onError={cityPhotoFallback}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <span className="absolute right-3 top-3 rounded-lg bg-white/20 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {d.iata}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="text-2xl font-bold">{d.city}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-white/85">{d.country}</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {popularPrices[d.iata] != null ? `${t("filters.price_from")} ${format(popularPrices[d.iata]!)}` : t("popular.price_tba")}
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
              <h2 className="text-3xl font-bold text-[var(--color-text)]">Идеи для поездки</h2>
              <p className="mt-2 text-[var(--color-text-muted)]">{t("deals.illustrative")}</p>
            </div>
            <a href="#search" className="hidden text-sm font-semibold text-[var(--color-primary)] hover:underline sm:block">
              Смотреть все →
            </a>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { route: "Москва — Стамбул", city: "Стамбул", iata: "IST" },
              { route: "Москва — Дубай", city: "Дубай", iata: "DXB" },
              { route: "Москва — Анталья", city: "Анталья", iata: "AYT" },
            ].map((d) => (
              <div key={d.route} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md transition hover:shadow-xl">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={cityPhotoUrl(d.iata)}
                    alt={d.route}
                    onError={cityPhotoFallback}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-lg font-bold text-[var(--color-text)]">{d.route}</div>
                    <div className="text-sm font-semibold text-[var(--color-text-muted)]">
                      {popularPrices[d.iata] != null ? `${t("filters.price_from")} ${format(popularPrices[d.iata]!)}` : t("popular.price_tba")}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t("deals.illustrative")}</p>
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
