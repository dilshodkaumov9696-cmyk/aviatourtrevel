"use client";

/**
 * Экран загрузки результатов: самолётик летит по дуге из города вылета
 * в город назначения (SVG animateMotion вдоль пути). Заменяет скучный спиннер.
 */
export default function FlightLoader({
  fromCity,
  fromIata,
  toCity,
  toIata,
}: {
  fromCity: string;
  fromIata: string;
  toCity: string;
  toIata: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8">
      <svg viewBox="0 0 400 150" className="mx-auto block w-full max-w-[460px]" role="img" aria-label="Поиск рейсов">
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Пунктирная дуга маршрута */}
        <path
          id="flight-arc"
          d="M40 112 Q200 8 360 112"
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="2.5"
          strokeDasharray="2 7"
          strokeLinecap="round"
        />

        {/* Города-точки */}
        <circle cx="40" cy="112" r="6" fill="var(--color-primary)" />
        <circle cx="40" cy="112" r="6" fill="var(--color-primary)">
          <animate attributeName="r" values="6;13;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="360" cy="112" r="6" fill="var(--color-accent-dark)" />

        {/* Самолёт, летящий вдоль дуги */}
        <g>
          <g transform="translate(-11,-11) rotate(45,11,11)">
            <path
              fill="var(--color-primary)"
              d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"
            />
          </g>
          <animateMotion dur="2.1s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
            <mpath href="#flight-arc" />
          </animateMotion>
        </g>

        {/* Подписи аэропортов */}
        <text x="40" y="138" textAnchor="middle" className="fill-[var(--color-text-muted)]" fontSize="12" fontWeight="700">
          {fromIata}
        </text>
        <text x="360" y="138" textAnchor="middle" className="fill-[var(--color-text-muted)]" fontSize="12" fontWeight="700">
          {toIata}
        </text>
      </svg>

      <div className="mt-4 text-center">
        <div className="text-base font-bold text-[var(--color-text)]">
          {fromCity} <span className="text-[var(--color-text-muted)]">→</span> {toCity}
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
          Ищем лучшие цены
          <span className="flex gap-1">
            <span className="loader-dot h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            <span className="loader-dot h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            <span className="loader-dot h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
          </span>
        </div>
      </div>
    </div>
  );
}
