"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatDuration } from "../data/flights";
import { useSettings } from "../context/settings";
import { useAuth } from "../context/auth";
import PaymentStep from "../components/booking/PaymentStep";
import { buildAviasalesUrl, cabinetData, createOrder, type SavedPassenger } from "../lib/api";
import PassportScanButton from "../components/PassportScanButton";
import LogoMark from "../components/Logo";
import { nationalityToRussian, type ScannedPassport } from "../lib/passportScan";

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

// Тип пассажира — раньше анкеты вообще не различали взрослых/детей/младенцев
// (одинаковые "Пассажир N", а младенцы вообще не получали анкету: paxCount
// считал только тех, кто занимает место). Паспорт для билета нужен всем,
// включая младенца на руках — просто он не платит за тариф.
type PaxCategory = "adult" | "child" | "infant";
const PAX_CATEGORY_LABEL: Record<PaxCategory, string> = {
  adult: "Взрослый",
  child: "Ребёнок · 2–11 лет",
  infant: "Младенец · до 2 лет, без места",
};

function toPassenger(p: SavedPassenger): Passenger {
  return {
    firstName: p.first_name,
    lastName: p.last_name,
    middleName: p.middle_name ?? "",
    dob: p.dob,
    gender: p.gender === "female" ? "female" : "male",
    citizenship: p.citizenship,
    docNumber: p.doc_number,
    docExpiry: p.doc_expiry ?? "",
  };
}

function toSavedPassengerIn(p: Passenger) {
  return {
    first_name: p.firstName,
    last_name: p.lastName,
    middle_name: p.middleName || null,
    dob: p.dob,
    gender: p.gender,
    citizenship: p.citizenship,
    doc_number: p.docNumber,
    doc_expiry: p.docExpiry || null,
  };
}

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

type TariffCode = "basic" | "standard" | "comfort";
type PaymentMethod = "card" | "sbp" | "transfer" | "cash" | "installment";

const TARIFFS: {
  code: TariffCode;
  name: string;
  extraPerPax: number;
  note: string;
  features: string[];
}[] = [
  {
    code: "basic",
    name: "Basic",
    extraPerPax: 0,
    note: "Минимальная цена",
    features: ["Ручная кладь", "Место за доплату", "Возврат недоступен"],
  },
  {
    code: "standard",
    name: "Standard",
    extraPerPax: 1200,
    note: "Оптимальный выбор",
    features: ["Багаж включён", "Обмен со штрафом", "1% бонусами"],
  },
  {
    code: "comfort",
    name: "Comfort",
    extraPerPax: 3200,
    note: "Больше гибкости",
    features: ["Багаж включён", "Выбор места включён", "Приоритетная поддержка"],
  },
];

const PAYMENT_METHODS: { id: PaymentMethod; title: string; desc: string }[] = [
  { id: "card", title: "Банковская карта", desc: "Visa, Mastercard, Мир" },
  { id: "sbp", title: "СБП", desc: "Быстрая оплата по QR" },
  { id: "transfer", title: "Перевод", desc: "Реквизиты после заявки" },
  { id: "cash", title: "Наличные", desc: "Оплата в офисе" },
  { id: "installment", title: "Рассрочка", desc: "Разбить платёж на части" },
];

const STATUS_STEPS = ["Заявка создана", "Ожидает оплаты", "Оплачено", "Билет выписан"];
// Коды статусов с бэкенда в том же порядке, что и подписи выше.
const STATUS_ORDER = ["new", "awaiting_payment", "paid", "issued"];
const OCCUPIED_SEATS = new Set(["1A", "1B", "2C", "4D", "5E", "7F"]);

