import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { HeartPulse, Home, Stethoscope, LayoutDashboard, Star, Moon, Sun, LogIn } from "lucide-react";
import { UserMenu } from "./nav/UserMenu";
import { MobileDock } from "./nav/MobileDock";

const navItems = [
  { to: "/", label: "Home", icon: Home, testid: "nav-link-home", end: true },
  { to: "/diagnostics", label: "Diagnostics", icon: Stethoscope, testid: "nav-link-diagnostics" },
  { to: "/dashboard", label: "Statistics", icon: LayoutDashboard, testid: "nav-link-dashboard" },
  { to: "/reviews", label: "Reviews", icon: Star, testid: "nav-link-reviews" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      {/* Desktop / top header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ background: "color-mix(in srgb, var(--pm-surface) 88%, transparent)", borderColor: "var(--pm-border)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2.5" data-testid="nav-logo">
            <span className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }}>
              <HeartPulse className="w-5 h-5 text-white" />
            </span>
            <span className="font-display text-xl font-bold text-pm-ink">Pain Map</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                data-testid={n.testid}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full text-sm font-bold transition-colors ${
                    isActive ? "text-white" : "text-pm-muted hover:text-pm-ink"
                  }`
                }
                style={({ isActive }) => (isActive ? { background: "var(--pm-primary)" } : {})}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggle} data-testid="nav-theme-toggle-btn" aria-label="Toggle theme"
              className="w-10 h-10 rounded-full grid place-items-center border border-pm-border text-pm-ink hover:border-pm-secondary transition-colors">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <UserMenu user={user} onLogout={onLogout} onProfile={() => navigate("/profile")} />
            ) : (
              <NavLink to="/login" data-testid="nav-link-login" className="pm-btn !min-h-[40px] !py-2 !px-4 text-sm">
                <LogIn className="w-4 h-4" /> Login
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <MobileDock navItems={navItems} user={user} />
    </>
  );
}
