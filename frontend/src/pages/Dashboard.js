import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Stethoscope } from "lucide-react";
import { ProfileStrip } from "../components/dashboard/ProfileStrip";
import { StatCards } from "../components/dashboard/StatCards";
import { DiaryCharts } from "../components/dashboard/DiaryCharts";
import { DiaryList } from "../components/dashboard/DiaryList";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [d, st] = await Promise.all([api.get("/diary"), api.get("/diary/stats")]);
      setEntries(d.data);
      setStats(st.data);
    } catch {
      toast.error("Could not load your diary.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

      <ProfileStrip user={user} />
      <StatCards stats={stats} />
      <DiaryCharts timeline={timeline} stats={stats} />
      <DiaryList entries={entries} loading={loading} onDelete={del} onStart={() => navigate("/diagnostics")} />
    </main>
  );
}
