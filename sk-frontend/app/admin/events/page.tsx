"use client";

import EventForm from "@/components/admin/event/createEventForm";
import useEvents from "@/hooks/useEvent";
import { Event } from "@/server/event/types";
import Link from "next/link";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type EventStatus = "ACTIVE" | "DRAFT" | "EXPIRED" | "CANCELLED";

const STATUS_STYLES: Record<EventStatus, string> = {
  ACTIVE: "bg-[#0F6E56] text-[#9FE1CB]",
  DRAFT: "bg-[#185FA5] text-[#B5D4F4]",
  EXPIRED: "bg-[#444441] text-[#D3D1C7]",
  CANCELLED: "bg-[#633806] text-[#FAC775]",
};

const SHIMMER_CSS = `
  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .sk {
    background: linear-gradient(90deg, #111 25%, #1e1e1e 50%, #111 75%);
    background-size: 700px 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: 2px;
  }
`;

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function Sk({ w = "100%", h = "1rem", style = {} }: {
  w?: string; h?: string; style?: React.CSSProperties;
}) {
  return <div className="sk" style={{ width: w, height: h, borderRadius: 2, ...style }} />;
}

function StatBlockSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <Sk w="80px" h="3.5rem" />
      <Sk w="60px" h="11px" />
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div style={{ background: "#0a0a0a", overflow: "hidden" }}>
      {/* image area */}
      <Sk w="100%" h="11rem" style={{ borderRadius: 0 }} />
      {/* content */}
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.75rem", borderBottom: "1px solid #1f1f1f" }}>
          <Sk w="80px" h="11px" />
          <Sk w="80px" h="11px" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <Sk w="30px" h="1rem" />
            <Sk w="55px" h="11px" />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Sk w="52px" h="30px" />
            <Sk w="60px" h="30px" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div style={{ minHeight: "100vh", color: "white" }}>
      {/* Header */}
      <div style={{ background: "#0a0a0a", padding: "0.75rem 2rem 2rem", borderBottom: "1px solid #171717" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Sk w="180px" h="clamp(3.5rem, 9vw, 6rem)" style={{ borderRadius: 2 }} />
          <Sk w="140px" h="clamp(3.5rem, 9vw, 6rem)" style={{ borderRadius: 2 }} />
        </div>
        <Sk w="140px" h="42px" style={{ marginTop: "1.5rem" }} />
      </div>

      {/* Stats */}
      <div style={{
        background: "#0a0a0a",
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "2rem",
        padding: "2rem",
        borderBottom: "1px solid #171717",
      }}>
        {Array.from({ length: 4 }).map((_, i) => <StatBlockSkeleton key={i} />)}
      </div>

      {/* Grid */}
      <div style={{
        background: "#0a0a0a",
        padding: "1.5rem 2rem 4rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
        gap: "1rem",
      }}>
        {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

// ─── Components ──────────────────────────────────────────────────────────────

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(2.5rem,5vw,3.5rem)",
        color: "white",
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: "-0.03em",
      }}>
        {value}
      </span>
      <span style={{
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.15em",
        color: "#737373",
        textTransform: "uppercase",
      }}>
        {label}
      </span>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <div
      className="group"
      style={{ position: "relative", background: "#0a0a0a", overflow: "hidden", transition: "all 0.25s ease" }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", height: "11rem", overflow: "hidden", background: "#171717" }}>
        <img
          src={event.thumbnail || event.banner}
          alt={event.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s ease" }}
          className="group-hover:scale-105"
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15))" }} />

        {/* status */}
        <span
          className={STATUS_STYLES[event.status]}
          style={{
            position: "absolute", top: "0.75rem", right: "0.75rem",
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "0.35rem 0.65rem",
            borderRadius: "999px", backdropFilter: "blur(8px)",
          }}
        >
          {event.status}
        </span>

        {/* title */}
        <div style={{ position: "absolute", bottom: "1rem", left: "1rem", right: "1rem" }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.04em", color: "white", lineHeight: 1, margin: 0 }}>
            {event.name}
          </h3>
          <p style={{ color: "#d4d4d4", fontSize: "12px", marginTop: "0.2rem", fontWeight: 500 }}>
            {event.tagLine}
          </p>
        </div>
      </div>

      {/* content */}
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#737373", fontFamily: "monospace", borderBottom: "1px solid #1f1f1f", paddingBottom: "0.75rem" }}>
          <span>{fmt(event.startDate)}</span>
          <span style={{ color: "#525252" }}>→</span>
          <span>{fmt(event.endDate)}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "white", fontSize: "1rem", fontWeight: 700, margin: 0 }}>{event._count.products}</p>
            <span style={{ color: "#737373", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Products</span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Link
              href={`/admin/events/${event.id}`}
              style={{ background: "#171717", border: "1px solid #262626", color: "white", padding: "0.45rem 0.8rem", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              Edit
            </Link>
            <button
              style={{ background: "transparent", border: "1px solid #262626", color: "#a3a3a3", padding: "0.45rem 0.8rem", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ gridColumn: "1 / -1", border: "1px dashed #262626", padding: "5rem 2rem", textAlign: "center" }}>
      <p style={{ color: "#737373", marginBottom: "1.25rem", fontSize: "14px" }}>No events yet</p>
      <button
        onClick={onNew}
        style={{ background: "white", color: "black", border: "none", padding: "0.85rem 1.5rem", fontWeight: 700, cursor: "pointer", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.08em" }}
      >
        Create First Event
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EventCatalogPage() {
  const [openForm, setOpenForm] = useState(false);
  const { getEvents } = useEvents();

  const { data, isLoading } = getEvents();

  const events = data?.data?.events ?? [];
  const totalEvents = data?.data?.events?.length ?? 0;
  const published = data?.data?.totalActive ?? 0;
  const drafts = data?.data?.totalDraft ?? 0;
  const totalProducts = data?.data?.totalProducts ?? 0;

  // ✅ Show full skeleton while loading
  if (isLoading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background: #0a0a0a; }
          ${SHIMMER_CSS}
        `}</style>
        <CatalogSkeleton />
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0a; }
      `}</style>

      <div style={{ minHeight: "100vh", color: "white" }}>

        {/* Header */}
        <div style={{ background: "#0a0a0a", padding: "0.75rem 2rem 2rem", borderBottom: "1px solid #171717" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3.5rem, 9vw, 6rem)", lineHeight: 0.9, letterSpacing: "0.02em", margin: 0 }}>
            Event<br />
            <span style={{ color: "#737373" }}>Catalog</span>
          </h1>

          <button
            onClick={() => setOpenForm(!openForm)}
            style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid white", background: "white", color: "black", padding: "0.75rem 1.5rem", fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
          >
            <span style={{ fontSize: "1.1rem" }}>+</span>
            New Event
          </button>
        </div>

        {/* Stats */}
        <div style={{ background: "#0a0a0a", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2rem", padding: "2rem", borderBottom: "1px solid #171717" }}>
          <StatBlock value={String(totalEvents)} label="Total Events" />
          <StatBlock value={String(published)} label="Active" />
          <StatBlock value={String(drafts)} label="Drafts" />
          <StatBlock value={String(totalProducts)} label="Products" />
        </div>

        {/* Create Event Form */}
        {openForm && <EventForm onClose={() => setOpenForm(false)} />}

        {/* ✅ Grid — dark background (was white) */}
        <div style={{ background: "#0a0a0a", padding: "1.5rem 2rem 4rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1rem" }}>
          {events.length === 0
            ? <EmptyState onNew={() => setOpenForm(true)} />
            : events.map((event) => <EventCard key={event.id} event={event} />)
          }
        </div>

      </div>
    </>
  );
}