import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown } from "lucide-react";

function Avatar({ user, size = 32 }) {
  const initials = (user?.name || user?.email || "?").trim()[0]?.toUpperCase();
  if (user?.picture)
    return <img src={user.picture} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <span className="rounded-full grid place-items-center text-white font-bold" style={{ width: size, height: size, background: "var(--pm-primary)", fontSize: size * 0.42 }}>
      {initials}
    </span>
  );
}

export function UserMenu({ user, onLogout, onProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setMenuOpen((o) => !o)} data-testid="nav-user-menu-btn"
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border transition-colors hover:border-pm-secondary" style={{ borderColor: "var(--pm-border)" }}>
        <Avatar user={user} />
        <ChevronDown className="w-4 h-4 text-pm-muted" />
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 pm-card p-2 z-50">
          <div className="px-3 py-2">
            <p className="font-bold text-pm-ink text-sm truncate">{user.name || "You"}</p>
            <p className="text-xs text-pm-muted truncate">{user.email}</p>
          </div>
          <div className="h-px my-1" style={{ background: "var(--pm-border)" }} />
          <button onClick={() => { setMenuOpen(false); onProfile(); }} data-testid="nav-profile-btn"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-pm-ink hover:bg-pm-surfaceMuted">
            <User className="w-4 h-4" /> My profile
          </button>
          <button onClick={() => { setMenuOpen(false); onLogout(); }} data-testid="nav-logout-btn"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-pm-surfaceMuted" style={{ color: "var(--pm-red)" }}>
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
