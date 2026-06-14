import api from "@/lib/axios"
  export   type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
import { handleCreateOrder, handleGetOrder } from "@/server/order"
import { useMutation, useQuery } from "@tanstack/react-query"

const useOrder=()=>{
    const createOrder=useMutation({mutationFn:handleCreateOrder})
    const getOrder=()=>useQuery({queryKey:['orders'],queryFn:handleGetOrder})
    const orderPaid=useMutation({mutationFn:async({orderId,data}:{orderId:string,data:RazorpayPaymentResponse})=>{
        const res=await api.put(`/api/order/paid/${orderId}`,data)
        return res.data
    }})
    return {orderPaid,createOrder,getOrder}
}
export default useOrder