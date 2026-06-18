"use client";

import { useState, useMemo } from "react";
import { Star, Minus, Plus, ChevronUp, ChevronDown, Package, Clock, Tag, Calendar, RotateCcw, RefreshCw } from "lucide-react";
import useProduct from "@/hooks/use-product";
import { ApiProduct, ProductVariant } from "@/server/product/types";
import { useUserContext } from "@/contextProvider";
import useCart from "@/hooks/use_cart";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/navigation";


interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  body: string;
}


const reviews: Review[] = [
  {
    id: 1,
    author: "Obayedul",
    rating: 5,
    date: "13 Oct 2024",
    body: '"Loose-fit sweatshirt hoodie in medium weight cotton-blend fabric with a generous, but not oversized silhouette. Jersey-lined, drawstring hood, dropped shoulders, long sleeves."',
  },
  {
    id: 2,
    author: "Sarah M.",
    rating: 4,
    date: "02 Nov 2024",
    body: '"Absolutely love this chair. The fabric is soft and the wood legs give it such a warm, refined look. Assembly was straightforward too."',
  },
  {
    id: 3,
    author: "James T.",
    rating: 5,
    date: "18 Sep 2024",
    body: '"Exceeded expectations. Sturdy build, very comfortable even after long sessions. Would definitely recommend to anyone furnishing a dining room."',
  },
];

const ratingBreakdown = [
  { star: 5, count: 28 },
  { star: 4, count: 12 },
  { star: 3, count: 6 },
  { star: 2, count: 3 },
  { star: 1, count: 1 },
];

const totalReviews = ratingBreakdown.reduce((s, r) => s + r.count, 0);


function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
          color={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
        />
      ))}
    </div>
  );
}

