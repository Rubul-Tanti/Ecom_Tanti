"use client";

import { useState, useMemo } from "react";
import { Search, Star, Circle, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "Delivered" | "Cancelled" | "On the way" | "Returned";

interface Order {
  id: number;
  name: string;
  color?: string;
  size?: string;
  price: string;
  status: OrderStatus;
  statusDate: string;
  statusNote: string;
  canReview: boolean;
  imgSrc: string;
  year: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const orders: Order[] = [
  {
    id: 1,
    name: "Samsung Essential Series S3 60.4 cm (24 ...",
    color: "Black",
    size: "23.77953",
    price: "₹6,854",
    status: "Delivered",
    statusDate: "Jan 19",
    statusNote: "Your item has been delivered",
    canReview: true,
    imgSrc: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=160&h=160&fit=crop",
    year: 2025,
  },
  {
    id: 2,
    name: "Acer 60.45 cm (24 inch) Full HD LED Back...",
    color: "Black",
    size: "23.8",
    price: "₹6,255",
    status: "Cancelled",
    statusDate: "Jan 17",
    statusNote: "Your order was cancelled as per your request.",
    canReview: false,
    imgSrc: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=160&h=160&fit=crop",
    year: 2025,
  },
  {
    id: 3,
    name: "Medellin 38\" matt black Acoustic Guitar ...",
    color: "Black",
    price: "₹1,599",
    status: "Cancelled",
    statusDate: "Jan 02",
    statusNote: "Your order was cancelled as per your request.",
    canReview: false,
    imgSrc: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=160&h=160&fit=crop",
    year: 2025,
  },
  {
    id: 4,
    name: "BLUEBERRY B-D38S 38Inch Inbuilt TrussRod...",
    color: "Brown",
    price: "₹2,184",
    status: "Cancelled",
    statusDate: "Nov 24, 2025",
    statusNote: "Your order was cancelled as per your request.",
    canReview: false,
    imgSrc: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=160&h=160&fit=crop",
    year: 2025,
  },
  {
    id: 5,
    name: "FRKB 4-Pack Mini Padlock Luggage Locks w...",
    color: "Multicolor",
    price: "₹229",
    status: "Cancelled",
    statusDate: "May 11, 2025",
    statusNote: "Your order was cancelled as per your request.",
    canReview: false,
    imgSrc: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&h=160&fit=crop",
    year: 2025,
  },
  {
    id: 6,
    name: "CASIO HL100LB Portable Basic Calculator",
    color: "Grey",
    size: "Small",
    price: "₹192",
    status: "Delivered",
    statusDate: "Apr 12, 2025",
    statusNote: "Your item has been delivered",
    canReview: true,
    imgSrc: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=160&h=160&fit=crop",
    year: 2025,
  },
  {
    id: 7,
    name: "Boat Rockerz 450 Wireless Headphones",
    color: "Blue",
    price: "₹1,299",
    status: "On the way",
    statusDate: "Feb 27",
    statusNote: "Expected delivery by tomorrow",
    canReview: false,
    imgSrc: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&h=160&fit=crop",
    year: 2025,
  },
  {
    id: 8,
    name: "Nike Air Max 270 Running Shoes",
    color: "White/Black",
    size: "UK 9",
    price: "₹8,995",
    status: "Returned",
    statusDate: "Dec 15, 2024",
    statusNote: "Return processed successfully",
    canReview: false,
    imgSrc: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop",
    year: 2024,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<OrderStatus, { color: string; dot: string }> = {
  Delivered: { color: "#16a34a", dot: "#16a34a" },
  Cancelled: { color: "#dc2626", dot: "#dc2626" },
  "On the way": { color: "#2563eb", dot: "#2563eb" },
  Returned: { color: "#f59e0b", dot: "#f59e0b" },
};

// ─── Order Row ────────────────────────────────────────────────────────────────

function OrderRow({ order }: { order: Order }) {
  const cfg = statusConfig[order.status];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        cursor: "pointer",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Product image */}
      <img
        src={order.imgSrc}
        alt={order.name}
        style={{
          width: 80,
          height: 80,
          objectFit: "contain",
          borderRadius: 6,
          flexShrink: 0,
          background: "#f9fafb",
          padding: 4,
        }}
        draggable={false}
      />

      {/* Name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: "#111",
            margin: "0 0 6px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {order.name}
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#888",
            margin: 0,
          }}
        >
          {[order.color && `Color: ${order.color}`, order.size && `Size: ${order.size}`]
            .filter(Boolean)
            .join("   ")}
        </p>
      </div>

      {/* Price */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 15,
          color: "#111",
          minWidth: 80,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {order.price}
      </p>

      {/* Status */}
      <div style={{ minWidth: 240, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          {/* Status dot */}
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: cfg.dot,
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: cfg.color,
            }}
          >
            {order.status} on {order.statusDate}
          </span>
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#888",
            margin: "0 0 6px 15px",
          }}
        >
          {order.statusNote}
        </p>
        {order.canReview && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginLeft: 15,
              cursor: "pointer",
            }}
          >
            <Star size={13} fill="#2563eb" color="#2563eb" />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "#2563eb",
                fontWeight: 500,
              }}
            >
              Rate &amp; Review Product
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: OrderStatus[] = ["On the way", "Delivered", "Cancelled", "Returned"];
const TIME_FILTERS = ["Last 30 days", "2025", "2024", "Older"];

