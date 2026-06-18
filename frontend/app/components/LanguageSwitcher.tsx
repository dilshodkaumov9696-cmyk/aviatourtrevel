"use client";

import { useEffect, useState } from "react";
import HeaderMenu from "./HeaderMenu";

interface Lang {
  code: string;
  native: string;
}

// Языки стран СНГ + английский
const LANGS: Lang[] = [
  { code: "RU", native: "Русский" },
  { code: "TG", native: "Тоҷикӣ" },
  { code: "UZ", native: "Oʻzbekcha" },
  { code: "KK", native: "Қазақша" },
  { code: "KY", native: "Кыргызча" },
  { code: "HY", native: "Հայերեն" },
  { code: "AZ", native: "Azərbaycan" },
  { code: "EN", native: "English" },
];

export default function LanguageSwitcher({ align = "right" }: { align?: "left" | "right" }) {
  const [code, setCode] = useState("RU");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setCode(saved);
  }, []);

  function pick(c: string, close: () => void) {
    setCode(c);
    localStorage.setItem("lang", c);
    close();
  }

  return (
    <HeaderMenu label={<span className="font-semibold">{code}</span>} title="Язык" width="w-48" align={align}>
      {(close) => (
        <ul>
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => pick(l.code, close)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  code === l.code
                    ? "bg-[var(--color-primary-light)] font-semibold text-[var(--color-primary)]"
                    : "text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"
                }`}
              >
                <span>{l.native}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{l.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </HeaderMenu>
  );
}
