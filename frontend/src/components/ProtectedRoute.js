import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HeartPulse } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-pm-muted">
        <HeartPulse className="w-10 h-10 text-pm-secondary animate-pulse" />
        <p>Loading your care space…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
