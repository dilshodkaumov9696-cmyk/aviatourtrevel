"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ variant = "light" }: { variant?: "light" | "dark" }) {
  // null = тема ещё не считана (на сервере неизвестна) → рисуем заглушку
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Источник правды — класс, который уже выставил инлайн-скрипт в <head>.
    // На маунте только ЧИТАЕМ, ничего не пишем в localStorage (иначе можно затереть сохранённую тему).
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  }

  const shell =
    variant === "dark"
      ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
      : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-[var(--color-primary)]";

  // До монтирования — заглушка тех же размеров (избегаем рассинхрона гидрации)
  if (dark === null) {
    return <div className={`h-10 w-10 rounded-xl border ${shell}`} aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${shell}`}
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      <span className="text-lg leading-none">{dark ? "☀️" : "🌙"}</span>
    </button>
  );
}
