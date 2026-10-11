import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, API, formatApiError } from "../lib/api";
import { BLOOD_TYPES, RELATIONS } from "../lib/painEngine";
import { HeartPulse, ArrowRight } from "lucide-react";

const initial = {
  name: "", email: "", phone: "", address: "",
  emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relation: "Spouse",
  emergency_contact2_name: "", emergency_contact2_phone: "", emergency_contact2_relation: "Friend",
  password: "", age: "", blood_type: "O+", conditions: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ ...initial, email: location.state?.email || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState({ google: true, facebook: false, microsoft: false });

  useEffect(() => {
    api.get("/auth/providers").then(({ data }) => setProviders(data)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, age: parseInt(form.age, 10) || 0 });
      toast.success("Account created — welcome to Pain Map!");
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
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
        <Link to="/" className="flex items-center gap-2.5 mb-6">
          <span className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }}><HeartPulse className="w-5 h-5 text-white" /></span>
          <span className="font-display text-xl font-bold text-pm-ink">Pain Map</span>
        </Link>
        <h2 className="font-display text-3xl font-bold text-pm-ink">Create your account</h2>
        <p className="text-pm-muted mt-2">A few details help your doctor and keep you safe in an emergency.</p>

        <button onClick={googleLogin} data-testid="register-google-button" className="pm-btn-alt w-full mt-6">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
          Sign up with Google
        </button>
        {providers.facebook && (
          <button onClick={() => (window.location.href = `${API}/auth/facebook`)} data-testid="register-facebook-button" className="pm-btn-alt w-full mt-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="" className="w-5 h-5" />
            Sign up with Facebook
          </button>
        )}
        {providers.microsoft && (
          <button onClick={() => (window.location.href = `${API}/auth/microsoft`)} data-testid="register-microsoft-button" className="pm-btn-alt w-full mt-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="" className="w-5 h-5" />
            Sign up with Microsoft
          </button>
        )}
        <div className="flex items-center gap-3 my-5 text-pm-muted text-sm">
          <span className="h-px flex-1" style={{ background: "var(--pm-border)" }} /> or fill in your details <span className="h-px flex-1" style={{ background: "var(--pm-border)" }} />
        </div>

        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          {field("Full name", "name", "text", "Jane Doe", "register-name-input")}
          {field("Gmail / Email", "email", "email", "you@gmail.com", "register-email-input")}
          {field("Phone number", "phone", "tel", "+91 90000 00000", "register-phone-input")}
          <div>
            <label className="pm-label">Blood type</label>
            <select value={form.blood_type} onChange={set("blood_type")} data-testid="register-blood-type-select" className="pm-input">
              {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="pm-label">Address</label>
            <input value={form.address} onChange={set("address")} required placeholder="Street, city, pin code" data-testid="register-address-input" className="pm-input" />
          </div>
          {field("Emergency contact 1 name", "emergency_contact_name", "text", "Contact person", "register-emergency-contact-input")}
          {field("Emergency contact 1 phone", "emergency_contact_phone", "tel", "90000 00000", "register-emergency-phone-input")}
          <div className="sm:col-span-2">
            <label className="pm-label">Contact 1 relationship</label>
            <select value={form.emergency_contact_relation} onChange={set("emergency_contact_relation")} data-testid="register-emergency-relation-select" className="pm-input">
              {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {field("Emergency contact 2 name (optional)", "emergency_contact2_name", "text", "Second contact", "register-emergency2-contact-input", false)}
          {field("Emergency contact 2 phone (optional)", "emergency_contact2_phone", "tel", "90000 00000", "register-emergency2-phone-input", false)}
          <div className="sm:col-span-2">
            <label className="pm-label">Contact 2 relationship</label>
            <select value={form.emergency_contact2_relation} onChange={set("emergency_contact2_relation")} data-testid="register-emergency2-relation-select" className="pm-input">
              {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {field("Age", "age", "number", "30", "register-age-input")}
          {field("Password", "password", "password", "At least 6 characters", "register-password-input")}
          <div className="sm:col-span-2">
            <label className="pm-label">Existing conditions <span className="text-pm-muted font-normal">(optional)</span></label>
            <textarea value={form.conditions} onChange={set("conditions")} rows={2} placeholder="e.g. diabetes, hypertension, allergies" data-testid="register-conditions-input" className="pm-input resize-none" />
          </div>

          {error && <p className="sm:col-span-2 text-sm font-semibold" style={{ color: "var(--pm-red)" }} data-testid="register-error">{error}</p>}

          <button type="submit" disabled={loading} data-testid="register-submit-button" className="pm-btn w-full sm:col-span-2 mt-1">
            {loading ? "Creating account…" : <>Register & continue <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <p className="text-center text-pm-muted mt-6 text-sm">
          Already have an account? <Link to="/login" className="font-bold" style={{ color: "var(--pm-secondary)" }} data-testid="go-to-login-link">Log in</Link>
        </p>
      </div>
    </main>
  );
}
