type IconProps = { className?: string; size?: number };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconPlane({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" />
    </svg>
  );
}

export function IconPin({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconCalendar({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.15} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.2" y="5" width="17.6" height="15.5" rx="2.2" />
      <path d="M3.2 9.2h17.6M8 3.2v4.2M16 3.2v4.2" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
    </svg>
  );
}

export function IconUser({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
    </svg>
  );
}

export function IconSearch({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}

export function IconSwap({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M7 10l-3-3 3-3M4 7h13M17 14l3 3-3 3M20 17H7" />
    </svg>
  );
}

export function IconRoute({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="4" cy="7" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="20" cy="7" r="1.7" fill="currentColor" stroke="none" />
      <path d="M4 7h4l4 10h4l4-10" />
    </svg>
  );
}

export function IconHotel({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M3 20V7M3 13h13a4 4 0 0 1 4 4v3M3 20h18" />
      <path d="M7 13v-2h4v2" />
    </svg>
  );
}

export function IconTour({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function IconSim({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <rect x="8" y="12" width="8" height="6" rx="1" />
      <path d="M12 12v6M8 15h8" />
    </svg>
  );
}

export function IconShield({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconTrain({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 11h14" />
      <circle cx="8.5" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="14" r="1" fill="currentColor" stroke="none" />
      <path d="M7 21l2-3M17 21l-2-3" />
    </svg>
  );
}

export function IconBackpack({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M7 9V6a5 5 0 0 1 10 0v3" />
      <path d="M6 9h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

export function IconSuitcase({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

export function IconUndo({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M4 10h9a5 5 0 0 1 0 10h-2" />
      <path d="M8 5 4 10l4 5" />
    </svg>
  );
}

export function IconStarFilled({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6.3 6.8.8-5 4.7 1.3 6.8-6-3.4-6 3.4 1.3-6.8-5-4.7 6.8-.8L12 2.5z" />
    </svg>
  );
}

export function IconSeat({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6 4v9a2 2 0 0 0 2 2h8" />
      <path d="M6 13H5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h13" />
      <path d="M16 15v5M20 20v-4a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

export function IconMeal({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M6 3v4M8 3v4" />
      <path d="M17 3c-1.5 0-2.5 1.5-2.5 4s1 4 2.5 4v10" />
    </svg>
  );
}

export function IconPriority({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6 16l6-6 6 6" />
      <path d="M6 21l6-6 6 6" />
    </svg>
  );
}

export function IconLounge({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M4 12v6M20 12v6M4 15h16" />
      <path d="M5 15v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
      <path d="M4 21v-2M20 21v-2" />
    </svg>
  );
}

export function IconCheckin({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M9.5 12.5l1.8 1.8L15 10.5" />
    </svg>
  );
}

export function IconClock({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconCar({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6 17l1.2-4.5A2 2 0 0 1 9.1 11h5.8a2 2 0 0 1 1.9 1.5L18 17" />
      <path d="M4 17h16M4 17v2M20 17v2" />
      <circle cx="8" cy="17" r="1.5" />
      <circle cx="16" cy="17" r="1.5" />
    </svg>
  );
}

export function IconHeadset({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1v-8H6a2 2 0 0 0-2 2zM20 13v4a2 2 0 0 1-2 2h-1v-8h1a2 2 0 0 1 2 2z" />
      <path d="M13 19h2a2 2 0 0 1 2 2" />
    </svg>
  );
}

export function IconMinus({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6 12h12" />
    </svg>
  );
}

export function IconPlus({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

export function IconClose({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconTag({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M20 13 11 4H5v6l9 9 6-6z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
