"use client";

import type { ReactNode } from "react";

type IconProps = { className?: string; size?: number; title?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({ size = 28, className = "", title, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`ai-icon ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Самолёт — лёгкий взлёт и крен */
export function AnimFlights({ size, className, title = "Авиабилеты" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-flights">
        <path
          {...stroke}
          d="M4 18.5 14.5 14.2V8.8a1.6 1.6 0 0 1 3.2 0v5.4L28 18.5v3.1l-10.3-2.1v3.8l2.4 1.8v2.2l-4.1-1.6-4.1 1.6v-2.2l2.4-1.8v-3.8L4 21.6z"
        />
      </g>
    </Frame>
  );
}

/** Отели — корпус «дышит», окна мигают */
export function AnimHotels({ size, className, title = "Отели" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-hotels">
        <path {...stroke} d="M6 27V11.5L16 5v22M16 11h10v16M4 27h24" />
        <g className="ai-hotels__windows">
          <path d="M9.2 15.2h2.2M12.8 15.2h2.2M9.2 18.8h2.2M12.8 18.8h2.2M19 15.2h2.2M22.6 15.2h2.2M19 18.8h2.2M22.6 18.8h2.2" {...stroke} />
        </g>
      </g>
    </Frame>
  );
}

/** Туры — карта раскрывается */
export function AnimTours({ size, className, title = "Туры" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-tours">
        <path {...stroke} d="M5 8.5 12.5 6v18L5 26.5z" className="ai-tours__left" />
        <path {...stroke} d="M12.5 6 19.5 9v18L12.5 24z" className="ai-tours__mid" />
        <path {...stroke} d="M19.5 9 27 6.5V24.5L19.5 27z" className="ai-tours__right" />
      </g>
    </Frame>
  );
}

/** eSIM — волны сигнала */
export function AnimEsim({ size, className, title = "eSIM" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-esim">
        <path {...stroke} d="M9 5h8l6 6v15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
        <rect x="11" y="15" width="10" height="8" rx="1.2" {...stroke} />
        <g className="ai-esim__waves" {...stroke}>
          <path d="M22.5 9.5c1.2 1.1 1.9 2.6 1.9 4.2" />
          <path d="M24.8 7.6c1.8 1.7 2.9 4 2.9 6.5" />
        </g>
      </g>
    </Frame>
  );
}

/** Страхование — щит + галочка */
export function AnimInsurance({ size, className, title = "Страхование" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-insurance">
        <path {...stroke} d="M16 4.5 26 8.2v7.2c0 6.2-4.2 10.8-10 13.1-5.8-2.3-10-6.9-10-13.1V8.2z" />
        <path className="ai-insurance__check" {...stroke} d="M11.2 16.2 14.5 19.4 21 12.8" />
      </g>
    </Frame>
  );
}

/** Поезд — лёгкий ход вперёд */
export function AnimTrains({ size, className, title = "Билеты на поезд" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-trains">
        <rect x="7" y="5" width="18" height="16" rx="3.5" {...stroke} />
        <path {...stroke} d="M7 14h18M11 28l2.5-4M21 28l-2.5-4" />
        <circle className="ai-trains__wheel" cx="11.5" cy="18.5" r="1.4" fill="currentColor" />
        <circle className="ai-trains__wheel" cx="20.5" cy="18.5" r="1.4" fill="currentColor" />
      </g>
    </Frame>
  );
}

/** Трансферы — машина едет */
export function AnimTransfers({ size, className, title = "Трансферы" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-transfers">
        <path {...stroke} d="M5 18.5 7.2 11.8A2.4 2.4 0 0 1 9.5 10h13a2.4 2.4 0 0 1 2.3 1.8L27 18.5" />
        <path {...stroke} d="M3.5 18.5h25M6 18.5v2.8M26 18.5v2.8" />
        <circle className="ai-transfers__wheel" cx="10" cy="21.2" r="1.7" {...stroke} />
        <circle className="ai-transfers__wheel" cx="22" cy="21.2" r="1.7" {...stroke} />
      </g>
    </Frame>
  );
}

/** Акции — процент крутится */
export function AnimDeals({ size, className, title = "Акции" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-deals">
        <path {...stroke} d="M9.5 22.5 22.5 9.5" />
        <circle cx="11" cy="11" r="2.4" {...stroke} />
        <circle cx="21" cy="21" r="2.4" {...stroke} />
      </g>
    </Frame>
  );
}

/** Поддержка — гарнитура «звонит» */
export function AnimSupport({ size, className, title = "Поддержка" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-support">
        <path {...stroke} d="M6.5 15a9.5 9.5 0 0 1 19 0" />
        <path {...stroke} d="M6.5 15v5a2.2 2.2 0 0 0 2.2 2.2H10V13.5H8.7A2.2 2.2 0 0 0 6.5 15z" />
        <path {...stroke} d="M25.5 15v5a2.2 2.2 0 0 1-2.2 2.2H22V13.5h1.3a2.2 2.2 0 0 1 2.2 2.2z" />
        <path {...stroke} d="M16.5 24.5H20a2.4 2.4 0 0 1 2.4 2.4" />
      </g>
    </Frame>
  );
}

/** Войти — силуэт мягко увеличивается */
export function AnimLogin({ size, className, title = "Войти" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-login">
        <circle cx="16" cy="11" r="4.2" {...stroke} />
        <path {...stroke} d="M7.5 26c0-4.2 3.8-7.2 8.5-7.2s8.5 3 8.5 7.2" />
      </g>
    </Frame>
  );
}

/** Солнце — вращение лучей */
export function AnimSun({ size, className, title = "Светлая тема" }: IconProps) {
  return (
    <Frame size={size} className={className} title={title}>
      <g className="ai-sun">
        <circle cx="16" cy="16" r="4.2" {...stroke} />
        <g className="ai-sun__rays" {...stroke}>
          <path d="M16 5.5v2.4M16 24.1v2.4M5.5 16h2.4M24.1 16h2.4M8.4 8.4l1.7 1.7M21.9 21.9l1.7 1.7M8.4 23.6l1.7-1.7M21.9 10.1l1.7-1.7" />
        </g>
      </g>
    </Frame>
  );
}

export const ANIMATED_NAV_ICONS = [
  { key: "flights", label: "Авиабилеты", motion: "взлёт и лёгкий крен", Icon: AnimFlights },
  { key: "hotels", label: "Отели", motion: "здание дышит, окна мигают", Icon: AnimHotels },
  { key: "tours", label: "Туры", motion: "карта раскрывается", Icon: AnimTours },
  { key: "esim", label: "eSIM", motion: "волны сигнала", Icon: AnimEsim },
  { key: "insurance", label: "Страхование", motion: "галочка на щите", Icon: AnimInsurance },
  { key: "trains", label: "Билеты на поезд", motion: "состав едет вперёд", Icon: AnimTrains },
  { key: "transfers", label: "Трансферы", motion: "машина трогается", Icon: AnimTransfers },
  { key: "deals", label: "Акции", motion: "процент крутится", Icon: AnimDeals },
  { key: "support", label: "Поддержка", motion: "гарнитура «звонит»", Icon: AnimSupport },
  { key: "login", label: "Войти", motion: "силуэт мягко увеличивается", Icon: AnimLogin },
  { key: "sun", label: "Тема", motion: "лучи солнца вращаются", Icon: AnimSun },
] as const;
