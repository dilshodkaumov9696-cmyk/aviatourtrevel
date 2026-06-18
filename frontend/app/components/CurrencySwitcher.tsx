"use client";

import { useEffect, useState } from "react";
import HeaderMenu from "./HeaderMenu";

interface Currency {
  code: string;
  name: string;
  flag: string;
}

// Валюты стран СНГ + доллар
const CURRENCIES: Currency[] = [
  { code: "RUB", name: "Российский рубль", flag: "🇷🇺" },
  { code: "TJS", name: "Таджикский сомони", flag: "🇹🇯" },
  { code: "KZT", name: "Казахстанский тенге", flag: "🇰🇿" },
  { code: "UZS", name: "Узбекский сум", flag: "🇺🇿" },
  { code: "KGS", name: "Киргизский сом", flag: "🇰🇬" },
  { code: "BYN", name: "Белорусский рубль", flag: "🇧🇾" },
  { code: "AMD", name: "Армянский драм", flag: "🇦🇲" },
  { code: "AZN", name: "Азербайджанский манат", flag: "🇦🇿" },
  { code: "USD", name: "Доллар США", flag: "🇺🇸" },
];

export default function CurrencySwitcher({ align = "right" }: { align?: "left" | "right" }) {
  const [code, setCode] = useState("RUB");

  useEffect(() => {
    const saved = localStorage.getItem("currency");
    if (saved) setCode(saved);
  }, []);

  const current = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

  function pick(c: string, close: () => void) {
    setCode(c);
    localStorage.setItem("currency", c);
    close();
  }

  return (
    <HeaderMenu
      title="Валюта"
      width="w-64"
      align={align}
      label={
        <span className="flex items-center gap-1.5">
          <span className="text-base leading-none">{current.flag}</span>
          <span className="font-semibold">{current.code}</span>
        </span>
      }
    >
      {(close) => (
        <ul>
          {CURRENCIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => pick(c.code, close)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  code === c.code
                    ? "bg-[var(--color-primary-light)] font-semibold text-[var(--color-primary)]"
                    : "text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                }`}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{c.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </HeaderMenu>
  );
}
