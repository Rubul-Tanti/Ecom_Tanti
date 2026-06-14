import { handleCreatePromocodes, handleDeletePromocode, handleGetPromocode, handleGetPromocodes, handleUpdatePromocode } from "@/server/promoCodes"
import { useMutation, useQuery } from "@tanstack/react-query"

const usePromocode=()=>{
  const  getPromoCodes=()=>useQuery({queryKey:['promocodes'],queryFn:handleGetPromocodes})
  const  getPromoCode=(code:string)=>useQuery({queryKey:['promocode'],queryFn:()=>handleGetPromocode(code)})
  const createPromoCodes=useMutation({mutationFn:handleCreatePromocodes})
  const updatePromoCode=useMutation({mutationFn:handleUpdatePromocode})
  const deletePromoCode=useMutation({mutationFn:handleDeletePromocode})
  return {getPromoCodes,getPromoCode,createPromoCodes,updatePromoCode,deletePromoCode}

  }
export default usePromocode