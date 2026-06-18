"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface Props {
  label: ReactNode;
  title?: string;
  align?: "left" | "right";
  width?: string;
  children: (close: () => void) => ReactNode;
}

export default function HeaderMenu({
  label, title, align = "right", width = "w-60", children,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={title}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)]"
      >
        {label}
        <svg
          width="10" height="10" viewBox="0 0 12 12" aria-hidden
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className={`animate-fade-in-down absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} z-50 ${width} max-h-[360px] overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-2xl`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
