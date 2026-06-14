import api from "@/lib/axios"
import { CartResponse } from "./types"

export const handleAddToCart=async({size,quantity,variantId}:{size:string,quantity:number,variantId:string})=>{
const res=await api.post("/api/cart/",{size,quantity,variantId})
return res.data
}
export const handleGetCart=async()=>{
    const res=await api.get("/api/cart/")
    return res.data as CartResponse
}
export const handleRemoveFromCart=async(id:string)=>{
    const res=await api.delete(`/api/cart/${id}`)
    return res.data
}
