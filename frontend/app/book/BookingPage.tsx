"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDuration } from "../data/flights";

const GENDERS = [
  { v: "male", label: "Мужской" },
  { v: "female", label: "Женский" },
];

const CITIZENSHIPS = ["Таджикистан", "Россия", "Узбекистан", "Казахстан", "Кыргызстан", "Беларусь", "Украина", "Другое"];

interface Passenger {
  firstName: string;
  lastName: string;
  middleName: string;
  dob: string;
  gender: string;
  citizenship: string;
  docNumber: string;
  docExpiry: string;
}

const EMPTY_PAX: Passenger = {
  firstName: "", lastName: "", middleName: "",
  dob: "", gender: "male", citizenship: "Таджикистан",
  docNumber: "", docExpiry: "",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-muted)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

function PassengerForm({
  index,
  pax,
  onChange,
}: {
  index: number;
  pax: Passenger;
  onChange: (p: Passenger) => void;
}) {
  const set = (key: keyof Passenger, value: string) => onChange({ ...pax, [key]: value });

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="mb-4 text-base font-semibold text-[var(--color-text)]">
        Пассажир {index + 1}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Фамилия (латиницей)" required>
          <input
            className={inputCls}
            placeholder="IVANOV"
            value={pax.lastName}
            onChange={(e) => set("lastName", e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="Имя (латиницей)" required>
          <input
            className={inputCls}
            placeholder="IVAN"
            value={pax.firstName}
            onChange={(e) => set("firstName", e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="Отчество (если есть)">
          <input
            className={inputCls}
            placeholder="IVANOVICH"
            value={pax.middleName}
            onChange={(e) => set("middleName", e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="Дата рождения" required>
          <input
            type="date"
            className={inputCls}
            value={pax.dob}
            onChange={(e) => set("dob", e.target.value)}
          />
        </Field>
        <Field label="Пол" required>
          <select className={inputCls} value={pax.gender} onChange={(e) => set("gender", e.target.value)}>
            {GENDERS.map((g) => <option key={g.v} value={g.v}>{g.label}</option>)}
          </select>
        </Field>
        <Field label="Гражданство" required>
          <select className={inputCls} value={pax.citizenship} onChange={(e) => set("citizenship", e.target.value)}>
            {CITIZENSHIPS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Серия и номер паспорта" required>
          <input
            className={inputCls}
            placeholder="AA 1234567"
            value={pax.docNumber}
            onChange={(e) => set("docNumber", e.target.value)}
          />
        </Field>
        <Field label="Срок действия паспорта" required>
          <input
            type="date"
            className={inputCls}
            value={pax.docExpiry}
            onChange={(e) => set("docExpiry", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const sp = useSearchParams();
  const fromCity = sp.get("fromCity") || "";
  const fromIata = sp.get("fromIata") || "";
  const toCity = sp.get("toCity") || "";
  const toIata = sp.get("toIata") || "";
  const airlineName = sp.get("airlineName") || "";
  const flightNumber = sp.get("flightNumber") || "";
  const aircraft = sp.get("aircraft") || "";
  const departTime = sp.get("departTime") || "";
  const arriveTime = sp.get("arriveTime") || "";
  const durationMin = Number(sp.get("durationMin") || 0);
  const stops = Number(sp.get("stops") || 0);
  const dateLabel = sp.get("dateLabel") || "";
  const paxCount = Number(sp.get("paxCount") || 1);
  const total = Number(sp.get("total") || 0);
  const baggageLabel = sp.get("baggageLabel") || "";
  const airlineCode = sp.get("airlineCode") || "";

  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: paxCount }, () => ({ ...EMPTY_PAX }))
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function validate(): boolean {
    const errs: string[] = [];
    passengers.forEach((p, i) => {
      if (!p.firstName) errs.push(`Пассажир ${i + 1}: введите имя`);
      if (!p.lastName) errs.push(`Пассажир ${i + 1}: введите фамилию`);
      if (!p.dob) errs.push(`Пассажир ${i + 1}: введите дату рождения`);
      if (!p.docNumber) errs.push(`Пассажир ${i + 1}: введите номер паспорта`);
    });
    if (!email || !email.includes("@")) errs.push("Введите корректный email");
    if (!phone || phone.length < 7) errs.push("Введите номер телефона");
    setErrors(errs);
    return errs.length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg-soft)] px-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl dark:bg-green-900">✓</div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Заявка принята!</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Подтверждение придёт на <span className="font-medium text-[var(--color-text)]">{email}</span>
          </p>
          <div className="mt-4 rounded-xl bg-[var(--color-bg-soft)] px-6 py-4 text-sm text-[var(--color-text-muted)]">
            {flightNumber} · {fromIata} → {toIata} · {dateLabel}
          </div>
          <div className="mt-6 text-xl font-bold text-[var(--color-text)]">
            {total.toLocaleString("ru-RU")} ₽
          </div>
          <a
            href="/"
            className="mt-6 inline-block rounded-xl bg-[var(--color-primary)] px-8 py-3 font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            На главную
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-soft)]">
      {/* Хедер */}
      <header
        className="sticky top-0 z-30 text-white"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-[var(--color-primary)]">A</div>
            <span className="text-lg font-bold">Aviator</span>
          </a>
          <div className="text-sm opacity-80">
            {fromCity} → {toCity} · {dateLabel}
          </div>
        </div>
      </header>

      {/* Прогресс */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl gap-0 px-4">
          {["Поиск", "Выбор рейса", "Данные", "Оплата"].map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium ${
                i === 2
                  ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                i < 2 ? "bg-green-600 text-white" : i === 2 ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}>
                {i < 2 ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mx-auto max-w-7xl gap-6 px-4 py-6 lg:flex lg:items-start">
          {/* Левая колонка: формы */}
          <div className="flex-1 space-y-5">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Данные пассажиров</h2>

            {passengers.map((pax, i) => (
              <PassengerForm
                key={i}
                index={i}
                pax={pax}
                onChange={(p) => setPassengers((prev) => prev.map((x, j) => (j === i ? p : x)))}
              />
            ))}

            {/* Контактные данные */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h3 className="mb-4 text-base font-semibold text-[var(--color-text)]">Контактные данные</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email" required>
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field label="Телефон" required>
                  <input
                    type="tel"
                    className={inputCls}
                    placeholder="+992 900 000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
              </div>
              <p className="mt-3 text-[12px] text-[var(--color-text-muted)]">
                Билет и инструкции по оплате придут на этот email. Телефон — для связи в экстренных случаях.
              </p>
            </div>

            {/* Ошибки */}
            {errors.length > 0 && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                <div className="mb-1 text-sm font-semibold text-red-700 dark:text-red-400">Пожалуйста, исправьте:</div>
                <ul className="list-disc pl-4 text-sm text-red-600 dark:text-red-400">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 py-3.5 text-base font-bold text-white transition hover:bg-green-700 lg:hidden"
            >
              Перейти к оплате · {total.toLocaleString("ru-RU")} ₽
            </button>
          </div>

          {/* Правая колонка: итог */}
          <aside className="mt-6 w-full shrink-0 lg:mt-0 lg:w-80">
            <div className="sticky top-24 space-y-4">
              {/* Карточка рейса */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <img
                    src={`https://images.kiwi.com/airlines/64/${airlineCode}.png`}
                    alt={airlineName}
                    width={24} height={24}
                    className="h-6 w-6 rounded object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-text)]">{airlineName}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{flightNumber} · {aircraft}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-text)]">{departTime}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{fromIata}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{fromCity}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[11px] text-[var(--color-text-muted)]">{formatDuration(durationMin)}</div>
                    <div className="mx-auto my-1 h-0.5 w-full rounded bg-[var(--color-border)]" />
                    <div className={`text-[11px] ${stops === 0 ? "text-green-600" : "text-amber-600"}`}>
                      {stops === 0 ? "прямой" : `${stops} пересадка`}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-text)]">{arriveTime}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{toIata}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{toCity}</div>
                  </div>
                </div>

                <div className="mt-3 border-t border-[var(--color-border)] pt-3 text-[12px] text-[var(--color-text-muted)]">
                  <div>{dateLabel}</div>
                  <div className="mt-0.5">{baggageLabel}</div>
                </div>
              </div>

              {/* Итоговая цена */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="mb-3 text-sm font-semibold text-[var(--color-text)]">Итого</div>
                <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <div className="flex justify-between">
                    <span>Тариф × {paxCount} пас.</span>
                    <span className="text-[var(--color-text)]">{(total * 0.9).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Сборы и налоги</span>
                    <span className="text-[var(--color-text)]">{(total * 0.1).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold text-[var(--color-text)]">
                    <span>Итого</span>
                    <span>{total.toLocaleString("ru-RU")} ₽</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 hidden w-full rounded-xl bg-green-600 py-3.5 text-base font-bold text-white transition hover:bg-green-700 lg:block"
                >
                  Перейти к оплате
                </button>
                <p className="mt-3 text-center text-[11px] text-[var(--color-text-muted)]">
                  Нажимая кнопку, вы соглашаетесь с условиями использования
                </p>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
