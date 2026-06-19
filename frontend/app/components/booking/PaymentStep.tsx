"use client";

import { useState } from "react";
import { useSettings } from "../../context/settings";

type PaymentMethod = "card" | "sbp" | "installment";

interface Props {
  total: number;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PaymentStep({ total, onBack, onSuccess }: Props) {
  const { format, t } = useSettings();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardHolder, setCardHolder] = useState("JOHN DOE");
  const [expiry, setExpiry] = useState("12/25");
  const [cvc, setCvc] = useState("123");
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    // Имитация обработки платежа
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    onSuccess();
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="mb-2 text-2xl font-bold text-[var(--color-text)]">{t("pay.title")}</h2>
        <p className="text-sm text-[var(--color-text-muted)]">{t("pay.demo")}</p>
      </div>

      {/* Выбор способа оплаты */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <PaymentMethodButton
          active={method === "card"}
          onClick={() => setMethod("card")}
          icon="💳"
          label={t("pay.card")}
        />
        <PaymentMethodButton
          active={method === "sbp"}
          onClick={() => setMethod("sbp")}
          icon="📱"
          label={t("pay.sbp")}
        />
        <PaymentMethodButton
          active={method === "installment"}
          onClick={() => setMethod("installment")}
          icon="📅"
          label={t("pay.installment")}
        />
      </div>

      {/* Форма оплаты (только для карты) */}
      {method === "card" && (
        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="mb-6 rounded-xl border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="mb-8 text-sm opacity-80">Card</div>
            <div className="mb-8 text-2xl tracking-widest font-medium">{cardNumber}</div>
            <div className="flex justify-between">
              <div className="text-sm">{cardHolder}</div>
              <div className="text-sm">{expiry}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                {t("pay.card_number")}
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4111 1111 1111 1111"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                {t("pay.card_holder")}
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder="JOHN DOE"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  {t("pay.card_expiry")}
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  {t("pay.card_cvc")}
                </label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            {t("pay.secure")}
          </div>
        </div>
      )}

      {/* Альтернативные способы (инфо-секции) */}
      {method === "sbp" && (
        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <div className="text-4xl mb-3">📱</div>
          <div className="text-lg font-semibold text-[var(--color-text)]">{t("pay.sbp")}</div>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Откроется система быстрых платежей в вашем приложении банка
          </p>
        </div>
      )}

      {method === "installment" && (
        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="text-lg font-semibold text-[var(--color-text)] mb-4">{t("pay.installment")}</div>
          <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <div className="flex justify-between">
              <span>Месячный платёж</span>
              <span className="font-semibold text-[var(--color-text)]">{format(Math.round(total / 12))}</span>
            </div>
            <div className="flex justify-between">
              <span>Срок</span>
              <span className="font-semibold text-[var(--color-text)]">12 месяцев</span>
            </div>
          </div>
        </div>
      )}

      {/* Блок с итоговой ценой */}
      <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex items-center justify-between">
          <span className="text-[var(--color-text-muted)]">Итого к оплате:</span>
          <span className="text-2xl font-bold text-[var(--color-text)]">{format(total)}</span>
        </div>
      </div>

      {/* Кнопки действий */}
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
          className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:bg-green-600/50"
        >
          {processing ? "Обработка..." : t("pay.pay_now")}
        </button>
      </div>
    </div>
  );
}

function PaymentMethodButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-4 text-center transition ${
        active
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-blue-300"
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-sm font-medium ${active ? "text-blue-600 dark:text-blue-400" : "text-[var(--color-text)]"}`}>
        {label}
      </div>
    </button>
  );
}
