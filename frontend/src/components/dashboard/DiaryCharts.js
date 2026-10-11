import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { Activity, BarChart3 } from "lucide-react";

function EmptyChart({ text }) {
  return <div className="h-[220px] grid place-items-center text-center text-pm-muted text-sm px-6">{text}</div>;
}

export function DiaryCharts({ timeline, stats }) {
  return (
    <div className="grid lg:grid-cols-2 gap-5 mb-6">
      <div className="pm-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-pm-ink mb-3"><BarChart3 className="w-5 h-5 text-pm-secondary" /> Severity trend</h2>
        {timeline.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeline} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--pm-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--pm-muted)" }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "var(--pm-muted)" }} />
              <Tooltip contentStyle={{ background: "var(--pm-surface)", border: "1px solid var(--pm-border)", borderRadius: 12, color: "var(--pm-ink)" }} />
              <Line type="monotone" dataKey="severity" stroke="var(--pm-primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--pm-secondary)" }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyChart text="Save a check to see your severity over time." />}
      </div>

      <div className="pm-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-pm-ink mb-3"><Activity className="w-5 h-5 text-pm-secondary" /> Where it hurts most</h2>
        {stats?.regions?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.regions.slice(0, 6)} layout="vertical" margin={{ left: 20, right: 12 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "var(--pm-muted)" }} />
              <Tooltip cursor={{ fill: "var(--pm-surface-muted)" }} contentStyle={{ background: "var(--pm-surface)", border: "1px solid var(--pm-border)", borderRadius: 12, color: "var(--pm-ink)" }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="var(--pm-secondary)" />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart text="Your most frequent pain regions will appear here." />}
      </div>
    </div>
  );
}
