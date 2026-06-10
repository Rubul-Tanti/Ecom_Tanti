"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useProduct from "@/hooks/use-product";
import useEvents from "@/hooks/useEvent";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { RiArrowDropDownLine } from "react-icons/ri";

// ─── API Types ──────────────────────────────────────────────────────────────

interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  colorName: string | null;
  price: number;
  discountPercentage: number;
  discountPrice: number;
  stock: number;
  stockToDisplay: number;
  lowStockThreshold: number;
  sku: string;
  createdAt: string;
  images: ProductImage[];
}

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string | null;
  refundable: boolean;
  returnable: boolean;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  variants: ProductVariant[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Lowest price across all variants */
const getMinPrice = (variants: ProductVariant[]) =>
  variants.length ? Math.min(...variants.map((v) => v.price)) : 0;

/** Total stock across all variants */
const getTotalStock = (variants: ProductVariant[]) =>
  variants.reduce((s, v) => s + v.stock, 0);

/** Primary image from first variant that has one */
export const getPrimaryImage = (variants: ProductVariant[]): string => {
  for (const v of variants) {
    const primary = v.images.find((img) => img.isPrimary && img.url);
    if (primary) return primary.url;
    const any = v.images.find((img) => img.url);
    if (any) return any.url;
  }
  return "";
};

/** All unique colors from variants */
const getColors = (variants: ProductVariant[]) =>
  variants.map((v) => ({ hex: v.color, name: v.colorName ?? v.color }));

/** Short truncated name */
const shortName = (name: string, max = 32) =>
  name.length > max ? name.slice(0, max).trimEnd() + "…" : name;

const CATEGORIES = ["All", "Tops", "Bottoms", "Outerwear", "Accessories", "Footwear"];

// ─── Skeleton Card ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="pcard animate-pulse">
      <div className="pcard-visual bg-gray-200" />
      <div className="pcard-body">
        <div className="h-2 w-24 bg-gray-200 rounded mb-3" />
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-full bg-gray-100 rounded mb-1" />
        <div className="h-3 w-2/3 bg-gray-100 rounded mb-4" />
        <div className="flex gap-3 pt-3 border-t border-gray-100">
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ───────────────────────────────────────────────────────────

function DeleteModal({
  product,
  deleteProduct,
  onClose,
  onConfirm,
}: {
  deleteProduct: ReturnType<typeof useProduct>["deleteProduct"]
  product: ApiProduct;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
   <div
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
  onClick={onClose}
>
  <div
    style={{
      background: "#fff",
      width: "min(420px,92vw)",
      borderTop: "4px solid #0a0a0a",
      padding: "36px",
      animation: "slideUp 0.22s ease",
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <p
      style={{
        fontSize: "9px",
        letterSpacing: "4px",
        textTransform: "uppercase",
        color: "#9ca3af",
        marginBottom: "10px",
        fontFamily: "Syne, sans-serif",
      }}
    >
      Destructive Action
    </p>

    <h2
      style={{
        fontFamily: "Bebas Neue, sans-serif",
        fontSize: "36px",
        lineHeight: 1,
        marginBottom: "14px",
        color: "#0a0a0a",
        letterSpacing: "1px",
      }}
    >
      DELETE PRODUCT?
    </h2>

    <p
      style={{
        fontSize: "13px",
        color: "#6b7280",
        lineHeight: 1.7,
        marginBottom: "28px",
        fontFamily: "Syne, sans-serif",
      }}
    >
      Permanently removing{" "}
      <strong style={{ color: "#0a0a0a" }}>
        {shortName(product.name)}
      </strong>
      . This cannot be undone.
    </p>

    <div
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
      }}
    >
      <button
        onClick={onClose}
        style={{
          padding: "10px 20px",
          border: "1px solid #e5e7eb",
          background: "transparent",
          fontFamily: "Syne, sans-serif",
          fontSize: "11px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          cursor: "pointer",
          color: "#6b7280",
          transition: "0.2s",
        }}
      >
        Cancel
      </button>

      <button
        onClick={onConfirm}
        style={{
          padding: "10px 28px",
          background: "#0a0a0a",
          border: "none",
          fontFamily: "Bebas Neue, sans-serif",
          fontSize: "18px",
          letterSpacing: "3px",
          color: "#fff",
          cursor: "pointer",
          transition: "0.2s",
        }}
      >{deleteProduct.isPending ? "Deleting..." : "Delete"}
      </button>
    </div>
  </div>
</div>
  );
}

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({
  product,
  index,
  onDelete,
}: {
  product: ApiProduct;
  index: number;
  onDelete: () => void;
}) {
  const minPrice = getMinPrice(product.variants);
  const totalStock = getTotalStock(product.variants);
  const primaryImage = getPrimaryImage(product.variants);
  const colors = getColors(product.variants);
  const firstVariantSku = product.variants[0]?.sku?.split("-").slice(-3, -1).join("-") ?? "—";

  const stockState =
    totalStock === 0 ? "out" : totalStock < 10 ? "low" : "ok";
  const stockColor = { out: "#cc2200", low: "#e67e00", ok: "#0a0a0a" }[stockState];
  const [openEvent,setOpenEvent]=useState(false)
    const { getEvents,addProductToEvent } = useEvents();
  const { data:event, isLoading:eventLoading } = getEvents();
  return (
    <div className="pcard" style={{ animationDelay: `${index * 55}ms` }}>
      {/* Visual */}
      <div className="pcard-visual relative">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="pcard-pattern absolute inset-0" />
        )}

        {/* Category badge */}
        <span className="absolute bottom-2.5 left-3 text-[9px] tracking-[4px] uppercase text-white/70 font-[Syne,sans-serif] font-semibold drop-shadow">
          {product.categoryName ?? "Uncategorized"}
        </span>

        {/* Status dot */}
        <span
          className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
            product.isActive ? "bg-emerald-400" : "bg-gray-400"
          }`}
        />

        {/* Featured badge */}
        {product.isFeatured && (
          <span className="absolute top-3 left-3 text-[8px] tracking-[2px] uppercase bg-white/90 text-[#0a0a0a] px-2 py-0.5 font-[Syne,sans-serif] font-bold">
            Featured
          </span>
        )}
        <div  className=" ">
          <button  onClick={()=>setOpenEvent(!openEvent)} className="flex cursor-pointer absolute text-xs top-3  right-5 justify-between items-center bg-white" style={{padding:"3px"}}>Event   <RiArrowDropDownLine  size={20} />
          </button>
           <div className={`${openEvent?"absolute text-xs top-10  right-5":"hidden"}`}>
          {event?.data?.events.map((e)=>
          <div className="flex gap-2 justify-between items-center bg-white" style={{padding:"3px"}} key={e.id} >{e.name}
          {addProductToEvent.isPending?<CgSpinner className="animate-spin"/>:
          <button onClick={()=>{addProductToEvent.mutate({productId:product.id,eventId:e.id},{onSuccess:()=>{},onError:()=>{}})}} className="h-2 cursor-pointer w-2 border border-black"/>
          }


          </div>
        )}
        </div>
        </div>


      </div>

      {/* Body */}
      <div className="pcard-body">
        <div className="pcard-meta">
          <span className="pcard-sku">{firstVariantSku}</span>
          <span className="pcard-id">{product.variants.length}v</span>
        </div>

        <h3 className="pcard-name">{shortName(product.name, 28).toUpperCase()}</h3>
        <p className="pcard-desc">{product.description.replace(/\r\n/g, " ")}</p>

        {/* Color swatches */}
        {colors.length > 0 && (
          <div className="flex gap-1.5 mb-3">
            {colors.map((c, i) => (
              <span
                key={i}
                title={c.name}
                className="w-4 h-4 rounded-sm border border-black/10 flex-shrink-0"
                style={{ background: c.hex }}
              />
            ))}
          </div>
        )}

        {/* Numbers row */}
        <div className="pcard-numbers">
          <div className="pcard-num-block">
            <span className="pcard-num-label">Price</span>
            <span className="pcard-num-val">${minPrice}</span>
          </div>
          <div className="pcard-divider" />
          <div className="pcard-num-block">
            <span className="pcard-num-label">Stock</span>
            <span className="pcard-num-val" style={{ color: stockColor }}>
              {totalStock === 0 ? "—" : totalStock}
            </span>
          </div>
          <div className="pcard-divider" />
          <div className="pcard-num-block">
            <span className="pcard-num-label">Status</span>
            <span
              className="pcard-status-text"
              style={{ color: product.isActive ? "#16a34a" : "#9ca3af" }}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pcard-foot">
        <span className="pcard-date">
          {new Date(product.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <div className="pcard-actions">
          <Link href={`/admin/products/${product.slug}`}>
            <button className="pcard-btn">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              Edit
            </button>
          </Link>
          <button className="pcard-btn pcard-btn-del" onClick={onDelete}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 3h10M4 3V2h4v1M5 5.5v3M7 5.5v3M2 3l.8 7h6.4L10 3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [categoryName, setCategoryName] = useState("");
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<boolean | "All">("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "date">("date");
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const queryClient=useQueryClient()
  const {getProducts,deleteProduct} = useProduct()
  const { data, isLoading, error } = getProducts(
    limit,
    categoryName,
    page,
    search,
    activeStatus
  );

  const apiProducts: ApiProduct[] = data?.data ?? [];

  // Client-side sort (server already filtered)
  const sorted = [...apiProducts].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") return getMinPrice(b.variants) - getMinPrice(a.variants);
    if (sortBy === "stock") return getTotalStock(b.variants) - getTotalStock(a.variants);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Category filter client-side (if categoryName isn't enough)
  const filtered =
    activeCategory === "All"
      ? sorted
      : sorted.filter(
          (p) =>
            (p.categoryName ?? "").toLowerCase() === activeCategory.toLowerCase()
        );

  const totalStock = apiProducts.reduce(
    (s, p) => s + getTotalStock(p.variants),
    0
  );
  const totalValue = apiProducts.reduce(
    (s, p) => s + getMinPrice(p.variants) * getTotalStock(p.variants),
    0
  );
  const activeCount = apiProducts.filter((p) => p.isActive).length;
  const lowStockCount = apiProducts.filter((p) => {
    const s = getTotalStock(p.variants);
    return s > 0 && s < 10;
  }).length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    // Call your delete API here, then invalidate/refetch
    showToast(`"${shortName(deleteTarget.name)}" deleted`);
      deleteProduct.mutate(deleteTarget.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey:['products']})
        showToast("Product deleted successfully");
      },
      onError: (error: any) => {
        showToast(`Error deleting product: ${error.response.data.message}`);
      },onSettled:()=>{
        setDeleteTarget(null);
      }
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(24px) scale(0.98) } to { opacity:1; transform:none }
        }

        .pp-root { min-height:100vh; background:#f4f4f2; font-family:'Syne',sans-serif; color:#0a0a0a; }

        .pp-hero { background:#0a0a0a; padding:48px 40px 40px; position:relative; overflow:hidden; }
        .pp-hero::before {
          content:''; position:absolute; inset:0;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);
          background-size:40px 40px; pointer-events:none;
        }
        .pp-hero-wm {
          position:absolute; right:-10px; bottom:-40px;
          font-family:'Bebas Neue',sans-serif; font-size:clamp(120px,18vw,220px);
          line-height:1; color:rgba(255,255,255,0.04); pointer-events:none; user-select:none; letter-spacing:-2px;
        }
        .pp-hero-top { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; flex-wrap:wrap; position:relative; z-index:1; }
        .pp-hero-eyebrow { font-size:10px; letter-spacing:5px; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:10px; }
        .pp-hero-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(52px,8vw,80px); line-height:0.9; letter-spacing:-1px; color:#fff; }
        .pp-hero-title span { color:rgba(255,255,255,0.3); display:block; }
        .pp-create-btn {
          display:inline-flex; align-items:center; gap:10px; padding:14px 28px;
          background:#fff; border:none; font-family:'Bebas Neue',sans-serif;
          font-size:18px; letter-spacing:3px; color:#0a0a0a; cursor:pointer;
          white-space:nowrap; flex-shrink:0; transition:transform 0.15s,box-shadow 0.15s;
          position:relative; z-index:1; align-self:flex-end; margin-top:8px;
        }
        .pp-create-btn:hover { transform:translate(-2px,-2px); box-shadow:5px 5px 0 rgba(255,255,255,0.15); }

        .pp-hero-stats { display:flex; gap:0; margin-top:36px; position:relative; z-index:1; border-top:1px solid rgba(255,255,255,0.08); padding-top:28px; flex-wrap:wrap; }
        .pp-hstat { flex:1; min-width:120px; padding-right:32px; margin-right:32px; border-right:1px solid rgba(255,255,255,0.08); }
        .pp-hstat:last-child { border-right:none; }
        .pp-hstat-n { font-family:'Bebas Neue',sans-serif; font-size:44px; line-height:1; color:#fff; letter-spacing:-1px; }
        .pp-hstat-l { font-size:9px; letter-spacing:4px; text-transform:uppercase; color:rgba(255,255,255,0.3); margin-top:4px; }

        .pp-controls { padding:20px 40px; background:#fff; border-bottom:1px solid #e8e8e8; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; position:sticky; top:0; z-index:30; }
        .pp-controls-left { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .pp-controls-right { display:flex; align-items:center; gap:8px; }

        .pp-search-wrap { position:relative; }
        .pp-search { padding:9px 14px 9px 36px; border:1.5px solid #e4e4e4; font-family:'Syne',sans-serif; font-size:12px; color:#0a0a0a; background:#fafafa; outline:none; width:200px; transition:border-color 0.18s,box-shadow 0.18s; }
        .pp-search:focus { border-color:#0a0a0a; background:#fff; box-shadow:2px 2px 0 #0a0a0a; }
        .pp-search-ico { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#bbb; pointer-events:none; }

        .pp-pill { padding:7px 14px; border:1.5px solid #e4e4e4; background:#fafafa; font-family:'Syne',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#777; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
        .pp-pill:hover, .pp-pill.active { border-color:#0a0a0a; background:#0a0a0a; color:#fff; }

        .pp-sort { padding:7px 12px; border:1.5px solid #e4e4e4; font-family:'Syne',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#777; background:#fafafa; outline:none; cursor:pointer; -webkit-appearance:none; transition:border-color 0.15s; }
        .pp-sort:focus { border-color:#0a0a0a; }

        .pp-view-btn { width:34px; height:34px; border:1.5px solid #e4e4e4; background:#fafafa; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#aaa; transition:all 0.15s; }
        .pp-view-btn.active, .pp-view-btn:hover { border-color:#0a0a0a; background:#0a0a0a; color:#fff; }
        .pp-result-count { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#bbb; white-space:nowrap; }

        .pp-cats { padding:0 40px; background:#fff; border-bottom:1px solid #e8e8e8; display:flex; gap:0; overflow-x:auto; scrollbar-width:none; }
        .pp-cats::-webkit-scrollbar { display:none; }
        .pp-cat-tab { padding:14px 20px; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#aaa; cursor:pointer; white-space:nowrap; border-bottom:2px solid transparent; background:none; border-top:none; border-left:none; border-right:none; font-family:'Syne',sans-serif; font-weight:600; transition:color 0.15s,border-color 0.15s; }
        .pp-cat-tab:hover { color:#555; }
        .pp-cat-tab.active { color:#0a0a0a; border-bottom-color:#0a0a0a; }

        .pp-content { padding:32px 40px; }
        .pp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
        .pp-list { display:flex; flex-direction:column; gap:1px; background:#e8e8e8; }

        .pcard { background:#fff; display:flex; flex-direction:column; animation:cardIn 0.4s ease both; position:relative; }
        .pcard:hover .pcard-actions { opacity:1; transform:translateY(0); }
        .pcard:hover .pcard-visual { filter:brightness(0.92); }
        .pcard-visual { height:140px; background:#f0f0ee; position:relative; overflow:hidden; transition:filter 0.2s; flex-shrink:0; }
        .pcard-pattern { position:absolute; inset:0; background-image:linear-gradient(45deg,rgba(0,0,0,0.03) 25%,transparent 25%),linear-gradient(-45deg,rgba(0,0,0,0.03) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,rgba(0,0,0,0.03) 75%),linear-gradient(-45deg,transparent 75%,rgba(0,0,0,0.03) 75%); background-size:20px 20px; background-position:0 0,0 10px,10px -10px,-10px 0; }
        .pcard-body { padding:16px 18px 12px; flex:1; }
        .pcard-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
        .pcard-sku { font-size:9px; letter-spacing:3px; text-transform:uppercase; color:#bbb; font-family:'Syne',sans-serif; }
        .pcard-id { font-size:9px; letter-spacing:2px; color:#ddd; font-family:'Syne',sans-serif; }
        .pcard-name { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:0.5px; line-height:1.05; color:#0a0a0a; margin-bottom:6px; }
        .pcard-desc { font-size:11px; color:#888; line-height:1.55; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .pcard-numbers { display:flex; align-items:center; padding-top:12px; border-top:1px solid #f0f0f0; }
        .pcard-num-block { flex:1; }
        .pcard-num-label { display:block; font-size:8px; letter-spacing:3px; text-transform:uppercase; color:#bbb; margin-bottom:3px; }
        .pcard-num-val { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:0.5px; line-height:1; }
        .pcard-status-text { font-family:'Syne',sans-serif; font-size:9px; letter-spacing:3px; text-transform:uppercase; font-weight:600; display:block; margin-top:2px; }
        .pcard-divider { width:1px; height:32px; background:#f0f0f0; margin:0 12px; }
        .pcard-foot { padding:10px 18px 14px; display:flex; align-items:center; justify-content:space-between; }
        .pcard-date { font-size:9px; letter-spacing:2px; color:#ccc; font-family:'Syne',sans-serif; }
        .pcard-actions { display:flex; gap:6px; opacity:0; transform:translateY(4px); transition:opacity 0.2s,transform 0.2s; }
        .pcard-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border:1.5px solid #e0e0e0; background:none; font-family:'Syne',sans-serif; font-size:9px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; color:#555; transition:border-color 0.15s,background 0.15s,color 0.15s; font-weight:600; }
        .pcard-btn:hover { border-color:#0a0a0a; color:#0a0a0a; }
        .pcard-btn-del:hover { border-color:#cc2200 !important; color:#cc2200 !important; }

        .pp-list .pcard { flex-direction:row; align-items:center; }
        .pp-list .pcard-visual { width:80px; height:80px; flex-shrink:0; }
        .pp-list .pcard-body { padding:12px 16px; display:flex; align-items:center; gap:24px; flex:1; }
        .pp-list .pcard-desc { display:none; }
        .pp-list .pcard-numbers { border-top:none; padding-top:0; }
        .pp-list .pcard-foot { border-left:1px solid #f0f0f0; padding:0 16px; }
        .pp-list .pcard-actions { opacity:1; transform:none; }
        .pp-list .pcard-name { font-size:20px; margin-bottom:2px; }
        .pp-list .pcard-meta { flex-direction:column; align-items:flex-start; gap:1px; margin-bottom:2px; }

        .pp-empty { grid-column:1/-1; padding:80px 40px; text-align:center; }
        .pp-empty-title { font-family:'Bebas Neue',sans-serif; font-size:60px; color:#ddd; letter-spacing:2px; }
        .pp-empty-sub { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#bbb; margin-top:4px; }

        .pp-error { grid-column:1/-1; padding:60px 40px; text-align:center; }
        .pp-error-title { font-family:'Bebas Neue',sans-serif; font-size:48px; color:#cc2200; letter-spacing:2px; }
        .pp-error-sub { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#bbb; margin-top:4px; }

        .pp-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#0a0a0a; color:#fff; padding:12px 24px; font-family:'Syne',sans-serif; font-size:11px; letter-spacing:3px; text-transform:uppercase; border-left:3px solid #fff; z-index:999; white-space:nowrap; animation:slideUp 0.25s ease; }

        @media (max-width:640px) {
          .pp-hero { padding:32px 20px 28px; }
          .pp-controls, .pp-cats { padding-left:20px; padding-right:20px; }
          .pp-content { padding:20px; }
          .pp-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="pp-root">

        {/* ── Hero ── */}
        <header className="pp-hero">
          <div className="pp-hero-wm">PRODUCTS</div>
          <div className="pp-hero-top">
            <div>
              <p className="pp-hero-eyebrow">Admin · Dashboard</p>
              <h1 className="pp-hero-title">
                PRODUCT<br />
                <span>CATALOG</span>
              </h1>
            </div>
            <Link href="products/create">
              <button className="pp-create-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                New Product
              </button>
            </Link>
          </div>

          <div className="pp-hero-stats">
            {[
              { n: isLoading ? "—" : apiProducts.length, l: "Total Products" },
              { n: isLoading ? "—" : activeCount, l: "Active" },
              { n: isLoading ? "—" : lowStockCount, l: "Low Stock" },
              { n: isLoading ? "—" : `$${(totalValue / 1000).toFixed(1)}k`, l: "Inventory Value" },
            ].map((s) => (
              <div className="pp-hstat" key={s.l}>
                <p className="pp-hstat-n">{s.n}</p>
                <p className="pp-hstat-l">{s.l}</p>
              </div>
            ))}
          </div>
        </header>

        {/* ── Category tabs ── */}
        <div className="pp-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`pp-cat-tab${activeCategory === c ? " active" : ""}`}
              onClick={() => {
                setActiveCategory(c);
                setCategoryName(c === "All" ? "" : c);
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── Controls ── */}
        <div className="pp-controls">
          <div className="pp-controls-left">
            <div className="pp-search-wrap">
              <span className="pp-search-ico">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="5" cy="5" r="3.5" stroke="#bbb" strokeWidth="1.3" />
                  <path d="M8 8l2.5 2.5" stroke="#bbb" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="pp-search"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {(["All", true, false] as const).map((s, i) => (
              <button
                key={i}
                className={`pp-pill${activeStatus === s ? " active" : ""}`}
                onClick={() => setActiveStatus(s)}
              >
                {s === "All" ? "All" : s ? "Active" : "Inactive"}
              </button>
            ))}

            <span className="pp-result-count">{filtered.length} items</span>
          </div>

          <div className="pp-controls-right">
            <select
              className="pp-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
            </select>

            <button
              className={`pp-view-btn${viewMode === "grid" ? " active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1.2" />
                <rect x="8" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1.2" />
                <rect x="1" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1.2" />
                <rect x="8" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>

            <button
              className={`pp-view-btn${viewMode === "list" ? " active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 3.5h11M1 6.5h11M1 9.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Grid / List ── */}
        <div className="pp-content">
          <div className={viewMode === "grid" ? "pp-grid" : "pp-list"}>

            {/* Loading skeletons */}
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

            {/* Error */}
            {!isLoading && error && (
              <div className="pp-error">
                <p className="pp-error-title">FETCH ERROR</p>
                <p className="pp-error-sub">Could not load products. Please try again.</p>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && filtered.length === 0 && (
              <div className="pp-empty">
                <p className="pp-empty-title">NO RESULTS</p>
                <p className="pp-empty-sub">Adjust your search or filters</p>
              </div>
            )}

            {/* Cards */}
            {!isLoading &&
              !error &&
              filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onDelete={() => setDeleteTarget(p)}
                />
              ))}
          </div>

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pp-pill disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-[10px] tracking-[4px] uppercase text-gray-400 font-[Syne,sans-serif]">
                Page {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={apiProducts.length < limit}
                className="pp-pill disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
        deleteProduct={deleteProduct}
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Toast */}
      {toast && <div className="pp-toast">✓ &nbsp;{toast}</div>}
    </>
  );
}