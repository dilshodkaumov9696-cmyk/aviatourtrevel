"use client";

import { useEffect, useRef, useState } from "react";
import AirportInput from "./components/AirportInput";
import DateRangePicker from "./components/DateRangePicker";
import MultiCitySegments, { MultiSegment } from "./components/MultiCitySegments";
import PassengersPicker, { Passengers, CabinClass, passengersLabel } from "./components/PassengersPicker";
import { IconPlane, IconPin, IconCalendar, IconSearch, IconSwap, IconRoute } from "./components/icons";
import FlightMap from "./components/FlightMap";
import ThemeToggle from "./components/ThemeToggle";
import AuthModal from "./components/AuthModal";
import LanguageSwitcher from "./components/LanguageSwitcher";
import CurrencySwitcher from "./components/CurrencySwitcher";
import MobileMenu from "./components/MobileMenu";
import Footer from "./components/Footer";
import { Airport } from "./data/airports";

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

function fmtDate(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

const boxBase =
  "flex items-center gap-2.5 min-h-[52px] rounded-xl border bg-[var(--color-bg-soft)] px-3.5 py-1.5 transition-all duration-200 cursor-pointer hover:border-[var(--color-primary)]";

// Фото города по ключевому слову (временно — позже заменим на свои/лицензионные)
const cityPhoto = (kw: string, lock: number) =>
  `https://loremflickr.com/640/480/${kw}?lock=${lock}`;
// Если loremflickr не ответит — подменяем на гарантированное фото
function photoFallback(e: React.SyntheticEvent<HTMLImageElement>, seed: string) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = `https://picsum.photos/seed/${seed}/640/480`;
}

