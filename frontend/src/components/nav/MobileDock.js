import React from "react";
import { NavLink } from "react-router-dom";
import { LogIn, User } from "lucide-react";

export function MobileDock({ navItems, user }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden flex justify-around items-center py-1.5 px-2 border-t backdrop-blur-md"
      style={{ background: "color-mix(in srgb, var(--pm-surface) 94%, transparent)", borderColor: "var(--pm-border)" }}
    >
      {navItems.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          data-testid={`${n.testid}-mobile`}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-bold ${
              isActive ? "text-pm-secondary" : "text-pm-muted"
            }`
          }
        >
          <n.icon className="w-5 h-5" />
          {n.label}
        </NavLink>
      ))}
      {user ? (
        <NavLink to="/profile" end data-testid="nav-link-profile-mobile"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-bold ${isActive ? "text-pm-secondary" : "text-pm-muted"}`}>
          <User className="w-5 h-5" /> Profile
        </NavLink>
      ) : (
        <NavLink to="/login" data-testid="nav-link-login-mobile"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-pm-muted">
          <LogIn className="w-5 h-5" /> Login
        </NavLink>
      )}
    </nav>
  );
}
