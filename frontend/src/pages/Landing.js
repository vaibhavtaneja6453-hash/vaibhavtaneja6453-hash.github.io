import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { HeartPulse, Stethoscope, ShieldCheck, LineChart, MapPin, ArrowRight, MessageCircle, Activity } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwyfHxwYXRpZW50JTIwZG9jdG9yJTIwc21pbGluZ3xlbnwwfHx8fDE3OTE1NTk3ODd8MA&ixlib=rb-4.1.0&q=85&w=1200";

const features = [
  { icon: MapPin, title: "Tap where it hurts", text: "An interactive front & back body map turns vague pain into precise locations." },
  { icon: Activity, title: "Smart triage", text: "Cautious Green / Yellow / Red safety signals based on your answers." },
  { icon: LineChart, title: "Diary & statistics", text: "Track severity over time and spot the regions that trouble you most." },
  { icon: MessageCircle, title: "AI help assistant", text: "A friendly guide for using the app and understanding pain terms." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const startDiagnostics = () => navigate(user ? "/diagnostics" : "/login");

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="grid lg:grid-cols-2 gap-10 items-center pt-10 md:pt-16 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-pm-secondary mb-4">
            <HeartPulse className="w-4 h-4" /> Non-diagnostic pain companion
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-pm-ink">
            Describe your pain.<br />
            <span style={{ color: "var(--pm-secondary)" }}>Understand</span> your symptoms.
          </h1>
          <p className="mt-5 text-lg text-pm-muted max-w-xl leading-relaxed">
            Pain Map helps you show where it hurts, describe how it feels, and leave with a clear summary to share with your doctor — all in a few calm steps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={startDiagnostics} data-testid="diagnostics-start-button" className="pm-btn text-base">
              <Stethoscope className="w-5 h-5" /> Start diagnostics <ArrowRight className="w-5 h-5" />
            </button>
            {!user && (
              <button onClick={() => navigate("/register")} data-testid="landing-register-btn" className="pm-btn-alt text-base">
                Create an account
              </button>
            )}
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-pm-muted">
            <ShieldCheck className="w-4 h-4 text-pm-secondary" /> Private by design · your entries stay with your account.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative">
          <div className="absolute -inset-4 rounded-[32px] blur-2xl opacity-30" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }} />
          <img src={HERO} alt="Doctor consulting a patient" className="relative rounded-[28px] shadow-2xl object-cover w-full h-[340px] sm:h-[420px]" />
          <div className="absolute -bottom-5 -left-3 sm:left-6 pm-card px-5 py-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-full grid place-items-center" style={{ background: "var(--pm-sel)" }}>
              <Activity className="w-5 h-5" style={{ color: "var(--pm-secondary)" }} />
            </span>
            <div>
              <p className="font-display font-bold text-pm-ink leading-tight">Guided triage</p>
              <p className="text-xs text-pm-muted">Green · Yellow · Red</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-10">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-pm-ink text-center">A calmer way through pain</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="pm-card p-6"
            >
              <span className="w-11 h-11 rounded-2xl grid place-items-center mb-4" style={{ background: "var(--pm-sel)" }}>
                <f.icon className="w-6 h-6" style={{ color: "var(--pm-primary)" }} />
              </span>
              <h3 className="font-display text-lg font-bold text-pm-ink">{f.title}</h3>
              <p className="text-sm text-pm-muted mt-2 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="my-10 rounded-[28px] p-8 sm:p-12 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }}>
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Ready to map your pain?</h2>
          <p className="mt-3 opacity-95">Take two calm minutes. Get a clear, shareable summary and a diary that remembers for you.</p>
          <button onClick={startDiagnostics} className="mt-6 inline-flex items-center gap-2 bg-white text-pm-primary font-bold px-6 py-3 rounded-2xl" data-testid="cta-start-button" style={{ color: "var(--pm-primary)" }}>
            Begin now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <p className="text-center text-sm text-pm-muted max-w-2xl mx-auto pb-10">
        Pain Map is a non-diagnostic tool for pain awareness and communication. It is not a substitute for medical assessment. In an emergency call your local emergency number (112 in India).
      </p>
    </main>
  );
}
