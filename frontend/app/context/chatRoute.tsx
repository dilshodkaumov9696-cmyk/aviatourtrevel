"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ANNA_PIN_FLIGHT, type HomeRouteInput, type PinnedFlight } from "../lib/chatRoute";

interface ChatRouteCtx {
  homeRoute: HomeRouteInput | null;
  pinnedFlight: PinnedFlight | null;
  setHomeRoute: (route: HomeRouteInput | null) => void;
  pinFlight: (flight: PinnedFlight | null) => void;
}

const Ctx = createContext<ChatRouteCtx | null>(null);

export function ChatRouteProvider({ children }: { children: ReactNode }) {
  const [homeRoute, setHome] = useState<HomeRouteInput | null>(null);
  const [pinnedFlight, setPinnedFlight] = useState<PinnedFlight | null>(null);

  useEffect(() => {
    function onPin(e: Event) {
      const detail = (e as CustomEvent<PinnedFlight>).detail;
      if (detail?.bookHref) setPinnedFlight(detail);
    }
    window.addEventListener(ANNA_PIN_FLIGHT, onPin);
    return () => window.removeEventListener(ANNA_PIN_FLIGHT, onPin);
  }, []);

  const setHomeRoute = useCallback((next: HomeRouteInput | null) => setHome(next), []);
  const pinFlight = useCallback((flight: PinnedFlight | null) => setPinnedFlight(flight), []);

  const value = useMemo(
    () => ({ homeRoute, pinnedFlight, setHomeRoute, pinFlight }),
    [homeRoute, pinnedFlight, setHomeRoute, pinFlight],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChatRoute() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useChatRoute must be inside ChatRouteProvider");
  return ctx;
}

/** Главная только публикует поля формы. Календарь и пассажиры не меняются. */
export function usePublishHomeRoute(route: HomeRouteInput) {
  const ctx = useContext(Ctx);
  const setHomeRoute = ctx?.setHomeRoute;
  useEffect(() => {
    if (!setHomeRoute) return;
    setHomeRoute(route);
    return () => setHomeRoute(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- публикуем снимок формы
  }, [
    setHomeRoute,
    route.fromIata,
    route.toIata,
    route.fromCity,
    route.toCity,
    route.date,
    route.returnDate,
    route.adults,
    route.children,
    route.infants,
    route.infantsSeat,
    route.cabin,
  ]);
}
