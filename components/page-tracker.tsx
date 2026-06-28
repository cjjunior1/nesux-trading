"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Beacon de tracking de navegación. Al cambiar de ruta registra la página
 * anterior con el tiempo que el usuario pasó en ella (POST /api/track).
 * No bloquea ni afecta la navegación. Se ignoran rutas internas de admin.
 */
function sessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("track_sid");
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("track_sid", id); }
  return id;
}

export default function PageTracker() {
  const pathname = usePathname();
  const prev = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    const now = Date.now();
    const last = prev.current;

    const send = (path: string, durationMs: number) => {
      const body = JSON.stringify({ path, durationMs, sessionId: sessionId(), referrer: document.referrer || null });
      // sendBeacon sobrevive a la navegación; fetch keepalive como respaldo.
      if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      else fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    };

    if (last && last.path !== pathname) send(last.path, now - last.at);
    prev.current = { path: pathname, at: now };

    // Al cerrar/recargar, registrar la página actual con su duración
    const onHide = () => { if (prev.current) send(prev.current.path, Date.now() - prev.current.at); };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [pathname]);

  return null;
}
