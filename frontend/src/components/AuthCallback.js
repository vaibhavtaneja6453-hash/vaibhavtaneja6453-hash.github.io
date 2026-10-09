import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { HeartPulse } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;

    if (!sessionId) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        const { data } = await api.post("/auth/session", {}, { headers: { "X-Session-ID": sessionId } });
        setUser(data);
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/dashboard", { replace: true });
      } catch {
        setError("Google sign-in failed. Please try again.");
        setTimeout(() => navigate("/login", { replace: true }), 1800);
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-pm-muted">
      <HeartPulse className="w-10 h-10 text-pm-secondary animate-pulse" />
      <p>{error || "Signing you in…"}</p>
    </div>
  );
}
