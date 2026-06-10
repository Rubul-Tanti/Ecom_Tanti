"use client";

import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
type SettingSection =
  | "profile"
  | "store"
  | "notifications"
  | "security"
  | "integrations"
  | "danger";

interface Toggle {
  id: string;
  label: string;
  description: string;
  value: boolean;
}

// ─── Toggle Component ────────────────────────────────────────────────────────
function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      style={{
        width: 44, height: 24,
        background: enabled ? "#0a0a0a" : "#e0e0e0",
        border: "none", cursor: "pointer",
        position: "relative", flexShrink: 0,
        transition: "background 0.2s",
        borderRadius: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 4, left: enabled ? 24 : 4,
        width: 16, height: 16,
        background: "#fff",
        transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)",
        display: "block",
      }} />
    </button>
  );
}

// ─── Section Nav Item ────────────────────────────────────────────────────────
function SectionTab({
  id, label, icon, active, onClick,
}: {
  id: SettingSection; label: string; icon: React.ReactNode;
  active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 20px",
        width: "100%", border: "none",
        background: active ? "#fff" : "transparent",
        fontFamily: "'Syne', sans-serif",
        fontSize: 11, letterSpacing: "2.5px", textTransform: "uppercase",
        fontWeight: 600,
        color: active ? "#0a0a0a" : "rgba(255,255,255,0.45)",
        cursor: "pointer",
        textAlign: "left",
        borderLeft: active ? "3px solid #0a0a0a" : "3px solid transparent",
        transition: "all 0.15s",
        position: "relative",
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#fff";
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)";
      }}
    >
      <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ─── Field Row ───────────────────────────────────────────────────────────────
