import type { SyntheticEvent } from "react";

/** Travel-style city photos (Unsplash). Fallback is a calm skyline crop. */

const FALLBACK =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80";

const BY_IATA: Record<string, string> = {
  IST: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
  DXB: "https://images.unsplash.com/photo-1512453979798-5ea9204c5c1b?auto=format&fit=crop&w=800&q=80",
  AYT: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80",
  EVN: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
  TBS: "https://images.unsplash.com/photo-1565008447742-97f6f38c980c?auto=format&fit=crop&w=800&q=80",
  BKK: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
  ALA: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80",
  AER: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
  MOW: "https://images.unsplash.com/photo-1513326738677-b76405e262b4?auto=format&fit=crop&w=800&q=80",
  DYU: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80",
  TAS: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
  GYD: "https://images.unsplash.com/photo-1600421539016-cc3f0866d2b0?auto=format&fit=crop&w=800&q=80",
};

export function cityPhotoUrl(iata: string): string {
  return BY_IATA[iata] ?? FALLBACK;
}

export function cityPhotoFallback(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = FALLBACK;
}
