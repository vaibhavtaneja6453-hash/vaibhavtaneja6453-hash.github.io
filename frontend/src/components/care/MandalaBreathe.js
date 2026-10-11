import React, { useEffect, useState } from "react";
import { Flower2, Wind } from "lucide-react";
import { MANDALAS } from "../../lib/careContent";

export function MandalaBreathe() {
  const [mandala, setMandala] = useState(0);
  const [phase, setPhase] = useState("Breathe in…");

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p === "Breathe in…" ? "Breathe out…" : "Breathe in…")), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pm-card p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-1"><Flower2 className="w-5 h-5 text-pm-secondary" /><h4 className="font-display font-bold text-pm-ink">Breathe with the mandala</h4></div>
      <p className="text-sm text-pm-muted mb-4">Watch the mandala grow and shrink. Breathe in as it expands, out as it shrinks.</p>
      <div className="rounded-3xl py-8 flex flex-col items-center" style={{ background: "radial-gradient(circle at 50% 40%, var(--pm-sel), var(--pm-surface-muted))" }} data-testid="mandala-breathe-section">
        <img src={MANDALAS[mandala]} alt="Calming mandala" loading="lazy" decoding="async" className="mandala-breathe w-56 h-56 sm:w-64 sm:h-64 rounded-full object-cover shadow-xl" />
        <div className="mt-6 flex items-center gap-2 text-pm-ink font-display text-lg font-bold">
          <Wind className="w-5 h-5 text-pm-secondary" /> {phase}
        </div>
        <div className="flex gap-2 mt-5">
          {MANDALAS.map((m, i) => (
            <button key={`mandala-${m}`} onClick={() => setMandala(i)} data-testid={`mandala-thumb-${i}`} aria-label={`Mandala ${i + 1}`}
              className="w-12 h-12 rounded-full overflow-hidden border-2 transition-all" style={{ borderColor: mandala === i ? "var(--pm-secondary)" : "transparent", opacity: mandala === i ? 1 : 0.6 }}>
              <img src={m} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
