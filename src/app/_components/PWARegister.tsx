"use client";

import { useEffect } from "react";

/**
 * PWARegister — Phase 44.
 *
 * Registers the service worker on mount. No-op on browsers without
 * SW support (older Safari, etc). Lives in a tiny client component
 * so it can be included in the root server layout.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Defer registration until after the first paint so SW install
    // doesn't compete with the initial render.
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
        console.warn("AmIFree SW registration failed", err);
      });
    };
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
