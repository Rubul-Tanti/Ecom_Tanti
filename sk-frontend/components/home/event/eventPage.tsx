'use client'

import { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import {
  ArrowLeft, Calendar, Package, Tag, Star,
  RotateCcw, ShieldCheck, ChevronLeft, ChevronRight,
  Layers, Circle, ShoppingBag, Heart, ArrowUpRight,
} from "lucide-react"
import useEvents from "@/hooks/useEvent"
import ProductCard from "../product/productCard"


// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#f8f5f0", surface: "#ffffff", card: "#faf8f5",
  border: "rgba(0,0,0,0.07)", borderMid: "rgba(0,0,0,0.13)",
  ink: "#0e0c0a", inkMid: "#6b6560", inkFaint: "#b0aa9f",
  gold: "#b8874a", goldLight: "#f5e8d4", goldDark: "#8a5f2a",
  red: "#c94040", green: "#2d7a4f",
}

// ─── Keyframes only — no class rules ─────────────────────────────────────────
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=DM+Mono:wght@300;400&family=Instrument+Sans:wght@400;500;600&display=swap');
  @keyframes shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position:  800px 0; }
  }
  @keyframes badge-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(45,122,79,0.35); }
    50%       { box-shadow: 0 0 0 5px rgba(45,122,79,0); }
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}


// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ w = "100%", h = "14px", r = 4, style = {} }: { w?: string; h?: string; r?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      background: "linear-gradient(90deg, #ede8e0 25%, #f5f0e8 50%, #ede8e0 75%)",
      backgroundSize: "800px 100%",
      animation: "shimmer 1.5s infinite linear",
      ...style,
    }} />
  )
}

function PageSkeleton() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <style>{KEYFRAMES}</style>
      <Sk w="100%" h="420px" r={0} />
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <Sk w="100%" h="260px" r={0} />
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <Sk w="80%" h="14px" />
                <Sk w="50%" h="12px" />
                <Sk w="100%" h="36px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  ACTIVE:    { label: "Live Now",   dot: T.green,    pulse: true  },
  DRAFT:     { label: "Upcoming",   dot: "#3b82f6",  pulse: false },
  EXPIRED:   { label: "Ended",      dot: T.inkFaint, pulse: false },
  CANCELLED: { label: "Cancelled",  dot: T.red,      pulse: false },
}



// ─── Main Page ────────────────────────────────────────────────────────────────
const EventPage = ({ id }: { id: string }) => {
  const { getEventsById } = useEvents()
  const { data, isLoading } = getEventsById(id)

  if (isLoading) return <PageSkeleton />

  const event = data?.data
  if (!event) return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{KEYFRAMES}</style>
      <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: T.inkMid, fontStyle: "italic" }}>Event not found</p>
    </div>
  )

  const status = STATUS_MAP[event.status] ?? STATUS_MAP.EXPIRED
  const staggerV: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
  }
  const cardV: Variants = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 26 } },
  }

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", background: T.bg, minHeight: "100vh", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
      <style>{KEYFRAMES}</style>

      {/* ── Hero ── */}
      <div style={{ position: "relative", height: 440, overflow: "hidden" }}>
        <img
          src={event.banner}
          alt={event.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(14,12,10,0.15) 0%, rgba(14,12,10,0.7) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 40px 36px" }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 2, padding: "5px 10px", marginBottom: 14 }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.dot, flexShrink: 0, animation: status.pulse ? "badge-pulse 2s ease-in-out infinite" : "none" }} />
            <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{status.label}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, type: "spring", stiffness: 200, damping: 22 }}
            style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px,5vw,58px)", fontWeight: 300, fontStyle: "italic", color: "#fff", lineHeight: 0.95, letterSpacing: "-1px", marginBottom: 10 }}
          >
            {event.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
            style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", maxWidth: 480, lineHeight: 1.5, marginBottom: 20 }}
          >
            {event.tagLine}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { icon: <Calendar size={11} />, text: `${fmtDate(event.startDate)} — ${fmtDate(event.endDate)}` },
              { icon: <Package size={11} />, text: `${event._count.products} Products` },
            ].map((chip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 2, padding: "5px 10px" }}>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{chip.icon}</span>
                <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.75)", letterSpacing: "0.04em" }}>{chip.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Description strip ── */}
      {event.description && (
        <div style={{ background: T.goldLight, borderBottom: `1px solid rgba(184,135,74,0.2)`, padding: "16px 40px", display: "flex", alignItems: "center", gap: 12 }}>
          <Tag size={13} color={T.goldDark} />
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontStyle: "italic", color: T.goldDark, lineHeight: 1.5 }}>{event.description}</p>
        </div>
      )}

      {/* ── Products ── */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 24px 64px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: T.inkFaint, marginBottom: 6 }}>Collection</p>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 300, color: T.ink, lineHeight: 1 }}>All Products</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 3, border: `1px solid ${T.border}`, background: T.surface }}>
            <Layers size={12} color={T.inkMid} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: T.inkMid }}>{event.products.length} items</span>
          </div>
        </div>

        {event.products.length === 0 ? (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <Package size={32} color={T.inkFaint} style={{ margin: "0 auto 16px" }} />
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontStyle: "italic", color: T.inkMid }}>No products in this collection yet</p>
          </div>
        ) : (
          <motion.div
            variants={staggerV} initial="hidden" animate="show"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}
          >
            {event.products.map(product => (
              <motion.div key={product.id} variants={cardV}>
                <ProductCard key={product.id} item={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default EventPage