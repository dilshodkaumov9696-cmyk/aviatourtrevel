"use client";

import { useState } from "react";
import { useSettings } from "../../context/settings";

type PaymentMethod = "card" | "sbp" | "installment";

interface Props {
  total: number;
  onBack: () => void;
  onSuccess: () => void;
}

/* ── SVG-логотипы платёжных систем ── */

function LogoVisa({ h = 20 }: { h?: number }) {
  return (
    <svg height={h} viewBox="0 0 48 16" aria-label="Visa" fill="none">
      <text x="0" y="13" fontFamily="Arial" fontWeight="800" fontSize="15" fill="#1A1F71" letterSpacing="-0.5">VISA</text>
    </svg>
  );
}

function LogoMastercard({ h = 24 }: { h?: number }) {
  return (
    <svg height={h} viewBox="0 0 38 24" aria-label="Mastercard">
      <circle cx="14" cy="12" r="11" fill="#EB001B" />
      <circle cx="24" cy="12" r="11" fill="#F79E1B" />
      <path d="M19 4.8a11 11 0 010 14.4A11 11 0 0119 4.8z" fill="#FF5F00" />
    </svg>
  );
}

function LogoMir({ h = 18 }: { h?: number }) {
  return (
    <svg height={h} viewBox="0 0 56 18" aria-label="Мир" fill="none">
      <rect width="56" height="18" rx="3" fill="url(#mirGrad)" />
      <text x="7" y="13" fontFamily="Arial" fontWeight="700" fontSize="10" fill="white">МИР</text>
      <defs>
        <linearGradient id="mirGrad" x1="0" y1="0" x2="56" y2="0">
          <stop stopColor="#00B4E6" />
          <stop offset="1" stopColor="#007332" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LogoUnionPay({ h = 20 }: { h?: number }) {
  return (
    <svg height={h} viewBox="0 0 40 24" aria-label="UnionPay" fill="none">
      <rect width="40" height="24" rx="3" fill="#DE2910" />
      <rect x="14" y="0" width="26" height="24" rx="3" fill="#003087" />
      <text x="3" y="16" fontFamily="Arial" fontWeight="700" fontSize="8" fill="white">UP</text>
    </svg>
  );
}

function LogoSBP({ h = 28 }: { h?: number }) {
  return (
    <svg height={h} viewBox="0 0 32 32" aria-label="СБП" fill="none">
      <rect width="32" height="32" rx="8" fill="#1D1D1B" />
      <path d="M8 16h4l2-4 2 8 2-6 2 4h4" stroke="#00B628" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoQIWI({ h = 24 }: { h?: number }) {
  return (
    <svg height={h} viewBox="0 0 48 24" aria-label="QIWI" fill="none">
      <rect width="48" height="24" rx="4" fill="#FF8C00" />
      <text x="6" y="17" fontFamily="Arial" fontWeight="800" fontSize="13" fill="white">QIWI</text>
    </svg>
  );
}

function LogoYookassa({ h = 20 }: { h?: number }) {
  return (
    <svg height={h} viewBox="0 0 72 20" aria-label="ЮKassa" fill="none">
      <rect width="72" height="20" rx="4" fill="#8B5CF6" />
      <text x="6" y="14" fontFamily="Arial" fontWeight="700" fontSize="11" fill="white">ЮKassa</text>
    </svg>
  );
}

/* Определяем тип карты по первым цифрам */
function detectCard(num: string): "visa" | "mc" | "mir" | "up" | null {
  const n = num.replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mc";
  if (n.startsWith("2")) return "mir";
  if (n.startsWith("62")) return "up";
  return null;
}

export default function PaymentStep({ total, onBack, onSuccess }: Props) {
  const { format, t } = useSettings();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardHolder, setCardHolder] = useState("JOHN DOE");
  const [expiry, setExpiry] = useState("12/25");
  const [cvc, setCvc] = useState("···");
  const [processing, setProcessing] = useState(false);

  const cardType = detectCard(cardNumber);

  const handlePay = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    onSuccess();
  };

  /* маскируем номер для превью */
  const maskedNumber = cardNumber.replace(/\s/g, "").padEnd(16, "·").replace(/(.{4})/g, "$1 ").trim();

  return (
    <div className="w-full max-w-2xl">
      {/* Шапка */}
      <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-text)]">{t("pay.title")}</h2>
          <div className="flex items-center gap-2">
            <LogoVisa h={18} />
            <LogoMastercard h={22} />
            <LogoMir h={16} />
            <LogoUnionPay h={18} />
          </div>
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t("pay.demo")}</p>
      </div>

      {/* Способы оплаты */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <PayMethodBtn active={method === "card"} onClick={() => setMethod("card")}>
          <div className="mb-2 flex justify-center gap-1">
            <LogoVisa h={14} />
            <LogoMastercard h={18} />
          </div>
          <div className="text-xs font-medium leading-tight">{t("pay.card")}</div>
        </PayMethodBtn>

        <PayMethodBtn active={method === "sbp"} onClick={() => setMethod("sbp")}>
          <div className="mb-2 flex justify-center">
            <LogoSBP h={26} />
          </div>
          <div className="text-xs font-medium leading-tight">{t("pay.sbp")}</div>
        </PayMethodBtn>

        <PayMethodBtn active={method === "installment"} onClick={() => setMethod("installment")}>
          <div className="mb-2 flex justify-center">
            <LogoYookassa h={18} />
          </div>
          <div className="text-xs font-medium leading-tight">{t("pay.installment")}</div>
        </PayMethodBtn>
      </div>

      {/* Форма карты */}
      {method === "card" && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {/* Превью карты */}
          <div className="relative h-44 bg-gradient-to-br from-[#1E3A5F] via-[#1E5C80] to-[#0F2942] p-5 text-white">
            {/* Чип */}
            <div className="mb-4 flex items-center justify-between">
              <svg width="36" height="28" viewBox="0 0 36 28" aria-hidden>
                <rect width="36" height="28" rx="4" fill="#D4A843" />
                <rect x="0" y="9" width="36" height="10" fill="#B8922E" />
                <rect x="12" y="0" width="12" height="28" fill="#B8922E" opacity="0.5" />
                <rect x="12" y="9" width="12" height="10" fill="#D4A843" opacity="0.8" />
              </svg>
              <div className="opacity-90">
                {cardType === "visa" && <LogoVisa h={22} />}
                {cardType === "mc" && <LogoMastercard h={26} />}
                {cardType === "mir" && <LogoMir h={20} />}
                {cardType === "up" && <LogoUnionPay h={22} />}
                {!cardType && <div className="text-xs opacity-50">CARD</div>}
              </div>
            </div>

            {/* Номер */}
            <div className="mb-4 font-mono text-lg tracking-[0.18em] drop-shadow">
              {maskedNumber}
            </div>

            {/* Нижняя строка */}
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-0.5 text-[9px] uppercase opacity-60">Cardholder</div>
                <div className="text-sm font-medium tracking-wide">{cardHolder || "FULL NAME"}</div>
              </div>
              <div className="text-right">
                <div className="mb-0.5 text-[9px] uppercase opacity-60">Expires</div>
                <div className="text-sm font-medium">{expiry || "MM/YY"}</div>
              </div>
            </div>

            {/* Блики */}
            <div className="pointer-events-none absolute right-4 top-4 h-32 w-32 rounded-full bg-white opacity-5" />
            <div className="pointer-events-none absolute -bottom-8 -left-4 h-32 w-32 rounded-full bg-white opacity-5" />
          </div>

          {/* Поля ввода */}
          <div className="space-y-3 p-5">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-muted)]">
                {t("pay.card_number")}
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2.5 font-mono text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-muted)]">
                {t("pay.card_holder")}
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder="IVAN PETROV"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-muted)]">
                  {t("pay.card_expiry")}
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2.5 font-mono text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-muted)]">
                  {t("pay.card_cvc")}
                </label>
                <input
                  type="password"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="···"
                  maxLength={4}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2.5 font-mono text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            </div>
          </div>

          {/* Безопасность */}
          <div className="flex items-center gap-2 border-t border-[var(--color-border)] px-5 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[11px] text-[var(--color-text-muted)]">{t("pay.secure")}</span>
          </div>
        </div>
      )}

      {/* СБП */}
      {method === "sbp" && (
        <div className="mb-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <LogoSBP h={56} />
          <div className="mt-3 text-base font-semibold text-[var(--color-text)]">Система Быстрых Платежей</div>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            После нажатия «Оплатить» откроется QR-код или ссылка для оплаты через приложение банка
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-[var(--color-text-muted)]">
            {["Сбербанк", "Тинькофф", "ВТБ", "Альфа-банк", "Газпром", "Озон Банк"].map((b) => (
              <span key={b} className="rounded-full border border-[var(--color-border)] px-2.5 py-1">{b}</span>
            ))}
          </div>
        </div>
      )}

      {/* Рассрочка */}
      {method === "installment" && (
        <div className="mb-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="mb-4 flex items-center gap-3">
            <LogoYookassa h={22} />
            <div className="text-base font-semibold text-[var(--color-text)]">Рассрочка без процентов</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[3, 6, 12].map((months) => (
              <div key={months} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-3 text-center">
                <div className="text-lg font-bold text-[var(--color-primary)]">{format(Math.round(total / months))}</div>
                <div className="text-[11px] text-[var(--color-text-muted)]">{months} мес.</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-[var(--color-text-muted)]">
            Рассрочка предоставляется партнёрами. Требуется регистрация в ЮKassa.
          </p>
        </div>
      )}

      {/* Итого */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
        <span className="text-[var(--color-text-muted)]">Итого к оплате</span>
        <span className="text-2xl font-bold text-[var(--color-text)]">{format(total)}</span>
      </div>

      {/* Нижние логотипы */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3 opacity-60">
        <LogoVisa h={16} />
        <LogoMastercard h={20} />
        <LogoMir h={15} />
        <LogoUnionPay h={16} />
        <LogoQIWI h={18} />
        <LogoSBP h={22} />
        <LogoYookassa h={16} />
      </div>

      {/* Кнопки */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-border)] disabled:opacity-50"
        >
          {t("pay.back")}
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={processing}
          className="flex-[2] rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:bg-green-600/50"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
              </svg>
              Обработка...
            </span>
          ) : `${t("pay.pay_now")} · ${format(total)}`}
        </button>
      </div>
    </div>
  );
}

function PayMethodBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center rounded-xl border-2 px-3 py-3.5 text-center transition ${
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50"
      }`}
    >
      {children}
    </button>
  );
}
