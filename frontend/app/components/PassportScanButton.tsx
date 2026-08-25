"use client";

import { useRef, useState } from "react";
import { isPassportScanConfigured, nationalityToRussian, startPassportScan, type PassportScanHandle, type ScannedPassport } from "../lib/passportScan";

const btnCls = "rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]";

const date = (d?: string) => (d ? d.split("-").reverse().join(".") : "—");

/** Кнопка сканирования паспорта камерой. onConfirm вызывается только после того,
 * как пользователь проверил распознанные данные и подтвердил их — сканер никогда
 * не заполняет форму молча за спиной пользователя. */
export default function PassportScanButton({ onConfirm, className }: { onConfirm: (data: ScannedPassport) => void; className?: string }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<ScannedPassport | null>(null);
  const handleRef = useRef<PassportScanHandle | null>(null);

  if (!isPassportScanConfigured()) {
    return (
      <button type="button" disabled className={`${className ?? btnCls} cursor-not-allowed opacity-50`}>
        📷 Скан паспорта — скоро появится
      </button>
    );
  }

  async function start() {
    setScanning(true);
    setError("");
    try {
      const handle = await startPassportScan();
      handleRef.current = handle;
      const data = await handle.result;
      setPreview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось распознать паспорт");
    } finally {
      setScanning(false);
      handleRef.current = null;
    }
  }

  function cancelScan() {
    handleRef.current?.cancel();
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={scanning ? cancelScan : start} className={className ?? btnCls}>
        {scanning ? "Сканируем… (отменить)" : "📷 Сканировать паспорт"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}

      {preview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4" onClick={() => setPreview(null)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[var(--color-text)]">Проверьте данные</h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Так распознан паспорт. Если всё верно — подтвердите, поля впишутся в форму.</p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Фамилия" value={preview.lastName} />
              <Row label="Имя" value={preview.firstName} />
              <Row label="Дата рождения" value={date(preview.dob)} />
              <Row label="Номер документа" value={preview.docNumber} />
              <Row label="Срок действия" value={date(preview.docExpiry)} />
              <Row label="Гражданство" value={nationalityToRussian(preview.nationality) ?? preview.nationality} />
            </dl>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => { onConfirm(preview); setPreview(null); }}
                className="flex-1 rounded-xl bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white"
              >
                Заполнить форму
              </button>
              <button type="button" onClick={() => setPreview(null)} className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold">
                Отмена
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setPreview(null); void start(); }}
              className="mt-2 w-full text-center text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              Сканировать заново
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className="font-semibold text-[var(--color-text)]">{value || "—"}</dd>
    </div>
  );
}
