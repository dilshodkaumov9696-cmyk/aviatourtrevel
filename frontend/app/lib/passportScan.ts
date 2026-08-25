"use client";

// Сканирование паспорта через BlinkID (@microblink/blinkid). Пакет тяжёлый
// (WASM-движок, ~70МБ ресурсов) — грузим динамически, только когда реально
// нажали "Сканировать", а не в основном бандле.
//
// Без лицензионного ключа функция считается не подключённой — так же, как
// вход через Google в этом проекте (см. getAuthProviders/googleLoginUrl).

export interface ScannedPassport {
  firstName?: string;
  lastName?: string;
  dob?: string; // YYYY-MM-DD
  docNumber?: string;
  docExpiry?: string; // YYYY-MM-DD
  nationality?: string; // ISO 3166-1 alpha-3, напр. "UZB"
  sex?: "male" | "female";
}

export function isPassportScanConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_BLINKID_LICENSE_KEY;
}

interface AlphabetStringResult {
  value: string;
}
interface StringResultLike {
  latin?: AlphabetStringResult;
}
interface DateResultLike {
  day?: number;
  month?: number;
  year?: number;
}
interface BlinkIdScanningResultLike {
  firstName?: StringResultLike;
  lastName?: StringResultLike;
  documentNumber?: StringResultLike;
  nationality?: StringResultLike;
  sex?: StringResultLike;
  dateOfBirth?: DateResultLike;
  dateOfExpiry?: DateResultLike;
}

function text(field?: StringResultLike): string | undefined {
  const v = field?.latin?.value;
  return v && v.trim() ? v.trim() : undefined;
}

function isoDate(field?: DateResultLike): string | undefined {
  if (!field?.year || !field?.month || !field?.day) return undefined;
  return `${String(field.year).padStart(4, "0")}-${String(field.month).padStart(2, "0")}-${String(field.day).padStart(2, "0")}`;
}

function mapSex(field?: StringResultLike): "male" | "female" | undefined {
  const v = text(field)?.toUpperCase();
  return v === "M" ? "male" : v === "F" ? "female" : undefined;
}

function mapResult(result: BlinkIdScanningResultLike): ScannedPassport {
  return {
    firstName: text(result.firstName),
    lastName: text(result.lastName),
    docNumber: text(result.documentNumber),
    nationality: text(result.nationality),
    sex: mapSex(result.sex),
    dob: isoDate(result.dateOfBirth),
    docExpiry: isoDate(result.dateOfExpiry),
  };
}

const NATIONALITY_RU: Record<string, string> = {
  RUS: "Россия",
  UZB: "Узбекистан",
  TJK: "Таджикистан",
  KAZ: "Казахстан",
  KGZ: "Кыргызстан",
  BLR: "Беларусь",
  UKR: "Украина",
};

/** MRZ отдаёт код гражданства ISO 3166-1 alpha-3 (напр. "UZB") — переводим в то, что есть в списке гражданств на сайте. */
export function nationalityToRussian(code?: string): string | undefined {
  if (!code) return undefined;
  return NATIONALITY_RU[code.toUpperCase()];
}

export interface PassportScanHandle {
  /** Резолвится результатом первого успешного скана. */
  result: Promise<ScannedPassport>;
  /** Закрыть камеру и отменить сканирование, не дожидаясь результата. */
  cancel: () => void;
}

export async function startPassportScan(): Promise<PassportScanHandle> {
  const licenseKey = process.env.NEXT_PUBLIC_BLINKID_LICENSE_KEY;
  if (!licenseKey) throw new Error("Сканирование паспорта ещё не подключено");

  const { createBlinkId } = await import("@microblink/blinkid");
  const blinkId = await createBlinkId({
    licenseKey,
    cameraManagerUiOptions: { showCloseButton: true },
  });

  let settled = false;
  const result = new Promise<ScannedPassport>((resolve, reject) => {
    blinkId.addOnResultCallback((raw: BlinkIdScanningResultLike) => {
      if (settled) return;
      settled = true;
      const scanned = mapResult(raw);
      void blinkId.destroy();
      resolve(scanned);
    });
    blinkId.addOnErrorCallback((error: unknown) => {
      if (settled) return;
      settled = true;
      void blinkId.destroy();
      reject(error instanceof Error ? error : new Error("Не удалось распознать паспорт"));
    });
  });

  const cancel = () => {
    if (settled) return;
    settled = true;
    void blinkId.destroy();
  };

  return { result, cancel };
}
