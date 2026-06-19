"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Цена-«одометр»: число плавно прокручивается от предыдущего значения
 * к новому (count-up на маунте, перекат при смене валюты/пассажиров).
 * format — функция форматирования (валюта/локаль) из настроек.
 */
export default function AnimatedNumber({
  value,
  format,
  duration = 650,
  className = "",
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    // easeOutExpo — быстрый старт, мягкое торможение
    const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = ease(p);
      setDisplay(from + (to - from) * eased);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(Math.round(display))}
    </span>
  );
}