function SeatPicker({
  selected,
  onSelect,
  included,
}: {
  selected: string;
  onSelect: (seat: string) => void;
  included: boolean;
}) {
  const rows = Array.from({ length: 8 }, (_, i) => i + 1);
  const cols = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Выбор места</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            {included ? "Включено в тариф" : "600 ₽ за пассажира"}
          </p>
        </div>
        {selected && (
          <span className="rounded-lg bg-[var(--color-primary-light)] px-3 py-1 text-sm font-semibold text-[var(--color-primary)]">
            {selected}
          </span>
        )}
      </div>

      <div className="mx-auto max-w-sm rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
        <div className="mx-auto mb-4 h-8 w-28 rounded-t-full bg-[var(--color-surface)] text-center text-[10px] leading-8 text-[var(--color-text-muted)]">
          Нос самолёта
        </div>
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div key={row} className="grid grid-cols-[18px_repeat(3,1fr)_16px_repeat(3,1fr)] items-center gap-1.5">
              <span className="text-[11px] text-[var(--color-text-muted)]">{row}</span>
              {cols.map((col, idx) => {
                const seat = `${row}${col}`;
                const occupied = OCCUPIED_SEATS.has(seat);
                return (
                  <button
                    key={seat}
                    type="button"
                    disabled={occupied}
                    onClick={() => onSelect(seat)}
                    className={`h-8 rounded-md text-[11px] font-semibold transition ${
                      occupied
                        ? "cursor-not-allowed bg-[var(--color-border)] text-[var(--color-text-muted)] opacity-50"
                        : selected === seat
                          ? "bg-green-600 text-white"
                          : "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                    } ${idx === 3 ? "col-start-6" : ""}`}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PassengerForm({
  index,
  category,
  pax,
  onChange,
  savedPassengers,
  onPick,
  onSave,
}: {
  index: number;
  category: PaxCategory;
  pax: Passenger;
  onChange: (p: Passenger) => void;
  savedPassengers: SavedPassenger[];
  onPick: (p: SavedPassenger) => void;
  onSave?: () => Promise<void>;
}) {
  const set = (key: keyof Passenger, value: string) => onChange({ ...pax, [key]: value });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  function onScanned(data: ScannedPassport) {
    onChange({
      ...pax,
      firstName: data.firstName?.toUpperCase() ?? pax.firstName,
      lastName: data.lastName?.toUpperCase() ?? pax.lastName,
      dob: data.dob ?? pax.dob,
      gender: data.sex ?? pax.gender,
      citizenship: nationalityToRussian(data.nationality) ?? pax.citizenship,
      docNumber: data.docNumber ?? pax.docNumber,
      docExpiry: data.docExpiry ?? pax.docExpiry,
    });
    setSaveMsg("");
  }

  const canSave = pax.firstName.trim() && pax.lastName.trim() && pax.dob && pax.citizenship && pax.docNumber.trim().length >= 4;

  async function save() {
    if (!onSave) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await onSave();
      setSaveMsg("Сохранён в кабинете");
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text)]">
          Пассажир {index + 1}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              category === "adult"
                ? "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
            }`}
          >
            {PAX_CATEGORY_LABEL[category]}
          </span>
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <PassportScanButton onConfirm={onScanned} />
          {savedPassengers.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Мои пассажиры
              </button>
              {pickerOpen && (
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg">
                  {savedPassengers.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--color-bg-soft)]">
                      <span className="truncate">{p.last_name} {p.first_name}</span>
                      <button
                        type="button"
                        onClick={() => { onPick(p); setPickerOpen(false); setSaveMsg(""); }}
                        className="shrink-0 rounded-lg bg-[var(--color-primary)] px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        Выбрать
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {onSave && (
            <button
              type="button"
              onClick={save}
              disabled={!canSave || saving}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Сохраняем…" : "Сохранить пассажира"}
            </button>
          )}
        </div>
      </div>
      {saveMsg && <p className="mb-3 text-xs text-[var(--color-text-muted)]">{saveMsg}</p>}
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
  const { format } = useSettings();
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
  const dateISO = sp.get("dateISO") || "";
  // paxCount — сколько тарифов оплачивается (взрослые + дети, без младенцев без места):
  // вся денежная математика ниже (тарифы, багаж, место) считается по нему, как и раньше.
  const paxCount = Number(sp.get("paxCount") || 1);
  // А вот анкеты нужны на каждого человека, включая младенца — у него тоже проверяют
  // паспорт на посадке. Если ссылка старая и adults/children/infants в ней нет,
  // считаем всех взрослыми на paxCount — прежнее поведение не ломается.
  const adultsCount = sp.has("adults") ? Number(sp.get("adults")) : paxCount;
  const childrenCount = Number(sp.get("children") || 0);
  const infantsCount = Number(sp.get("infants") || 0);
  const paxCategories: PaxCategory[] = [
    ...Array(Math.max(0, adultsCount)).fill("adult" as const),
    ...Array(Math.max(0, childrenCount)).fill("child" as const),
    ...Array(Math.max(0, infantsCount)).fill("infant" as const),
  ];
  if (paxCategories.length === 0) paxCategories.push("adult");
  const total = Number(sp.get("total") || 0);
  const baggageLabel = sp.get("baggageLabel") || "";
  const airlineCode = sp.get("airlineCode") || "";
  const airlineDisplayName =
    airlineName && airlineName !== airlineCode
      ? airlineName
      : airlineCode
        ? `Авиакомпания ${airlineCode}`
        : "Авиакомпания";
  const externalBookingUrl = sp.get("bookingUrl") || (
    fromIata && toIata && dateISO
      ? buildAviasalesUrl({ origin: fromIata, destination: toIata, departDate: dateISO, adults: adultsCount || paxCount })
      : null
  );

  const [passengers, setPassengers] = useState<Passenger[]>(
    paxCategories.map(() => ({ ...EMPTY_PAX }))
  );
  const { user } = useAuth();
  const [savedPassengers, setSavedPassengers] = useState<SavedPassenger[]>([]);
  const reloadSavedPassengers = useCallback(async () => {
    if (!user) { setSavedPassengers([]); return; }
    try { setSavedPassengers(await cabinetData<SavedPassenger[]>("/passengers")); }
    catch { /* кабинет недоступен — бронирование всё равно должно работать */ }
  }, [user]);
  useEffect(() => { void reloadSavedPassengers(); }, [reloadSavedPassengers]);
  async function savePassenger(pax: Passenger) {
    await cabinetData("/passengers", { method: "POST", body: JSON.stringify(toSavedPassengerIn(pax)) });
    await reloadSavedPassengers();
  }
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [errors, setErrors] = useState<string[]>([]);
  const [tariff, setTariff] = useState<TariffCode>("standard");
  const [selectedSeat, setSelectedSeat] = useState("");
  const [promo, setPromo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  // Код и статус заявки от бэкенда — показываем клиенту, по коду заявка находится.
  const [orderRef, setOrderRef] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  const activeTariff = TARIFFS.find((t) => t.code === tariff) ?? TARIFFS[1];
  const tariffExtra = activeTariff.extraPerPax * paxCount;
  const seatFee = selectedSeat && tariff !== "comfort" ? 600 * paxCount : 0;
  const subtotal = total + tariffExtra + seatFee;
  const promoApplied = promo.trim().toUpperCase() === "AVIA10";
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const bonus = Math.round(grandTotal * 0.01);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await createOrder({
        email,
        phone,
        origin: fromIata,
        destination: toIata,
        departDate: dateISO,
        cabin: sp.get("cabin") ?? "economy",
        airline: airlineCode || undefined,
        flightNumber: sp.get("flightNumber") ?? undefined,
        tariff,
        seat: selectedSeat || undefined,
        promo: promoApplied ? promo.trim().toUpperCase() : undefined,
        paymentMethod,
        totalAmount: grandTotal,
        passengers: passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          middleName: p.middleName || undefined,
          dob: p.dob,
          gender: p.gender,
          citizenship: p.citizenship,
          docNumber: p.docNumber,
          docExpiry: p.docExpiry || undefined,
        })),
      });
      setOrderRef(created.ref);
      setOrderStatus(created.status);
      setStep("payment");
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Не удалось создать заявку"]);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "payment") {
    return (
      <div className="flex min-h-screen flex-col items-center bg-[var(--color-bg-soft)] px-4 py-10">
        <PaymentStep
          total={grandTotal}
          onBack={() => setStep("form")}
          onSuccess={() => setStep("success")}
        />
      </div>
    );
  }

  if (step === "success") {
    // Код приходит от бэкенда при создании заявки — по нему её можно найти.
    const bookingNumber = orderRef;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg-soft)] px-4 py-10">
        <div className="w-full max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl dark:bg-green-900">✓</div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Заявка принята!</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Подтверждение придёт на <span className="font-medium text-[var(--color-text)]">{email}</span>
          </p>

          <div className="mx-auto mt-6 max-w-xl rounded-xl bg-[var(--color-bg-soft)] px-6 py-4 text-left text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-[var(--color-text-muted)]">Номер заявки</span>
              <span className="font-semibold text-[var(--color-text)]">{bookingNumber}</span>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <span className="text-[var(--color-text-muted)]">Маршрут</span>
              <span className="font-semibold text-[var(--color-text)]">{flightNumber} · {fromIata} → {toIata}</span>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <span className="text-[var(--color-text-muted)]">Тариф / место</span>
              <span className="font-semibold text-[var(--color-text)]">{activeTariff.name}{selectedSeat ? ` · ${selectedSeat}` : ""}</span>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <span className="text-[var(--color-text-muted)]">Оплата</span>
              <span className="font-semibold text-[var(--color-text)]">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.title}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-2 text-left sm:grid-cols-4">
            {STATUS_STEPS.map((step, i) => {
              // Подсвечиваем ровно до реального статуса заявки, а не фиксированные два шага.
              const reached = i <= STATUS_ORDER.indexOf(orderStatus);
              const current = i === STATUS_ORDER.indexOf(orderStatus);
              return (
                <div
                  key={step}
                  className={`rounded-xl border px-3 py-3 ${
                    reached
                      ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                  }`}
                >
                  <div className="text-xs font-semibold">{step}</div>
                  <div className="mt-1 text-[11px]">
                    {current ? "текущий статус" : reached ? "пройдено" : "следующий шаг"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-xl font-bold text-[var(--color-text)]">{format(grandTotal)}</div>
          <div className="mt-1 text-sm text-green-600">Начислим {format(bonus)} бонусами</div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href={`/order/${bookingNumber}`} className="rounded-xl bg-[var(--color-accent)] px-5 py-3 text-center text-sm font-semibold text-[var(--color-accent-foreground)] transition hover:bg-[var(--color-accent-dark)]">
              Проверить статус
            </Link>
            <Link href="/account" className="rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]">
              Открыть личный кабинет
            </Link>
            <a href="https://t.me/" target="_blank" rel="noreferrer" className="rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)]">
              Написать в Telegram
            </a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)]">
              Написать в WhatsApp
            </a>
          </div>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[var(--color-primary)] px-8 py-3 font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-soft)]">
      {/* Хедер */}
      <header
        className="sticky top-0 z-30 border-b border-[var(--color-ink-border)] text-white"
        style={{ background: "linear-gradient(180deg, var(--color-ink) 0%, var(--color-ink-soft) 100%)" }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <LogoMark size={34} />
            <span className="font-heading text-lg font-bold">Aviator</span>
          </Link>
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
              <span className={i === 2 ? "inline" : "hidden sm:inline"}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mx-auto max-w-7xl px-4 pt-4 lg:hidden">
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase text-[var(--color-text-muted)]">
                    Ваш билет
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-[var(--color-text)]">
                    {fromCity} → {toCity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[var(--color-text-muted)]">Итого</div>
                  <div className="text-lg font-bold text-[var(--color-text)]">{format(grandTotal)}</div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <img
                  src={`https://images.kiwi.com/airlines/64/${airlineCode}.png`}
                  alt={airlineDisplayName}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--color-text)]">{airlineDisplayName}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">{flightNumber}{aircraft ? ` · ${aircraft}` : ""}</div>
                </div>
              </div>

              <div className="grid grid-cols-[72px_1fr_72px] items-center gap-3">
                <div>
                  <div className="text-2xl font-bold leading-none text-[var(--color-text)]">{departTime}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-muted)]">{fromIata}</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-[var(--color-text-muted)]">{formatDuration(durationMin)}</div>
                  <div className="my-2 h-px bg-[var(--color-border)]" />
                  <div className={`text-[11px] font-semibold ${stops === 0 ? "text-green-600" : "text-amber-600"}`}>
                    {stops === 0 ? "прямой" : `${stops} пересадка`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold leading-none text-[var(--color-text)]">{arriveTime}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-muted)]">{toIata}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-[var(--color-text-muted)]">
                <span className="rounded-full bg-[var(--color-bg-soft)] px-2.5 py-1">{dateLabel}</span>
                <span className="rounded-full bg-[var(--color-bg-soft)] px-2.5 py-1">{baggageLabel}</span>
                <span className="rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  +{format(bonus)} бонусами
                </span>
              </div>

              {externalBookingUrl ? (
                <>
                  <a
                    href={externalBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block w-full rounded-xl bg-[#FF6D00] py-3 text-center text-sm font-bold text-white transition hover:bg-[#e65c00]"
                  >
                    Купить на Aviasales
                  </a>
                  <a
                    href="#passenger-data"
                    className="mt-2 block w-full rounded-xl border border-[var(--color-primary)] py-3 text-center text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)]"
                  >
                    Оставить заявку у нас
                  </a>
                </>
              ) : (
                <a
                  href="#passenger-data"
                  className="mt-4 block w-full rounded-xl bg-[var(--color-primary)] py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--color-primary-dark)]"
                >
                  Заполнить данные пассажира
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl gap-6 px-4 py-6 lg:flex lg:items-start">
          {/* Левая колонка: формы */}
          <div className="flex-1 space-y-5">
            <h2 id="passenger-data" className="text-xl font-bold text-[var(--color-text)]">Данные пассажиров</h2>

            {passengers.map((pax, i) => (
              <PassengerForm
                key={i}
                index={i}
                category={paxCategories[i] ?? "adult"}
                pax={pax}
                onChange={(p) => setPassengers((prev) => prev.map((x, j) => (j === i ? p : x)))}
                savedPassengers={savedPassengers}
                onPick={(saved) => setPassengers((prev) => prev.map((x, j) => (j === i ? toPassenger(saved) : x)))}
                onSave={user ? () => savePassenger(pax) : undefined}
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

            {/* Тарифы */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--color-text)]">Сравнение тарифов</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Выберите условия обмена, багажа и места</p>
                </div>
                <span className="hidden rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300 sm:inline">
                  1% бонусами
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {TARIFFS.map((item) => {
                  const active = item.code === tariff;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setTariff(item.code)}
                      className={`rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-[var(--color-primary)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-[var(--color-text)]">{item.name}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">{item.note}</div>
                        </div>
                        <div className="text-right text-sm font-bold text-[var(--color-primary)]">
                          {item.extraPerPax === 0 ? "+0" : `+${format(item.extraPerPax * paxCount)}`}
                        </div>
                      </div>
                      <ul className="mt-3 space-y-1.5 text-xs text-[var(--color-text-muted)]">
                        {item.features.map((f) => (
                          <li key={f} className="flex gap-1.5">
                            <span className="text-green-600">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            <SeatPicker
              selected={selectedSeat}
              onSelect={setSelectedSeat}
              included={tariff === "comfort"}
            />

            {/* Оплата */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h3 className="mb-4 text-base font-semibold text-[var(--color-text)]">Способ оплаты</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      paymentMethod === method.id
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    <div className="text-sm font-semibold text-[var(--color-text)]">{method.title}</div>
                    <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">{method.desc}</div>
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <input className={`${inputCls} sm:col-span-2`} placeholder="0000 0000 0000 0000" />
                  <input className={inputCls} placeholder="MM/YY" />
                  <input className={inputCls} placeholder="CVC" />
                </div>
              )}

              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                Демо-режим: реальная оплата не производится. Данные карты не сохраняются.
              </p>
            </div>

            {/* Поддержка */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-primary)]"
              >
                <div className="text-sm font-semibold text-[var(--color-text)]">Telegram-поддержка</div>
                <div className="mt-1 text-xs text-[var(--color-text-muted)]">Оператор поможет с оплатой и документами</div>
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-primary)]"
              >
                <div className="text-sm font-semibold text-[var(--color-text)]">WhatsApp</div>
                <div className="mt-1 text-xs text-[var(--color-text-muted)]">Быстрая связь по заявке</div>
              </a>
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

            {/* Оба пути доступны: покупка у партнёра и заявка у нас. */}
            <div className="lg:hidden">
              {externalBookingUrl && (
                <a
                  href={externalBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-2 block w-full rounded-xl bg-[#FF6D00] py-3.5 text-center text-base font-bold text-white transition hover:bg-[#e65c00]"
                >
                  Купить на Aviasales · {format(grandTotal)} →
                </a>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-green-600 py-3.5 text-base font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Отправляем заявку…" : `Оставить заявку · ${format(grandTotal)}`}
              </button>
            </div>
          </div>

          {/* Правая колонка: итог */}
          <aside className="mt-6 w-full shrink-0 lg:mt-0 lg:w-80">
            <div className="sticky top-24 space-y-4">
              {/* Карточка рейса */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <img
                    src={`https://images.kiwi.com/airlines/64/${airlineCode}.png`}
                    alt={airlineDisplayName}
                    width={24} height={24}
                    className="h-6 w-6 rounded object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-text)]">{airlineDisplayName}</div>
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
                    <span className="text-[var(--color-text)]">{format(total)}</span>
                  </div>
                  {tariffExtra > 0 && (
                    <div className="flex justify-between">
                      <span>{activeTariff.name}</span>
                      <span className="text-[var(--color-text)]">{format(tariffExtra)}</span>
                    </div>
                  )}
                  {seatFee > 0 && (
                    <div className="flex justify-between">
                      <span>Выбор места {selectedSeat}</span>
                      <span className="text-[var(--color-text)]">{format(seatFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Сборы и налоги</span>
                    <span className="text-[var(--color-text)]">включены</span>
                  </div>
                  <label className="block pt-2 text-xs text-[var(--color-text-muted)]">
                    Промокод
                    <input
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="AVIA10"
                      className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    />
                  </label>
                  {promo && (
                    <div className={`text-xs ${promoApplied ? "text-green-600" : "text-amber-600"}`}>
                      {promoApplied ? `Скидка применена: −${format(discount)}` : "Промокод не найден"}
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Скидка</span>
                      <span>−{format(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-green-600">
                    <span>Бонусы за покупку</span>
                    <span>{format(bonus)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold text-[var(--color-text)]">
                    <span>Итого</span>
                    <span style={{ viewTransitionName: "flight-price" }}>{format(grandTotal)}</span>
                  </div>
                </div>

                <div className="hidden lg:block">
                  {externalBookingUrl && (
                    <a
                      href={externalBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block w-full rounded-xl bg-[#FF6D00] py-3.5 text-center text-base font-bold text-white transition hover:bg-[#e65c00]"
                    >
                      Купить на Aviasales →
                    </a>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full rounded-xl bg-green-600 py-3.5 text-base font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Отправляем заявку…" : "Оставить заявку"}
                  </button>
                </div>
                <p className="mt-3 text-center text-[11px] text-[var(--color-text-muted)]">
                  {externalBookingUrl
                    ? "Купить сразу — на Aviasales. Оставить заявку — мы подберём и свяжемся с вами."
                    : "Нажимая кнопку, вы соглашаетесь с условиями использования"}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
