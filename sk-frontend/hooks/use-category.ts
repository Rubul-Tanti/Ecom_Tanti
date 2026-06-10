import { handleCreateCategory, handleGetAllCategory } from "@/server/category"
import { useMutation, useQuery } from "@tanstack/react-query"

const useCategory=()=>{

    const createCategory=()=>useMutation({mutationFn:handleCreateCategory})
    const getAllCategory=()=>useQuery({queryKey:['all category'],queryFn:handleGetAllCategory})

    return {createCategory,getAllCategory}
}
export default useCategory
