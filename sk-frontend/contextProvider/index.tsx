'use client'
import { createContext, SetStateAction, useContext, useState
 } from "react";
 type UserType= {
    isAuthenticated:boolean
    role:'ADMIN'|'USER'|'MODERATOR'|null,
         userName:string|null,
        email:string|null,
        profilePicture:string|null,
        cartCount:number|0
 }
 type userContextType={
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
    setUser:()=>{},
    loginPopup:false, setLoginPopup:()=>{}
 })

export  const ContextProvider=({children}:{children:React.ReactNode})=>{
     const [loginPopup, setLoginPopup] = useState(false);
    const [user,setUser]=useState<UserType>({isAuthenticated:false,role:null,userName:null,
        email:null,
        profilePicture:null,cartCount:0})

    return <UserContext value={{user,setUser,loginPopup,setLoginPopup}}>{children}</UserContext>

}

export const useUserContext=()=>{
   return useContext(UserContext)}
