"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

interface Dest {
  city: string;
  iata: string;
  lat: number;
  lon: number;
  price: number;
  temp: number;
  weather: string; // emoji-иконка погоды
  kw: string; // ключевое слово для фото
}

// Направления из Душанбе — координаты, цена (₽), температура.
const HUB = { city: "Душанбе", iata: "DYU", lat: 38.56, lon: 68.77 };

const DESTS: Dest[] = [
  { city: "Стамбул", iata: "IST", lat: 41.0, lon: 28.95, price: 4500, temp: 24, weather: "☀️", kw: "istanbul" },
  { city: "Дубай", iata: "DXB", lat: 25.25, lon: 55.36, price: 9900, temp: 35, weather: "☀️", kw: "dubai,skyline" },
  { city: "Москва", iata: "SVO", lat: 55.97, lon: 37.41, price: 8200, temp: 18, weather: "☁️", kw: "moscow" },
  { city: "Тбилиси", iata: "TBS", lat: 41.69, lon: 44.95, price: 4100, temp: 21, weather: "⛅", kw: "tbilisi" },
  { city: "Алматы", iata: "ALA", lat: 43.35, lon: 77.04, price: 7300, temp: 22, weather: "⛅", kw: "almaty,mountains" },
  { city: "Дели", iata: "DEL", lat: 28.56, lon: 77.1, price: 12400, temp: 33, weather: "🌫️", kw: "delhi,india" },
  { city: "Бангкок", iata: "BKK", lat: 13.69, lon: 100.75, price: 28500, temp: 34, weather: "🌧️", kw: "bangkok,temple" },
];

const cityPhoto = (kw: string) => `https://loremflickr.com/120/120/${kw}?lock=${kw.length}`;

export default function GlobeHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: import("maplibre-gl").Map | null = null;
    let raf = 0;
    let userInteracting = false;
    let disposed = false;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (disposed || !containerRef.current) return;

      map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [62, 36],
        zoom: 1.9,
        attributionControl: false,
        interactive: true,
        dragRotate: true,
      });

      map.on("style.load", () => {
        if (!map) return;
        // Глобус-проекция
        map.setProjection({ type: "globe" });
        // Русские подписи там, где есть name:ru
        const style = map.getStyle();
        for (const layer of style.layers ?? []) {
          if (layer.type === "symbol" && layer.layout && "text-field" in layer.layout) {
            try {
              map.setLayoutProperty(layer.id, "text-field", [
                "coalesce",
                ["get", "name:ru"],
                ["get", "name:latin"],
                ["get", "name"],
              ]);
            } catch {
              // некоторые слои не дают менять — пропускаем
            }
          }
        }
      });

      map.on("load", () => {
        if (!map) return;

        // Хаб — Душанбе (золотая пульсирующая точка)
        const hubEl = document.createElement("div");
        hubEl.className = "globe-hub";
        hubEl.innerHTML = `<span class="globe-hub__dot"></span><span class="globe-hub__label">${HUB.city}</span>`;
        new maplibregl.Marker({ element: hubEl, anchor: "center" })
          .setLngLat([HUB.lon, HUB.lat])
          .addTo(map);

        // Карточки направлений
        for (const d of DESTS) {
          const el = document.createElement("div");
          el.className = "globe-card";
          el.innerHTML = `
            <img class="globe-card__img" src="${cityPhoto(d.kw)}" alt="${d.city}" loading="lazy"
                 onerror="this.onerror=null;this.src='https://picsum.photos/seed/${d.iata}/120/120'" />
            <div class="globe-card__body">
              <div class="globe-card__city">${d.city}</div>
              <div class="globe-card__meta">
                <span class="globe-card__temp">+${d.temp}°</span>
                <span class="globe-card__w">${d.weather}</span>
                <span class="globe-card__price">от ${d.price.toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>
            <span class="globe-card__pin"></span>`;
          el.addEventListener("click", () => {
            window.location.href = `/search?fromCity=${HUB.city}&fromIata=${HUB.iata}&toCity=${d.city}&toIata=${d.iata}&date=&adults=1&children=0&infants=0&cabin=economy`;
          });
          new maplibregl.Marker({ element: el, anchor: "bottom" })
            .setLngLat([d.lon, d.lat])
            .addTo(map);
        }
      });

      // Авто-вращение, пауза при взаимодействии
      const pause = () => { userInteracting = true; };
      const resume = () => { userInteracting = false; };
      map.on("mousedown", pause);
      map.on("touchstart", pause);
      map.on("dragstart", pause);
      map.on("mouseup", resume);
      map.on("touchend", resume);
      map.on("dragend", resume);

      const spin = () => {
        if (map && !userInteracting) {
          const c = map.getCenter();
          c.lng -= 0.06;
          map.jumpTo({ center: c });
        }
        raf = requestAnimationFrame(spin);
      };
      raf = requestAnimationFrame(spin);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      map?.remove();
    };
  }, []);

  return <div ref={containerRef} className="globe-canvas" aria-hidden />;
}
