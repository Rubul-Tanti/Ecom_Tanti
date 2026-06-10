"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Heart,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Package,
  Link,
} from "lucide-react";
import useEvents from "@/hooks/useEvent";
import { Event } from "@/server/event/types";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type EventStatus = "ACTIVE" | "DRAFT" | "EXPIRED" | "CANCELLED";

interface Favourite { id: number; src: string; alt: string; }

// ─── Variants ─────────────────────────────────────────────────────────────────
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const riseUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};
const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 240, damping: 20 } },
};

// ─── Static Data ──────────────────────────────────────────────────────────────
const categories = ["All", "Active", "Upcoming"];

const favourites: Favourite[] = [
  { id: 1, src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&h=280&fit=crop&crop=faces", alt: "Look 1" },
  { id: 2, src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=280&fit=crop&crop=faces", alt: "Look 2" },
  { id: 3, src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&h=280&fit=crop&crop=faces", alt: "Look 3" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<EventStatus, { bg: string; color: string }> = {
  ACTIVE:    { bg: "rgba(15,110,86,0.15)",  color: "#0F6E56" },
  DRAFT:     { bg: "rgba(24,95,165,0.12)",  color: "#185FA5" },
  EXPIRED:   { bg: "rgba(68,68,65,0.15)",   color: "#888" },
  CANCELLED: { bg: "rgba(99,56,6,0.15)",    color: "#b36a1a" },
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:         "#ffffff",
  surface:    "#f7f5f2",
  surfaceAlt: "#f0ede8",
  border:     "rgba(0,0,0,0.07)",
  borderMid:  "rgba(0,0,0,0.11)",
  ink:        "#111010",
  inkMid:     "#555",
  inkFaint:   "#aaa",
  gold:       "#b8914a",
  goldLight:  "#f0d9a8",
  goldBg:     "#faf3e4",
};

// ─── WishlistBtn ──────────────────────────────────────────────────────────────
function WishlistBtn({ className = "" }: { className?: string }) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      onClick={() => setLiked(!liked)}
      className={`w-8 h-8 rounded-full flex items-center justify-center ${className}`}
      style={{
        background: liked ? "rgba(244,63,94,0.1)" : "rgba(255,255,255,0.88)",
        border: liked ? "1px solid rgba(244,63,94,0.35)" : "1px solid rgba(0,0,0,0.08)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
      }}
    >
      <Heart size={13} fill={liked ? "#f43f5e" : "none"} color={liked ? "#f43f5e" : "#888"} style={{ transition: "all 0.2s" }} />
    </motion.button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SHIMMER = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .sk {
    background: linear-gradient(90deg, #ede9e3 25%, #f5f2ee 50%, #ede9e3 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 12px;
  }
`;

function Sk({ w = "100%", h = "1rem", radius = 12, style = {} }: {
  w?: string; h?: string; radius?: number; style?: React.CSSProperties;
}) {
  return <div className="sk" style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }} />;
}

function EventCardSkeleton() {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
      <Sk w="100%" h="215px" radius={0} />
      <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Sk w="55%" h="16px" />
        <Sk w="60px" h="32px" radius={999} />
      </div>
    </div>
  );
}

function SkeletonRight() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <EventCardSkeleton />
      <EventCardSkeleton />
      <Sk w="100%" h="102px" />
    </div>
  );
}

function SkeletonLeft() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Sk w="100%" h="200px" />
      <Sk w="100%" h="118px" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sk w="100%" h="228px" />
        <Sk w="100%" h="228px" />
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const statusStyle = STATUS_COLORS[event.status] ?? STATUS_COLORS.EXPIRED;
  const router=useRouter()
  return (

    <motion.div
    onClick={()=>router.push(`/event/${event.id}`)}
      variants={riseUp}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: 215 }}>
        <motion.img
          src={event.thumbnail || event.banner}
          alt={event.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 52%, ${T.surface}ee 100%)` }} />

        {/* Status pill */}
        <div className="absolute top-3 left-3">
          <span style={{
            fontSize: 8,
            color: statusStyle.color,
            background: "rgba(255,255,255,0.88)",
            border: `1px solid ${statusStyle.bg}`,
            backdropFilter: "blur(8px)",
            borderRadius: 999,
            padding: "2px 9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}>
            {event.status}
          </span>
        </div>

        <WishlistBtn className="absolute top-3 right-3" />

        {/* Date badge */}
        <div className="absolute bottom-3 left-3">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}
          >
            <Calendar size={9} color={T.inkMid} />
            <span style={{ fontSize: 9, color: T.inkMid, fontWeight: 600 }}>
              {fmt(event.startDate)} → {fmt(event.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between px-3.5 py-3 gap-3">
        <div className="flex-1 min-w-0">
          <p className="truncate" style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: T.ink, lineHeight: 1.3 }}>
            {event.name}
          </p>
          <p className="truncate" style={{ fontSize: 10, color: T.inkMid, marginTop: 2 }}>{event.tagLine}</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.07 }}
          className="flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5"
          style={{ background: T.ink, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}
        >
          <Package size={9} />
          {event._count.products}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyEvents() {
  return (
    <div style={{
      gridColumn: "1 / -1",
      border: `1px dashed ${T.borderMid}`,
      borderRadius: 16,
      padding: "3rem 2rem",
      textAlign: "center",
      background: T.surface,
    }}>
      <Sparkles size={24} color={T.gold} style={{ margin: "0 auto 0.75rem" }} />
      <p style={{ fontSize: 13, color: T.inkMid, fontWeight: 500 }}>No events available right now</p>
      <p style={{ fontSize: 11, color: T.inkFaint, marginTop: 4 }}>Check back soon for new collections</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ExploreHero() {
  const [active, setActive] = useState("All");
  const [favIdx, setFavIdx] = useState(0);

  const { getEventsDashboard } = useEvents();
  const { data, isLoading } = getEventsDashboard();
    const rawData:any = data?.data;
  const allEvents: Event[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.events)
    ? rawData.events
    : Array.isArray(rawData?.data)
    ? rawData.data
    : [];

  // Filter by category tab
  const filtered = allEvents.filter((e) => {
    if (active === "All") return true;
    if (active === "Active") return e.status === "ACTIVE";
    if (active === "Upcoming") return e.status === "DRAFT";
    return true;
  });

  // Split into two columns
  const leftEvents  = filtered.filter((_, i) => i % 2 === 0);
  const rightEvents = filtered.filter((_, i) => i % 2 === 1);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: T.bg }} className="">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&display=swap');
        * { box-sizing: border-box; }
        ${SHIMMER}
      `}</style>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">

        {/* ── HEADER ── */}
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="flex items-center justify-between py-4 mb-1"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700, color: T.ink, letterSpacing: "-0.3px", lineHeight: 1 }}>
              Explore
            </h1>
            <p style={{ fontSize: 9, color: T.inkFaint, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 3 }}>
              New Season · SS25
            </p>
          </div>

          {/* Category pills */}
          {/* <div className="flex items-center gap-1">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.94 }}
                onClick={() => setActive(cat)}
                className="relative px-4 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: active === cat ? T.ink : "transparent",
                  color: active === cat ? "#fff" : T.inkMid,
                  border: active === cat ? `1px solid ${T.ink}` : `1px solid transparent`,
                  transition: "all 0.18s ease",
                }}
              >
                {cat}
                {active === cat && (
                  <motion.span
                    layoutId="activeDot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: T.gold }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
              </motion.button>
            ))}
          </div> */}

          {/* Actions */}
          {/* <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium relative"
              style={{ background: T.surface, color: T.inkMid, border: `1px solid ${T.border}` }}
            >
              <SlidersHorizontal size={12} />
              <span className="hidden sm:inline">Filter</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: T.gold, boxShadow: `0 0 6px ${T.gold}aa` }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}
            >
              <Search size={14} color={T.inkMid} />
            </motion.button>
          </div> */}
        </motion.header>

        {/* ── GRID ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <SkeletonLeft />
            <SkeletonRight />
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4"
          >
            {/* ── LEFT COLUMN ── */}
            <div className="flex flex-col gap-3">

              {/* Real events — left column */}
              {leftEvents.length > 0
                ? leftEvents.map((event) => <EventCard key={event.id} event={event} />)
                : null
              }

              {/* SAVED / FAVOURITES — always shown */}
              <motion.div
                variants={popIn}
                className="rounded-2xl flex flex-col overflow-hidden"
                style={{ height: 228, background: T.surface, border: `1px solid ${T.border}` }}
              >
                <div className="flex items-center justify-between px-3 pt-3 pb-2 flex-shrink-0">
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.ink, letterSpacing: "0.03em" }}>Saved</span>
                  <div className="flex gap-1">
                    {[
                      { dir: "prev", icon: <ChevronLeft size={10} color={T.inkMid} />, disabled: favIdx === 0, action: () => setFavIdx(i => Math.max(0, i - 1)) },
                      { dir: "next", icon: <ChevronRight size={10} color={T.inkMid} />, disabled: favIdx >= favourites.length - 2, action: () => setFavIdx(i => Math.min(favourites.length - 2, i + 1)) },
                    ].map(btn => (
                      <motion.button
                        key={btn.dir}
                        whileTap={{ scale: 0.82 }}
                        onClick={btn.action}
                        disabled={btn.disabled}
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "#fff", border: `1px solid ${T.borderMid}`, opacity: btn.disabled ? 0.3 : 1, transition: "opacity 0.15s" }}
                      >
                        {btn.icon}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1.5 flex-1 px-3 overflow-hidden min-h-0">
                  <AnimatePresence mode="popLayout">
                    {favourites.slice(favIdx, favIdx + 2).map(fav => (
                      <motion.div
                        key={fav.id}
                        initial={{ opacity: 0, x: 16, scale: 0.92 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -16, scale: 0.92 }}
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                        className="flex-1 rounded-xl overflow-hidden"
                      >
                        <img src={fav.src} alt={fav.alt} className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ color: T.gold }}
                  className="flex-shrink-0 text-center py-2.5 transition-colors"
                  style={{ fontSize: 9, color: T.inkMid, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}
                >
                  View All
                </motion.button>
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex flex-col gap-3">
              {rightEvents.length > 0
                ? rightEvents.map((event) => <EventCard key={event.id} event={event} />)
                : null
              }

              {/* Empty state if both columns are empty */}
              {filtered.length === 0 && <EmptyEvents />}


            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}