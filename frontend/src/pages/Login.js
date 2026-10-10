import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, API, formatApiError } from "../lib/api";
import { HeartPulse, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noAccount, setNoAccount] = useState(false);
  const [providers, setProviders] = useState({ google: true, facebook: false, microsoft: false });

  useEffect(() => {
    api.get("/auth/providers").then(({ data }) => setProviders(data)).catch(() => {});
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) toast.error(`${err === "facebook" ? "Facebook" : "Microsoft"} sign-in failed. Please try again.`);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNoAccount(false);
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 404) {
        setNoAccount(true);
        setError("No account found for this email. New here? Create an account.");
      } else {
        setError(formatApiError(err.response?.data?.detail) || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white" style={{ background: "linear-gradient(145deg,var(--pm-primary),var(--pm-secondary))" }}>
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-full bg-white/20 grid place-items-center"><HeartPulse className="w-5 h-5" /></span>
          <span className="font-display text-2xl font-bold">Pain Map</span>
        </Link>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">Welcome back to your<br />care space.</h1>
          <p className="mt-4 opacity-90 max-w-sm">Pick up your pain diary, review your trends, and prepare for your next appointment with confidence.</p>
        </div>
        <p className="text-sm opacity-75">Private, non-diagnostic, and built for clarity.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }}><HeartPulse className="w-5 h-5 text-white" /></span>
            <span className="font-display text-xl font-bold text-pm-ink">Pain Map</span>
          </Link>
          <h2 className="font-display text-3xl font-bold text-pm-ink">Sign in</h2>
          <p className="text-pm-muted mt-2">Log in to continue to your dashboard.</p>

          <button onClick={googleLogin} data-testid="login-google-button" className="pm-btn-alt w-full mt-6">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
            Continue with Google
          </button>
          {providers.facebook && (
            <button onClick={() => (window.location.href = `${API}/auth/facebook`)} data-testid="login-facebook-button" className="pm-btn-alt w-full mt-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="" className="w-5 h-5" />
              Continue with Facebook
            </button>
          )}
          {providers.microsoft && (
            <button onClick={() => (window.location.href = `${API}/auth/microsoft`)} data-testid="login-microsoft-button" className="pm-btn-alt w-full mt-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="" className="w-5 h-5" />
              Continue with Microsoft
            </button>
          )}

          <div className="flex items-center gap-3 my-5 text-pm-muted text-sm">
            <span className="h-px flex-1" style={{ background: "var(--pm-border)" }} /> or <span className="h-px flex-1" style={{ background: "var(--pm-border)" }} />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="pm-label">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-pm-muted" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email-input" className="pm-input pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="pm-label">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-pm-muted" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password-input" className="pm-input pl-10" placeholder="••••••••" />
              </div>
            </div>
            {error && (
              <div data-testid="login-error" className="text-sm">
                <p className="font-semibold" style={{ color: noAccount ? "var(--pm-ink)" : "var(--pm-red)" }}>{error}</p>
                {noAccount && (
                  <button type="button" onClick={() => navigate("/register", { state: { email } })} data-testid="login-go-register-btn" className="pm-btn-alt w-full mt-3">
                    Register with this email
                  </button>
                )}
              </div>
            )}
            <button type="submit" disabled={loading} data-testid="login-submit-button" className="pm-btn w-full">
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <p className="text-center text-pm-muted mt-6 text-sm">
            No account yet? <Link to="/register" className="font-bold" style={{ color: "var(--pm-secondary)" }} data-testid="go-to-register-link">Register here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
