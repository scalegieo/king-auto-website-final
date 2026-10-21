"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const VISITOR_KEY = "ka_vid";

function visitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
    const next = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function send(payload: { type: "view" | "click"; path: string; label?: string }) {
  const body = JSON.stringify({ ...payload, visitorId: visitorId() });
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics/collect", blob)) return;
  }
  void fetch("/api/analytics/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    send({ type: "view", path: pathname });
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (window.location.pathname.startsWith("/admin")) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("a, button");
      if (!el) return;
      const label = (el.getAttribute("aria-label") || el.textContent || "Tap")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
      if (!label) return;
      send({ type: "click", path: window.location.pathname, label });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
