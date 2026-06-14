'use client'
import { CartItem } from "@/server/cart/types";
import { createContext, SetStateAction, useContext, useState
 } from "react";
 export const initialCartItem: CartItem[] =[ {
  id: "",
  orderId: null,
  productId: "",
  quantity: 0,
  size: "",
  productVariantId: "",
  userId: "",
  createdAt: "",
  updatedAt: "",

  product: {
    id: "",
    name: "",
  },

  productVariant: {
    id: "",
    finalPrice: 0,
    color: "",
    colorName: "",
    deliveryCharge: 0,
    images: [],
  },
}];
 type UserType= {
    isAuthenticated:boolean
    role:'ADMIN'|'USER'|'MODERATOR'|null,
         userName:string|null,
        email:string|null,
        profilePicture:string|null,
        cartCount:number|0
 }
 type userContextType={
    orderItems:CartItem[],
    setOrderItems:React.Dispatch<SetStateAction<CartItem[]>>
    user:UserType,
    setUser:React.Dispatch<SetStateAction<UserType>>
loginPopup:boolean, setLoginPopup:React.Dispatch<SetStateAction<boolean>>
}
 const UserContext=createContext<userContextType>({
    user:{
        isAuthenticated:false,
        role:null,
        userName:null,
        email:null,
        profilePicture:null,
        cartCount:0
        },
        orderItems:initialCartItem,
        setOrderItems:()=>{},
    setUser:()=>{},
    loginPopup:false, setLoginPopup:()=>{}
 })

export  const ContextProvider=({children}:{children:React.ReactNode})=>{
     const [loginPopup, setLoginPopup] = useState(false);
    const [user,setUser]=useState<UserType>({isAuthenticated:false,role:null,userName:null,
        email:null,
        profilePicture:null,cartCount:0})
        const [orderItems,setOrderItems]=useState<CartItem[]>([])

    return <UserContext value={{orderItems,setOrderItems,user,setUser,loginPopup,setLoginPopup}}>{children}</UserContext>
}

export const useUserContext=()=>{
   return useContext(UserContext)}
