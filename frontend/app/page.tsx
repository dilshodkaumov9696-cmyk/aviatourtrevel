"use client";

import { useEffect, useRef, useState } from "react";
import AirportInput from "./components/AirportInput";
import DateRangePicker from "./components/DateRangePicker";
import MultiCitySegments, { MultiSegment } from "./components/MultiCitySegments";
import PassengersPicker, { Passengers, CabinClass, passengersLabel } from "./components/PassengersPicker";
import { IconPlane, IconPin, IconCalendar, IconSearch, IconSwap, IconRoute } from "./components/icons";
import FlightMap from "./components/FlightMap";
import ThemeToggle from "./components/ThemeToggle";

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

function fmtDate(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

const boxBase =
  "flex items-center gap-2.5 min-h-[52px] rounded-xl border bg-[var(--color-bg-soft)] px-3.5 py-1.5 transition-all duration-200 cursor-pointer hover:border-[var(--color-primary)]";

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

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (datepickerRef.current && !datepickerRef.current.contains(e.target as Node)) {
        setDatepickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
      <header className="bg-white border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold text-[var(--color-primary)]">Aviator</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-muted)]">
            <a href="#" className="hover:text-[var(--color-primary)]">Авиабилеты</a>
            <a href="#" className="hover:text-[var(--color-primary)]">Направления</a>
            <a href="#" className="hover:text-[var(--color-primary)]">Акции</a>
            <a href="#" className="hover:text-[var(--color-primary)]">Помощь</a>
          </nav>
          <button className="rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">
          <ThemeToggle />
            Войти
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
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
          className="mx-auto w-full max-w-[1280px] mt-10 rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl text-left overflow-visible border border-white/30"
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
                    className="absolute z-10 top-1/2 -translate-y-1/2 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] bg-white text-[var(--color-primary)] shadow-sm hover:bg-[var(--color-primary-light)] hover:shadow-md transition"
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
      <section className="bg-white py-16">
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

      {/* Footer */}
      <footer className="bg-[var(--color-primary-dark)] text-white/80 py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">© 2026 Aviator. Сайт продажи авиабилетов.</div>
          <div className="text-xs text-white/50">aviator_web v0.1.0 · dev</div>
        </div>
      </footer>
    </div>
  );
}