function FieldRow({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "200px 1fr",
      gap: 24, padding: "22px 0",
      borderBottom: "1px solid #f0f0f0",
      alignItems: "start",
    }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#0a0a0a", marginBottom: 4 }}>{label}</p>
        {hint && <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
function Input({
  value, onChange, placeholder, type = "text", readOnly,
}: {
  value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={e => onChange?.(e.target.value)}
      style={{
        width: "100%", padding: "10px 14px",
        border: "1.5px solid #e4e4e4",
        fontFamily: "'Syne', sans-serif", fontSize: 13,
        color: readOnly ? "#aaa" : "#0a0a0a",
        background: readOnly ? "#fafafa" : "#fff",
        outline: "none", borderRadius: 0,
        transition: "border-color 0.18s, box-shadow 0.18s",
        cursor: readOnly ? "not-allowed" : "text",
      }}
      onFocus={e => {
        if (!readOnly) {
          e.target.style.borderColor = "#0a0a0a";
          e.target.style.boxShadow = "3px 3px 0 #0a0a0a";
        }
      }}
      onBlur={e => {
        e.target.style.borderColor = "#e4e4e4";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
function Select({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "10px 14px",
        border: "1.5px solid #e4e4e4",
        fontFamily: "'Syne', sans-serif", fontSize: 13,
        color: "#0a0a0a", background: "#fff",
        outline: "none", borderRadius: 0,
        cursor: "pointer", WebkitAppearance: "none",
        transition: "border-color 0.18s",
      }}
      onFocus={e => { e.target.style.borderColor = "#0a0a0a"; }}
      onBlur={e => { e.target.style.borderColor = "#e4e4e4"; }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── Save Button ─────────────────────────────────────────────────────────────
function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        padding: "11px 28px",
        background: saving ? "#888" : "#0a0a0a",
        border: "none",
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 17, letterSpacing: "3px",
        color: "#fff", cursor: saving ? "not-allowed" : "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => {
        if (!saving) {
          (e.currentTarget as HTMLButtonElement).style.transform = "translate(-2px,-2px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 4px 0 rgba(0,0,0,0.15)";
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "none";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      {saving ? "Saving..." : "Save Changes"}
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>("profile");
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Profile
  const [firstName, setFirstName] = useState("Admin");
  const [lastName, setLastName] = useState("User");
  const [email, setEmail] = useState("admin@tanti.co");
  const [role] = useState("Super Admin");
  const [bio, setBio] = useState("");

  // Store
  const [storeName, setStoreName] = useState("TANTI");
  const [storeUrl, setStoreUrl] = useState("tanti.co");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("Europe/London");
  const [language, setLanguage] = useState("en");
  const [taxRate, setTaxRate] = useState("20");

  // Notifications
  const [notifs, setNotifs] = useState<Toggle[]>([
    { id: "n1", label: "New Orders",       description: "Get notified when a new order is placed",         value: true },
    { id: "n2", label: "Low Stock Alerts", description: "Alert when product stock falls below 10 units",   value: true },
    { id: "n3", label: "Customer Signups", description: "Notify on every new customer registration",       value: false },
    { id: "n4", label: "Payment Failures", description: "Alert on failed or declined payments",            value: true },
    { id: "n5", label: "Weekly Report",    description: "Receive a weekly performance summary email",      value: true },
    { id: "n6", label: "Refund Requests",  description: "Get notified when a refund is requested",        value: false },
  ]);

  // Security
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");

  // Integrations
  const [integrations, setIntegrations] = useState([
    { id: "stripe",    name: "Stripe",       description: "Payment processing",       connected: true,  icon: "S" },
    { id: "mailchimp", name: "Mailchimp",     description: "Email marketing",          connected: false, icon: "M" },
    { id: "shopify",   name: "Shopify Sync",  description: "Inventory sync",           connected: false, icon: "Sh" },
    { id: "ga",        name: "Google Analytics", description: "Traffic & conversions", connected: true,  icon: "G" },
    { id: "slack",     name: "Slack",         description: "Order notifications",      connected: false, icon: "Sl" },
    { id: "ups",       name: "UPS Shipping",  description: "Shipping labels & rates",  connected: true,  icon: "U" },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Settings saved successfully");
    }, 900);
  };

  const toggleNotif = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, value: !n.value } : n));
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i)
    );
    const intg = integrations.find(i => i.id === id);
    if (intg) showToast(intg.connected ? `${intg.name} disconnected` : `${intg.name} connected`);
  };

  const NAV: { id: SettingSection; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-3 2.5-4.5 6-4.5s6 1.5 6 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { id: "store", label: "Store", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="5" width="12" height="8" stroke="currentColor" strokeWidth="1.3"/><path d="M1 5l2-4h8l2 4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 13V9h4v4" stroke="currentColor" strokeWidth="1.3"/></svg> },
    { id: "notifications", label: "Notifications", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1a4 4 0 00-4 4v2.5L1 9h12l-2-1.5V5A4 4 0 007 1z" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 10.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/></svg> },
    { id: "security", label: "Security", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L2 3.5V7c0 3 2 5 5 6 3-1 5-3 5-6V3.5L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
    { id: "integrations", label: "Integrations", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="3" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="3" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7h2m2-4L7 7m2 4L7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { id: "danger", label: "Danger Zone", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 12h12L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 5v3M7 10v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .st-root {
          display: flex;
          min-height: 100%;
          font-family: 'Syne', sans-serif;
          color: #0a0a0a;
          background: #f4f4f2;
        }

        /* ── Settings sidebar ── */
        .st-nav {
          width: 200px;
          flex-shrink: 0;
          background: #0a0a0a;
          padding: 32px 0 24px;
          position: sticky;
          top: 0;
          height: calc(100vh - 64px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .st-nav-eyebrow {
          font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(255,255,255,0.2); padding: 0 20px; margin-bottom: 16px;
        }

        .st-nav-divider {
          height: 1px; background: rgba(255,255,255,0.07);
          margin: 10px 0;
        }

        .st-nav-footer {
          margin-top: auto; padding: 16px 20px 0;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .st-nav-version {
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.15);
        }

        /* ── Content area ── */
        .st-content {
          flex: 1; padding: 36px 44px 64px;
          animation: fadeUp 0.3s ease both;
          min-width: 0;
        }

        /* ── Section header ── */
        .st-section-header {
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #0a0a0a;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .st-section-eyebrow {
          font-size: 9px; letter-spacing: 5px; text-transform: uppercase;
          color: #bbb; margin-bottom: 6px;
        }

        .st-section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 5vw, 52px);
          line-height: 0.9; letter-spacing: -0.5px; color: #0a0a0a;
        }

        /* ── Card ── */
        .st-card {
          background: #fff;
          margin-bottom: 20px;
        }

        .st-card-head {
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .st-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 2px; color: #0a0a0a;
        }

        .st-card-body {
          padding: 0 24px;
        }

        /* ── Avatar upload ── */
        .st-avatar-row {
          display: flex; align-items: center; gap: 20px;
          padding: 22px 0; border-bottom: 1px solid #f0f0f0;
        }

        .st-avatar {
          width: 64px; height: 64px;
          background: #0a0a0a;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; color: #fff; flex-shrink: 0;
        }

        .st-avatar-info { flex: 1; }
        .st-avatar-name { font-size: 14px; font-weight: 700; color: #0a0a0a; margin-bottom: 2px; }
        .st-avatar-role { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #bbb; }

        .st-upload-btn {
          padding: 8px 18px;
          border: 1.5px solid #e0e0e0; background: none;
          font-family: 'Syne', sans-serif;
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          cursor: pointer; color: #555;
          transition: border-color 0.15s, color 0.15s;
          white-space: nowrap;
        }

        .st-upload-btn:hover { border-color: #0a0a0a; color: #0a0a0a; }

        /* ── Notif toggle row ── */
        .st-notif-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; padding: 18px 24px;
          border-bottom: 1px solid #f8f8f8;
          transition: background 0.12s;
        }

        .st-notif-row:last-child { border-bottom: none; }
        .st-notif-row:hover { background: #fafafa; }

        .st-notif-label { font-size: 13px; font-weight: 600; color: #0a0a0a; margin-bottom: 2px; }
        .st-notif-desc  { font-size: 11px; color: #aaa; line-height: 1.4; }

        /* ── Integration card ── */
        .st-intg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1px;
          background: #f0f0f0;
        }

        .st-intg-item {
          background: #fff;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: background 0.15s;
        }

        .st-intg-item:hover { background: #fafafa; }

        .st-intg-icon {
          width: 40px; height: 40px;
          background: #f4f4f2;
          border: 1.5px solid #e8e8e8;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; color: #0a0a0a; flex-shrink: 0;
        }

        .st-intg-info { flex: 1; min-width: 0; }
        .st-intg-name { font-size: 13px; font-weight: 600; color: #0a0a0a; }
        .st-intg-desc { font-size: 10px; letter-spacing: 1px; color: #aaa; margin-top: 1px; }

        .st-intg-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }

        .st-intg-btn {
          padding: 6px 14px;
          border: 1.5px solid; background: none;
          font-family: 'Syne', sans-serif;
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; font-weight: 600;
          transition: all 0.15s; white-space: nowrap;
        }

        /* ── Danger zone ── */
        .st-danger-item {
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; padding: 20px 24px;
          border-bottom: 1px solid #fdf0f0;
          flex-wrap: wrap;
        }

        .st-danger-item:last-child { border-bottom: none; }

        .st-danger-label { font-size: 13px; font-weight: 600; color: "#0a0a0a"; margin-bottom: 2px; }
        .st-danger-desc  { font-size: 11px; color: #aaa; }

        .st-danger-btn {
          padding: 8px 20px;
          border: 1.5px solid #cc2200; background: none;
          font-family: 'Syne', sans-serif;
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          cursor: pointer; color: #cc2200; font-weight: 600;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; flex-shrink: 0;
        }

        .st-danger-btn:hover { background: #cc2200; color: #fff; }

        /* ── Footer row ── */
        .st-footer-row {
          padding-top: 28px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #e8e8e8;
          margin-top: 8px;
        }

        .st-cancel-btn {
          padding: 11px 22px;
          border: 1.5px solid #e0e0e0; background: none;
          font-family: 'Syne', sans-serif;
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          cursor: pointer; color: #777;
          transition: border-color 0.15s, color 0.15s;
        }

        .st-cancel-btn:hover { border-color: #0a0a0a; color: #0a0a0a; }

        /* ── Session list ── */
        .st-session {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 14px 24px;
          border-bottom: 1px solid #f8f8f8;
          flex-wrap: wrap;
        }

        .st-session:last-child { border-bottom: none; }

        .st-session-device { font-size: 12px; font-weight: 600; color: #0a0a0a; }
        .st-session-meta   { font-size: 10px; color: #aaa; margin-top: 2px; }

        .st-session-badge {
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          padding: 3px 8px; font-weight: 600;
        }

        .st-revoke-btn {
          padding: 5px 14px;
          border: 1.5px solid #e0e0e0; background: none;
          font-family: 'Syne', sans-serif;
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; color: #aaa;
          transition: border-color 0.15s, color 0.15s;
        }

        .st-revoke-btn:hover { border-color: #cc2200; color: #cc2200; }

        /* ── Toast ── */
        .st-toast {
          position: fixed; bottom: 28px; left: 50%;
          transform: translateX(-50%);
          background: #0a0a0a; color: #fff;
          padding: 12px 24px;
          font-family: 'Syne', sans-serif;
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          border-left: 3px solid #fff; z-index: 999;
          white-space: nowrap;
          animation: toastIn 0.25s ease;
        }

        /* ── Responsive ── */
        @media (max-width: 760px) {
          .st-nav { display: none; }
          .st-content { padding: 24px 20px 48px; }
        }

        @media (max-width: 560px) {
          .st-card-body .field-row-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="st-root">

        {/* ── Settings sidebar nav ── */}
        <aside className="st-nav">
          <p className="st-nav-eyebrow">Settings</p>

          {NAV.slice(0, 4).map(n => (
            <SectionTab
              key={n.id} id={n.id} label={n.label} icon={n.icon}
              active={activeSection === n.id}
              onClick={() => setActiveSection(n.id)}
            />
          ))}

          <div className="st-nav-divider" />

          {NAV.slice(4).map(n => (
            <SectionTab
              key={n.id} id={n.id} label={n.label} icon={n.icon}
              active={activeSection === n.id}
              onClick={() => setActiveSection(n.id)}
            />
          ))}

          <div className="st-nav-footer">
            <p className="st-nav-version">TANTI Admin v2.4.1</p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="st-content" key={activeSection}>

          {/* ══ PROFILE ══ */}
          {activeSection === "profile" && (
            <>
              <div className="st-section-header">
                <div>
                  <p className="st-section-eyebrow">Settings · Account</p>
                  <h1 className="st-section-title">PROFILE</h1>
                </div>
                <SaveBtn onClick={handleSave} saving={saving} />
              </div>

              <div className="st-card">
                <div className="st-card-head">
                  <span className="st-card-title">ACCOUNT INFO</span>
                </div>
                <div className="st-card-body">
                  {/* Avatar row */}
                  <div className="st-avatar-row">
                    <div className="st-avatar">AD</div>
                    <div className="st-avatar-info">
                      <p className="st-avatar-name">{firstName} {lastName}</p>
                      <p className="st-avatar-role">{role}</p>
                    </div>
                    <button className="st-upload-btn">Upload Photo</button>
                  </div>

                  <FieldRow label="First Name">
                    <Input value={firstName} onChange={setFirstName} placeholder="First name" />
                  </FieldRow>

                  <FieldRow label="Last Name">
                    <Input value={lastName} onChange={setLastName} placeholder="Last name" />
                  </FieldRow>

                  <FieldRow label="Email Address" hint="Used for login and notifications">
                    <Input value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
                  </FieldRow>

                  <FieldRow label="Role" hint="Contact your system admin to change">
                    <Input value={role} readOnly />
                  </FieldRow>

                  <FieldRow label="Bio" hint="Short description shown on internal profiles">
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="A few words about you..."
                      rows={3}
                      style={{
                        width: "100%", padding: "10px 14px",
                        border: "1.5px solid #e4e4e4",
                        fontFamily: "'Syne', sans-serif", fontSize: 13,
                        color: "#0a0a0a", background: "#fff",
                        outline: "none", borderRadius: 0, resize: "vertical",
                      }}
                    />
                  </FieldRow>
                </div>
              </div>

              <div className="st-footer-row">
                <button className="st-cancel-btn" onClick={() => {}}>Discard</button>
                <SaveBtn onClick={handleSave} saving={saving} />
              </div>
            </>
          )}

          {/* ══ STORE ══ */}
          {activeSection === "store" && (
            <>
              <div className="st-section-header">
                <div>
                  <p className="st-section-eyebrow">Settings · Configuration</p>
                  <h1 className="st-section-title">STORE</h1>
                </div>
                <SaveBtn onClick={handleSave} saving={saving} />
              </div>

              <div className="st-card">
                <div className="st-card-head"><span className="st-card-title">GENERAL</span></div>
                <div className="st-card-body">
                  <FieldRow label="Store Name" hint="Displayed across all customer-facing pages">
                    <Input value={storeName} onChange={setStoreName} placeholder="Store name" />
                  </FieldRow>
                  <FieldRow label="Store URL" hint="Your primary domain">
                    <Input value={storeUrl} onChange={setStoreUrl} placeholder="example.com" />
                  </FieldRow>
                </div>
              </div>

              <div className="st-card">
                <div className="st-card-head"><span className="st-card-title">REGIONAL</span></div>
                <div className="st-card-body">
                  <FieldRow label="Currency">
                    <Select
                      value={currency} onChange={setCurrency}
                      options={[
                        { value: "USD", label: "USD — US Dollar" },
                        { value: "EUR", label: "EUR — Euro" },
                        { value: "GBP", label: "GBP — British Pound" },
                        { value: "JPY", label: "JPY — Japanese Yen" },
                        { value: "INR", label: "INR — Indian Rupee" },
                      ]}
                    />
                  </FieldRow>
                  <FieldRow label="Timezone">
                    <Select
                      value={timezone} onChange={setTimezone}
                      options={[
                        { value: "Europe/London",    label: "Europe / London (GMT+0)" },
                        { value: "America/New_York",  label: "America / New York (GMT−5)" },
                        { value: "America/Los_Angeles",label: "America / Los Angeles (GMT−8)" },
                        { value: "Asia/Tokyo",        label: "Asia / Tokyo (GMT+9)" },
                        { value: "Asia/Kolkata",      label: "Asia / Kolkata (GMT+5:30)" },
                      ]}
                    />
                  </FieldRow>
                  <FieldRow label="Language">
                    <Select
                      value={language} onChange={setLanguage}
                      options={[
                        { value: "en", label: "English" },
                        { value: "fr", label: "Français" },
                        { value: "de", label: "Deutsch" },
                        { value: "ja", label: "日本語" },
                      ]}
                    />
                  </FieldRow>
                  <FieldRow label="Tax Rate (%)" hint="Applied to all taxable orders">
                    <Input value={taxRate} onChange={setTaxRate} type="number" placeholder="0" />
                  </FieldRow>
                </div>
              </div>

              <div className="st-footer-row">
                <button className="st-cancel-btn">Discard</button>
                <SaveBtn onClick={handleSave} saving={saving} />
              </div>
            </>
          )}

          {/* ══ NOTIFICATIONS ══ */}
          {activeSection === "notifications" && (
            <>
              <div className="st-section-header">
                <div>
                  <p className="st-section-eyebrow">Settings · Alerts</p>
                  <h1 className="st-section-title">NOTIFICATIONS</h1>
                </div>
                <SaveBtn onClick={handleSave} saving={saving} />
              </div>

              <div className="st-card">
                <div className="st-card-head">
                  <span className="st-card-title">EMAIL NOTIFICATIONS</span>
                  <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#bbb" }}>
                    {notifs.filter(n => n.value).length} of {notifs.length} active
                  </span>
                </div>

                {notifs.map(n => (
                  <div className="st-notif-row" key={n.id}>
                    <div>
                      <p className="st-notif-label">{n.label}</p>
                      <p className="st-notif-desc">{n.description}</p>
                    </div>
                    <ToggleSwitch enabled={n.value} onChange={() => toggleNotif(n.id)} />
                  </div>
                ))}
              </div>

              <div className="st-footer-row">
                <SaveBtn onClick={handleSave} saving={saving} />
              </div>
            </>
          )}

          {/* ══ SECURITY ══ */}
          {activeSection === "security" && (
            <>
              <div className="st-section-header">
                <div>
                  <p className="st-section-eyebrow">Settings · Security</p>
                  <h1 className="st-section-title">SECURITY</h1>
                </div>
              </div>

              {/* Change password */}
              <div className="st-card">
                <div className="st-card-head"><span className="st-card-title">CHANGE PASSWORD</span></div>
                <div className="st-card-body">
                  <FieldRow label="Current Password">
                    <Input value={currentPw} onChange={setCurrentPw} type="password" placeholder="••••••••" />
                  </FieldRow>
                  <FieldRow label="New Password" hint="Minimum 8 characters">
                    <Input value={newPw} onChange={setNewPw} type="password" placeholder="••••••••" />
                  </FieldRow>
                  <FieldRow label="Confirm Password">
                    <Input value={confirmPw} onChange={setConfirmPw} type="password" placeholder="••••••••" />
                  </FieldRow>
                </div>
                <div style={{ padding: "0 24px 20px", display: "flex", justifyContent: "flex-end" }}>
                  <SaveBtn onClick={() => showToast("Password updated")} saving={false} />
                </div>
              </div>

              {/* 2FA */}
              <div className="st-card">
                <div className="st-card-head"><span className="st-card-title">TWO-FACTOR AUTH</span></div>
                <div className="st-notif-row">
                  <div>
                    <p className="st-notif-label">Enable 2FA</p>
                    <p className="st-notif-desc">Add an extra layer of security with an authenticator app</p>
                  </div>
                  <ToggleSwitch enabled={twoFA} onChange={setTwoFA} />
                </div>
                {twoFA && (
                  <div style={{ padding: "16px 24px 20px", background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
                    <p style={{ fontSize: 11, color: "#555", letterSpacing: 1, lineHeight: 1.6 }}>
                      Scan the QR code with your authenticator app (Google Authenticator, Authy) to complete setup.
                    </p>
                    {/* QR placeholder */}
                    <div style={{
                      width: 100, height: 100, background: "#e8e8e8",
                      margin: "12px 0", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <rect x="2" y="2" width="14" height="14" rx="0" stroke="#aaa" strokeWidth="2"/>
                        <rect x="20" y="2" width="14" height="14" rx="0" stroke="#aaa" strokeWidth="2"/>
                        <rect x="2" y="20" width="14" height="14" rx="0" stroke="#aaa" strokeWidth="2"/>
                        <rect x="6" y="6" width="6" height="6" fill="#aaa"/>
                        <rect x="24" y="6" width="6" height="6" fill="#aaa"/>
                        <rect x="6" y="24" width="6" height="6" fill="#aaa"/>
                        <rect x="20" y="20" width="4" height="4" fill="#aaa"/>
                        <rect x="26" y="26" width="4" height="4" fill="#aaa"/>
                        <rect x="26" y="20" width="4" height="4" fill="#aaa"/>
                        <rect x="20" y="26" width="4" height="4" fill="#aaa"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Session timeout */}
              <div className="st-card">
                <div className="st-card-head"><span className="st-card-title">SESSION</span></div>
                <div className="st-card-body">
                  <FieldRow label="Auto-logout after" hint="Idle minutes before session expires">
                    <Select
                      value={sessionTimeout} onChange={setSessionTimeout}
                      options={[
                        { value: "15",  label: "15 minutes" },
                        { value: "30",  label: "30 minutes" },
                        { value: "60",  label: "1 hour" },
                        { value: "120", label: "2 hours" },
                        { value: "0",   label: "Never" },
                      ]}
                    />
                  </FieldRow>
                </div>
              </div>

              {/* Active sessions */}
              <div className="st-card">
                <div className="st-card-head">
                  <span className="st-card-title">ACTIVE SESSIONS</span>
                  <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#bbb" }}>3 devices</span>
                </div>

                {[
                  { device: "Chrome · macOS",      ip: "192.168.1.42",   loc: "London, UK",      current: true,  time: "Now" },
                  { device: "Safari · iPhone 15",   ip: "92.45.123.11",   loc: "London, UK",      current: false, time: "2h ago" },
                  { device: "Firefox · Windows 11", ip: "78.32.211.44",   loc: "Berlin, DE",      current: false, time: "3 days ago" },
                ].map((s, i) => (
                  <div className="st-session" key={i}>
                    <div>
                      <p className="st-session-device">{s.device}</p>
                      <p className="st-session-meta">{s.ip} · {s.loc} · {s.time}</p>
                    </div>
                    {s.current ? (
                      <span className="st-session-badge" style={{ background: "#e8f5ee", color: "#22aa55" }}>Current</span>
                    ) : (
                      <button className="st-revoke-btn" onClick={() => showToast("Session revoked")}>Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ INTEGRATIONS ══ */}
          {activeSection === "integrations" && (
            <>
              <div className="st-section-header">
                <div>
                  <p className="st-section-eyebrow">Settings · Apps</p>
                  <h1 className="st-section-title">INTEGRATIONS</h1>
                </div>
                <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#bbb" }}>
                  {integrations.filter(i => i.connected).length} connected
                </span>
              </div>

              <div className="st-card">
                <div className="st-card-head"><span className="st-card-title">ALL INTEGRATIONS</span></div>
                <div className="st-intg-grid">
                  {integrations.map(intg => (
                    <div className="st-intg-item" key={intg.id}>
                      <div className="st-intg-icon">{intg.icon}</div>
                      <div className="st-intg-info">
                        <p className="st-intg-name">{intg.name}</p>
                        <p className="st-intg-desc">{intg.description}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <div className="st-intg-dot" style={{ background: intg.connected ? "#22aa55" : "#e0e0e0" }} />
                        <button
                          className="st-intg-btn"
                          onClick={() => toggleIntegration(intg.id)}
                          style={{
                            borderColor: intg.connected ? "#e0e0e0" : "#0a0a0a",
                            color:       intg.connected ? "#aaa"    : "#0a0a0a",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = intg.connected ? "#fafafa" : "#0a0a0a";
                            (e.currentTarget as HTMLButtonElement).style.color = intg.connected ? "#555" : "#fff";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = "none";
                            (e.currentTarget as HTMLButtonElement).style.color = intg.connected ? "#aaa" : "#0a0a0a";
                          }}
                        >
                          {intg.connected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ DANGER ZONE ══ */}
          {activeSection === "danger" && (
            <>
              <div className="st-section-header">
                <div>
                  <p className="st-section-eyebrow">Settings · Danger</p>
                  <h1 className="st-section-title" style={{ color: "#cc2200" }}>DANGER ZONE</h1>
                </div>
              </div>

              <div className="st-card" style={{ border: "1.5px solid #f5d0d0" }}>
                <div className="st-card-head" style={{ borderBottom: "1px solid #fdf0f0" }}>
                  <span className="st-card-title" style={{ color: "#cc2200" }}>DESTRUCTIVE ACTIONS</span>
                  <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#e09090" }}>
                    Irreversible
                  </span>
                </div>

                {[
                  {
                    label: "Export All Data",
                    desc: "Download a full backup of your store data as a JSON archive.",
                    btn: "Export",
                    action: () => showToast("Export started — check your email"),
                    mild: true,
                  },
                  {
                    label: "Clear All Orders",
                    desc: "Permanently delete all order history. This cannot be undone.",
                    btn: "Clear Orders",
                    action: () => showToast("Orders cleared"),
                    mild: false,
                  },
                  {
                    label: "Reset Inventory",
                    desc: "Set all product stock counts to zero across the catalog.",
                    btn: "Reset Stock",
                    action: () => showToast("Inventory reset to zero"),
                    mild: false,
                  },
                  {
                    label: "Delete Store",
                    desc: "Permanently delete this store and all associated data. No recovery possible.",
                    btn: "Delete Store",
                    action: () => showToast("Action blocked — contact support"),
                    mild: false,
                  },
                ].map((d, i) => (
                  <div className="st-danger-item" key={i}>
                    <div>
                      <p className="st-danger-label">{d.label}</p>
                      <p className="st-danger-desc">{d.desc}</p>
                    </div>
                    <button
                      className="st-danger-btn"
                      onClick={d.action}
                      style={d.mild ? {
                        borderColor: "#e0e0e0", color: "#555",
                      } : undefined}
                      onMouseEnter={e => {
                        if (!d.mild) {
                          (e.currentTarget as HTMLButtonElement).style.background = "#cc2200";
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!d.mild) {
                          (e.currentTarget as HTMLButtonElement).style.background = "none";
                          (e.currentTarget as HTMLButtonElement).style.color = "#cc2200";
                        }
                      }}
                    >{d.btn}</button>
                  </div>
                ))}
              </div>

              {/* Warning note */}
              <div style={{
                marginTop: 16, padding: "14px 20px",
                background: "#fff8f8", border: "1px solid #f5d0d0",
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M8 1L1 14h14L8 1z" stroke="#cc2200" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M8 6v3M8 11.5v.5" stroke="#cc2200" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <p style={{ fontSize: 11, color: "#aa4400", lineHeight: 1.6 }}>
                  Actions in this section are permanent and cannot be reversed. Please ensure you have a full backup before proceeding.
                </p>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && <div className="st-toast">✓ &nbsp;{toast}</div>}
    </>
  );
}