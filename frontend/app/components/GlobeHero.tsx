"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Небольшой фиксированный набор городов, которые глобус умеет подсвечивать
 * и рисовать между ними дугу маршрута. Специально мало (см. ТЗ: «не 1000 точек») —
 * покрывает состояние по умолчанию (8 популярных городов) плюс города, на которые
 * можно кликнуть из панели «Популярные направления» (Мюнхен и другие хабы).
 */
export const CITY_COORDS: Record<string, { city: string; lat: number; lon: number }> = {
  // СНГ и Центральная Азия — основной рынок, точек намеренно больше, чем в остальных регионах.
  MOW: { city: "Москва", lat: 55.7558, lon: 37.6173 },
  LED: { city: "Санкт-Петербург", lat: 59.8, lon: 30.26 },
  SVX: { city: "Екатеринбург", lat: 56.74, lon: 60.8 },
  OVB: { city: "Новосибирск", lat: 55.0, lon: 82.65 },
  DYU: { city: "Душанбе", lat: 38.5598, lon: 68.787 },
  TAS: { city: "Ташкент", lat: 41.2995, lon: 69.2401 },
  ALA: { city: "Алматы", lat: 43.35, lon: 77.04 },
  FRU: { city: "Бишкек", lat: 43.06, lon: 74.48 },
  NQZ: { city: "Астана", lat: 51.13, lon: 71.47 },
  GYD: { city: "Баку", lat: 40.4093, lon: 49.8671 },
  EVN: { city: "Ереван", lat: 40.15, lon: 44.4 },
  TBS: { city: "Тбилиси", lat: 41.67, lon: 44.95 },
  MSQ: { city: "Минск", lat: 53.9, lon: 27.54 },
  // Ближний Восток и Турция
  IST: { city: "Стамбул", lat: 41.0, lon: 28.95 },
  DXB: { city: "Дубай", lat: 25.25, lon: 55.36 },
  // Европа
  LON: { city: "Лондон", lat: 51.5074, lon: -0.1278 },
  PAR: { city: "Париж", lat: 49.0, lon: 2.55 },
  MUC: { city: "Мюнхен", lat: 48.1351, lon: 11.582 },
  // Африка
  CAI: { city: "Каир", lat: 30.0444, lon: 31.2357 },
  JNB: { city: "Йоханнесбург", lat: -26.13, lon: 28.24 },
  // Азия и Океания
  BKK: { city: "Бангкок", lat: 13.69, lon: 100.75 },
  SIN: { city: "Сингапур", lat: 1.35, lon: 103.99 },
  NRT: { city: "Токио", lat: 35.76, lon: 140.39 },
  PEK: { city: "Пекин", lat: 40.08, lon: 116.58 },
  SYD: { city: "Сидней", lat: -33.95, lon: 151.18 },
  // Америка — раньше не было ни одной точки на этой стороне глобуса.
  JFK: { city: "Нью-Йорк", lat: 40.64, lon: -73.78 },
  LAX: { city: "Лос-Анджелес", lat: 33.94, lon: -118.41 },
  MIA: { city: "Майами", lat: 25.79, lon: -80.29 },
  YYZ: { city: "Торонто", lat: 43.68, lon: -79.63 },
  MEX: { city: "Мехико", lat: 19.44, lon: -99.07 },
  GRU: { city: "Сан-Паулу", lat: -23.43, lon: -46.47 },
  EZE: { city: "Буэнос-Айрес", lat: -34.82, lon: -58.54 },
};

export interface GlobeCitySelection {
  iata: string;
  city: string;
}

interface Props {
  origin?: GlobeCitySelection | null;
  destination?: GlobeCitySelection | null;
  onCityClick?: (city: string, iata: string) => void;
}

function toRad(d: number) { return (d * Math.PI) / 180; }
function toDeg(r: number) { return (r * 180) / Math.PI; }

type LngLat = [number, number];
type Vec3 = [number, number, number];

