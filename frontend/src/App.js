import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
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

function AppRouter() {
  const location = useLocation();
  // Google OAuth returns to {origin}/dashboard#session_id=... — handle it before anything else.
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  const authPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--pm-bg)" }}>
      {!authPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/diagnostics" element={<ProtectedRoute><Diagnostics /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/reviews" element={<Reviews />} />
      </Routes>
      {!authPage && <FloatingAIAssistant />}
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
