import api from "@/lib/axios"
import { GetUserResponse } from "./type"
export type AddressForm = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  town: string;
  district: string;
  state: string;
  pincode: string;
};
export const handleGetUser=async()=>{
    const res=await api.get("/api/user/")
    return res.data as GetUserResponse
}
export const handleCreateAddress=async(data:AddressForm)=>{
    const res=await api.post("/api/address/",data)
    return res.data
}