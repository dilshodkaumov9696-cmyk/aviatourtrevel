"use client";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--color-bg-soft)] rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
