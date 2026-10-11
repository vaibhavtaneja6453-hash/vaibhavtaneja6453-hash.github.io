import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import {
  Stethoscope, Trash2, TrendingDown, TrendingUp, Minus, Activity, Droplet, Phone, MapPin, BookHeart, BarChart3,
} from "lucide-react";

const LEVEL_COLOR = { G: "var(--pm-green)", Y: "var(--pm-yellow)", R: "var(--pm-red)" };
const LEVEL_TEXT = { G: "Green", Y: "Yellow", R: "Red" };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [d, st] = await Promise.all([api.get("/diary"), api.get("/diary/stats")]);
      setEntries(d.data);
      setStats(st.data);
    } catch {
      toast.error("Could not load your diary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    try {
      await api.delete(`/diary/${id}`);
      setEntries((e) => e.filter((x) => x.id !== id));
      const st = await api.get("/diary/stats");
      setStats(st.data);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Could not delete.");
    }
  };

  const TrendIcon = stats?.trend === "improving" ? TrendingDown : stats?.trend === "worsening" ? TrendingUp : Minus;
  const trendText = { improving: "Pain looks to be improving", worsening: "Pain looks to be getting worse", steady: "Pain looks fairly steady", none: "Save 2+ checks to see a trend" }[stats?.trend || "none"];

  const timeline = (stats?.timeline || []).map((t, i) => ({ ...t, idx: i + 1, label: t.date?.slice(5) }));

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header + profile */}
      <div className="rounded-3xl p-6 sm:p-8 mb-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Statistics</p>
          <h1 className="font-display text-3xl font-bold mt-1">Welcome, {user?.name?.split(" ")[0] || "there"}</h1>
          <p className="opacity-90 mt-1">Your pain statistics and diary, all in one place.</p>
        </div>
        <button onClick={() => navigate("/diagnostics")} data-testid="dashboard-new-check-btn" className="inline-flex items-center justify-center gap-2 bg-white font-bold px-5 py-3 rounded-2xl shrink-0" style={{ color: "var(--pm-primary)" }}><Stethoscope className="w-5 h-5" /> New pain check</button>
      </div>

      {/* Profile strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Droplet, label: "Blood type", value: user?.blood_type || "—" },
          { icon: Activity, label: "Age", value: user?.age ?? "—" },
          { icon: Phone, label: "Emergency", value: user?.emergency_contact_phone || "—" },
          { icon: MapPin, label: "Address", value: user?.address ? user.address.split(",")[0] : "—" },
        ].map((c) => (
          <div key={c.label} className="pm-card p-4">
            <div className="flex items-center gap-2 text-pm-muted text-xs font-bold uppercase tracking-wide"><c.icon className="w-4 h-4" />{c.label}</div>
            <p className="font-display font-bold text-pm-ink mt-1 truncate">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Stats cards */}
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

      {/* Charts */}
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

      {/* Diary */}
      <div className="pm-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-pm-ink mb-4"><BookHeart className="w-5 h-5 text-pm-secondary" /> Pain diary</h2>
        {loading ? (
          <p className="text-pm-muted">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-pm-muted">No entries yet. Finish a pain check and tap “Save to diary”.</p>
            <button onClick={() => navigate("/diagnostics")} className="pm-btn mt-4 mx-auto">Start your first check</button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "var(--pm-surface-muted)" }} data-testid={`diary-entry-${e.id}`}>
                <span className="w-2.5 h-14 rounded-full" style={{ background: LEVEL_COLOR[e.level] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-pm-ink">{new Date(e.created_at).toLocaleDateString()}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: LEVEL_COLOR[e.level] }}>{LEVEL_TEXT[e.level]}</span>
                    <span className="text-xs font-bold text-pm-muted">{e.severity}/10</span>
                  </div>
                  <p className="text-sm text-pm-muted truncate mt-0.5">{(e.regions || []).join(", ") || "—"}{e.descriptors?.length ? ` · ${e.descriptors.join(", ")}` : ""}</p>
                </div>
                <button onClick={() => del(e.id)} data-testid={`delete-entry-${e.id}`} aria-label="Delete entry" className="w-10 h-10 grid place-items-center rounded-xl text-pm-muted hover:text-white transition-colors" style={{ border: "1px solid var(--pm-border)" }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--pm-red)")} onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyChart({ text }) {
  return <div className="h-[220px] grid place-items-center text-center text-pm-muted text-sm px-6">{text}</div>;
}
