"use client";

import { useRef, useState } from "react";

interface Direction {
  city: string;
  country: string;
  iata: string;
  price: number;
  photo: string;
  keyword: string;
  lock: number;
}

const DIRECTIONS: Direction[] = [
  { city: "Стамбул", country: "Турция", iata: "IST", price: 4500, photo: "istanbul,city", keyword: "istanbul,city", lock: 1 },
  { city: "Дубай", country: "ОАЭ", iata: "DXB", price: 9900, photo: "dubai,skyline", keyword: "dubai,skyline", lock: 2 },
  { city: "Анталья", country: "Турция", iata: "AYT", price: 6200, photo: "antalya,beach", keyword: "antalya,beach", lock: 3 },
  { city: "Ереван", country: "Армения", iata: "EVN", price: 3800, photo: "yerevan,armenia", keyword: "yerevan,armenia", lock: 4 },
  { city: "Тбилиси", country: "Грузия", iata: "TBS", price: 4100, photo: "tbilisi,city", keyword: "tbilisi,city", lock: 5 },
  { city: "Бангкок", country: "Таиланд", iata: "BKK", price: 28500, photo: "bangkok,temple", keyword: "bangkok,temple", lock: 6 },
  { city: "Алматы", country: "Казахстан", iata: "ALA", price: 7300, photo: "almaty,mountains", keyword: "almaty,mountains", lock: 7 },
  { city: "Сочи", country: "Россия", iata: "AER", price: 3200, photo: "sochi,sea", keyword: "sochi,sea", lock: 8 },
];

const cityPhoto = (kw: string, lock: number) =>
  `https://loremflickr.com/640/480/${kw}?lock=${lock}`;

function photoFallback(e: React.SyntheticEvent<HTMLImageElement>, seed: string) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = `https://picsum.photos/seed/${seed}/640/480`;
}

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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
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
                className="carousel-card group flex-shrink-0 relative w-48 h-48 rounded-xl overflow-hidden shadow-md transition hover:shadow-lg"
              >
                <img
                  src={cityPhoto(dir.keyword, dir.lock)}
                  onError={(e) => photoFallback(e, dir.city)}
                  alt={dir.city}
                  className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {/* IATA Badge */}
                <div className="absolute top-3 right-3 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {dir.iata}
                </div>
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="text-lg font-bold">{dir.city}</div>
                  <div className="text-sm text-white/80">{dir.country}</div>
                  <div className="mt-2 text-base font-bold text-[var(--color-accent)]">от {dir.price.toLocaleString('ru-RU')} ₽</div>
                </div>
              </a>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
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
