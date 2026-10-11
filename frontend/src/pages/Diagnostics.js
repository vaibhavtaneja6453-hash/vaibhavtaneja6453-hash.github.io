import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import BodyMap from "../components/BodyMap";
import CareRelief from "../components/CareRelief";
import { useAuth } from "../context/AuthContext";
import {
  DESC, ONSET, DUR, PAT, TRIG, REL, AQ, groups, axAll, analyse, summary, LEVEL_FULL,
} from "../lib/painEngine";
import { ChevronLeft, ChevronRight, Mic, Copy, Save, RotateCcw, Stethoscope, Activity } from "lucide-react";

const STEPS = ["Where", "Describe", "Questions", "Result"];

const emptyState = {
  age: "", sex: "Prefer not to say", view: "front", regions: [],
  desc: [], text: "", sev: 5, onset: "", dur: "", pat: "", trig: [], rel: [],
};

export default function Diagnostics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [s, setS] = useState(() => ({ ...emptyState, age: user?.age ?? "" }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (patch) => setS((prev) => ({ ...prev, ...patch }));

  const toggleRegion = (name) =>
    setS((prev) => ({
      ...prev,
      regions: prev.regions.includes(name) ? prev.regions.filter((r) => r !== name) : [...prev.regions, name],
    }));

  const pickMulti = (key, val) =>
    setS((prev) => {
      const arr = prev[key] || [];
      const neg = val.startsWith("None") || val.startsWith("I don");
      if (arr.includes(val)) return { ...prev, [key]: arr.filter((x) => x !== val) };
      if (neg) return { ...prev, [key]: [val] };
      return { ...prev, [key]: [...arr.filter((x) => !x.startsWith("None") && !x.startsWith("I don")), val] };
    });

  const pickSingle = (key, val) => update({ [key]: s[key] === val ? "" : val });

  const result = useMemo(() => (step === 3 ? analyse(s) : null), [step, s]);

  const canNext = step === 0 ? s.regions.length > 0 : true;

  const go = (n) => { setStep(n); window.scrollTo(0, 0); };

  const mic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input is not supported in this browser."); return; }
    const r = new SR();
    r.lang = "en-IN";
    r.onresult = (e) => update({ text: (s.text + " " + e.results[0][0].transcript).trim() });
    r.onerror = () => toast.error("Voice failed — please type instead.");
    r.start();
    toast("Listening…");
  };

  const saveEntry = async () => {
    setSaving(true);
    const r = analyse(s);
    try {
      await api.post("/diary", {
        level: r.lvl, severity: s.sev, regions: s.regions, descriptors: s.desc, text: s.text,
        onset: s.onset, duration: s.dur, pattern: s.pat, triggers: s.trig, related: s.rel,
        area_specific: axAll(s), summary: summary(s, r), next_step: r.next,
      });
      setSaved(true);
      toast.success("Saved to your dashboard diary.");
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary(s, analyse(s)));
      toast.success("Summary copied.");
    } catch {
      toast.error("Copy blocked by the browser.");
    }
  };

  const restart = () => { setS({ ...emptyState, age: user?.age ?? "" }); setSaved(false); setStep(0); window.scrollTo(0, 0); };

  const Chips = ({ list, value, multi, testid }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {list.map((v) => {
        const on = multi ? value.includes(v) : value === v;
        return (
          <button key={v} type="button" onClick={() => (multi ? pickMulti(testid, v) : pickSingle(testid, v))} className={`pm-chip ${on ? "on" : ""}`}>
            {on && "✓ "}{v}
          </button>
        );
      })}
    </div>
  );

  const activeGroups = groups(s.regions);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Stethoscope className="w-5 h-5 text-pm-secondary" />
        <h1 className="font-display text-2xl font-bold text-pm-ink">Pain diagnostics</h1>
      </div>

      {/* progress */}
      <div className="flex justify-between text-xs font-bold mt-4 mb-1.5 px-1">
        {STEPS.map((label, i) => (
          <span key={label} style={{ color: i <= step ? "var(--pm-secondary)" : "var(--pm-muted)" }}>{label}</span>
        ))}
      </div>
      <div className="h-2 rounded-full mb-6" style={{ background: "var(--pm-border)" }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(step + 1) * 25}%`, background: "linear-gradient(90deg,var(--pm-primary),var(--pm-secondary))" }} />
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        {step === 0 && (
          <div className="space-y-4">
            <div className="pm-card p-6">
              <h2 className="font-display text-xl font-bold text-pm-ink mb-3">Tap where it hurts</h2>
              <div className="flex gap-2 mb-2">
                <button onClick={() => update({ view: "front" })} data-testid="body-map-view-front-btn" className={`pm-chip ${s.view === "front" ? "on" : ""}`}>Front</button>
                <button onClick={() => update({ view: "back" })} data-testid="body-map-view-back-btn" className={`pm-chip ${s.view === "back" ? "on" : ""}`}>Back</button>
              </div>
              <div className="rounded-2xl p-3" style={{ background: "var(--pm-surface-muted)" }}>
                <BodyMap view={s.view} regions={s.regions} onToggle={toggleRegion} />
              </div>
            </div>
            <div className="pm-card p-6">
              <h3 className="font-display font-bold text-pm-ink mb-2">Selected areas</h3>
              {s.regions.length ? (
                <div className="flex flex-wrap gap-2">
                  {s.regions.map((n) => (
                    <button key={n} onClick={() => toggleRegion(n)} className="pm-chip on" data-testid={`selected-region-${n}`}>{n} ✕</button>
                  ))}
                </div>
              ) : <p className="text-pm-muted">None yet — tap a body part above.</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="pm-card p-6">
            <h2 className="font-display text-xl font-bold text-pm-ink mb-2">What does it feel like?</h2>
            <Chips list={DESC} value={s.desc} multi testid="desc" />
            <label className="pm-label mt-5">Or say it in your own words</label>
            <textarea value={s.text} onChange={(e) => update({ text: e.target.value })} rows={3} data-testid="diag-text-input" className="pm-input resize-none" placeholder="Describe your pain…" />
            <button onClick={mic} data-testid="pain-voice-dictation-btn" className="pm-chip mt-3"><Mic className="w-4 h-4" /> Speak instead</button>
          </div>
        )}

        {step === 2 && (
          <div className="pm-card p-6 space-y-5">
            <h2 className="font-display text-xl font-bold text-pm-ink">A few quick questions</h2>
            <div>
              <label className="pm-label">How bad is it right now? (0 = none, 10 = worst)</label>
              <div className="font-display text-5xl font-bold text-center" style={{ color: "var(--pm-primary)" }}>{s.sev}</div>
              <input type="range" min={0} max={10} value={s.sev} onChange={(e) => update({ sev: +e.target.value })} data-testid="pain-severity-slider" className="w-full h-10" style={{ accentColor: "var(--pm-secondary)" }} />
            </div>
            <div><label className="pm-label">How did it start?</label><Chips list={ONSET} value={s.onset} testid="onset" /></div>
            <div><label className="pm-label">How long has it lasted?</label><Chips list={DUR} value={s.dur} testid="dur" /></div>
            <div><label className="pm-label">Pattern</label><Chips list={PAT} value={s.pat} testid="pat" /></div>
            <div><label className="pm-label">What triggers or changes it?</label><Chips list={TRIG} value={s.trig} multi testid="trig" /></div>
            <div><label className="pm-label">Anything else happening?</label><Chips list={REL} value={s.rel} multi testid="rel" /></div>
            {activeGroups.length > 0 && (
              <div className="pt-2">
                <h3 className="font-display font-bold text-pm-ink mb-1">Questions for your pain area</h3>
                {activeGroups.map((k) => (
                  <div key={k} className="mt-3">
                    <label className="pm-label">{AQ[k][0]}</label>
                    <Chips list={AQ[k][1]} value={s["ax_" + k] || []} multi testid={"ax_" + k} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && result && (
          <div className="space-y-4">
            <div className="rounded-3xl p-6 text-white shadow-lg" style={{ background: { G: "linear-gradient(135deg,#0f8a6a,#27b58c)", Y: "linear-gradient(135deg,#a87800,#d49a00)", R: "linear-gradient(135deg,#c0283a,#e5535f)" }[result.lvl] }} data-testid="diag-result-banner" data-level={result.lvl}>
              <div className="flex items-center gap-2 mb-2"><Activity className="w-6 h-6" /><h2 className="font-display text-2xl font-bold">{LEVEL_FULL[result.lvl]}</h2></div>
              {result.why.map((w, i) => <p key={`why-${w}`} className="text-[15px] opacity-95 mt-1">• {w}</p>)}
            </div>
            {result.lvl !== "G" && <CareRelief level={result.lvl} user={user} s={s} />}
            <div className="pm-card p-6">
              <h3 className="font-display text-lg font-bold text-pm-ink">What this could mean</h3>
              <p className="text-sm text-pm-muted">Possible patterns only, not a diagnosis.</p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-pm-ink">{result.pat.map((p) => <li key={`pat-${p}`}>{p}</li>)}</ul>
              <h3 className="font-display text-lg font-bold text-pm-ink mt-5">Next step</h3>
              <p className="text-pm-ink mt-1">{result.next}</p>
            </div>
            <div className="pm-card p-6">
              <h3 className="font-display text-lg font-bold text-pm-ink mb-2">Summary for your doctor</h3>
              <pre className="whitespace-pre-wrap text-sm p-4 rounded-xl" style={{ background: "var(--pm-surface-muted)", border: "1px dashed var(--pm-primary)", fontFamily: "inherit" }}>{summary(s, result)}</pre>
              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={copySummary} data-testid="copy-summary-btn" className="pm-btn"><Copy className="w-5 h-5" /> Copy / share</button>
                <button onClick={saveEntry} disabled={saving || saved} data-testid="save-diary-entry-button" className="pm-btn-alt"><Save className="w-5 h-5" /> {saved ? "Saved" : saving ? "Saving…" : "Save to diary"}</button>
                <button onClick={() => navigate("/dashboard")} data-testid="go-dashboard-btn" className="pm-btn-alt">View statistics</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* nav buttons */}
      <div className="flex gap-3 mt-6">
        {step > 0 && step < 3 && (
          <button onClick={() => go(step - 1)} data-testid="diag-back-btn" className="pm-btn-alt"><ChevronLeft className="w-5 h-5" /> Back</button>
        )}
        {step < 3 && (
          <button onClick={() => go(step + 1)} disabled={!canNext} data-testid="diag-next-btn" className="pm-btn ml-auto">
            {step === 2 ? "See my summary" : "Next"} <ChevronRight className="w-5 h-5" />
          </button>
        )}
        {step === 3 && (
          <button onClick={restart} data-testid="diag-restart-btn" className="pm-btn-alt ml-auto"><RotateCcw className="w-5 h-5" /> Start over</button>
        )}
      </div>

      <p className="text-center text-xs text-pm-muted mt-8">Non-diagnostic. In an emergency call your local emergency number (112 in India).</p>
    </main>
  );
}
