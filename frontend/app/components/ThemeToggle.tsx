"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Проверяем системную тему или localStorage
    const isDark = localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (dark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, [dark, mounted]);

  // Показываем placeholder до монтирования (избегаем hydration mismatch)
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-[var(--color-bg-soft)] border border-[var(--color-border)]" />
    );
  }

  return (
    <button
      onClick={() => setDark(!dark)}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-bg-soft)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300"
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      {dark ? (
        <span className="text-xl">☀️</span>
      ) : (
        <span className="text-xl">🌙</span>
      )}
    </button>
  );
}
