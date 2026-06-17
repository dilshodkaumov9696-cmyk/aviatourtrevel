"use client";

import { useEffect, useRef, useState } from "react";
import AirportInput from "./components/AirportInput";
import DateRangePicker from "./components/DateRangePicker";
import MultiCitySegments, { MultiSegment } from "./components/MultiCitySegments";
import { Airport } from "./data/airports";

type TripType = "one-way" | "round-trip" | "multi";
type CabinClass = "economy" | "business" | "first";

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Эконом",
  business: "Бизнес",
  first: "Первый",
};

const TRIP_TABS: { t: TripType; label: string }[] = [
  { t: "round-trip", label: "Туда-обратно" },
  { t: "one-way", label: "В одну сторону" },
  { t: "multi", label: "Сложный маршрут" },
];

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

interface Passengers {
  adults: number;
  children: number;
  infants: number;
}

function passengersLabel(p: Passengers, cabin: CabinClass): string {
  const total = p.adults + p.children + p.infants;
  const word = total === 1 ? "пассажир" : total < 5 ? "пассажира" : "пассажиров";
  return `${total} ${word}, ${CABIN_LABELS[cabin]}`;
}

function fmtDate(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

export default function Home() {
  // Form state
  const [tripType, setTripType] = useState<TripType>("round-trip");
  const [flexDates, setFlexDates] = useState(false);
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destAirport, setDestAirport] = useState<Airport | null>(null);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cabin, setCabin] = useState<CabinClass>("economy");
  const [passengers, setPassengers] = useState<Passengers>({ adults: 1, children: 0, infants: 0 });

  // Multi-city segments
  const [segments, setSegments] = useState<MultiSegment[]>([
    { id: 1, from: null, to: null, date: "" },
    { id: 2, from: null, to: null, date: "" },
  ]);
  const segIdRef = useRef(3);

  // Date picker popup
  const [datepickerOpen, setDatepickerOpen] = useState(false);
  const [datepickerField, setDatepickerField] = useState<"depart" | "return">("depart");
  const datepickerRef = useRef<HTMLDivElement>(null);

  // Passengers popup
  const [paxOpen, setPaxOpen] = useState(false);
  const paxRef = useRef<HTMLDivElement>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close date picker on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (datepickerRef.current && !datepickerRef.current.contains(e.target as Node)) {
        setDatepickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close pax on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (paxRef.current && !paxRef.current.contains(e.target as Node)) {
        setPaxOpen(false);
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

  // --- Multi-city handlers ---
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

  function changePax(key: keyof Passengers, delta: number) {
    setPassengers((prev) => {
      const next = { ...prev, [key]: Math.max(0, prev[key] + delta) };
      if (next.adults < 1) next.adults = 1;
      if (next.infants > next.adults) next.infants = next.adults;
      return next;
    });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (tripType === "multi") {
      segments.forEach((seg) => {
        if (!seg.from) e[`from${seg.id}`] = "Укажите город";
        if (!seg.to) e[`to${seg.id}`] = "Укажите город";
        if (!seg.date) e[`date${seg.id}`] = "Дата";
      });
    } else {
      if (!originAirport) e.origin = "Укажите город вылета";
      if (!destAirport) e.destination = "Укажите город прилёта";
      if (!departDate) e.departDate = "Укажите дату";
      if (tripType === "round-trip" && !returnDate) e.returnDate = "Укажите дату";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (tripType === "multi") {
      const route = segments
        .map((s, i) => `${i + 1}. ${s.from!.iata} → ${s.to!.iata} · ${fmtDate(s.date)}`)
        .join("\n");
      alert(route + "\n" + passengersLabel(passengers, cabin));
      return;
    }

    const flex = flexDates ? " (±3 дня)" : "";
    alert(
      `${originAirport!.iata} → ${destAirport!.iata}\n` +
        `${fmtDate(departDate)}${returnDate ? " — " + fmtDate(returnDate) : ""}${flex}\n` +
        passengersLabel(passengers, cabin)
    );
  }

  // Field cell styles
  const cellBase =
    "flex-shrink-0 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[var(--color-bg-soft)] transition";

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
            Войти
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center px-4 py-20 text-white"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl w-full text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Найдите дешёвые авиабилеты
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/80">
            Сравниваем сотни авиакомпаний и агентств за секунды
          </p>

          {/* Search card */}
          <form
            onSubmit={handleSearch}
            noValidate
            className="mt-10 rounded-2xl bg-white shadow-2xl text-left overflow-visible"
          >
            {/* Trip type toggle + flexible dates */}
            <div className="px-5 pt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1">
                {TRIP_TABS.map(({ t, label }) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTripType(t);
                      if (t === "one-way") {
                        setReturnDate("");
                        setErrors((p) => ({ ...p, returnDate: "" }));
                      }
                    }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                      tripType === t
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tripType !== "multi" && (
                <button
                  type="button"
                  onClick={() => setFlexDates((v) => !v)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    flexDates
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] leading-none ${
                      flexDates
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    {flexDates && "✓"}
                  </span>
                  Гибкие даты ±3 дня
                </button>
              )}
            </div>

            {/* --- Простой маршрут (туда / туда-обратно) --- */}
            {tripType !== "multi" && (
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-0 px-3 py-3">
                {/* Откуда */}
                <div className={`flex-1 min-w-0 ${cellBase} ${errors.origin ? "bg-red-50" : ""}`}>
                  <AirportInput
                    airport={originAirport}
                    onChange={(a) => {
                      setOriginAirport(a);
                      setErrors((p) => ({ ...p, origin: "" }));
                    }}
                    label="Откуда"
                    placeholder={errors.origin || "Город или аэропорт"}
                    error={undefined}
                  />
                </div>

                {/* Swap */}
                <button
                  type="button"
                  onClick={swap}
                  title="Поменять местами"
                  className="hidden md:flex self-center items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition flex-shrink-0"
                >
                  ⇄
                </button>

                <div className="hidden md:block w-px bg-[var(--color-border)] self-stretch mx-1" />

                {/* Куда */}
                <div className={`flex-1 min-w-0 ${cellBase} ${errors.destination ? "bg-red-50" : ""}`}>
                  <AirportInput
                    airport={destAirport}
                    onChange={(a) => {
                      setDestAirport(a);
                      setErrors((p) => ({ ...p, destination: "" }));
                    }}
                    label="Куда"
                    placeholder={errors.destination || "Город или аэропорт"}
                    error={undefined}
                  />
                </div>

                <div className="hidden md:block w-px bg-[var(--color-border)] self-stretch mx-1" />

                {/* Dates + calendar popup */}
                <div ref={datepickerRef} className="relative flex items-center">
                  {/* Дата вылета */}
                  <div
                    className={`${cellBase} ${errors.departDate ? "bg-red-50" : ""}`}
                    onClick={() => openDatePicker("depart")}
                  >
                    <div className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                      {errors.departDate
                        ? <span className="text-red-500">{errors.departDate}</span>
                        : "Туда"}
                    </div>
                    <div className={`text-sm ${departDate ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                      {departDate ? fmtDate(departDate) : "Дата вылета"}
                    </div>
                  </div>

                  {/* Дата обратно */}
                  {tripType === "round-trip" && (
                    <>
                      <div className="w-px bg-[var(--color-border)] self-stretch mx-1" />
                      <div
                        className={`${cellBase} ${errors.returnDate ? "bg-red-50" : ""}`}
                        onClick={() => openDatePicker("return")}
                      >
                        <div className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                          {errors.returnDate
                            ? <span className="text-red-500">{errors.returnDate}</span>
                            : "Обратно"}
                        </div>
                        <div className={`text-sm ${returnDate ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                          {returnDate ? fmtDate(returnDate) : "Дата возврата"}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Calendar popup */}
                  {datepickerOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                      <DateRangePicker
                        tripType={tripType === "round-trip" ? "round-trip" : "one-way"}
                        departDate={departDate}
                        returnDate={returnDate}
                        onDepartChange={(d) => {
                          setDepartDate(d);
                          setErrors((p) => ({ ...p, departDate: "" }));
                        }}
                        onReturnChange={(d) => {
                          setReturnDate(d);
                          setErrors((p) => ({ ...p, returnDate: "" }));
                        }}
                        initialField={datepickerField}
                        onClose={() => setDatepickerOpen(false)}
                      />
                    </div>
                  )}
                </div>

                <div className="hidden md:block w-px bg-[var(--color-border)] self-stretch mx-1" />

                {/* Пассажиры */}
                <div ref={paxRef} className="relative flex-shrink-0">
                  <div className={`${cellBase}`} onClick={() => setPaxOpen((v) => !v)}>
                    <div className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Пассажиры</div>
                    <div className="flex items-center gap-1 text-sm text-[var(--color-text)] whitespace-nowrap">
                      {passengersLabel(passengers, cabin)}
                      <span className="text-[var(--color-text-muted)] text-xs">{paxOpen ? "▴" : "▾"}</span>
                    </div>
                  </div>

                  {paxOpen && (
                    <div className="absolute top-full right-0 mt-2 z-50 bg-white border border-[var(--color-border)] rounded-xl shadow-2xl p-4 w-72">
                      {([
                        { key: "adults" as const, label: "Взрослые", sub: "от 12 лет" },
                        { key: "children" as const, label: "Дети", sub: "2–11 лет" },
                        { key: "infants" as const, label: "Младенцы", sub: "до 2 лет, без места" },
                      ]).map(({ key, label, sub }) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                          <div>
                            <div className="text-sm font-medium text-[var(--color-text)]">{label}</div>
                            <div className="text-xs text-[var(--color-text-muted)]">{sub}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => changePax(key, -1)}
                              disabled={key === "adults" ? passengers[key] <= 1 : passengers[key] <= 0}
                              className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:border-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition text-xl leading-none">−</button>
                            <span className="w-5 text-center font-semibold text-[var(--color-text)]">{passengers[key]}</span>
                            <button type="button" onClick={() => changePax(key, 1)}
                              className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:border-[var(--color-primary)] transition text-xl leading-none">+</button>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4">
                        <div className="text-xs text-[var(--color-text-muted)] mb-2">Класс</div>
                        <div className="flex gap-2">
                          {(["economy", "business", "first"] as CabinClass[]).map((c) => (
                            <button key={c} type="button" onClick={() => setCabin(c)}
                              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                                cabin === c
                                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
                              }`}>
                              {CABIN_LABELS[c]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button type="button" onClick={() => setPaxOpen(false)}
                        className="mt-4 w-full rounded-lg bg-[var(--color-primary)] text-white py-2 text-sm font-medium hover:bg-[var(--color-primary-dark)] transition">
                        Готово
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex-shrink-0 px-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto rounded-xl bg-[var(--color-accent)] px-6 py-3 font-bold text-[var(--color-primary-dark)] hover:bg-[var(--color-accent-dark)] transition shadow-md whitespace-nowrap"
                  >
                    Найти билеты
                  </button>
                </div>
              </div>
            )}

            {/* --- Сложный маршрут --- */}
            {tripType === "multi" && (
              <>
                <MultiCitySegments
                  segments={segments}
                  errors={errors}
                  onUpdate={updateSegment}
                  onSwap={swapSegment}
                  onAdd={addSegment}
                  onRemove={removeSegment}
                />
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 px-5 pb-4">
                  <div ref={paxRef} className="relative">
                    <div
                      className="px-3 py-2.5 rounded-xl cursor-pointer border border-[var(--color-border)] hover:border-[var(--color-primary)] transition"
                      onClick={() => setPaxOpen((v) => !v)}
                    >
                      <div className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Пассажиры</div>
                      <div className="flex items-center gap-1 text-sm text-[var(--color-text)] whitespace-nowrap">
                        {passengersLabel(passengers, cabin)}
                        <span className="text-[var(--color-text-muted)] text-xs">{paxOpen ? "▴" : "▾"}</span>
                      </div>
                    </div>

                    {paxOpen && (
                      <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-[var(--color-border)] rounded-xl shadow-2xl p-4 w-72">
                        {([
                          { key: "adults" as const, label: "Взрослые", sub: "от 12 лет" },
                          { key: "children" as const, label: "Дети", sub: "2–11 лет" },
                          { key: "infants" as const, label: "Младенцы", sub: "до 2 лет, без места" },
                        ]).map(({ key, label, sub }) => (
                          <div key={key} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                            <div>
                              <div className="text-sm font-medium text-[var(--color-text)]">{label}</div>
                              <div className="text-xs text-[var(--color-text-muted)]">{sub}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" onClick={() => changePax(key, -1)}
                                disabled={key === "adults" ? passengers[key] <= 1 : passengers[key] <= 0}
                                className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:border-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition text-xl leading-none">−</button>
                              <span className="w-5 text-center font-semibold text-[var(--color-text)]">{passengers[key]}</span>
                              <button type="button" onClick={() => changePax(key, 1)}
                                className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:border-[var(--color-primary)] transition text-xl leading-none">+</button>
                            </div>
                          </div>
                        ))}
                        <div className="mt-4">
                          <div className="text-xs text-[var(--color-text-muted)] mb-2">Класс</div>
                          <div className="flex gap-2">
                            {(["economy", "business", "first"] as CabinClass[]).map((c) => (
                              <button key={c} type="button" onClick={() => setCabin(c)}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                                  cabin === c
                                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
                                }`}>
                                {CABIN_LABELS[c]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button type="button" onClick={() => setPaxOpen(false)}
                          className="mt-4 w-full rounded-lg bg-[var(--color-primary)] text-white py-2 text-sm font-medium hover:bg-[var(--color-primary-dark)] transition">
                          Готово
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--color-accent)] px-8 py-3 font-bold text-[var(--color-primary-dark)] hover:bg-[var(--color-accent-dark)] transition shadow-md whitespace-nowrap"
                  >
                    Найти билеты
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
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
