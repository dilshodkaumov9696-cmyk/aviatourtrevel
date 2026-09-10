"use client";

import { useRef, useState } from "react";
import { cityPhotoFallback, cityPhotoUrl } from "../data/cityPhotos";

const DIRECTIONS = [
  { city: "Стамбул", country: "Турция", iata: "IST" },
  { city: "Дубай", country: "ОАЭ", iata: "DXB" },
  { city: "Анталья", country: "Турция", iata: "AYT" },
  { city: "Ереван", country: "Армения", iata: "EVN" },
  { city: "Тбилиси", country: "Грузия", iata: "TBS" },
  { city: "Бангкок", country: "Таиланд", iata: "BKK" },
  { city: "Алматы", country: "Казахстан", iata: "ALA" },
  { city: "Сочи", country: "Россия", iata: "AER" },
];

export default function DirectionsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (!trackRef.current) return;
    const cardWidth = trackRef.current.querySelector(".carousel-card")?.clientWidth || 200;
    const gap = 16;
    trackRef.current.scrollBy({
      left: direction === "right" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth",
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    const diff = dragStart - e.clientX;
    if (Math.abs(diff) > 50) {
      scroll(diff > 0 ? "right" : "left");
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !trackRef.current) return;
    const diff = dragStart - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
      scroll(diff > 0 ? "right" : "left");
      setIsDragging(false);
    }
  };

  return (
    <section className="bg-[var(--color-bg-soft)] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold text-[var(--color-text-muted)]">Популярные маршруты</h3>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] lg:flex"
            aria-label="Предыдущие"
          >
            ‹
          </button>

          {/* Carousel Track */}
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto scroll-smooth py-2"
            style={{ scrollBehavior: "smooth" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {DIRECTIONS.map((dir) => (
              <a
                key={dir.iata}
                href="#search"
                className="carousel-card group relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)]"
              >
                <img
                  src={cityPhotoUrl(dir.iata)}
                  onError={cityPhotoFallback}
                  alt={dir.city}
                  className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute right-3 top-3 rounded-md bg-[var(--color-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text)]">
                  {dir.iata}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-[var(--color-ink)]/80 p-4 text-white">
                  <div className="text-lg font-bold">{dir.city}</div>
                  <div className="text-sm text-white/80">{dir.country}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] lg:flex"
            aria-label="Следующие"
          >
            ›
          </button>
        </div>

        {/* Swipe Hint for Mobile */}
        <div className="mt-4 text-center text-xs text-[var(--color-text-muted)] lg:hidden">
          ← Свайп влево/вправо →
        </div>
      </div>
    </section>
  );
}
