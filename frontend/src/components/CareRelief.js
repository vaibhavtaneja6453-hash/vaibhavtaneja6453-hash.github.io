import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { REGION_CONTENT, regionKeys, MANDALAS, RED_WAIT_TIPS } from "../lib/careContent";
import { Leaf, PlayCircle, Flower2, PhoneCall, MessageCircle, Siren, HeartPulse, Wind, Send, Stethoscope } from "lucide-react";

function normPhone(raw) {
  let d = (raw || "").replace(/[^0-9]/g, "");
  if (d.startsWith("0")) d = d.replace(/^0+/, "");
  if (d.length === 10) d = "91" + d;
  return d.length >= 11 ? d : "";
}

function buildMessage(user, s) {
  const name = user?.name || "Someone I know";
  const regions = (s.regions || []).join(", ") || "unspecified area";
  const symptoms = (s.rel || []).filter((x) => !x.startsWith("None")).join(", ");
  return (
    `🚨 Pain Map emergency alert: ${name} may need urgent help right now. ` +
    `A serious (RED) situation was flagged — pain in ${regions}, severity ${s.sev}/10` +
    (symptoms ? `, symptoms: ${symptoms}` : "") +
    `. Please reach them or call emergency services immediately. (Automated alert — not a medical diagnosis.)`
  );
}

function dedupe(videos) {
  const seen = new Set();
  return videos.filter((v) => (seen.has(v.id) ? false : seen.add(v.id)));
}

