import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthCallback from "@/components/AuthCallback";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Diagnostics from "@/pages/Diagnostics";
import Dashboard from "@/pages/Dashboard";
import Reviews from "@/pages/Reviews";
import Profile from "@/pages/Profile";
import Onboarding from "@/pages/Onboarding";

function AppRouter() {
  const location = useLocation();
  const { user, loading } = useAuth();
  // Google OAuth returns to {origin}/dashboard#session_id=... — handle it before anything else.
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  const authPage = location.pathname === "/login" || location.pathname === "/register";
  const onboardingPage = location.pathname === "/onboarding";
  const hideChrome = authPage || onboardingPage;

  // New social sign-ins (or anyone with an incomplete profile) must finish onboarding first.
  if (!loading && user && !user.profile_complete && !onboardingPage && !authPage) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--pm-bg)" }}>
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/diagnostics" element={<ProtectedRoute><Diagnostics /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/reviews" element={<Reviews />} />
      </Routes>
      {!hideChrome && <FloatingAIAssistant />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
