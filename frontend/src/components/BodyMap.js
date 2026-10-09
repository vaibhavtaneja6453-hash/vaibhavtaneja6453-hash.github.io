import React from "react";
import { regionsForView } from "../lib/painEngine";

export default function BodyMap({ view, regions, onToggle, counts = null }) {
  const shapes = regionsForView(view);
  const back = view === "back";
  const max = counts ? Math.max(1, ...Object.values(counts)) : 1;

  return (
    <svg viewBox="0 0 200 410" className="w-full max-w-[280px] mx-auto select-none" role="group" aria-label={`${back ? "Back" : "Front"} body map`}>
      {shapes.map((r) => {
        const selected = regions.includes(r.name);
        let fill = "var(--pm-sel)";
        let stroke = "var(--pm-primary)";
        let opacity = 1;
        if (counts) {
          const c = counts[r.name] || 0;
          fill = c ? "var(--pm-red)" : "var(--pm-surface-muted)";
          opacity = c ? 0.25 + 0.75 * (c / max) : 1;
          stroke = c ? "var(--pm-red)" : "var(--pm-border)";
        } else if (selected) {
          fill = "var(--pm-red)";
          stroke = "var(--pm-red)";
          opacity = 0.85;
        }
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
