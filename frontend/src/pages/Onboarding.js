import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";
import { BLOOD_TYPES, RELATIONS } from "../lib/painEngine";
import { HeartPulse, ArrowRight, ShieldCheck } from "lucide-react";

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

  const field = (label, key, type = "text", placeholder = "", testid, required = true) => (
    <div>
      <label className="pm-label">{label}</label>
      <input type={type} required={required} value={form[key]} onChange={set(key)} placeholder={placeholder} data-testid={testid} className="pm-input" {...(type === "number" ? { min: 0, max: 120 } : {})} />
    </div>
  );

  return (
    <main className="min-h-screen flex items-center justify-center p-5 sm:p-8" style={{ background: "var(--pm-bg)" }}>
      <div className="w-full max-w-2xl pm-card p-6 sm:p-10 my-6">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }}><HeartPulse className="w-5 h-5 text-white" /></span>
          <span className="font-display text-xl font-bold text-pm-ink">Pain Map</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-pm-ink">Welcome, {user?.name?.split(" ")[0] || "there"}! A few details first</h1>
        <p className="text-pm-muted mt-2">These keep you safe in an emergency and help your doctor understand you. You'll only do this once.</p>

        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4 mt-6">
          {field("Phone number", "phone", "tel", "90000 00000", "onboarding-phone-input")}
          <div>
            <label className="pm-label">Blood type</label>
            <select value={form.blood_type} onChange={set("blood_type")} data-testid="onboarding-blood-type-select" className="pm-input">
              {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="pm-label">Address</label>
            <input value={form.address} onChange={set("address")} required placeholder="Street, city, pin code" data-testid="onboarding-address-input" className="pm-input" />
          </div>
          {field("Age", "age", "number", "30", "onboarding-age-input")}
          <div className="sm:col-span-2 mt-1">
            <p className="flex items-center gap-1.5 font-display font-bold text-pm-ink"><ShieldCheck className="w-4 h-4 text-pm-secondary" /> Emergency contacts</p>
            <p className="text-sm text-pm-muted">On a serious (Red) result you can alert these people instantly on WhatsApp.</p>
          </div>
          {field("Contact 1 name", "emergency_contact_name", "text", "Full name", "onboarding-emergency-name-input")}
          {field("Contact 1 phone", "emergency_contact_phone", "tel", "90000 00000", "onboarding-emergency-phone-input")}
          <div className="sm:col-span-2">
            <label className="pm-label">Contact 1 relationship</label>
            <select value={form.emergency_contact_relation} onChange={set("emergency_contact_relation")} data-testid="onboarding-emergency-relation-select" className="pm-input">
              {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {field("Contact 2 name (optional)", "emergency_contact2_name", "text", "Full name", "onboarding-emergency2-name-input", false)}
          {field("Contact 2 phone (optional)", "emergency_contact2_phone", "tel", "90000 00000", "onboarding-emergency2-phone-input", false)}
          <div className="sm:col-span-2">
            <label className="pm-label">Contact 2 relationship</label>
            <select value={form.emergency_contact2_relation} onChange={set("emergency_contact2_relation")} data-testid="onboarding-emergency2-relation-select" className="pm-input">
              {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="pm-label">Existing conditions <span className="text-pm-muted font-normal">(optional)</span></label>
            <textarea value={form.conditions} onChange={set("conditions")} rows={2} placeholder="e.g. diabetes, hypertension, allergies" data-testid="onboarding-conditions-input" className="pm-input resize-none" />
          </div>

          {error && <p className="sm:col-span-2 text-sm font-semibold" style={{ color: "var(--pm-red)" }} data-testid="onboarding-error">{error}</p>}

          <button type="submit" disabled={loading} data-testid="onboarding-submit-button" className="pm-btn w-full sm:col-span-2 mt-1">
            {loading ? "Saving…" : <>Enter Pain Map <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </main>
  );
}
