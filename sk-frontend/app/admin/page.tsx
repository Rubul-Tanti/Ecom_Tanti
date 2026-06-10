"use client";

import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "fulfilled" | "pending" | "cancelled";
  time: string;
}

interface ActivityItem {
  id: string;
  type: "order" | "product" | "customer" | "alert";
  message: string;
  detail: string;
  time: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const RECENT_ORDERS: Order[] = [
  { id: "#4821", customer: "Lena Hoffmann",   product: "Obsidian Tee",        amount: 89,  status: "fulfilled", time: "2m ago" },
  { id: "#4820", customer: "Marcus Webb",     product: "Raw Edge Hoodie",     amount: 210, status: "pending",   time: "14m ago" },
  { id: "#4819", customer: "Aiko Tanaka",     product: "Cargo Wide Leg",      amount: 175, status: "fulfilled", time: "1h ago" },
  { id: "#4818", customer: "Julien Moreau",   product: "Matte Leather Pant",  amount: 290, status: "cancelled", time: "2h ago" },
  { id: "#4817", customer: "Priya Nair",      product: "Minimal Knit Vest",   amount: 130, status: "fulfilled", time: "3h ago" },
  { id: "#4816", customer: "Sam Okafor",      product: "Contrast Seam Jacket",amount: 340, status: "pending",   time: "5h ago" },
];

const ACTIVITY: ActivityItem[] = [
  { id: "a1", type: "order",    message: "New order placed",       detail: "#4821 — Lena Hoffmann",         time: "2m" },
  { id: "a2", type: "product",  message: "Low stock alert",        detail: "Cargo Wide Leg — 7 units left", time: "18m" },
  { id: "a3", type: "customer", message: "New customer registered", detail: "marcus.webb@email.com",         time: "32m" },
  { id: "a4", type: "order",    message: "Order fulfilled",        detail: "#4819 — Aiko Tanaka",           time: "1h" },
  { id: "a5", type: "alert",    message: "Payment failed",         detail: "#4818 — Julien Moreau",         time: "2h" },
  { id: "a6", type: "product",  message: "Product published",      detail: "Minimal Knit Vest → Active",    time: "3h" },
];

// Weekly revenue sparkline data (last 7 days)
const SPARKLINE = [4200, 3800, 5100, 4700, 6200, 5800, 7340];
const SPARK_MAX = Math.max(...SPARKLINE);

// Monthly revenue bars (last 6 months)
const MONTHLY = [
  { month: "OCT", value: 38400 },
  { month: "NOV", value: 52100 },
  { month: "DEC", value: 71800 },
  { month: "JAN", value: 44200 },
  { month: "FEB", value: 59600 },
  { month: "MAR", value: 73400 },
];
const MONTHLY_MAX = Math.max(...MONTHLY.map(m => m.value));

// ─── Sparkline SVG ───────────────────────────────────────────────────────────
function Sparkline({ data, color = "#0a0a0a" }: { data: number[]; color?: string }) {
  const W = 120, H = 36;
  const max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${H} ` + pts + ` ${W},${H}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ display: "block" }}>
      <polygon points={area} fill={color} opacity="0.08" />
      <polyline points={pts} stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function OrderStatus({ status }: { status: Order["status"] }) {
  const map = {
    fulfilled: { label: "Fulfilled", bg: "#0a0a0a", color: "#fff" },
    pending:   { label: "Pending",   bg: "#f0f0f0", color: "#555" },
    cancelled: { label: "Cancelled", bg: "#f5e8e8", color: "#cc2200" },
  };
  const s = map[status];
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px",
      fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase",
      fontFamily: "'Syne', sans-serif", fontWeight: 600,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

// ─── Activity Icon ────────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const icons = {
    order:    <path d="M1 1h2l2 7h7l2-5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>,
    product:  <><rect x="1" y="4" width="12" height="9" stroke="currentColor" strokeWidth="1.3"/><path d="M5 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.3"/></>,
    customer: <><circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M1 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
    alert:    <><path d="M7 1L1 12h12L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 6v3M7 11v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
  };
  const colors = { order: "#0a0a0a", product: "#555", customer: "#0a0a0a", alert: "#cc2200" };
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: colors[type], flexShrink: 0, marginTop: 1 }}>
      {icons[type]}
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "activity">("orders");

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        .db-root {
          padding: 36px 40px 60px;
          font-family: 'Syne', sans-serif;
          color: #0a0a0a;
          background: #f4f4f2;
          min-height: 100%;
        }

        /* ── Page header ── */
        .db-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeUp 0.35s ease both;
        }

        .db-greeting {
          font-size: 10px; letter-spacing: 5px; text-transform: uppercase;
          color: #aaa; margin-bottom: 6px;
        }

        .db-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(42px, 6vw, 64px);
          line-height: 0.9; letter-spacing: -1px; color: #0a0a0a;
        }

        .db-title span { color: #ccc; }

        .db-date {
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          color: #aaa; text-align: right;
        }

        .db-live-dot {
          display: inline-block; width: 6px; height: 6px;
          border-radius: 50%; background: #22aa55;
          margin-right: 6px; vertical-align: middle;
          animation: pulse 2s ease infinite;
        }

        /* ── KPI strip ── */
        .db-kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          margin-bottom: 28px;
          animation: fadeUp 0.4s 0.05s ease both;
        }

        .db-kpi {
          background: #fff;
          padding: 24px 24px 20px;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s;
          cursor: default;
        }

        .db-kpi:hover { transform: translateY(-2px); }

        .db-kpi::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: #0a0a0a;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }
        .db-kpi:hover::after { transform: scaleX(1); }

        .db-kpi-label {
          font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
          color: #aaa; margin-bottom: 10px;
        }

        .db-kpi-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px; line-height: 1; letter-spacing: -1px; color: #0a0a0a;
        }

        .db-kpi-sub {
          display: flex; align-items: center; gap: 6px;
          margin-top: 8px; font-size: 11px; color: #aaa;
        }

        .db-kpi-delta {
          font-size: 10px; letter-spacing: 1px; font-weight: 600;
          padding: 2px 6px;
        }

        .db-kpi-delta.up   { background: #e8f5ee; color: #22aa55; }
        .db-kpi-delta.down { background: #f5e8e8; color: #cc2200; }

        .db-kpi-spark {
          position: absolute; bottom: 12px; right: 12px;
          opacity: 0.5;
        }

        /* ── Main grid ── */
        .db-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          margin-bottom: 20px;
          animation: fadeUp 0.4s 0.1s ease both;
        }

        /* ── Card base ── */
        .db-card {
          background: #fff;
        }

        .db-card-head {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex; align-items: center; justify-content: space-between;
        }

        .db-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 2px; color: #0a0a0a;
        }

        .db-card-sub {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #bbb;
        }

        /* ── Revenue chart ── */
        .db-chart {
          padding: 24px 24px 20px;
        }

        .db-chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          height: 140px;
        }

        .db-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
          justify-content: flex-end;
          cursor: pointer;
        }

        .db-bar-val {
          font-size: 9px; letter-spacing: 1px;
          color: #bbb; font-family: 'Syne', sans-serif;
          opacity: 0; transition: opacity 0.15s;
          white-space: nowrap;
        }

        .db-bar-col:hover .db-bar-val { opacity: 1; }

        .db-bar {
          width: 100%;
          background: #e8e8e8;
          transition: background 0.15s, transform 0.15s;
          transform-origin: bottom;
          animation: barGrow 0.6s cubic-bezier(0.4,0,0.2,1) both;
        }

        .db-bar.active { background: #0a0a0a; }
        .db-bar-col:hover .db-bar { background: #0a0a0a; }

        .db-bar-label {
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
          color: #bbb; font-family: 'Syne', sans-serif;
          transition: color 0.15s;
        }

        .db-bar-col:hover .db-bar-label,
        .db-bar-col.active .db-bar-label { color: #0a0a0a; }

        .db-chart-total {
          margin-top: 20px; padding-top: 20px;
          border-top: 1px solid #f0f0f0;
          display: flex; align-items: baseline; gap: 12px;
        }

        .db-chart-total-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px; letter-spacing: -1px; color: #0a0a0a;
        }

        .db-chart-total-label {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #aaa;
        }

        /* ── Top products ── */
        .db-products { padding: 0; }

        .db-product-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 24px;
          border-bottom: 1px solid #f8f8f8;
          transition: background 0.15s;
        }

        .db-product-row:last-child { border-bottom: none; }
        .db-product-row:hover { background: #fafafa; }

        .db-product-rank {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 0; color: #e0e0e0;
          width: 28px; flex-shrink: 0; text-align: center;
        }

        .db-product-info { flex: 1; min-width: 0; }

        .db-product-name {
          font-size: 13px; font-weight: 600; color: #0a0a0a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .db-product-cat {
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #bbb; margin-top: 1px;
        }

        .db-product-bar-wrap {
          width: 60px; flex-shrink: 0;
        }

        .db-product-bar-track {
          height: 3px; background: #f0f0f0; position: relative;
        }

        .db-product-bar-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: #0a0a0a;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
        }

        .db-product-revenue {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 0.5px; color: #0a0a0a;
          width: 60px; text-align: right; flex-shrink: 0;
        }

        /* ── Bottom row ── */
        .db-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          animation: fadeUp 0.4s 0.15s ease both;
        }

        /* ── Tabs ── */
        .db-tabs {
          display: flex; gap: 0;
        }

        .db-tab {
          padding: 8px 16px;
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          font-family: 'Syne', sans-serif; font-weight: 600;
          cursor: pointer; color: #bbb;
          border: none; background: none;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
        }

        .db-tab.active { color: #0a0a0a; border-bottom-color: #0a0a0a; }
        .db-tab:hover  { color: #555; }

        /* ── Orders table ── */
        .db-orders { overflow-x: auto; }

        .db-ot {
          width: 100%; border-collapse: collapse; font-size: 12px;
        }

        .db-ot th {
          padding: 10px 20px;
          text-align: left;
          font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
          color: #bbb; font-weight: 600; border-bottom: 2px solid #0a0a0a;
          font-family: 'Syne', sans-serif;
          white-space: nowrap;
        }

        .db-ot td {
          padding: 13px 20px;
          border-bottom: 1px solid #f4f4f4;
          vertical-align: middle; color: #0a0a0a;
        }

        .db-ot tbody tr { transition: background 0.12s; }
        .db-ot tbody tr:hover { background: #fafafa; }
        .db-ot tbody tr:last-child td { border-bottom: none; }

        .db-ot-id { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; }
        .db-ot-customer { font-weight: 600; }
        .db-ot-time { font-size: 10px; letter-spacing: 1px; color: #ccc; }
        .db-ot-amount { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.5px; }

        /* ── Activity feed ── */
        .db-feed { padding: 0; }

        .db-feed-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 24px;
          border-bottom: 1px solid #f8f8f8;
          transition: background 0.12s;
        }

        .db-feed-item:last-child { border-bottom: none; }
        .db-feed-item:hover { background: #fafafa; }

        .db-feed-icon {
          width: 30px; height: 30px; flex-shrink: 0;
          background: #f4f4f2;
          display: flex; align-items: center; justify-content: center;
        }

        .db-feed-body { flex: 1; min-width: 0; }

        .db-feed-msg { font-size: 12px; font-weight: 600; color: #0a0a0a; }
        .db-feed-detail { font-size: 11px; color: #aaa; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-feed-time { font-size: 9px; letter-spacing: 2px; color: #ccc; flex-shrink: 0; margin-top: 2px; }

        /* ── Quick stats row ── */
        .db-qstats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: #e8e8e8;
        }

        .db-qstat {
          background: #fff; padding: 18px 20px;
          display: flex; flex-direction: column; gap: 4px;
        }

        .db-qstat-label {
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #bbb;
        }

        .db-qstat-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; letter-spacing: 0; color: #0a0a0a; line-height: 1;
        }

        @media (max-width: 900px) {
          .db-grid   { grid-template-columns: 1fr; }
          .db-bottom { grid-template-columns: 1fr; }
          .db-kpis   { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 560px) {
          .db-root { padding: 24px 20px 48px; }
          .db-kpis { grid-template-columns: 1fr 1fr; }
          .db-kpi-value { font-size: 36px; }
        }
      `}</style>

      <div className="db-root">

        {/* ── Page header ── */}
        <div className="db-header">
          <div>
            <p className="db-greeting">Admin Panel · TANTI</p>
            <h1 className="db-title">
              GOOD <span>MORNING,</span><br />DASHBOARD
            </h1>
          </div>
          <div className="db-date">
            <span className="db-live-dot" />
            Live
            <br />
            {today}
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="db-kpis">
          {[
            {
              label: "Revenue Today",
              value: "$7,340",
              delta: "+18%",
              dir: "up",
              sub: "vs yesterday",
              spark: SPARKLINE,
            },
            {
              label: "Orders Today",
              value: "34",
              delta: "+9%",
              dir: "up",
              sub: "vs yesterday",
              spark: [12,9,15,11,18,14,17],
            },
            {
              label: "Active Customers",
              value: "1,284",
              delta: "+4%",
              dir: "up",
              sub: "this month",
              spark: [900,950,1020,980,1100,1200,1284],
            },
            {
              label: "Avg. Order Value",
              value: "$216",
              delta: "−3%",
              dir: "down",
              sub: "vs last week",
              spark: [240,220,235,210,228,218,216],
            },
          ].map((k, i) => (
            <div className="db-kpi" key={k.label} style={{ animationDelay: `${i * 60}ms` }}>
              <p className="db-kpi-label">{k.label}</p>
              <p className="db-kpi-value">{k.value}</p>
              <div className="db-kpi-sub">
                <span className={`db-kpi-delta ${k.dir}`}>{k.delta}</span>
                <span>{k.sub}</span>
              </div>
              <div className="db-kpi-spark">
                <Sparkline data={k.spark} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue + Top Products ── */}
        <div className="db-grid">

          {/* Revenue chart */}
          <div className="db-card">
            <div className="db-card-head">
              <span className="db-card-title">REVENUE</span>
              <span className="db-card-sub">Last 6 months</span>
            </div>
            <div className="db-chart">
              <div className="db-chart-bars">
                {MONTHLY.map((m, i) => {
                  const pct = (m.value / MONTHLY_MAX) * 100;
                  const isActive = i === MONTHLY.length - 1;
                  return (
                    <div
                      key={m.month}
                      className={`db-bar-col${isActive ? " active" : ""}`}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <span className="db-bar-val">
                        ${(m.value / 1000).toFixed(1)}k
                      </span>
                      <div
                        className={`db-bar${isActive || hoveredBar === i ? " active" : ""}`}
                        style={{
                          height: `${pct}%`,
                          animationDelay: `${i * 80}ms`,
                        }}
                      />
                      <span className="db-bar-label">{m.month}</span>
                    </div>
                  );
                })}
              </div>

              <div className="db-chart-total">
                <span className="db-chart-total-val">$339,500</span>
                <span className="db-chart-total-label">Total 6-Month Revenue</span>
                <span className="db-kpi-delta up" style={{ marginLeft: "auto", alignSelf: "center" }}>+22% YoY</span>
              </div>
            </div>
          </div>

          {/* Top products */}
          <div className="db-card">
            <div className="db-card-head">
              <span className="db-card-title">TOP PRODUCTS</span>
              <span className="db-card-sub">By revenue</span>
            </div>
            <div className="db-products">
              {[
                { name: "Contrast Seam Jacket", cat: "Outerwear", revenue: 12240, pct: 100 },
                { name: "Raw Edge Hoodie",      cat: "Tops",      revenue: 9870,  pct: 81 },
                { name: "Matte Leather Pant",   cat: "Bottoms",   revenue: 8120,  pct: 66 },
                { name: "Cargo Wide Leg",       cat: "Bottoms",   revenue: 6475,  pct: 53 },
                { name: "Obsidian Tee",         cat: "Tops",      revenue: 5696,  pct: 47 },
              ].map((p, i) => (
                <div className="db-product-row" key={p.name}>
                  <span className="db-product-rank">{String(i + 1).padStart(2, "0")}</span>
                  <div className="db-product-info">
                    <p className="db-product-name">{p.name}</p>
                    <p className="db-product-cat">{p.cat}</p>
                    <div className="db-product-bar-wrap" style={{ marginTop: 6 }}>
                      <div className="db-product-bar-track">
                        <div className="db-product-bar-fill" style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="db-product-revenue">${(p.revenue / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom row: Orders / Activity + Quick stats ── */}
        <div className="db-bottom">

          {/* Orders / Activity tabs */}
          <div className="db-card">
            <div className="db-card-head" style={{ paddingBottom: 0 }}>
              <span className="db-card-title">
                {activeTab === "orders" ? "RECENT ORDERS" : "ACTIVITY"}
              </span>
              <div className="db-tabs">
                <button
                  className={`db-tab${activeTab === "orders" ? " active" : ""}`}
                  onClick={() => setActiveTab("orders")}
                >Orders</button>
                <button
                  className={`db-tab${activeTab === "activity" ? " active" : ""}`}
                  onClick={() => setActiveTab("activity")}
                >Feed</button>
              </div>
            </div>

            {activeTab === "orders" ? (
              <div className="db-orders">
                <table className="db-ot">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_ORDERS.map(o => (
                      <tr key={o.id}>
                        <td><span className="db-ot-id">{o.id}</span></td>
                        <td>
                          <span className="db-ot-customer">{o.customer}</span>
                          <br />
                          <span style={{ fontSize: 10, color: "#bbb", letterSpacing: 1 }}>{o.product}</span>
                        </td>
                        <td><span className="db-ot-amount">${o.amount}</span></td>
                        <td><OrderStatus status={o.status} /></td>
                        <td><span className="db-ot-time">{o.time}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="db-feed">
                {ACTIVITY.map(a => (
                  <div className="db-feed-item" key={a.id}>
                    <div className="db-feed-icon">
                      <ActivityIcon type={a.type} />
                    </div>
                    <div className="db-feed-body">
                      <p className="db-feed-msg">{a.message}</p>
                      <p className="db-feed-detail">{a.detail}</p>
                    </div>
                    <span className="db-feed-time">{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column: quick stats + goal */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Monthly goal */}
            <div className="db-card" style={{ padding: "24px 24px 20px" }}>
              <p style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#bbb", marginBottom: 12 }}>
                Monthly Goal
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: -1, lineHeight: 1, color: "#0a0a0a" }}>
                  73%
                </span>
                <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#aaa" }}>
                  of $100k target
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 6, background: "#f0f0f0", position: "relative", marginBottom: 12 }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: "73%", background: "#0a0a0a",
                  transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: "#bbb" }}>$73,400 earned</span>
                <span style={{ fontSize: 10, letterSpacing: 2, color: "#bbb" }}>$26,600 left</span>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="db-card">
              <div className="db-card-head">
                <span className="db-card-title">QUICK STATS</span>
                <span className="db-card-sub">Today</span>
              </div>
              <div className="db-qstats">
                {[
                  { label: "New Customers", val: "12" },
                  { label: "Refunds",        val: "2" },
                  { label: "Abandoned",      val: "8" },
                  { label: "Reviews",        val: "5" },
                  { label: "Low Stock",      val: "3" },
                  { label: "Dispatched",     val: "21" },
                ].map(s => (
                  <div className="db-qstat" key={s.label}>
                    <span className="db-qstat-label">{s.label}</span>
                    <span className="db-qstat-val">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}