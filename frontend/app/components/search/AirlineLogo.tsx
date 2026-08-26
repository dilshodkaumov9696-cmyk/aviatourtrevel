"use client";

import { useState } from "react";

interface Props {
  code: string;
  name: string;
  size: number;
  className?: string;
}

// Логотип авиакомпании с безопасным фолбэком: если внешний URL недоступен
// (или его нет), вместо битой картинки показываем код авиакомпании.
export default function AirlineLogo({ code, name, size, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed || !code) {
    return (
      <span
        className={`flex items-center justify-center font-bold text-[var(--color-text-muted)] ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(9, size * 0.4) }}
        aria-hidden
      >
        {code || "?"}
      </span>
    );
  }

  return (
    <img
      src={`https://images.kiwi.com/airlines/64/${code}.png`}
      alt={name}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
