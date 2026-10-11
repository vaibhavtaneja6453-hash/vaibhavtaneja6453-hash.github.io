export function regionStyle(r, { selected, counts, max }) {
  if (counts) {
    const c = counts[r.name] || 0;
    return {
      fill: c ? "var(--pm-red)" : "var(--pm-surface-muted)",
      stroke: c ? "var(--pm-red)" : "var(--pm-border)",
      opacity: c ? 0.25 + 0.75 * (c / max) : 1,
    };
  }
  if (selected) {
    return { fill: "var(--pm-red)", stroke: "var(--pm-red)", opacity: 0.85 };
  }
  return { fill: "var(--pm-sel)", stroke: "var(--pm-primary)", opacity: 1 };
}
