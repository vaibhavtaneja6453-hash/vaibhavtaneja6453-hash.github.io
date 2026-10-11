import React from "react";
import { motion } from "framer-motion";
import { Trash2, BookHeart } from "lucide-react";

const LEVEL_COLOR = { G: "var(--pm-green)", Y: "var(--pm-yellow)", R: "var(--pm-red)" };
const LEVEL_TEXT = { G: "Green", Y: "Yellow", R: "Red" };

export function DiaryList({ entries, loading, onDelete, onStart }) {
  return (
    <div className="pm-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-pm-ink mb-4"><BookHeart className="w-5 h-5 text-pm-secondary" /> Pain diary</h2>
      {loading ? (
        <p className="text-pm-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-pm-muted">No entries yet. Finish a pain check and tap “Save to diary”.</p>
          <button onClick={onStart} className="pm-btn mt-4 mx-auto">Start your first check</button>
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
              <button onClick={() => onDelete(e.id)} data-testid={`delete-entry-${e.id}`} aria-label="Delete entry" className="w-10 h-10 grid place-items-center rounded-xl text-pm-muted hover:text-white transition-colors" style={{ border: "1px solid var(--pm-border)" }}
                onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--pm-red)")} onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}>
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
