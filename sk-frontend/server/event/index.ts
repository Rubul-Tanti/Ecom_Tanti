import api from "@/lib/axios"
import { EventFormData, GetEventResponse, GetEventsResponse, GetEventsResponseDashboard } from "./types"

export const handleCreateEvent=async(data:FormData)=>{
    const res=await api.post("/api/event/",data)
    return res.data
}
export const handleUpdateEvent=async({id,data}:{id:string,data:EventFormData})=>{
    const res=await api.put(`/api/event/${id}`,data)
    return res.data
}
export const handleDeleteEvent=async(id:string)=>{
    const res=await api.delete(`/api/event/${id}`)
return res.data
}

export const handleGetEvents=async()=>{
const res=await api.get("/api/event/")
return res.data as GetEventsResponse
}
export const handleGetEventById=async(id:string)=>{
const res=await api.get(`/api/event/${id}`)
return res.data as GetEventResponse
}
export const handleGetEventsForUser=async()=>{
const res=await api.get("/api/event/get")
return res.data as GetEventsResponseDashboard
}
export const handleAddProductToEvent=async({productId,eventId}:{productId:string,eventId:string})=>{
    const res=await api.post(`/api/event/${eventId}/product/${productId}`)
}