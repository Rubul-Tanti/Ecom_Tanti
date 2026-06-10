'use client'
import useEvents from "@/hooks/useEvent";
import { ApiProduct, ProductImage } from "@/server/product/types";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  name: string;
  thumbnail: string;
  price: number;
};

type EventStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "CANCELLED";

type EventForm = {
  name: string;
  slug: string;
  tagLine: string;
  description: string;
  status: EventStatus;
  startDate: string;
  endDate: string;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const skeletonStyle = `
  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #0d0d0d 25%, #1a1a1a 50%, #0d0d0d 75%);
    background-size: 700px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 3px;
  }
  .field-input {
    width: 100%;
    background: #0a0a0a;
    border: 1px solid #1f1f1f;
    color: white;
    padding: 0.75rem 1rem;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .field-input:focus {
    border-color: #3f3f3f;
  }
  .field-input:hover {
    border-color: #2a2a2a;
  }
  select.field-input option {
    background: #0a0a0a;
  }
`;

function Sk({ w = "100%", h = "1rem", style = {} }: {
  w?: string; h?: string; style?: React.CSSProperties;
}) {
  return <div className="skeleton" style={{ width: w, height: h, ...style }} />;
}

function EditEventPageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "white", padding: "2rem" }}>
      <style>{skeletonStyle}</style>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* breadcrumb */}
        <Sk w="100px" h="11px" style={{ marginBottom: "2rem" }} />

        {/* two col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Sk w="100%" h="250px" style={{ borderRadius: 0 }} />
            {[1,2,3,4].map(i => (
              <div key={i}>
                <Sk w="80px" h="11px" style={{ marginBottom: "0.5rem" }} />
                <Sk w="100%" h="44px" />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Sk w="100%" h="160px" />
            {[1,2,3].map(i => <Sk key={i} w="100%" h="120px" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#525252", marginBottom: "0.5rem" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const STATUS_OPTIONS: EventStatus[] = ["DRAFT", "ACTIVE", "EXPIRED", "CANCELLED"];
const STATUS_COLORS: Record<EventStatus, string> = {
  ACTIVE: "#22c55e", DRAFT: "#3b82f6", EXPIRED: "#737373", CANCELLED: "#ef4444",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
function EditEventPage({ id }: { id: string }) {
  const { getEventsById,updateEvent } = useEvents();
  const { data, isLoading } = getEventsById(id);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [form, setForm] = useState<EventForm | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const bannerRef = useRef<HTMLInputElement>(null);

  // Sync form when data loads
  useEffect(() => {
    if (data?.data) {
      const e = data.data;
      setForm({
        name: e.name ?? "",
        slug: e.slug ?? "",
        tagLine: e.tagLine ?? "",
        description: e.description ?? "",
        status: e.status ?? "DRAFT",
        startDate: e.startDate ? e.startDate.slice(0, 10) : "",
        endDate: e.endDate ? e.endDate.slice(0, 10) : "",
      });
      setProducts(e.products|| []);
    }
  }, [data?.data]);

  if (isLoading || !form) return <EditEventPageSkeleton />;

  const event = data?.data;

  // ── Handlers ──
  const set = (key: keyof EventForm, value: string) => {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
    setIsDirty(true);
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    if (!form) return;
    setIsSaving(true)
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("tagLine", form.tagLine);
      formData.append("description", form.description);
      formData.append("status", form.status);
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);
      // banner file if selected
      if (bannerRef.current?.files?.[0]) {
        formData.append("banner", bannerRef.current.files[0]);
      }
      await updateEvent.mutate({id,data:form},{onSuccess:()=>{
        toast("updated successfully")
      },onError:()=>{
        toast.error("error while updating")
      },onSettled:()=>{setIsSaving(false)}})
  };

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setIsDirty(true);
  };
  const getPrimaryUrl=(images:ProductImage[])=>{
    const url=images.find(img=>img.isPrimary===true)?.url||''
    return url
  }

  const statusColor = STATUS_COLORS[form.status];

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "white" }}>
      <style>{skeletonStyle}</style>

      {/* ── Top bar ── */}
      <div style={{ borderBottom: "1px solid #141414", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#050505", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#525252", fontSize: "12px" }}>Events</span>
          <span style={{ color: "#333", fontSize: "12px" }}>/</span>
          <span style={{ color: "#a3a3a3", fontSize: "12px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event?.name}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {saveStatus === "saved" && (
            <span style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.08em" }}>✓ Saved</span>
          )}
          {saveStatus === "error" && (
            <span style={{ fontSize: "11px", color: "#ef4444", letterSpacing: "0.08em" }}>Save failed</span>
          )}

          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            style={{
              background: isDirty ? "white" : "#141414",
              color: isDirty ? "black" : "#333",
              border: "none",
              padding: "0.6rem 1.25rem",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: isDirty ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>

          {/* ── LEFT — form fields ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

            {/* Banner preview + upload */}
            <div style={{ position: "relative", height: 220, overflow: "hidden", marginBottom: "2rem", border: "1px solid #1f1f1f" }}>
              <img src={event?.banner} alt={event?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }} />

              {/* Status chip */}
              <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid #262626", padding: "0.3rem 0.7rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, flexShrink: 0, boxShadow: `0 0 6px ${statusColor}` }} />
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: statusColor, textTransform: "uppercase" }}>{form.status}</span>
              </div>

              {/* Change banner */}
              <label style={{ position: "absolute", bottom: "1rem", right: "1rem", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid #333", color: "#a3a3a3", padding: "0.5rem 0.85rem", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                Change Banner
                <input ref={bannerRef} type="file" accept="image/*" style={{ display: "none" }} onChange={() => setIsDirty(true)} />
              </label>
            </div>

            {/* Form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Name + slug row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Event Name">
                  <input className="field-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Event name" />
                </Field>
                <Field label="Slug">
                  <input className="field-input" value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="event-slug" style={{ fontFamily: "monospace" }} />
                </Field>
              </div>

              <Field label="Tagline">
                <input className="field-input" value={form.tagLine} onChange={e => set("tagLine", e.target.value)} placeholder="A short punchy tagline" />
              </Field>

              <Field label="Description">
                <textarea
                  className="field-input"
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Describe this event…"
                  rows={4}
                  style={{ resize: "vertical", lineHeight: 1.6 }}
                />
              </Field>

              {/* Status + dates row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <Field label="Status">
                  <select className="field-input" value={form.status} onChange={e => set("status", e.target.value as EventStatus)}>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Start Date">
                  <input className="field-input" type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)}
                    style={{ colorScheme: "dark" }}
                  />
                </Field>
                <Field label="End Date">
                  <input className="field-input" type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)}
                    style={{ colorScheme: "dark" }}
                  />
                </Field>
              </div>

            </div>
          </div>

          {/* ── RIGHT — products panel ── */}
          <div style={{ border: "1px solid #141414", background: "#080808" }}>

            {/* Panel header */}
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #141414", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}>Products</p>
                <p style={{ margin: 0, fontSize: "11px", color: "#525252", marginTop: "0.2rem" }}>{products.length} attached</p>
              </div>
              <button style={{ background: "#141414", border: "1px solid #262626", color: "#a3a3a3", padding: "0.45rem 0.8rem", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                + Add
              </button>
            </div>

            {/* Product list */}
            <div style={{ maxHeight: 520, overflowY: "auto" }}>
              {products.length === 0 ? (
                <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                  <p style={{ color: "#333", fontSize: "12px" }}>No products yet</p>
                </div>
              ) : (
                products.map(product => (
                  <div key={product.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid #0f0f0f" }}>
                    <div style={{ width: 44, height: 44, flexShrink: 0, overflow: "hidden", background: "#111" }}>
                      <img src={getPrimaryUrl(product.productImages)} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
                    </div>
                    <button
                      onClick={() => removeProduct(product.id)}
                      style={{ background: "transparent", border: "none", color: "#333", fontSize: "16px", cursor: "pointer", lineHeight: 1, padding: "0.25rem", flexShrink: 0, transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#333")}
                      title="Remove product"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EditEventPage;