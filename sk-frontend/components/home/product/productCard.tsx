"use client";
import { ApiProduct, ProductVariant } from "@/server/product/types";

import {  useState} from "react";
import { motion } from "framer-motion";
import { getPrimaryImage } from "@/app/admin/products/page";
import { useRouter } from "next/navigation";
function ProductCard({ item }: { item:ApiProduct}) {
  const router=useRouter()
    const [hovered, setHovered] = useState(false);

  return (
    <motion.div
    onClick={()=>router.push(`/product/${item.slug}`)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.985 }}
      className="relative p-2 bg-white shrink-0  cursor-pointer select-none"
      style={{ width: "clamp(220px, 28vw, 300px)" }}
    >
      {/* Image */}
      <div className="relative bg-black/4 flex items-center overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <motion.img
          src={item.variants[0].images[0].url}
          alt={item.name}
          className=" h-auto w-full object-cover object-top"
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          draggable={false}
        />

        {/* vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 55%, rgba(255, 255, 255, 0.03) 100%)",
          }}
        />


      </div>

      {/* Info */}
      <div className="pt-3 pb-1 flex flex-col gap-0.5">

        <p
          className="text-sm font-semibold h-14 line-clamp-3 text-gray-900 leading-snug"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {item.name}
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">

          <span
            className="text-lg font-bold text-gray-900"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
          ₹ {item.variants[0].finalPrice}
          </span>

          {item.variants[0].price && (
            <span
              className="text-xs "
              style={{ color: "#aaa", fontFamily: "'DM Sans', sans-serif" }}
            >
           M.R.P  ₹<span className="line-through"> {item.variants[0].discountPrice}</span> ( {item.variants[0].discountPercentage}% )
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
export default ProductCard