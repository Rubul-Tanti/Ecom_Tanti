import { handleAddToCart, handleGetCart, handleRemoveFromCart } from "@/server/cart"
import { useMutation, useQuery } from "@tanstack/react-query"

const useCart=()=>{
    const addToCart=useMutation({mutationFn:handleAddToCart})
    const removeFromCart=useMutation({mutationFn:handleRemoveFromCart})
    const getCart=()=>useQuery({queryKey:['get-cart'],queryFn:handleGetCart})
    return {addToCart,getCart,removeFromCart}
}
export default useCart