"use client";

import { useEffect, useState } from "react";

const KEY = "aviator:cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(!localStorage.getItem(KEY)), []);
  if (!visible) return null;

  function save(value: "accepted" | "necessary") {
    localStorage.setItem(KEY, value);
    document.cookie = `aviator_cookie_consent=${value}; max-age=31536000; path=/; SameSite=Lax`;
    setVisible(false);
  }

  return (
    <aside className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-2xl sm:flex sm:items-center sm:gap-5">
      <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
        Мы используем необходимые cookie для работы сайта. С согласия — также для улучшения сервиса.
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button type="button" onClick={() => save("necessary")} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text)]">
          Только необходимые
        </button>
        <button type="button" onClick={() => save("accepted")} className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white">
          Принять
        </button>
      </div>
    </aside>
  );
}
