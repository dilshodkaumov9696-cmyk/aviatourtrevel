"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Небольшой фиксированный набор городов, которые глобус умеет подсвечивать
 * и рисовать между ними дугу маршрута. Специально мало (см. ТЗ: «не 1000 точек») —
 * покрывает состояние по умолчанию (8 популярных городов) плюс города, на которые
 * можно кликнуть из панели «Популярные направления» (Баку, которого нет среди
 * дефолтных точек, но который должен уметь подсветиться при выборе).
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

// Интерполяция большого круга между двумя точками сферы (slerp), n+1 точек.
function greatCircle(a: [number, number], b: [number, number], n = 48): [number, number][] {
  const lon1 = toRad(a[0]), lat1 = toRad(a[1]);
  const lon2 = toRad(b[0]), lat2 = toRad(b[1]);
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2,
  ));
  if (d === 0) return [a, b];
  const points: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);
    points.push([toDeg(lon), toDeg(lat)]);
  }
  return points;
}

// map.fitBounds() у globe-проекции в этой версии maplibre-gl считает камеру некорректно
// (сильно отдаляет и уводит к полюсу вместо города) — вместо него центр между городами
// + zoom по угловому расстоянию между ними, через обычный flyTo.
function angularDistanceDeg(a: [number, number], b: [number, number]): number {
  const lon1 = toRad(a[0]), lat1 = toRad(a[1]);
  const lon2 = toRad(b[0]), lat2 = toRad(b[1]);
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2,
  ));
  return toDeg(d);
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
          id: "route-arc-glow", type: "line", source: "route-arc",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#2FD98A", "line-width": 7, "line-blur": 7, "line-opacity": 0.45 },
        });
        map.addLayer({
          id: "route-arc-core", type: "line", source: "route-arc",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#B9FFDD", "line-width": 1.6, "line-opacity": 0.95 },
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
      const line = greatCircle([originCoord.lon, originCoord.lat], [destCoord.lon, destCoord.lat]);
      src.setData({ type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: line } }] });

      const MarkerCtor = maplibreglRef.current?.Marker;
      if (MarkerCtor) {
        cancelAnimationFrame(planeRafRef.current);
        if (!planeMarkerRef.current) {
          const wrap = document.createElement("div");
          wrap.className = "globe-plane";
          wrap.innerHTML = `<span class="globe-plane__icon">✈</span>`;
          planeMarkerRef.current = new MarkerCtor({ element: wrap, anchor: "center" });
        }
        const marker = planeMarkerRef.current!;
        marker.setLngLat(line[0]).addTo(map);
        const iconEl = marker.getElement().querySelector<HTMLElement>(".globe-plane__icon");
        const start = performance.now();
        const flightDuration = 3000;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / flightDuration);
          const idx = Math.min(line.length - 1, Math.floor(t * (line.length - 1)));
          const point = line[idx];
          if (!point) return;
          const [lon, lat] = point;
          marker.setLngLat([lon, lat]);
          const next = line[Math.min(line.length - 1, idx + 1)];
          if (iconEl && next) {
            const bearing = Math.atan2(next[0] - lon, next[1] - lat) * (180 / Math.PI);
            iconEl.style.transform = `rotate(${bearing}deg)`;
          }
          if (t < 1) planeRafRef.current = requestAnimationFrame(step);
        };
        planeRafRef.current = requestAnimationFrame(step);
      }

      map.flyTo({
        center: [(originCoord.lon + destCoord.lon) / 2, (originCoord.lat + destCoord.lat) / 2],
        zoom: zoomForDistanceDeg(angularDistanceDeg([originCoord.lon, originCoord.lat], [destCoord.lon, destCoord.lat])),
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
        map.flyTo({ center: [45, 32], zoom: 1.35, duration: 1000 });
      }
    }

    // Медленное авто-вращение — только когда нет активного маршрута, останавливается
    // при перетаскивании и полностью выключается вместе с этим эффектом при смене маршрута.
    let raf = 0;
    if (!hasRoute) {
      const spin = () => {
        if (mapRef.current && !userInteractingRef.current) {
          const c = mapRef.current.getCenter();
          c.lng -= 0.035;
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
