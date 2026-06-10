import api from "@/lib/axios"
import { allCategoryResponse, createCategoryProps } from "./types"

export const handleCreateCategory=async(data:FormData)=>{
    const res=await api.post('/api/category/create',data)
    return res
}
export const handleGetAllCategory=async()=>{
    const res=await api.get('/api/category/get-categories')
    return res.data as allCategoryResponse
}