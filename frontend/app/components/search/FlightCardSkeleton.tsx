export default function FlightCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:p-5 animate-pulse">
      {/* Левая часть */}
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex gap-2">
          <div className="h-[22px] w-[22px] shrink-0 rounded bg-[var(--color-bg-soft)]" />
          <div className="h-5 w-32 rounded bg-[var(--color-bg-soft)]" />
          <div className="h-5 w-20 rounded bg-[var(--color-bg-soft)]" />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-center">
            <div className="h-6 w-12 rounded bg-[var(--color-bg-soft)]" />
            <div className="mt-1 h-4 w-8 rounded bg-[var(--color-bg-soft)]" />
          </div>

          <div className="min-w-0 flex-1 text-center">
            <div className="mb-1 h-4 w-16 rounded bg-[var(--color-bg-soft)]" />
            <div className="flex items-center gap-1">
              <div className="h-0.5 flex-1 rounded bg-[var(--color-bg-soft)]" />
              <div className="h-3 w-3 rounded-full bg-[var(--color-bg-soft)]" />
              <div className="h-0.5 flex-1 rounded bg-[var(--color-bg-soft)]" />
            </div>
            <div className="mt-1 h-4 w-24 rounded bg-[var(--color-bg-soft)]" />
          </div>

          <div className="text-center">
            <div className="h-6 w-12 rounded bg-[var(--color-bg-soft)]" />
            <div className="mt-1 h-4 w-8 rounded bg-[var(--color-bg-soft)]" />
          </div>
        </div>

        <div className="mt-3 h-4 w-64 rounded bg-[var(--color-bg-soft)]" />
      </div>

      {/* Правая часть */}
      <div className="flex items-end justify-between gap-3 border-t border-[var(--color-border)] pt-3 sm:block sm:w-44 sm:shrink-0 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 sm:text-right">
        <div>
          <div className="h-6 w-24 rounded bg-[var(--color-bg-soft)]" />
          <div className="mt-1 h-4 w-32 rounded bg-[var(--color-bg-soft)]" />
          <div className="mt-1.5 h-4 w-20 rounded bg-[var(--color-bg-soft)]" />
        </div>
        <div className="sm:mt-3">
          <div className="h-10 w-24 rounded-xl bg-[var(--color-bg-soft)] sm:w-full" />
        </div>
      </div>
    </div>
  );
}
