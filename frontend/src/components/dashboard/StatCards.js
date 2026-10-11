import React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export function StatCards({ stats }) {
  const TrendIcon = stats?.trend === "improving" ? TrendingDown : stats?.trend === "worsening" ? TrendingUp : Minus;
  const trendText = { improving: "Pain looks to be improving", worsening: "Pain looks to be getting worse", steady: "Pain looks fairly steady", none: "Save 2+ checks to see a trend" }[stats?.trend || "none"];

  return (
    <div className="grid md:grid-cols-3 gap-5 mb-6">
      <div className="pm-card p-5">
        <p className="text-pm-muted text-sm font-bold">Saved checks</p>
        <p className="font-display text-4xl font-bold text-pm-ink mt-1">{stats?.count ?? 0}</p>
      </div>
      <div className="pm-card p-5">
        <p className="text-pm-muted text-sm font-bold">Average severity</p>
        <p className="font-display text-4xl font-bold mt-1" style={{ color: "var(--pm-primary)" }}>{stats?.avg_severity ?? 0}<span className="text-xl text-pm-muted">/10</span></p>
      </div>
      <div className="pm-card p-5">
        <p className="text-pm-muted text-sm font-bold">Trend</p>
        <p className="flex items-center gap-2 font-display text-lg font-bold text-pm-ink mt-2"><TrendIcon className="w-5 h-5" style={{ color: "var(--pm-secondary)" }} />{trendText}</p>
      </div>
    </div>
  );
}
