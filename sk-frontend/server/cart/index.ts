import api from "@/lib/axios"
import { GetCartResponse } from "./types"

export const handleAddToCart=async({deliveryCharge,productImageUrl,size,quantity,variantId,productName,colorName,productPrice}:{deliveryCharge:number,productImageUrl:string,productName:string,colorName:string,productPrice:number,size:string,quantity:number,variantId:string})=>{
const res=await api.post("/api/cart/",{size,quantity,variantId,productName,colorName,price:productPrice.toString(),productImageUrl,deliveryCharge})
return res.data
}
export const handleGetCart=async()=>{
    const res=await api.get("/api/cart/")
    return res.data as GetCartResponse
}
export const handleRemoveFromCart=async(id:string)=>{
    const res=await api.delete(`/api/cart/${id}`)
    return res.data
}
