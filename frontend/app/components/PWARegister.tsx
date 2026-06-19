"use client";

import { useEffect } from "react";

/**
 * Регистрирует service worker для офлайн-режима и установки PWA.
 * Только в production — в dev service worker мешает HMR Next.js.
 */
export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
