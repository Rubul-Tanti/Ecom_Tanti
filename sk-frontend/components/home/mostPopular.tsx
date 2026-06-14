"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import useProduct from "@/hooks/use-product";
import ProductCard from "./product/productCard";


export default function MostPopular() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const {getPopularProduct}=useProduct()
  const { data, isLoading, error } = getPopularProduct(20, "", 1);
  const SCROLL_AMOUNT = 420;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "right" ? SCROLL_AMOUNT : -SCROLL_AMOUNT,
      behavior: "smooth",
    });
    setTimeout(updateScrollState, 350);
  };

  return (
    <section
      className="w-full py-8 px-4  sm:px-8 lg:px-12 "
      style={{ fontFamily: "'DM Sans', sans-serif", margin:'auto',marginBottom:20,marginTop:20, maxWidth: 1400,}}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-xl font-bold text-gray-900 tracking-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Most Popular
        </h2>

        <div className="flex gap-2">
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                key="left"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollBy("left")}
                aria-label="Scroll left"
                className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-gray-500 transition-colors shadow-sm"
              >
                <ChevronLeft size={16} className="text-gray-800" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                key="right"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollBy("right")}
                aria-label="Scroll right"
                className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-gray-500 transition-colors shadow-sm"
              >
                <ChevronRight size={16} className="text-gray-800" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll strip */}
      <div className="relative">
        {canScrollRight && (
          <div
            className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.85))",
            }}
          />
        )}
        {canScrollLeft && (
          <div
            className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(255,255,255,0.85))",
            }}
          />
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="hide-scroll flex gap-3 overflow-x-auto pb-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            paddingTop:10
          }}
        >
          {isLoading?Array.from({length:5}).map((_,i)=><div key={i} className="bg-zinc-200 h-[400px] w-[300px] animate-pulse"></div>):data?.data.length==0?<></>:data?.data.map((item,i) => (
            <ProductCard key={i} item={item}/>
          ))}
        </div>
      </div>
    </section>
  );
}