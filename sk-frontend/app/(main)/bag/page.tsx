"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2, Minus, Plus, ShoppingBag, Tag, ChevronRight, Check } from "lucide-react";
import useCart from "@/hooks/use_cart";
import { CartItem } from "@/server/cart/types";
import Link from "next/link";
import { useUserContext } from "@/contextProvider";
import { useRouter } from "next/navigation";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-zinc-100 rounded-full animate-pulse ${className}`} />
  );
}

function CartRowSkeleton() {
  return (
    <div className="flex gap-4 py-5 border-b border-zinc-100">
      <div className="w-24 h-32 rounded-xl bg-zinc-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded-full" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummarySkeleton() {
  return (
    <div className="w-full lg:w-72 bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex-shrink-0">
      <Skeleton className="h-5 w-36 mb-6" />
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="border-t border-zinc-100 mt-5 pt-4 mb-5 flex justify-between items-center">
        <Skeleton className="h-5 w-10" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-12 w-full rounded-full" />
      <Skeleton className="h-4 w-32 mx-auto mt-4" />
    </div>
  );
}

function CartRow({
  item,
  onQtyChange,
  onRemove,
  onWishlist,
  wishlisted,
  onSelect,
  existInOrder
}: {
  onSelect:(v:string)=>void,
  item: CartItem;
  onQtyChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onWishlist: (id: string) => void;
  wishlisted: boolean;
  existInOrder:(id:string)=>boolean
}) {
  const exist=existInOrder(item.id)
  return (

    <div className="flex gap-4 py-5 border-b border-zinc-100 last:border-0 group relative">
        <button onClick={()=>onSelect(item.id)} className={`${exist?"bg-zinc-500":"bg-white  border border-zinc-400"} h-4 rounded cursor-pointer top-1 -left-2 w-4 items-center flex justify-center absolute z-50 `}>{exist&&<Check size={12} color='white'/>}</button>
      <div className="relative flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden bg-zinc-100">
        <img
          src={item.productVariant.images[0].url}
          alt={item.product.name}
          className="w-full h-full object-cover object-top"
          draggable={false}
        />
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-[15px] text-wrap text-zinc-900 leading-snug truncate">
              {item.product.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-zinc-400 flex bg-zinc-100 px-2 py-0.5 rounded-full">
                Size : <p className="text-zinc-800 ">{item.size}</p>
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-400">

                <span
                  className="inline-block border border-zinc-400 w-3 h-3 rounded-full border border-zinc-200"
                  style={{ background: item.productVariant.color.toLowerCase() }}
                />
                {item.productVariant.colorName}
              </span>
            </div>
          </div>
        </div>

        <p className="font-bold text-[15px] text-zinc-900 mt-1">
          ₹{(item.productVariant.finalPrice * item.quantity).toFixed(2)}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 bg-zinc-100 rounded-full px-3 py-1.5">
            <button
              onClick={() => onQtyChange(item.id, -1)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-30"
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
            >
              <Minus size={12} strokeWidth={2.5} className="text-zinc-700" />
            </button>
            <span className="text-sm font-semibold text-zinc-800 w-4 text-center tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item.id, 1)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={12} strokeWidth={2.5} className="text-zinc-700" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onWishlist(item.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart
                size={16}
                className={wishlisted ? "fill-rose-500 text-rose-500" : "text-zinc-400"}
              />
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors group/del"
              aria-label="Remove item"
            >
              <Trash2 size={16} className="text-zinc-400 group-hover/del:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <ShoppingBag size={28} className="text-zinc-300" />
      </div>
      <p className="text-zinc-800 font-semibold text-base">Your cart is empty</p>
      <p className="text-zinc-400 text-sm mt-1">Add something you love</p>
    </div>
  );
}

export default function Cart() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [promoApplied, setPromoApplied] = useState(false);
  const {orderItems:orderSumarryItems,setOrderItems:setOrderSummaryItems}=useUserContext()
  const { getCart, removeFromCart } = useCart();
  const { data, isLoading } = getCart();
  const router=useRouter()

  useEffect(()=>{
    if(!isLoading&&data){
      setOrderSummaryItems(data.data)
    }
  },[isLoading,data])


  const items = (data?.data ?? []).filter((item) => !removed.has(item.id));

  const getQty = (item: CartItem) => quantities[item.id] ?? item.quantity;

  const handleQtyChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const base = data?.data.find((i) => i.id === id)?.quantity ?? 1;
      const current = prev[id] ?? base;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };
    const onSelect=(id:string)=>{
      const exist=orderSumarryItems.find(item=>item.id===id)
      if(exist){
        const filter=orderSumarryItems.filter(item=>item.id!==id)
        setOrderSummaryItems(filter)
      }else{
        const item=items.find(item=>item.id===id)
        if(item){
          setOrderSummaryItems([...orderSumarryItems,item])
        }
      }
    }
  const handleRemove = (id: string) => {
    removeFromCart.mutate(id, {
      onSuccess: () => {
        setRemoved((prev) => new Set(prev).add(id));
      },
    });
  };

  const handleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const existInOrder=(id:string)=>{
    const exist=orderSumarryItems.find(item=>item.id===id)
    return exist?true:false
  }
  const subtotal = orderSumarryItems.reduce((sum, item) => sum + item.productVariant.finalPrice * getQty(item), 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const delivery = orderSumarryItems.reduce((sum, item) => sum + item.productVariant.deliveryCharge, 0);
  const total = subtotal + delivery - discount;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-8 w-40 rounded-lg" />
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Your Cart</h1>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Cart Items */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-zinc-100 px-6 py-2 min-w-0">
            {isLoading ? (
              <div className="py-3">
                <CartRowSkeleton />
                <CartRowSkeleton />
                <CartRowSkeleton />
              </div>
            ) : items.length === 0 ? (
              <EmptyCart />
            ) : (
              items.map((item) => (
                <CartRow
                  key={item.id}
                  item={{ ...item, quantity: getQty(item) }}
                  onQtyChange={handleQtyChange}
                  onRemove={handleRemove}
                  onWishlist={handleWishlist}
                  wishlisted={wishlist.has(item.id)}
                  onSelect={onSelect}
                  existInOrder={existInOrder}
                />
              ))
            )}
          </div>

          {/* Order Summary */}
          {isLoading ? (
            <OrderSummarySkeleton />
          ) : (
            <div className="min-w-xs lg:w-72 bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 lg:sticky lg:top-10 flex-shrink-0">
              <h2 className="text-lg font-bold text-zinc-900 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-semibold text-zinc-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Delivery</span>
                  <span className="font-semibold text-zinc-900">
                    {delivery === 0 ? (
                      <span className="text-emerald-500">Free</span>
                    ) : (
                      `₹${delivery.toFixed(2)}`
                    )}
                  </span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Promo (10% off)</span>
                    <span className="font-semibold">−₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-100 mt-4 pt-4 mb-5 flex justify-between items-center">
                <span className="font-bold text-zinc-900">Total</span>
                <span className="font-bold text-xl text-zinc-900">₹{total.toFixed(2)}</span>
              </div>

              <button disabled={orderSumarryItems.length==0} onClick={()=>{
                orderSumarryItems.length!==0&&router.push("/checkout")
              }}  className="w-full bg-zinc-900 hover:bg-zinc-700 active:scale-[0.98] text-white rounded-full py-3.5 text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2">
                Proceed To Buy
                <ChevronRight size={16} />
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}