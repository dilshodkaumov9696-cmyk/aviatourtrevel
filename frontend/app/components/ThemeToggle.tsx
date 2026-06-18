"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
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

  // До монтирования — заглушка тех же размеров (избегаем рассинхрона гидрации)
  if (dark === null) {
    return (
      <div className="w-10 h-10 rounded-full bg-[var(--color-bg-soft)] border border-[var(--color-border)]" />
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-bg-soft)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300"
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      <span className="text-xl">{dark ? "☀️" : "🌙"}</span>
    </button>
  );
}
