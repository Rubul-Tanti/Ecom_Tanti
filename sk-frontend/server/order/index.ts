import api from "@/lib/axios"
import { GetOrdersResponse, OrderPayload } from "./types"

export const handleCreateOrder=async(data:OrderPayload)=>{
    const res=await api.post("/api/order/",data)
    return res.data
}
export const handleGetOrder=async()=>{
    const res=await api.get("/api/order/")
    return res.data as GetOrdersResponse
}