export default function Home() {
  // Режим формы: обычный (туда + опц. обратно) или сложный маршрут
  const [mode, setMode] = useState<"simple" | "multi">("simple");

  // Простой маршрут
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destAirport, setDestAirport] = useState<Airport | null>(null);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

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

  // Sticky header на скролле
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (datepickerRef.current && !datepickerRef.current.contains(e.target as Node)) {
        setDatepickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
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
      const route = segments
        .map((s, i) => `${i + 1}. ${s.from!.iata} → ${s.to!.iata} · ${fmtDate(s.date)}`)
        .join("\n");
      alert(route + "\n" + passengersLabel(passengers, cabin));
      return;
    }

    const way = returnDate ? "туда-обратно" : "в одну сторону";
    alert(
      `${originAirport!.iata} → ${destAirport!.iata} (${way})\n` +
        `${fmtDate(departDate)}${returnDate ? " — " + fmtDate(returnDate) : ""}\n` +
        passengersLabel(passengers, cabin)
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className={`sticky top-0 z-40 bg-[var(--color-surface)] transition-all duration-200 ${isScrolled ? "border-b border-[var(--color-border)] shadow-md" : "border-b border-[var(--color-border)]"}`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-200 ${isScrolled ? "py-2" : "py-4"}`}>
          <a href="#search" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold text-[var(--color-primary)]">Aviator</span>
          </a>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[var(--color-text-muted)]">
            <a href="#search" className="transition-colors hover:text-[var(--color-primary)]">Авиабилеты</a>
            <a href="#directions" className="transition-colors hover:text-[var(--color-primary)]">Направления</a>
            <a href="#deals" className="transition-colors hover:text-[var(--color-primary)]">Акции</a>
            <a href="#help" className="transition-colors hover:text-[var(--color-primary)]">Помощь</a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <div className="hidden items-center lg:flex">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="ml-1 hidden rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)] lg:inline-block"
            >
              Войти
            </button>
            <MobileMenu onLogin={() => setAuthOpen(true)} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="search"
        className="relative flex flex-col items-center justify-center px-4 py-20 text-white"
        style={{ backgroundAttachment: "fixed", 
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        }}
      >
        <FlightMap />
        <div className="mx-auto max-w-3xl w-full text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Найдите дешёвые авиабилеты
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/80">
            Сравниваем сотни авиакомпаний и агентств за секунды
          </p>
        </div>

        {/* Search card */}
        <form
          onSubmit={handleSearch}
          noValidate
          className="mx-auto w-full max-w-[1280px] mt-10 rounded-2xl bg-[var(--color-surface)]/85 backdrop-blur-xl shadow-2xl text-left overflow-visible border border-white/30 dark:border-white/10"
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
              <div className="px-4 pb-4 flex flex-col lg:flex-row gap-2">
                {/* Маршрут: Откуда + Куда со свапом */}
                <div className="relative flex flex-col sm:flex-row gap-2 lg:flex-[2] min-w-0">
                  <div className={`flex-1 min-w-0 ${boxBase} ${errors.origin ? "border-red-400" : "border-[var(--color-border)]"} focus-within:border-[var(--color-primary)]`}>
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

                  <div className={`flex-1 min-w-0 ${boxBase} ${errors.destination ? "border-red-400" : "border-[var(--color-border)]"} focus-within:border-[var(--color-primary)]`}>
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
                <div ref={datepickerRef} className="relative flex gap-2 lg:flex-[2] min-w-0">
                  {/* Туда */}
                  <div
                    className={`flex-1 min-w-0 ${boxBase} cursor-pointer hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:outline-none ${errors.departDate ? "border-red-400" : "border-[var(--color-border)]"}`}
                    onClick={() => openDatePicker("depart")}
                  >
                    <IconCalendar className="text-[var(--color-primary)] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--color-text-muted)]">
                        {errors.departDate ? <span className="text-red-500">{errors.departDate}</span> : "Туда"}
                      </div>
                      <div className={`text-[15px] ${departDate ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                        {departDate ? fmtDate(departDate) : "Дата вылета"}
                      </div>
                    </div>
                  </div>

                  {/* Обратно */}
                  <div
                    className={`flex-1 min-w-0 ${boxBase} border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)]`}
                    onClick={() => openDatePicker("return")}
                  >
                    <IconCalendar className={`shrink-0 ${returnDate ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--color-text-muted)]">Обратно</div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[15px] ${returnDate ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                          {returnDate ? fmtDate(returnDate) : "В одну сторону"}
                        </span>
                        {returnDate && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReturnDate("");
                            }}
                            title="Убрать обратный билет"
                            className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs leading-none"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
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
                  className="lg:flex-1"
                />

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full lg:w-auto flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-gradient-to-r from-green-400 to-green-600 px-8 font-bold text-white hover:from-green-600 hover:to-green-400 bg-[length:200%_100%] hover:bg-right transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-md whitespace-nowrap"
                >
                  <IconSearch size={18} />
                  Найти билеты
                </button>
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
                    className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-gradient-to-r from-green-400 to-green-600 px-8 font-bold text-white hover:from-green-600 hover:to-green-400 bg-[length:200%_100%] hover:bg-right transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-md whitespace-nowrap"
                  >
                    <IconSearch size={18} />
                    Найти билеты
                  </button>
                </div>
              </>
            )}
          </form>
      </section>

      {/* Advantages */}
      <section className="bg-[var(--color-bg)] py-16">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "💰", title: "Лучшая цена", text: "Сравниваем сотни источников за один поиск" },
            { icon: "🕐", title: "Поддержка 24/7", text: "Поможем с бронированием в любое время" },
            { icon: "🛡️", title: "Безопасно", text: "Защищённая оплата и проверенные партнёры" },
          ].map((a) => (
            <div key={a.title} className="text-center">

              <div className="text-5xl mb-3">{a.icon}</div>
              <h3 className="text-xl font-bold text-[var(--color-primary)]">{a.title}</h3>
              <p className="mt-2 text-[var(--color-text-muted)]">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Популярные направления — иммерсивные плитки с фото */}
      <section id="directions" className="bg-[var(--color-bg-soft)] py-16">
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
              <a
                key={d.city}
                href="#search"
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
                    <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-sm font-bold text-[#3A2E00]">
                      от {d.price} ₽
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Горящие предложения — карточки рейсов со скидками */}
      <section id="deals" className="bg-[var(--color-bg)] py-16">
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
              { route: "Москва — Стамбул", disc: "−45%", time: "09:50 — 14:15", dur: "5ч 25м", stops: "прямой", days: "Пн · Ср · Сб", price: "4 500", kw: "istanbul,city", lock: 21 },
              { route: "Москва — Дубай", disc: "−30%", time: "22:30 — 04:05", dur: "5ч 35м", stops: "прямой", days: "Ежедневно", price: "9 900", kw: "dubai,skyline", lock: 22 },
              { route: "Москва — Анталья", disc: "−52%", time: "08:15 — 12:40", dur: "4ч 25м", stops: "прямой", days: "Вт · Чт · Сб", price: "6 200", kw: "antalya,beach", lock: 23 },
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
                    <button type="button" className="flex-1 rounded-lg border border-[var(--color-border)] py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)]">
                      О городе
                    </button>
                    <button type="button" className="flex-1 rounded-lg bg-[var(--color-primary)] py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]">
                      Выбрать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Помощь */}
      <section id="help" className="bg-[var(--color-bg-soft)] py-16">
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
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-white/90"
            >
              Написать в поддержку
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