export default function MyOrders() {
  const [search, setSearch] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());
  const [activeTimes, setActiveTimes] = useState<Set<string>>(new Set());

  const toggleSet = (set: Set<string>, value: string): Set<string> => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search || o.name.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        activeStatuses.size === 0 || activeStatuses.has(o.status);

      const matchTime = (() => {
        if (activeTimes.size === 0) return true;
        const now = new Date();
        if (activeTimes.has("Last 30 days")) {
          const d = new Date(o.statusDate + ", 2025");
          const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
          if (diff <= 30) return true;
        }
        if (activeTimes.has("2025") && o.year === 2025) return true;
        if (activeTimes.has("2024") && o.year === 2024) return true;
        if (activeTimes.has("Older") && o.year < 2024) return true;
        return false;
      })();

      return matchSearch && matchStatus && matchTime;
    });
  }, [search, activeStatuses, activeTimes]);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f3f4f6",
        minHeight: "100vh",
        padding: "20px 16px",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 20,
          fontSize: 13,
          color: "#888",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {["Home", "My Account", "My Orders"].map((crumb, i, arr) => (
          <span key={crumb} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                color: i === arr.length - 1 ? "#111" : "#888",
                cursor: i < arr.length - 1 ? "pointer" : "default",
                fontWeight: i === arr.length - 1 ? 600 : 400,
              }}
            >
              {crumb}
            </span>
            {i < arr.length - 1 && <ChevronRight size={13} color="#bbb" />}
          </span>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── Filters Sidebar ── */}
        <div
          style={{
            width: 200,
            flexShrink: 0,
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            padding: "20px 18px",
            position: "sticky",
            top: 20,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#111",
              margin: "0 0 16px",
            }}
          >
            Filters
          </p>

          {/* Order Status */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              color: "#555",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}
          >
            Order Status
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {STATUS_FILTERS.map((s) => (
              <label
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#333",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <input
                  type="checkbox"
                  checked={activeStatuses.has(s)}
                  onChange={() => setActiveStatuses(toggleSet(activeStatuses, s))}
                  style={{ accentColor: "#2563eb", width: 14, height: 14, cursor: "pointer" }}
                />
                {s}
              </label>
            ))}
          </div>

          {/* Order Time */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              color: "#555",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}
          >
            Order Time
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TIME_FILTERS.map((t) => (
              <label
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#333",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <input
                  type="checkbox"
                  checked={activeTimes.has(t)}
                  onChange={() => setActiveTimes(toggleSet(activeTimes, t))}
                  style={{ accentColor: "#2563eb", width: 14, height: 14, cursor: "pointer" }}
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        {/* ── Orders Panel ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Search bar */}
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "0 14px",
              }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your orders here"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  color: "#333",
                  fontFamily: "'DM Sans', sans-serif",
                  padding: "12px 0",
                  background: "transparent",
                }}
              />
            </div>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0 20px",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <Search size={15} />
              Search Orders
            </button>
          </div>

          {/* Order rows */}
          {filtered.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                padding: "48px 24px",
                textAlign: "center",
                color: "#aaa",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              No orders found.
            </div>
          ) : (
            filtered.map((order) => <OrderRow key={order.id} order={order} />)
          )}
        </div>
      </div>
    </div>
  );
}