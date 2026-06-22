"use client";

import { useEffect, useRef, useState } from "react";
import { useInViewAnimation } from "../hooks/useInViewAnimation";

interface Counter {
  label: string;
  value: number;
  suffix: string;
  description: string;
}

const COUNTERS: Counter[] = [
  { label: "Рейсов в день", value: 120000, suffix: "+", description: "ежедневно проверяем" },
  { label: "Направлений", value: 480, suffix: "", description: "городов мира" },
  { label: "Клиентов", value: 2500000, suffix: "+", description: "доверяют нам" },
  { label: "Экономия", value: 850000000, suffix: "", description: "долларов сэкономлено" },
];

function AnimatedNumber({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      setCurrent(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    animate();
  }, [inView, target]);

  function format(num: number): string {
    if (num >= 1000000) {
      const v = num / 1000000;
      return (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + "M";
    }
    if (num >= 1000) return (num / 1000).toFixed(0) + "k";
    return num.toString();
  }

  return (
    <span className="text-4xl font-bold text-[var(--color-primary)]">
      {format(current)}{suffix}
    </span>
  );
}

export default function Counters() {
  const { ref, isInView } = useInViewAnimation();

  return (
    <section
      ref={ref as any}
      className={`bg-[var(--color-bg)] py-16 transition-all duration-700 ${
        isInView ? "opacity-100" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {COUNTERS.map((counter) => (
            <div key={counter.label} className="text-center">
              <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {counter.label}
              </div>
              <AnimatedNumber target={counter.value} suffix={counter.suffix} inView={isInView} />
              <div className="mt-2 text-sm text-[var(--color-text-muted)]">{counter.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