// ─── Accordion ───────────────────────────────────────────────────────────────

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white border-none cursor-pointer font-bold text-sm text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {title}
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProductPage({ slug }: { slug: string }) {
  const {user,setLoginPopup,setOrderItems}=useUserContext()
  const router=useRouter()
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [qty, setQty] = useState(1);
  const {addToCart}=useCart()
  const { getProductById } = useProduct();
  const { data, isLoading } = getProductById(slug);

  const product:ApiProduct|undefined= data?.data;

  // Derive active variant
  const activeVariant: ProductVariant | undefined = product?.variants[selectedVariantIdx];

  // All images for the active variant, sorted by sortOrder
  const variantImages = useMemo(() => {
    if (!activeVariant) return [];
    return [...activeVariant.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [activeVariant]);

  // Sizes for active variant (comma-separated string → array)
  const sizes = useMemo(() => {
    if (!activeVariant) return [];
    return activeVariant.size.split(",").map((s) => s.trim()).filter(Boolean);
  }, [activeVariant]);

  // Reset image & size when variant changes
  const handleVariantChange = (idx: number) => {
    setSelectedVariantIdx(idx);
    setActiveImg(0);
    // setSelectedSize(null);

  };



  // Price display
  const hasDiscount = activeVariant && activeVariant.discountPercentage > 0;
  const displayPrice =activeVariant?.finalPrice
  const originalPrice = activeVariant?.price;

  // Stock info
  const isLowStock =
    activeVariant &&
    activeVariant.stockToDisplay <= activeVariant.lowStockThreshold;

  // Average rating — use API value if available, else fall back to static
  const avgRating =
    product && product.averageRating > 0 ? product.averageRating : 4.5;

    const handleAddToCart=()=>{
      if(!user.isAuthenticated){
        return setLoginPopup(true)
      }
      if(!product){return}
      const variant=product.variants[selectedVariantIdx]
      addToCart.mutate({variantId:variant.id,size:selectedSize,quantity:qty},{onSuccess:()=>{
        toast("Added To Cart")
      },onError:(e:any)=>{

      }})

    }
  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="font-sans bg-gray-50 min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-8 flex-wrap mb-10">
            <div className="flex-1 min-w-80">
              <Skeleton className="aspect-square rounded-xl mb-3" />
              <div className="flex gap-2.5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="flex-1 aspect-square rounded-lg" />
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-72 flex flex-col gap-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ──
  if (!product) {
    return (
      <div className="font-sans bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }
    const existInCart=()=>{
      const variant=product.variants[selectedVariantIdx]
      const variantId=variant.id
      const exist=data?.existInCart?.includes(variantId)
      console.log(variantId)
      console.log(exist)
      return exist
  }
  const handleBuy=()=>{
    const variant=product.variants[selectedVariantIdx]
    const data ={id:"",
  orderId: null,
  productId: product.id,
  quantity: qty,
  size:selectedSize,
  productVariantId:variant.id,
  userId:"",
  createdAt: "",
  updatedAt: "",
  product: {
    id: product.id,
    name:product.name,
  },

  productVariant: {
    id:variant.id,
    finalPrice:variant.finalPrice,
    color: variant.color,
    colorName:variant.colorName,
    deliveryCharge: variant.deliveryCharge,
    images:variant.images,
  }}
  setOrderItems([data])
  router.push("/checkout")
  }

  return (
    <div className="font-sans bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── TOP SECTION ── */}
        <div className="flex gap-8 flex-wrap mb-10">

          {/* Left: gallery */}
          <div className="flex-1 min-w-80">
            {/* Main image */}
            <div className="bg-[white]  rounded-xl overflow-hidden mb-3 aspect-square flex items-center justify-center">
              {variantImages[activeImg] ? (
                <div>
                <Image
                width={256}
                height={100}
                  src={variantImages[activeImg].url}
                  alt={variantImages[activeImg].altText || product.name}
                  className=" w-full h-auto"
                  draggable={false}
                />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  No image
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {variantImages.length > 1 && (
              <div className="flex flex-row justify-start gap-2.5 ">
                {variantImages.map((img, i) => (
                  <button
                    key={img.id}

                    onClick={() => setActiveImg(i)}
                    className={`flex-1 max-w-20 h-20 aspect-square rounded-lg overflow-hidden p-0 cursor-pointer bg-[#f0ede8] transition-all ${
                      activeImg === i
                        ? "shadow-lg shadow-black"
                        : "border-2 border-transparent"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || `Image ${i + 2}`}
                      className="object-cover h-auto w-full"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="flex-1 min-w-72 flex flex-col gap-4">

            {/* Name + price */}
            <div>
              <h1 className="font-bold text-2xl text-gray-900 mb-1.5">{product.name}</h1>
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <p className="text-sm text-gray-400 line-through">${originalPrice?.toFixed(2)}</p>
                )}
                <p className="font-bold text-xl text-gray-900">${displayPrice?.toFixed(2)}</p>
                {hasDiscount && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {activeVariant?.discountPercentage}% OFF
                  </span>
                )}
              </div>
              {/* Low stock badge */}
              {isLowStock && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  Only {activeVariant?.stockToDisplay} left in stock!
                </p>
              )}
            </div>

            {/* Description accordion */}
            <Accordion title="Description">
              <p className="text-sm text-gray-500 leading-relaxed mt-0 whitespace-pre-line">
                {product.description}
              </p>
            </Accordion>

            {/* Color / Variant picker */}
            {product.variants.length > 0 && (
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-2.5">
                  Color
                  {activeVariant && (
                    <span className="font-normal text-gray-400 ml-1.5">— {activeVariant.colorName}</span>
                  )}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((variant, i) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(i)}
                      aria-label={variant.colorName||""}
                      className={` overflow-hidden  p-0 cursor-pointer transition-all ${
                        selectedVariantIdx === i
                          && "border border-black shadow shadow-sm shadow-gray-500"
                      }`
                    }
                    >
                      <Image src={variant.images[0].url} alt="variant image" width={45} height={45}/>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size picker */}
            {sizes.length > 0 && (
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-2.5">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer transition-all ${
                        selectedSize === size
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty stepper */}
            <div className="flex items-center">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 rounded-l-md border border-gray-200 bg-white cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Decrease"
              >
                <Minus size={13} className="text-gray-700" />
              </button>
              <div className="w-11 h-9 border-t border-b border-gray-200 flex items-center justify-center font-semibold text-sm text-gray-900 bg-white">
                {qty}
              </div>
              <button
                onClick={() => setQty(Math.min(activeVariant?.stockToDisplay ?? 99, qty + 1))}
                className="w-9 h-9 rounded-r-md border border-gray-200 bg-white cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Increase"
              >
                <Plus size={13} className="text-gray-700" />
              </button>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-2.5">
              <button disabled={existInCart()} onClick={handleAddToCart} style={{backgroundColor:existInCart()?"#FEF3C7":"white"}}  className="flex-1 py-3 rounded-full    bg-white font-semibold text-sm text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors">
               {existInCart()?"Added To Cart":"Add to Cart"}
              </button>
              <button onClick={()=>{!user.isAuthenticated?setLoginPopup(true):handleBuy()}} className="flex-1 py-3 rounded-full border-none bg-gray-900 font-semibold text-sm text-white cursor-pointer hover:bg-gray-800 transition-colors">
                Buy Now
              </button>
            </div>

            {/* Shipping / policy accordion */}
            <Accordion title="Shipping & Returns">
              <div className="grid grid-cols-2 gap-3 mt-1">
                {hasDiscount && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Tag size={13} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Discount</p>
                      <p className="text-sm font-semibold text-gray-700">{activeVariant?.discountPercentage}% Off</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package size={13} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Stock</p>
                    <p className="text-sm font-semibold text-gray-700">{activeVariant?.stockToDisplay} units</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <RefreshCw size={13} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Refundable</p>
                    <p className="text-sm font-semibold text-gray-700">{product.refundable ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <RotateCcw size={13} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Returns</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {product.returnable
                        ? `${product.returnWindowDays}-day window`
                        : "Not returnable"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={13} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Delivery Time</p>
                    <p className="text-sm font-semibold text-gray-700">3–4 Working Days</p>
                  </div>
                </div>
              </div>
            </Accordion>
          </div>
        </div>

        {/* ── RATINGS & REVIEWS ── */}
        <div>
          <h2 className="font-bold text-xl text-gray-900 mb-6">Rating & Reviews</h2>

          <div className="flex gap-8 flex-wrap">

            {/* Left: score + breakdown */}
            <div className="flex-shrink-0 min-w-44">
              <div className="flex items-end gap-1 mb-1.5">
                <span className="font-extrabold text-7xl text-gray-900 leading-none">
                  {avgRating}
                </span>
                <span className="text-lg text-gray-400 pb-2">/5</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                ({product.reviewCount > 0 ? product.reviewCount : totalReviews} Reviews)
              </p>

              {/* Bar breakdown */}
              <div className="flex flex-col gap-1.5">
                {ratingBreakdown.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <span className="text-xs text-gray-400 w-2 text-right">{star}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#f0ede8] overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full"
                        style={{ width: `${(count / totalReviews) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: review cards */}
            <div className="flex-1 flex flex-col gap-4 min-w-64">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-4"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="font-bold text-sm text-gray-900 mb-1">{r.author}</p>
                      <Stars rating={r.rating} />
                    </div>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mt-2.5 italic">
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}