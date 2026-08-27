import { useId } from "react";

/**
 * Знак бренда: тёмный сквиркл с самолётом и золотой точкой-акцентом.
 * useId — чтобы id градиента не дублировался, если знак есть и в хедере, и в футере одной страницы.
 */
export default function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  const gradId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="0.75" y="0.75" width="22.5" height="22.5" rx="6.5" fill={`url(#${gradId})`} stroke="var(--color-gold)" strokeWidth="1.4" />
      <path
        d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"
        fill="#fff"
        transform="translate(2.4,1.6) scale(0.78)"
      />
      <circle cx="18.6" cy="5.4" r="1.3" fill="var(--color-gold)" />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="var(--color-ink)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
