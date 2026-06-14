import api from "@/lib/axios"
import { GetPromoCodeResponse, GetPromoCodesResponse } from "./types";
export type PromoCodeFormValue={
code: string;
    amount: number;
    isActive: boolean;
    expiresAt: string;
    minOrder?: number | undefined;
    maxDiscount?: number | undefined;
    usageLimit?: number | undefined;
}
export const handleGetPromocodes=async()=>{
    const res=await api.get("/api/promocode/")
    return res.data as GetPromoCodesResponse
}
export const handleGetPromocode=async(code:string)=>{
    const res=await api.get(`/api/promocode/${code}`)
    return res.data as GetPromoCodeResponse
}
export const handleCreatePromocodes=async(data:PromoCodeFormValue)=>{
    const res=await api.post("/api/promocode/",data)
    return res.data as GetPromoCodeResponse
}
export const handleUpdatePromocode=async({data,id}:{id:string,data:PromoCodeFormValue})=>{
    const res=await api.put(`/api/promocode/${id}`,data)
    return res.data as GetPromoCodeResponse
}
export const handleDeletePromocode=async(id:string)=>{
    const res=await api.delete(`/api/promocode/${id}`)
    return res.data as GetPromoCodeResponse
}