"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { FaArrowAltCircleDown, FaArrowAltCircleRight, FaArrowCircleUp, FaRegArrowAltCircleUp } from "react-icons/fa";
import { ImArrowUpRight2 } from "react-icons/im";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PopularItem {
  id: number;
  label: string;
  name: string;
  price: string;
  originalPrice?: string;
  imgSrc: string;
  badge?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const items: PopularItem[] = [
  {
    id: 1,
    label: "Best Seller",
    name: "Classic Oversized Tee",
    price: "$49",
    imgSrc: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=750&fit=crop&crop=top",
    badge: "#1",
  },
  {
    id: 2,
    label: "Trending",
    name: "Slim Tapered Chinos",
    price: "$119",
    originalPrice: "$150",
    imgSrc: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&crop=top",
  },
  {
    id: 3,
    label: "Fan Favourite",
    name: "Ribbed Knit Cardigan",
    price: "$135",
    imgSrc: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=750&fit=crop&crop=top",
    badge: "Hot",
  },
  {
    id: 4,
    label: "Top Rated",
    name: "Linen Shorts",
    price: "$79",
    imgSrc: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=750&fit=crop&crop=top",
  },
  {
    id: 5,
    label: "Most Liked",
    name: "Satin Wrap Blouse",
    price: "$98",
    originalPrice: "$120",
    imgSrc: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=750&fit=crop&crop=top",
    badge: "Popular",
  },
  {
    id: 6,
    label: "Best Seller",
    name: "Relaxed Blazer",
    price: "$210",
    imgSrc: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=750&fit=crop&crop=top",
  },
  {
    id: 7,
    label: "Trending",
    name: "Wide Leg Denim",
    price: "$145",
    imgSrc: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=750&fit=crop&crop=top",
    badge: "#2",
  },
  {
    id: 8,
    label: "Top Rated",
    name: "Cashmere Crew Neck",
    price: "$275",
    originalPrice: "$320",
    imgSrc: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=750&fit=crop&crop=top",
  },
];

// ─── Card ─────────────────────────────────────────────────────────────────────

function PopularCard({ item }: { item: PopularItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer select-none"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <motion.img
          src={item.imgSrc}
          alt={item.name}
          className="w-full h-full object-cover object-top"
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          draggable={false}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.15) 100%)",
          }}
        />
        {item.badge && (
          <div className="absolute top-3 left-3">
            <span
              className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 text-white"
              style={{
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(4px)",
                borderRadius: 2,
              }}
            >
              {item.badge}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-2.5 pb-1 flex flex-col gap-0.5">
        <p
          className="text-[11px] font-medium tracking-widest uppercase"
          style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
        >
          {item.label}
        </p>
        <p
          className="text-sm font-semibold text-gray-900 leading-snug truncate"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {item.name}
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span
            className="text-sm font-bold text-gray-900"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {item.price}
          </span>
          {item.originalPrice && (
            <span
              className="text-xs line-through"
              style={{ color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}
            >
              {item.originalPrice}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MostPopular() {
  return (
    <section
      className="w-full py-8 px-4 sm:px-8 lg:px-12"
      style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 1400, margin: "0 auto" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Most Popular</h2>

            <button style={{padding:'5px'}} className="border  border-black rounded-full"><ImArrowUpRight2 size={20} /></button>
      </div>

      {/* ── Static Grid ── */}
      <div
        className="grid gap-3 "
        style={{
            marginTop:10,
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
        }}
      >
        {items.map((item) => (
          <PopularCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}