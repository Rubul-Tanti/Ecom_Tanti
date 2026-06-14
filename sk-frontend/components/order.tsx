"use client";

import { useState, useMemo } from "react";
import { Search, Star, Circle, ChevronRight } from "lucide-react";
import useOrder from "@/hooks/use_order";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface ProductImage {
  url: string;
}

interface Product {
  name: string;
  description: string;
}

interface ProductVariant {
  images: ProductImage[];
  finalPrice: number;
  deliveryCharge: number;
}

interface OrderItem {
  id: string;
  productId: string;
  productVariantId: string;
  size: string;
  quantity: number;
  createdAt: string;
  orderId: string;
  product: Product;
  productVariant: ProductVariant;
}

interface ApiOrder {
  id: string;
  status: OrderStatus;
  currency: string;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  placedAt: string;
  updatedAt: string;
  items: OrderItem[];
  [key: string]: any;
}

interface Order {
  id: string;
  orderId: string;
  items: OrderItem[];
  status: OrderStatus;
  statusDate: string;
  statusNote: string;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  currency: string;
  year: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<OrderStatus, { color: string; dot: string }> = {
  PENDING: { color: "#f59e0b", dot: "#f59e0b" },
  PROCESSING: { color: "#3b82f6", dot: "#3b82f6" },
  SHIPPED: { color: "#2563eb", dot: "#2563eb" },
  DELIVERED: { color: "#16a34a", dot: "#16a34a" },
  CANCELLED: { color: "#dc2626", dot: "#dc2626" },
};

const paymentStatusConfig: Record<PaymentStatus, { color: string; bgColor: string }> = {
  PAID: { color: "#16a34a", bgColor: "#dcfce7" },
  PENDING: { color: "#f59e0b", bgColor: "#fef3c7" },
  FAILED: { color: "#dc2626", bgColor: "#fee2e2" },
  REFUNDED: { color: "#8b5cf6", bgColor: "#ede9fe" },
};

const getStatusNote = (status: OrderStatus): string => {
  const notes: Record<OrderStatus, string> = {
    PENDING: "Your order is being processed",
    PROCESSING: "Your order is being prepared for shipment",
    SHIPPED: "Your order is on the way",
    DELIVERED: "Your item has been delivered",
    CANCELLED: "Your order was cancelled",
  };
  return notes[status] || "Order status updated";
};

// ─── Convert API Order to Component Order ──────────────────────────────────

const convertApiOrderToOrder = (apiOrder: ApiOrder): Order => {
  const placedDate = new Date(apiOrder.placedAt);
  const year = placedDate.getFullYear();
  const monthDay = placedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return {
    id: apiOrder.id,
    orderId: apiOrder.id,
    items: apiOrder.items || [],
    status: apiOrder.status,
    statusDate: monthDay,
    statusNote: getStatusNote(apiOrder.status),
    paymentStatus: apiOrder.paymentStatus,
    totalAmount: apiOrder.totalAmount,
    currency: apiOrder.currency,
    year: year,
  };
};

// ─── Order Item Row ───────────────────────────────────────────────────────────

function OrderItemRow({ item, orderStatus }: { item: OrderItem; orderStatus: OrderStatus }) {
  const itemImg = item.productVariant?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        paddingBottom: 16,
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      {/* Product image */}
      <img
        src={itemImg}
        alt={item.product?.name}
        style={{
          width: 80,
          height: 80,
          objectFit: "cover",
          borderRadius: 6,
          flexShrink: 0,
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
        }}
        draggable={false}
      />

      {/* Product details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "#111",
            margin: "0 0 4px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.product?.name}
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#888",
            margin: "0 0 8px",
          }}
        >
          Size: <strong>{item.size}</strong> | Qty: <strong>{item.quantity}</strong>
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#666",
            margin: 0,
          }}
        >
          ₹{item.productVariant?.finalPrice?.toLocaleString() || 0}
          {item.productVariant?.deliveryCharge > 0 && (
            <> + ₹{item.productVariant.deliveryCharge} delivery</>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────

function OrderRow({ order }: { order: Order }) {
  const cfg = statusConfig[order.status];
  const paymentCfg = paymentStatusConfig[order.paymentStatus];
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handlePayment = async () => {
    setIsPaymentProcessing(true);
    // TODO: Integrate with your payment gateway (Razorpay, Stripe, etc.)
    console.log(`Processing payment for order: ${order.orderId}`);
    setTimeout(() => {
      setIsPaymentProcessing(false);
    }, 1000);
  };

  const canReview = order.status === "DELIVERED" && order.paymentStatus === "PAID";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        transition: "box-shadow 0.15s",
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Order Header */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          cursor: "pointer",
          backgroundColor: "#f9fafb" ,
        }}
      >
        {/* Order ID and Items Count */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              color: "#111",
              margin: "0 0 6px",
            }}
          >
            Order #{order.orderId.slice(0, 8).toUpperCase()}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#888",
              margin: 0,
            }}
          >
            {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""} • {order.statusDate}
          </p>
        </div>

        {/* Payment Status Badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            backgroundColor: paymentCfg.bgColor,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            color: paymentCfg.color,
            fontFamily: "'DM Sans', sans-serif",
            flexShrink: 0,
          }}
        >
          {order.paymentStatus}
        </span>

        {/* Price */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#111",
            minWidth: 100,
            textAlign: "right",
            flexShrink: 0,
            margin: 0,
          }}
        >
          ₹{order.totalAmount.toLocaleString()}
        </p>

        {/* Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 160,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: cfg.dot,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: cfg.color,
            }}
          >
            {order.status}
          </span>
        </div>

      </div>

      {/* Order Details - Expandable */}
        <div style={{ padding: "0 24px 20px", backgroundColor: "#f9fafb" }}>
          {/* Items List */}
          <div style={{ marginBottom: 16 }}>
            {order.items?.map((item) => (
              <OrderItemRow key={item.id} item={item} orderStatus={order.status} />
            ))}
          </div>

          {/* Status Note */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#666",
              margin: "0 0 16px",
              paddingTop: 12,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {order.statusNote}
          </p>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {order.paymentStatus === "PENDING" && (
              <button
                onClick={handlePayment}
                disabled={isPaymentProcessing}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: isPaymentProcessing ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: isPaymentProcessing ? 0.7 : 1,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isPaymentProcessing) {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }}
              >
                {isPaymentProcessing ? "Processing..." : "Pay Now"}
              </button>
            )}

            {canReview && (
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  backgroundColor: "#f0f9ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f9ff";
                  e.currentTarget.style.color = "#2563eb";
                  e.currentTarget.style.borderColor = "#bfdbfe";
                }}
              >
                <Star size={14} fill="currentColor" />
                Rate &amp; Review
              </button>
            )}
          </div>
        </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const TIME_FILTERS = ["Last 30 days", "2025", "2024", "Older"];

