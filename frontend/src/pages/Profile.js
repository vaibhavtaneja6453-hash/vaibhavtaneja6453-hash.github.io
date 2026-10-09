import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";
import { BLOOD_TYPES } from "../lib/painEngine";
import { Camera, Save, Mail, ShieldCheck } from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || "", phone: user?.phone || "", address: user?.address || "",
    emergency_contact_name: user?.emergency_contact_name || "",
    emergency_contact_phone: user?.emergency_contact_phone || "",
    age: user?.age ?? "", blood_type: user?.blood_type || "O+",
    conditions: user?.conditions || "", picture: user?.picture || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
        setForm((f) => ({ ...f, picture: canvas.toDataURL("image/jpeg", 0.82) }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ ...form, age: form.age === "" ? null : parseInt(form.age, 10) });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.name || user?.email || "?").trim()[0]?.toUpperCase();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-pm-ink">My profile</h1>
      <p className="text-pm-muted mt-1">Your details and emergency information — everything here is editable.</p>

      <div className="pm-card p-6 sm:p-8 mt-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {form.picture ? (
              <img src={form.picture} alt="Profile" className="w-24 h-24 rounded-full object-cover" data-testid="profile-avatar-img" />
            ) : (
              <span className="w-24 h-24 rounded-full grid place-items-center text-white font-display text-3xl font-bold" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }} data-testid="profile-avatar-initials">{initials}</span>
            )}
            <button onClick={() => fileRef.current?.click()} data-testid="profile-avatar-upload-btn" className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full grid place-items-center text-white shadow-lg" style={{ background: "var(--pm-secondary)" }} aria-label="Change photo">
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} data-testid="profile-avatar-file-input" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-xl font-bold text-pm-ink truncate">{form.name || "Your name"}</p>
            <p className="flex items-center gap-1.5 text-pm-muted text-sm truncate"><Mail className="w-4 h-4" /> {user?.email}</p>
            <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "var(--pm-secondary)" }}>
              <ShieldCheck className="w-3.5 h-3.5" /> {user?.auth_provider === "google" ? "Google account" : "Email account"}{user?.role === "admin" ? " · Owner" : ""}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <Field label="Full name" k="name" v={form.name} on={set} t="profile-name-input" />
          <Field label="Phone number" k="phone" v={form.phone} on={set} t="profile-phone-input" type="tel" />
          <div className="sm:col-span-2">
            <label className="pm-label">Address</label>
            <input value={form.address} onChange={set("address")} className="pm-input" data-testid="profile-address-input" />
          </div>
          <Field label="Emergency contact name" k="emergency_contact_name" v={form.emergency_contact_name} on={set} t="profile-emergency-name-input" />
          <Field label="Emergency contact phone" k="emergency_contact_phone" v={form.emergency_contact_phone} on={set} t="profile-emergency-phone-input" type="tel" />
          <Field label="Age" k="age" v={form.age} on={set} t="profile-age-input" type="number" />
          <div>
            <label className="pm-label">Blood type</label>
            <select value={form.blood_type} onChange={set("blood_type")} className="pm-input" data-testid="profile-blood-type-select">
              {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="pm-label">Existing conditions <span className="text-pm-muted font-normal">(optional)</span></label>
            <textarea rows={2} value={form.conditions} onChange={set("conditions")} className="pm-input resize-none" data-testid="profile-conditions-input" placeholder="e.g. diabetes, hypertension, allergies" />
          </div>
        </div>

        <button onClick={save} disabled={saving} data-testid="profile-save-btn" className="pm-btn mt-7">
          <Save className="w-5 h-5" /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </main>
  );
}

function Field({ label, k, v, on, t, type = "text" }) {
  return (
    <div>
      <label className="pm-label">{label}</label>
      <input type={type} value={v} onChange={on(k)} className="pm-input" data-testid={t} {...(type === "number" ? { min: 0, max: 120 } : {})} />
    </div>
  );
}
