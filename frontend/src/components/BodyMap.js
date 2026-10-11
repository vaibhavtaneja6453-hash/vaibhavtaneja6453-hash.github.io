import React from "react";
import { regionsForView } from "../lib/painEngine";
import { regionStyle } from "./bodyMapStyle";

export default function BodyMap({ view, regions, onToggle, counts = null }) {
  const shapes = regionsForView(view);
  const back = view === "back";
  const max = counts ? Math.max(1, ...Object.values(counts)) : 1;

  return (
    <svg viewBox="0 0 200 410" className="w-full max-w-[280px] mx-auto select-none" role="group" aria-label={`${back ? "Back" : "Front"} body map`}>
      {shapes.map((r) => {
        const selected = regions.includes(r.name);
        const { fill, stroke, opacity } = regionStyle(r, { selected, counts, max });
        const common = {
          fill,
          stroke,
          strokeWidth: 1.4,
          fillOpacity: opacity,
          style: { cursor: counts ? "default" : "pointer", transition: "fill .15s, fill-opacity .15s" },
          onClick: counts ? undefined : () => onToggle(r.name),
          tabIndex: counts ? -1 : 0,
          role: counts ? "img" : "button",
          "aria-label": r.name + (counts ? `: ${counts[r.name] || 0}` : ""),
          "aria-pressed": counts ? undefined : selected,
          "data-testid": `body-map-region-${r.id}`,
          onKeyDown: counts
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(r.name);
                }
              },
        };
        return r.t === "e" ? (
          <ellipse key={r.id} cx={r.x} cy={r.y} rx={r.w} ry={r.h} {...common} />
        ) : (
          <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} rx={10} {...common} />
        );
      })}
    </svg>
  );
}