export default function MyOrders() {
  const { getOrder } = useOrder();
  const { data, isLoading } = getOrder();
  const apiOrders = data?.orders || [];
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());
  const [activeTimes, setActiveTimes] = useState<Set<string>>(new Set());

  const toggleSet = (set: Set<string>, value: string): Set<string> => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  // Convert API orders to component orders
  const orders: Order[] = useMemo(
    () => (Array.isArray(apiOrders) ? apiOrders.map(convertApiOrderToOrder) : []),
    [apiOrders]
  );

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Search in product names within items, or in order ID

      const matchStatus =
        activeStatuses.size === 0 || activeStatuses.has(o.status);

      const matchTime = (() => {
        if (activeTimes.size === 0) return true;
        const now = new Date();
        if (activeTimes.has("Last 30 days")) {
          const d = new Date(o.statusDate + ", " + o.year);
          const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
          if (diff <= 30) return true;
        }
        if (activeTimes.has("2025") && o.year === 2025) return true;
        if (activeTimes.has("2024") && o.year === 2024) return true;
        if (activeTimes.has("Older") && o.year < 2024) return true;
        return false;
      })();

      return  matchStatus && matchTime;
    });
  }, [ activeStatuses, activeTimes, orders]);

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


          {/* Loading state */}
          {isLoading && (
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                padding: "48px 24px",
                textAlign: "center",
                color: "#888",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Loading orders...
            </div>
          )}

          {/* Order rows */}
          {!isLoading && filtered.length === 0 && (
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
          )}

          {!isLoading && filtered.map((order) => <OrderRow key={order.orderId} order={order} />)}
        </div>
      </div>
    </div>
  );
}