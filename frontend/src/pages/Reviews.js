import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api, formatApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Star, Plus, X, ShieldCheck, Quote } from "lucide-react";

const WELLNESS = "https://images.unsplash.com/photo-1570506097811-83004c7e4691?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHx3ZWxsbmVzcyUyMGNhbG0lMjBuYXR1cmUlMjB0aGVyYXB5fGVufDB8fHx8MTc5MTU1OTc4N3ww&ixlib=rb-4.1.0&q=85&w=1200";

function Stars({ value, size = 16, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type={onChange ? "button" : undefined} disabled={!onChange} onClick={onChange ? () => onChange(n) : undefined} aria-label={`${n} star`} data-testid={onChange ? `review-star-${n}` : undefined}>
          <Star style={{ width: size, height: size, fill: n <= value ? "var(--pm-yellow)" : "transparent", color: "var(--pm-yellow)" }} />
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", review: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try { const { data } = await api.get("/reviews"); setReviews(data); } catch { toast.error("Could not load reviews."); }
  };
  useEffect(() => { load(); }, []);

  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));

  const openModal = () => {
    if (!user) { toast.info("Please log in to share your review."); navigate("/login"); return; }
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/reviews", form);
      setReviews((r) => [data, ...r]);
      setOpen(false);
      setForm({ rating: 5, title: "", review: "" });
      toast.success("Thank you for your review!");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* header */}
      <div className="rounded-[28px] overflow-hidden relative mb-8">
        <img src={WELLNESS} alt="Calm wellness" className="w-full h-56 sm:h-64 object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(11,92,125,0.92), rgba(21,154,122,0.72))" }} />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 text-white">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Loved by patients & clinicians</h1>
          <p className="mt-2 max-w-lg opacity-95">Real stories from people who found a clearer way to describe their pain.</p>
          <div className="flex items-center gap-3 mt-4">
            <Stars value={Math.round(avg)} size={22} />
            <span className="font-display text-2xl font-bold">{avg}</span>
            <span className="opacity-90">· {reviews.length} reviews</span>
          </div>
        </div>
      </div>

      {/* distribution + CTA */}
      <div className="grid md:grid-cols-3 gap-5 mb-8 items-start">
        <div className="pm-card p-6 md:col-span-2">
          <h2 className="font-display text-lg font-bold text-pm-ink mb-3">Rating breakdown</h2>
          {dist.map((d) => (
            <div key={d.n} className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-pm-muted w-6">{d.n}★</span>
              <div className="flex-1 h-2.5 rounded-full" style={{ background: "var(--pm-surface-muted)" }}>
                <div className="h-full rounded-full" style={{ width: `${reviews.length ? (d.c / reviews.length) * 100 : 0}%`, background: "var(--pm-yellow)" }} />
              </div>
              <span className="text-sm text-pm-muted w-6 text-right">{d.c}</span>
            </div>
          ))}
        </div>
        <div className="pm-card p-6 text-center">
          <ShieldCheck className="w-8 h-8 mx-auto" style={{ color: "var(--pm-secondary)" }} />
          <h3 className="font-display font-bold text-pm-ink mt-2">Share your experience</h3>
          <p className="text-sm text-pm-muted mt-1">Help others feel confident about describing their pain.</p>
          <button onClick={openModal} data-testid="open-add-review-modal-btn" className="pm-btn w-full mt-4"><Plus className="w-5 h-5" /> Add your review</button>
        </div>
      </div>

      {/* grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            className="pm-card p-6 flex flex-col" data-testid={`review-card-${r.id}`}>
            <Quote className="w-7 h-7 mb-2" style={{ color: "var(--pm-sel)" }} />
            <Stars value={r.rating} />
            <h3 className="font-display font-bold text-pm-ink mt-3">{r.title}</h3>
            <p className="text-sm text-pm-muted mt-2 flex-1 leading-relaxed">{r.review}</p>
            <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: "1px solid var(--pm-border)" }}>
              {r.picture ? (
                <img src={r.picture} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="w-10 h-10 rounded-full grid place-items-center text-white font-bold" style={{ background: "var(--pm-primary)" }}>{(r.name || "?")[0]}</span>
              )}
              <div className="min-w-0">
                <p className="font-bold text-pm-ink text-sm flex items-center gap-1 truncate">{r.name}{r.verified && <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--pm-secondary)" }} />}</p>
                <p className="text-xs text-pm-muted truncate">{r.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md pm-card p-6" style={{ background: "var(--pm-surface)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-pm-ink">Write a review</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-full text-pm-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="pm-label">Your rating</label>
                <Stars value={form.rating} size={28} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} />
              </div>
              <div>
                <label className="pm-label">Title</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} data-testid="review-title-input" className="pm-input" placeholder="A short headline" />
              </div>
              <div>
                <label className="pm-label">Your review</label>
                <textarea required rows={4} value={form.review} onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))} data-testid="review-text-input" className="pm-input resize-none" placeholder="How did Pain Map help you?" />
              </div>
              <button type="submit" disabled={submitting} data-testid="submit-customer-review-btn" className="pm-btn w-full">{submitting ? "Posting…" : "Post review"}</button>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
}