export default function CareRelief({ level, groups, user, s }) {
  const keys = regionKeys(s.regions);
  const content = keys.map((k) => REGION_CONTENT[k] || REGION_CONTENT.general);
  const assessList = [...new Set(content.map((c) => c.assess))];
  const remedies = [...new Set(content.flatMap((c) => c.remedies))].slice(0, 6);
  const videos = dedupe(content.flatMap((c) => c.videos)).slice(0, 4);
  const [active, setActive] = useState(null);
  const [mandala, setMandala] = useState(0);
  const [phase, setPhase] = useState("Breathe in…");

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p === "Breathe in…" ? "Breathe out…" : "Breathe in…")), 5500);
    return () => clearInterval(id);
  }, []);

  const isRed = level === "R";
  const alertMsg = buildMessage(user, s);
  const contacts = [
    { name: user?.emergency_contact_name, relation: user?.emergency_contact_relation, phone: normPhone(user?.emergency_contact_phone) },
    { name: user?.emergency_contact2_name, relation: user?.emergency_contact2_relation, phone: normPhone(user?.emergency_contact2_phone) },
  ].filter((c) => c.phone);
  const waUrl = (c) => `https://wa.me/${c.phone}?text=${encodeURIComponent(alertMsg)}`;
  const smsUrl = (c) => `sms:${c.phone}?body=${encodeURIComponent(alertMsg)}`;

  return (
    <div className="space-y-4" data-testid="care-relief-section">
      {/* Emergency alert — RED only */}
      {isRed && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-6 border-2" style={{ background: "var(--pm-surface)", borderColor: "var(--pm-red)" }} data-testid="emergency-alert-card">
          <div className="flex items-center gap-2 mb-2">
            <Siren className="w-6 h-6" style={{ color: "var(--pm-red)" }} />
            <h3 className="font-display text-xl font-bold" style={{ color: "var(--pm-red)" }}>Get help now</h3>
          </div>
          <p className="text-pm-ink">This looks serious. Contact emergency services and alert someone who can help you right away.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a href="tel:112" data-testid="emergency-call-btn" className="pm-btn" style={{ background: "var(--pm-red)", boxShadow: "none" }}>
              <PhoneCall className="w-5 h-5" /> Call emergency (112)
            </a>
            {contacts.length === 0 && (
              <Link to="/profile" data-testid="emergency-add-contact-link" className="pm-btn-alt">
                <MessageCircle className="w-5 h-5" /> Add an emergency contact
              </Link>
            )}
            {contacts.length >= 2 && (
              <button type="button" onClick={() => contacts.forEach((c) => window.open(waUrl(c), "_blank"))} data-testid="emergency-whatsapp-both-btn" className="pm-btn-alt" style={{ borderColor: "#25D366", color: "#1c9e4f" }}>
                <MessageCircle className="w-5 h-5" /> Alert both on WhatsApp
              </button>
            )}
          </div>
          {contacts.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {contacts.map((c, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: "var(--pm-surface-muted)" }} data-testid={`emergency-contact-${i}`}>
                  <p className="font-bold text-pm-ink text-sm">{c.name || "Emergency contact"} <span className="text-pm-muted font-normal">· {c.relation || "contact"}</span></p>
                  <div className="flex gap-2 mt-2">
                    <a href={waUrl(c)} target="_blank" rel="noopener noreferrer" data-testid={`emergency-whatsapp-btn-${i}`} className="pm-btn-alt flex-1 !min-h-[42px] !py-2" style={{ borderColor: "#25D366", color: "#1c9e4f" }}>
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                    <a href={smsUrl(c)} data-testid={`emergency-sms-btn-${i}`} className="pm-btn-alt flex-1 !min-h-[42px] !py-2">
                      <Send className="w-4 h-4" /> SMS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--pm-border)" }}>
            <p className="text-sm font-bold text-pm-ink mb-1">While you wait for help</p>
            <ul className="space-y-1">
              {RED_WAIT_TIPS.map((t, i) => <li key={i} className="text-sm text-pm-muted">• {t}</li>)}
            </ul>
          </div>
        </motion.div>
      )}

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
          {assessList.map((a, i) => <p key={i} className="text-sm text-pm-ink">• {a}</p>)}
        </div>

        {/* Home remedies */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2"><Leaf className="w-4 h-4 text-pm-secondary" /><h4 className="font-display font-bold text-pm-ink">Home remedies for this area</h4></div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {remedies.map((r, i) => (
              <div key={i} className="flex gap-2.5 p-3 rounded-xl text-sm text-pm-ink" style={{ background: "var(--pm-surface-muted)" }} data-testid={`home-remedy-${i}`}>
                <span className="mt-0.5 text-pm-secondary">✓</span>{r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Relief videos */}
      <div className="pm-card p-6">
        <div className="flex items-center gap-2 mb-3"><PlayCircle className="w-5 h-5 text-pm-secondary" /><h4 className="font-display font-bold text-pm-ink">Relief & relaxation videos</h4></div>
        <div className="grid sm:grid-cols-2 gap-4">
          {videos.map((v) => (
            <div key={v.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--pm-surface-muted)", border: "1px solid var(--pm-border)" }} data-testid={`relief-video-${v.id}`}>
              <div className="relative aspect-video bg-black">
                {active === v.id ? (
                  <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`} title={v.title}
                    allow="accelerated-sensors; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : (
                  <button onClick={() => setActive(v.id)} className="group w-full h-full" data-testid={`relief-video-play-${v.id}`} aria-label={`Play ${v.title}`}>
                    <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute inset-0 grid place-items-center">
                      <PlayCircle className="w-14 h-14 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                    </span>
                  </button>
                )}
              </div>
              <p className="px-3 py-2.5 text-sm font-semibold text-pm-ink">{v.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mandala breathing */}
      <div className="pm-card p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-1"><Flower2 className="w-5 h-5 text-pm-secondary" /><h4 className="font-display font-bold text-pm-ink">Breathe with the mandala</h4></div>
        <p className="text-sm text-pm-muted mb-4">Watch the mandala grow and shrink. Breathe in as it expands, out as it shrinks.</p>
        <div className="rounded-3xl py-8 flex flex-col items-center" style={{ background: "radial-gradient(circle at 50% 40%, var(--pm-sel), var(--pm-surface-muted))" }} data-testid="mandala-breathe-section">
          <img src={MANDALAS[mandala]} alt="Calming mandala" className="mandala-breathe w-56 h-56 sm:w-64 sm:h-64 rounded-full object-cover shadow-xl" />
          <div className="mt-6 flex items-center gap-2 text-pm-ink font-display text-lg font-bold">
            <Wind className="w-5 h-5 text-pm-secondary" /> {phase}
          </div>
          <div className="flex gap-2 mt-5">
            {MANDALAS.map((m, i) => (
              <button key={i} onClick={() => setMandala(i)} data-testid={`mandala-thumb-${i}`} aria-label={`Mandala ${i + 1}`}
                className="w-12 h-12 rounded-full overflow-hidden border-2 transition-all" style={{ borderColor: mandala === i ? "var(--pm-secondary)" : "transparent", opacity: mandala === i ? 1 : 0.6 }}>
                <img src={m} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
