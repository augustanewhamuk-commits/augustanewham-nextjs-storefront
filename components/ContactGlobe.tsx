"use client";

import dynamic from "next/dynamic";

// MapLibre touches `window` on import, so the globe must load client-side only.
const Globe = dynamic(() => import("./ContactGlobeInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export function ContactGlobe() {
  return <Globe />;
}
