import React from "react";
import { Activity, Droplet, Phone, MapPin } from "lucide-react";

export function ProfileStrip({ user }) {
  const cards = [
    { icon: Droplet, label: "Blood type", value: user?.blood_type || "—" },
    { icon: Activity, label: "Age", value: user?.age ?? "—" },
    { icon: Phone, label: "Emergency", value: user?.emergency_contact_phone || "—" },
    { icon: MapPin, label: "Address", value: user?.address ? user.address.split(",")[0] : "—" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="pm-card p-4">
          <div className="flex items-center gap-2 text-pm-muted text-xs font-bold uppercase tracking-wide"><c.icon className="w-4 h-4" />{c.label}</div>
          <p className="font-display font-bold text-pm-ink mt-1 truncate">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
