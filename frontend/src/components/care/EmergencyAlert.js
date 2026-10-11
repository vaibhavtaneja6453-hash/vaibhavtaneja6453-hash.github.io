import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PhoneCall, MessageCircle, Siren, Send } from "lucide-react";
import { RED_WAIT_TIPS } from "../../lib/careContent";

export function EmergencyAlert({ contacts, alertMsg }) {
  const waUrl = (c) => `https://wa.me/${c.phone}?text=${encodeURIComponent(alertMsg)}`;
  const smsUrl = (c) => `sms:${c.phone}?body=${encodeURIComponent(alertMsg)}`;

  return (
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
            <div key={`contact-${c.phone || c.name || i}`} className="p-3 rounded-xl" style={{ background: "var(--pm-surface-muted)" }} data-testid={`emergency-contact-${i}`}>
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
          {RED_WAIT_TIPS.map((t) => <li key={t} className="text-sm text-pm-muted">• {t}</li>)}
        </ul>
      </div>
    </motion.div>
  );
}
