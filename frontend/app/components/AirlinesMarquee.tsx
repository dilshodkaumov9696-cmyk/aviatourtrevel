"use client";

const AIRLINES = [
  { name: "Uzbekistan\nAirways", color: "#00923F", bg: "#E8F5EE" },
  { name: "S7 Airlines", color: "#3C9640", bg: "#EDF7EE" },
  { name: "Turkish Airlines", color: "#C8102E", bg: "#FDEEF1" },
  { name: "Belavia", color: "#003580", bg: "#EEF2FA" },
  { name: "Air Astana", color: "#003087", bg: "#EEF1FA" },
  { name: "Qatar Airways", color: "#5C0632", bg: "#F5EEF2" },
  { name: "Emirates", color: "#C8102E", bg: "#FDEEF1" },
  { name: "Aeroflot", color: "#0039A6", bg: "#EEF1FA" },
  { name: "Pobeda", color: "#FF6B00", bg: "#FFF3EC" },
  { name: "FlyDubai", color: "#D4002A", bg: "#FDEEF0" },
  { name: "Ural Airlines", color: "#003DA5", bg: "#EEF1FA" },
  { name: "Amadeus", color: "#003580", bg: "#EEF2FA" },
];

function AirlineLogo({ name, color, bg }: { name: string; color: string; bg: string }) {
  return (
    <div
      className="flex h-14 min-w-[140px] items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 transition hover:shadow-md hover:border-[var(--color-primary)]"
      style={{ background: "var(--color-surface)" }}
    >
      <span
        className="whitespace-pre-line text-center text-sm font-bold leading-tight tracking-wide"
        style={{ color }}
      >
        {name}
      </span>
    </div>
  );
}

export default function AirlinesMarquee() {
  const doubled = [...AIRLINES, ...AIRLINES];

  return (
    <section className="bg-[var(--color-bg)] py-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Наши партнёры
        </p>
      </div>

      {/* Fade edges */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(to right, var(--color-bg), transparent)" }} />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(to left, var(--color-bg), transparent)" }} />

        <div className="flex animate-marquee gap-4 w-max">
          {doubled.map((airline, i) => (
            <AirlineLogo key={i} {...airline} />
          ))}
        </div>
      </div>
    </section>
  );
}
