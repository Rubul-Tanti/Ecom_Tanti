import { handleCreateAddress, handleGetUser } from "@/server/user"
import { useMutation, useQuery } from "@tanstack/react-query"

const useUser=()=>{
    const getUser=()=>useQuery({queryKey:['user'],queryFn:handleGetUser})
    const createAddress=useMutation({mutationFn:handleCreateAddress})

    return {getUser,createAddress}
}
export default useUser