function lngLatToVec(lon: number, lat: number): Vec3 {
  const lo = toRad(lon), la = toRad(lat);
  return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
}
function vecToLngLat(v: Vec3): LngLat {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  const x = v[0] / n, y = v[1] / n, z = v[2] / n;
  return [toDeg(Math.atan2(y, x)), toDeg(Math.asin(Math.max(-1, Math.min(1, z))))];
}
function vAdd(a: Vec3, b: Vec3): Vec3 { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function vSub(a: Vec3, b: Vec3): Vec3 { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vScale(a: Vec3, s: number): Vec3 { return [a[0] * s, a[1] * s, a[2] * s]; }
function vDot(a: Vec3, b: Vec3): number { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function vCross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function vNorm(a: Vec3): Vec3 {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
}
function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const d = Math.max(-1, Math.min(1, vDot(a, b)));
  const omega = Math.acos(d);
  if (omega < 1e-6) return vNorm(vAdd(a, vScale(vSub(b, a), t)));
  const so = Math.sin(omega);
  return vAdd(vScale(a, Math.sin((1 - t) * omega) / so), vScale(b, Math.sin(t * omega) / so));
}

// map.fitBounds() у globe-проекции в этой версии maplibre-gl считает камеру некорректно
// (сильно отдаляет и уводит к полюсу вместо города) — вместо него центр между городами
// + zoom по угловому расстоянию между ними, через обычный flyTo.
function angularDistanceDeg(a: LngLat, b: LngLat): number {
  const d = Math.max(-1, Math.min(1, vDot(lngLatToVec(a[0], a[1]), lngLatToVec(b[0], b[1]))));
  return toDeg(Math.acos(d));
}

function curveAmplitudeDeg(distDeg: number): { s: number; arch: number } {
  const s = Math.min(18, Math.max(4.2, distDeg * (distDeg < 14 ? 1.1 : distDeg < 40 ? 0.42 : 0.28)));
  const arch = Math.min(9, Math.max(2.2, distDeg * (distDeg < 14 ? 0.58 : distDeg < 40 ? 0.28 : 0.16)));
  return { s, arch };
}

// S-кривая на сфере: From и To фиксированы, середина уходит в стороны мягким
// изгибом (sin 2π — намёк на бесконечность, без замкнутой восьмёрки).
function flightCurve(a: LngLat, b: LngLat, n = 192): LngLat[] {
  const A = lngLatToVec(a[0], a[1]);
  const B = lngLatToVec(b[0], b[1]);
  let perp = vCross(A, B);
  if (Math.hypot(perp[0], perp[1], perp[2]) < 1e-8) {
    perp = vCross(A, Math.abs(A[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]);
  }
  perp = vNorm(perp);
  const { s, arch } = curveAmplitudeDeg(angularDistanceDeg(a, b));
  const ampS = toRad(s);
  const ampArch = toRad(arch);

  const raw: Vec3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = slerp(A, B, t);
    const ang = ampS * Math.sin(2 * Math.PI * t) + ampArch * Math.sin(Math.PI * t);
    raw.push(vNorm(vAdd(vScale(p, Math.cos(ang)), vScale(perp, Math.sin(ang)))));
  }
  raw[0] = A;
  raw[n] = B;

  const dist = [0];
  for (let i = 1; i < raw.length; i++) {
    dist.push(dist[i - 1] + Math.acos(Math.max(-1, Math.min(1, vDot(raw[i - 1], raw[i])))));
  }
  const total = dist[dist.length - 1] || 1;
  const out: LngLat[] = new Array(n + 1);
  out[0] = a;
  out[n] = b;
  let j = 1;
  for (let i = 1; i < n; i++) {
    const target = (i / n) * total;
    while (j < dist.length - 1 && dist[j] < target) j += 1;
    const span = dist[j] - dist[j - 1] || 1;
    const f = (target - dist[j - 1]) / span;
    out[i] = vecToLngLat(slerp(raw[j - 1], raw[j], f));
  }
  return out;
}

function bearingAt(from: Vec3, to: Vec3): number {
  const [lon, lat] = vecToLngLat(from);
  const lo = toRad(lon), la = toRad(lat);
  const east: Vec3 = [-Math.sin(lo), Math.cos(lo), 0];
  const north: Vec3 = [-Math.sin(la) * Math.cos(lo), -Math.sin(la) * Math.sin(lo), Math.cos(la)];
  const dir = vSub(to, from);
  return toDeg(Math.atan2(vDot(dir, east), vDot(dir, north)));
}
function zoomForDistanceDeg(dDeg: number): number {
  if (dDeg < 3) return 5.5;
  if (dDeg < 8) return 4.5;
  if (dDeg < 16) return 3.6;
  if (dDeg < 30) return 2.8;
  if (dDeg < 60) return 2;
  if (dDeg < 100) return 1.5;
  return 1.1;
}

const PLANE_FLIGHT_MS = 16000;
const PLANE_FADE_MS = 900;
const PLANE_SVG = `<svg class="globe-plane__icon" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"/></svg>`;

function easeInOut(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  const k = 0.14;
  if (x < k) {
    const u = x / k;
    return k * u * u * (3 - 2 * u);
  }
  if (x > 1 - k) {
    const u = (x - (1 - k)) / k;
    return (1 - k) + k * u * u * (3 - 2 * u);
  }
  return x;
}

function pointAlong(line: LngLat[], t: number): { lon: number; lat: number; bearing: number } {
  const last = line.length - 1;
  const pos = Math.min(1, Math.max(0, t)) * last;
  const i = Math.min(last - 1, Math.floor(pos));
  const f = pos - i;
  const a = lngLatToVec(line[i][0], line[i][1]);
  const b = lngLatToVec(line[i + 1][0], line[i + 1][1]);
  const p = slerp(a, b, f);
  const [lon, lat] = vecToLngLat(p);
  return { lon, lat, bearing: bearingAt(a, b) };
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type MaplibreMap = import("maplibre-gl").Map;
type MaplibreMarker = import("maplibre-gl").Marker;
async function loadMaplibreGl() { return (await import("maplibre-gl")).default; }
type MaplibreModule = Awaited<ReturnType<typeof loadMaplibreGl>>;

// Красим бесплатный векторный стиль openfreemap ("liberty") в тёмно-синий и прячем
// дороги/здания/POI/подписи — оставляем только силуэты суши и воды. Дешёвая раскраска
// уже загруженного стиля вместо стороннего тёмного тайлсета (тот требует API-ключ).
function darkenLiberty(map: MaplibreMap) {
  const style = map.getStyle();
  if (!style?.layers) return;

  const RECOLOR: Record<string, { prop: "background-color" | "fill-color"; color: string }> = {
    background: { prop: "background-color", color: "#1a3a6b" },
    water: { prop: "fill-color", color: "#0d1f42" },
  };
  const FAINT_LINES = new Set(["boundary_2"]);

  for (const layer of style.layers) {
    if (layer.id in RECOLOR) {
      const { prop, color } = RECOLOR[layer.id];
      try { map.setPaintProperty(layer.id, prop, color); } catch { /* некоторые слои не дают менять */ }
      continue;
    }
    if (FAINT_LINES.has(layer.id)) {
      try {
        map.setPaintProperty(layer.id, "line-color", "#274a7a");
        map.setPaintProperty(layer.id, "line-opacity", 0.35);
      } catch { /* пропускаем */ }
      continue;
    }
    // Всё остальное (дороги, здания, POI, текстуры суши, подписи) — прячем: глобусу
    // нужны только силуэты континентов и воды, без городского шума и мультиязычных подписей.
    try { map.setLayoutProperty(layer.id, "visibility", "none"); } catch { /* пропускаем */ }
  }
}

export default function GlobeHero({ origin = null, destination = null, onCityClick = () => {} }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const maplibreglRef = useRef<MaplibreModule | null>(null);
  const markersRef = useRef<Record<string, MaplibreMarker>>({});
  const planeMarkerRef = useRef<MaplibreMarker | null>(null);
  const planeRafRef = useRef(0);
  const userInteractingRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  // Колбэк кладём в ref, чтобы не пересоздавать карту при каждом ре-рендере page.tsx —
  // сама карта монтируется один раз, клик всегда должен видеть свежий обработчик.
  const onCityClickRef = useRef(onCityClick);
  useEffect(() => { onCityClickRef.current = onCityClick; }, [onCityClick]);

  // Монтирование карты — один раз за жизнь компонента. Эффект НЕ знает про origin/destination:
  // всё, что от них зависит (маршрут, подсветка, авто-вращение), живёт в отдельном эффекте ниже,
  // который реагирует на mapReady + origin + destination напрямую, без обмена данными через refs.
  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;

    (async () => {
      const maplibregl = await loadMaplibreGl();
      if (disposed || !containerRef.current) return;
      maplibreglRef.current = maplibregl;

      // Базовая карта — тот же бесплатный векторный стиль openfreemap, что и в предыдущей
      // версии этого компонента (без ключа/аккаунта). Растровый "dark_all" от CartoDB,
      // который раньше казался разумной альтернативой, на практике требует API-ключ
      // (тайлы возвращают водяной знак "API KEY REQUIRED") — поэтому вместо чужого
      // тёмного тайлсета красим ЭТОТ же проверенный источник в тёмно-синий сами
      // (см. darkenLiberty ниже): прячем дороги/здания/подписи, красим сушу/воду.
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [45, 32],
        zoom: 1.35,
        attributionControl: false,
        interactive: true,
        dragRotate: true,
      });
      mapRef.current = map;

      // Подстраховка: если контейнер меняет размер уже после того, как карта
      // измерила его при создании (например, ещё грузится веб-шрифт и сдвигает
      // разметку, или контейнер получает финальную высоту на кадр позже канваса),
      // maplibre не всегда успевает это заметить сам — приходится resize() руками.
      resizeObserverRef.current = new ResizeObserver(() => map.resize());
      resizeObserverRef.current.observe(containerRef.current);

      map.on("style.load", () => {
        map.setProjection({ type: "globe" });
        darkenLiberty(map);
      });

      map.on("load", () => {
        if (disposed) return;

        // Мягкое атмосферное свечение вокруг globe-проекции — встроенная возможность
        // maplibre-gl (sky/atmosphere), доп. библиотек не требуется.
        map.setSky({
          "sky-color": "#01030a",
          "horizon-color": "#0b1f45",
          "fog-color": "#1b3a7a",
          "horizon-fog-blend": 0.25,
          "sky-horizon-blend": 0.6,
          "atmosphere-blend": 0.6,
        });

        // Дуга маршрута: glow (широкая, размытая) + core (тонкая, яркая) — изначально пустые,
        // наполняются вторым эффектом, когда выбраны origin и destination.
        map.addSource("route-arc", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: "route-arc-halo", type: "line", source: "route-arc",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#C4841D", "line-width": 16, "line-blur": 11, "line-opacity": 0.38 },
        });
        map.addLayer({
          id: "route-arc-glow", type: "line", source: "route-arc",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#E8B84A", "line-width": 7.5, "line-blur": 2.2, "line-opacity": 0.85 },
        });
        map.addLayer({
          id: "route-arc-core", type: "line", source: "route-arc",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#FFE9A3", "line-width": 2.2, "line-opacity": 1 },
        });

        // Точки городов — немного (см. CITY_COORDS), статичные, без постоянной пульсации.
        for (const [iata, c] of Object.entries(CITY_COORDS)) {
          const el = document.createElement("div");
          el.className = "globe-dot";
          el.innerHTML = `<span class="globe-dot__core"></span><span class="globe-dot__label">${c.city}</span>`;
          el.addEventListener("click", () => onCityClickRef.current(c.city, iata));
          const marker = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat([c.lon, c.lat])
            .addTo(map);
          markersRef.current[iata] = marker;
        }

        setMapReady(true);
      });

      const pause = () => { userInteractingRef.current = true; };
      const resume = () => { userInteractingRef.current = false; };
      map.on("mousedown", pause);
      map.on("touchstart", pause);
      map.on("dragstart", pause);
      map.on("mouseup", resume);
      map.on("touchend", resume);
      map.on("dragend", resume);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(planeRafRef.current);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Маршрут, подсветка точек, камера и авто-вращение — всё в одном эффекте, реагирующем
  // на mapReady + origin + destination. Никаких общих refs с эффектом монтирования выше:
  // эффект сам решает, крутить ли глобус (нет маршрута) или держать кадр на маршруте.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    for (const iata of Object.keys(markersRef.current)) {
      markersRef.current[iata].getElement().classList.remove("globe-dot--origin", "globe-dot--destination");
    }
    if (origin && markersRef.current[origin.iata]) {
      markersRef.current[origin.iata].getElement().classList.add("globe-dot--origin");
    }
    if (destination && markersRef.current[destination.iata]) {
      markersRef.current[destination.iata].getElement().classList.add("globe-dot--destination");
    }

    const originCoord = origin ? CITY_COORDS[origin.iata] : null;
    const destCoord = destination ? CITY_COORDS[destination.iata] : null;
    const src = map.getSource("route-arc") as import("maplibre-gl").GeoJSONSource | undefined;
    const hasRoute = Boolean(originCoord && destCoord);

    if (originCoord && destCoord && src) {
      const from: LngLat = [originCoord.lon, originCoord.lat];
      const to: LngLat = [destCoord.lon, destCoord.lat];
      const line = flightCurve(from, to);
      src.setData({ type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: line } }] });

      const MarkerCtor = maplibreglRef.current?.Marker;
      if (MarkerCtor && line.length >= 2) {
        cancelAnimationFrame(planeRafRef.current);
        planeMarkerRef.current?.remove();
        const wrap = document.createElement("div");
        wrap.className = "globe-plane";
        wrap.setAttribute("aria-hidden", "true");
        wrap.style.pointerEvents = "none";
        wrap.innerHTML = PLANE_SVG;
        const marker = new MarkerCtor({
          element: wrap,
          anchor: "center",
          pitchAlignment: "viewport",
          rotationAlignment: "viewport",
        });
        planeMarkerRef.current = marker;
        const iconEl = wrap.querySelector<HTMLElement>(".globe-plane__icon");

        const placeAt = (t: number, opacity: number) => {
          const p = pointAlong(line, t);
          marker.setLngLat([p.lon, p.lat]);
          wrap.style.opacity = String(opacity);
          if (iconEl) iconEl.style.transform = `rotate(${p.bearing}deg)`;
        };

        placeAt(0, 0);
        marker.addTo(map);

        if (prefersReducedMotion()) {
          placeAt(0.5, 1);
        } else {
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = (now - start) % PLANE_FLIGHT_MS;
            const linear = elapsed / PLANE_FLIGHT_MS;
            const fade = Math.min(elapsed / PLANE_FADE_MS, (PLANE_FLIGHT_MS - elapsed) / PLANE_FADE_MS, 1);
            placeAt(easeInOut(linear), fade);
            planeRafRef.current = requestAnimationFrame(step);
          };
          planeRafRef.current = requestAnimationFrame(step);
        }
      }

      const dist = angularDistanceDeg(from, to);
      const amp = curveAmplitudeDeg(dist);
      map.flyTo({
        center: [(originCoord.lon + destCoord.lon) / 2, (originCoord.lat + destCoord.lat) / 2],
        zoom: zoomForDistanceDeg(dist + amp.s + amp.arch),
        duration: 1200,
      });
    } else {
      src?.setData({ type: "FeatureCollection", features: [] });
      cancelAnimationFrame(planeRafRef.current);
      planeMarkerRef.current?.remove();
      planeMarkerRef.current = null;
      if (originCoord) {
        map.flyTo({ center: [originCoord.lon, originCoord.lat], zoom: 3, duration: 1000 });
      } else {
        map.flyTo({ center: [38, 28], zoom: 1.22, duration: 1000 });
      }
    }

    // Медленное авто-вращение — только когда нет активного маршрута, останавливается
    // при перетаскивании и полностью выключается вместе с этим эффектом при смене маршрута.
    let raf = 0;
    if (!hasRoute) {
      const spin = () => {
        if (mapRef.current && !userInteractingRef.current) {
          const c = mapRef.current.getCenter();
          c.lng -= 0.018;
          mapRef.current.jumpTo({ center: c });
        }
        raf = requestAnimationFrame(spin);
      };
      raf = requestAnimationFrame(spin);
    }
    // Отменяем и вращение, и анимацию самолёта: без этого при быстрой смене origin/
    // destination (или двойном вызове эффекта в dev-режиме React) старый RAF-цикл мог
    // продолжать тикать поверх уже пересозданного состояния карты/маркера.
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(planeRafRef.current);
    };
    // Реагируем только на смену IATA — сравнение целых объектов вызывало бы лишние
    // перезапуски эффекта при каждом ре-рендере page.tsx (новая ссылка на тот же город).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, origin?.iata, destination?.iata]);

  return <div ref={containerRef} className="globe-canvas" aria-hidden />;
}
