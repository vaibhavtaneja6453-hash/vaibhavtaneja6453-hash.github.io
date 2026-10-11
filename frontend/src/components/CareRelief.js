import React from "react";
import { REGION_CONTENT, regionKeys } from "../lib/careContent";
import { Leaf, HeartPulse, Stethoscope } from "lucide-react";
import { buildMessage, dedupe, emergencyContacts, CALMING_REGIONS } from "./care/emergency";
import { EmergencyAlert } from "./care/EmergencyAlert";
import { ReliefVideos } from "./care/ReliefVideos";
import { MandalaBreathe } from "./care/MandalaBreathe";

export default function CareRelief({ level, user, s }) {
  const keys = regionKeys(s.regions);
  const content = keys.map((k) => REGION_CONTENT[k] || REGION_CONTENT.general);
  const assessList = [...new Set(content.map((c) => c.assess))];
  const remedies = [...new Set(content.flatMap((c) => c.remedies))].slice(0, 6);
  const videos = dedupe(content.flatMap((c) => c.videos)).slice(0, 4);
  // Breathing/mandala only makes sense for torso, head, back, pelvis — not limbs (biceps, knee, etc.).
  const showMandala = keys.some((k) => CALMING_REGIONS.includes(k));
  const isRed = level === "R";

  return (
    <div className="space-y-4" data-testid="care-relief-section">
      {isRed && <EmergencyAlert contacts={emergencyContacts(user)} alertMsg={buildMessage(user, s)} />}

      {/* Self-care header */}
      <div className="pm-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <HeartPulse className="w-5 h-5 text-pm-secondary" />
          <h3 className="font-display text-xl font-bold text-pm-ink">{isRed ? "Stay calm while help is on the way" : "Care & relief you can try now"}</h3>
        </div>
        <p className="text-sm text-pm-muted">
          {isRed
            ? "These calming tools can help you cope in the moment — they do not replace emergency care."
            : "Gentle, safe things that often ease this kind of pain while you arrange a doctor visit. Stop anything that makes the pain worse."}
        </p>

        <div className="mt-4 p-3.5 rounded-xl" style={{ background: "var(--pm-sel)" }} data-testid="care-assessment">
          <div className="flex items-center gap-1.5 mb-1"><Stethoscope className="w-4 h-4 text-pm-secondary" /><p className="font-bold text-pm-ink text-sm">Assessing your pain</p></div>
          {assessList.map((a) => <p key={a} className="text-sm text-pm-ink">• {a}</p>)}
        </div>

        {/* Home remedies */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2"><Leaf className="w-4 h-4 text-pm-secondary" /><h4 className="font-display font-bold text-pm-ink">Home remedies for this area</h4></div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {remedies.map((r, i) => (
              <div key={`remedy-${r}`} className="flex gap-2.5 p-3 rounded-xl text-sm text-pm-ink" style={{ background: "var(--pm-surface-muted)" }} data-testid={`home-remedy-${i}`}>
                <span className="mt-0.5 text-pm-secondary">✓</span>{r}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReliefVideos videos={videos} />

      {/* Mandala breathing — only for torso/head/back/pelvis, not limbs */}
      {showMandala && <MandalaBreathe />}
    </div>
  );
}
