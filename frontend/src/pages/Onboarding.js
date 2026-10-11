import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";
import { BLOOD_TYPES, RELATIONS } from "../lib/painEngine";
import { HeartPulse, ArrowRight, ShieldCheck, User, Phone, MapPin, Droplet, Users } from "lucide-react";

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: user?.phone || "", address: user?.address || "", age: user?.age ?? "",
    blood_type: user?.blood_type || "O+", conditions: user?.conditions || "",
    emergency_contact_name: user?.emergency_contact_name || "",
    emergency_contact_phone: user?.emergency_contact_phone || "",
    emergency_contact_relation: user?.emergency_contact_relation || "Spouse",
    emergency_contact2_name: user?.emergency_contact2_name || "",
    emergency_contact2_phone: user?.emergency_contact2_phone || "",
    emergency_contact2_relation: user?.emergency_contact2_relation || "Friend",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.phone || !form.address || !form.age || !form.emergency_contact_name || !form.emergency_contact_phone) {
      setError("Please fill your phone, address, age and your first emergency contact.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ ...form, age: parseInt(form.age, 10) || null });
      toast.success("All set — welcome to Pain Map!");
      navigate("/");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const step = form.phone && form.address && form.age ? (form.emergency_contact_name && form.emergency_contact_phone ? 100 : 60) : 25;

  return (
    <main className="min-h-screen grid lg:grid-cols-[0.9fr_1.1fr]">
      {/* Left panel */}
      <aside className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden" style={{ background: "linear-gradient(150deg,var(--pm-primary),var(--pm-secondary))" }}>
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-full bg-white/20 grid place-items-center"><HeartPulse className="w-5 h-5" /></span>
          <span className="font-display text-2xl font-bold">Pain Map</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">Just a few details<br />to keep you safe.</h1>
          <p className="mt-4 opacity-90 max-w-sm leading-relaxed">We'll remember your blood type, conditions and emergency contacts — so in a serious moment, help is one tap away.</p>
          <ul className="mt-8 space-y-3">
            {["Share precise pain summaries with your doctor", "Alert your loved ones instantly in an emergency", "You only fill this once"].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-white/20 grid place-items-center shrink-0"><ShieldCheck className="w-3.5 h-3.5" /></span><span className="opacity-95">{t}</span></li>
            ))}
          </ul>
        </div>
        <p className="text-sm opacity-70">Private &amp; secure · non-diagnostic</p>
      </aside>

      {/* Form */}
      <div className="flex items-start justify-center p-5 sm:p-10 overflow-auto">
        <div className="w-full max-w-xl py-6">
          <div className="lg:hidden flex items-center gap-2.5 mb-5">
            <span className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }}><HeartPulse className="w-5 h-5 text-white" /></span>
            <span className="font-display text-xl font-bold text-pm-ink">Pain Map</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-pm-ink">Welcome, {user?.name?.split(" ")[0] || "there"}!</h2>
          <p className="text-pm-muted mt-1">Complete your profile to enter Pain Map.</p>

          <div className="h-1.5 rounded-full mt-4 mb-7" style={{ background: "var(--pm-border)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${step}%`, background: "linear-gradient(90deg,var(--pm-primary),var(--pm-secondary))" }} />
          </div>

          <form onSubmit={submit} className="space-y-7">
            <section>
              <h3 className="flex items-center gap-2 font-display font-bold text-pm-ink mb-3"><User className="w-4 h-4 text-pm-secondary" /> Your details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <OnbInput label="Phone number" value={form.phone} onChange={set("phone")} type="tel" placeholder="90000 00000" testid="onboarding-phone-input" icon={Phone} />
                <div>
                  <label className="pm-label">Blood type</label>
                  <div className="relative">
                    <Droplet className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pm-muted" />
                    <select value={form.blood_type} onChange={set("blood_type")} data-testid="onboarding-blood-type-select" className="pm-input pl-9">
                      {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="pm-label">Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pm-muted" />
                    <input value={form.address} onChange={set("address")} required placeholder="Street, city, pin code" data-testid="onboarding-address-input" className="pm-input pl-9" />
                  </div>
                </div>
                <OnbInput label="Age" value={form.age} onChange={set("age")} type="number" placeholder="30" testid="onboarding-age-input" />
                <div>
                  <label className="pm-label">Conditions <span className="text-pm-muted font-normal">(optional)</span></label>
                  <input value={form.conditions} onChange={set("conditions")} placeholder="diabetes, allergies…" data-testid="onboarding-conditions-input" className="pm-input" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 font-display font-bold text-pm-ink mb-1"><Users className="w-4 h-4 text-pm-secondary" /> Emergency contacts</h3>
              <p className="text-sm text-pm-muted mb-3">On a serious (Red) result you can alert these people instantly on WhatsApp.</p>
              <div className="pm-card p-4 mb-3" style={{ boxShadow: "none" }}>
                <p className="text-xs font-bold uppercase tracking-wide text-pm-secondary mb-2">Contact 1 (required)</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <OnbInput label="Name" value={form.emergency_contact_name} onChange={set("emergency_contact_name")} placeholder="Full name" testid="onboarding-emergency-name-input" />
                  <OnbInput label="Phone" value={form.emergency_contact_phone} onChange={set("emergency_contact_phone")} type="tel" placeholder="90000 00000" testid="onboarding-emergency-phone-input" />
                  <div>
                    <label className="pm-label">Relationship</label>
                    <select value={form.emergency_contact_relation} onChange={set("emergency_contact_relation")} data-testid="onboarding-emergency-relation-select" className="pm-input">
                      {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="pm-card p-4" style={{ boxShadow: "none" }}>
                <p className="text-xs font-bold uppercase tracking-wide text-pm-muted mb-2">Contact 2 (optional)</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <OnbInput label="Name" value={form.emergency_contact2_name} onChange={set("emergency_contact2_name")} placeholder="Full name" testid="onboarding-emergency2-name-input" required={false} />
                  <OnbInput label="Phone" value={form.emergency_contact2_phone} onChange={set("emergency_contact2_phone")} type="tel" placeholder="90000 00000" testid="onboarding-emergency2-phone-input" required={false} />
                  <div>
                    <label className="pm-label">Relationship</label>
                    <select value={form.emergency_contact2_relation} onChange={set("emergency_contact2_relation")} data-testid="onboarding-emergency2-relation-select" className="pm-input">
                      {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {error && <p className="text-sm font-semibold" style={{ color: "var(--pm-red)" }} data-testid="onboarding-error">{error}</p>}

            <button type="submit" disabled={loading} data-testid="onboarding-submit-button" className="pm-btn w-full">
              {loading ? "Saving…" : <>Enter Pain Map <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}


function OnbInput({ label, value, onChange, type = "text", placeholder = "", testid, required = true, icon: Icon }) {
  return (
    <div>
      <label className="pm-label">{label}</label>
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pm-muted" />}
        <input type={type} required={required} value={value} onChange={onChange} placeholder={placeholder} data-testid={testid}
          className={`pm-input ${Icon ? "pl-9" : ""}`} {...(type === "number" ? { min: 0, max: 120 } : {})} />
      </div>
    </div>
  );
}
