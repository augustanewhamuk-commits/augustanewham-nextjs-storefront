"use client";

import { useEffect, useRef } from "react";
import { Map, useControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ArcLayer, ScatterplotLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";

// Free, token-less dark basemap (CARTO + OpenStreetMap, attribution shown).
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

type Position = [number, number];

// Lagos is the hub; arcs reach out to international destinations.
const LAGOS: Position = [3.3792, 6.5244];
const DESTINATIONS: { name: string; coord: Position }[] = [
  { name: "London", coord: [-0.1278, 51.5074] },
  { name: "Paris", coord: [2.3522, 48.8566] },
  { name: "New York", coord: [-74.006, 40.7128] },
  { name: "Toronto", coord: [-79.3832, 43.6532] },
  { name: "Dubai", coord: [55.2708, 25.2048] },
  { name: "Johannesburg", coord: [28.0473, -26.2041] },
];

const POINTS = [{ coord: LAGOS }, ...DESTINATIONS];

function DeckOverlay() {
  const overlay = useControl(() => new MapboxOverlay({ interleaved: false }));

  overlay.setProps({
    layers: [
      new ArcLayer({
        id: "shipping-routes",
        data: DESTINATIONS,
        getSourcePosition: () => LAGOS,
        getTargetPosition: (d: { coord: Position }) => d.coord,
        getSourceColor: [255, 255, 255],
        getTargetColor: [214, 178, 178],
        getWidth: 1.4,
        greatCircle: true,
      }),
      new ScatterplotLayer({
        id: "cities",
        data: POINTS,
        getPosition: (d: { coord: Position }) => d.coord,
        getFillColor: [255, 255, 255],
        getRadius: 2,
        radiusUnits: "pixels",
        radiusMinPixels: 2,
        radiusMaxPixels: 4,
      }),
    ],
  });

  return null;
}

export default function ContactGlobeInner() {
  const mapRef = useRef<MapRef | null>(null);

  // Switch to the 3D globe projection and slowly spin it (unless the visitor
  // prefers reduced motion). Spinning pauses while they drag the globe.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    let interacting = false;
    // Only spin while the globe is actually on screen — no point burning the
    // main thread (and battery) animating WebGL the visitor can't see.
    let onScreen = true;
    const onDown = () => (interacting = true);
    const onUp = () => (interacting = false);

    const container = map.getContainer();
    const observer = new IntersectionObserver(
      ([entry]) => (onScreen = entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(container);

    const start = () => {
      map.setProjection({ type: "globe" });
      map.on("mousedown", onDown);
      map.on("touchstart", onDown);
      map.on("mouseup", onUp);
      map.on("touchend", onUp);

      if (reduceMotion) return;
      const spin = () => {
        if (!interacting && onScreen) {
          const c = map.getCenter();
          map.setCenter([c.lng + 0.08, c.lat]);
        }
        frame = requestAnimationFrame(spin);
      };
      frame = requestAnimationFrame(spin);
    };

    if (map.loaded()) start();
    else map.once("load", start);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      map.off("mousedown", onDown);
      map.off("touchstart", onDown);
      map.off("mouseup", onUp);
      map.off("touchend", onUp);
    };
  }, []);

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: 8, latitude: 22, zoom: 1.1 }}
      mapStyle={MAP_STYLE}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      dragRotate={false}
      touchZoomRotate={false}
      scrollZoom={false}
      doubleClickZoom={false}
    >
      <DeckOverlay />
    </Map>
  );
}
