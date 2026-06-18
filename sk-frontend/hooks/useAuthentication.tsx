import { useUserContext } from "@/contextProvider";
import {handleLoginWithEmail, handleEmailVerifation,handleGoogleRegistration,  handleLoginWithAccessToken, handleOtpVerification } from "@/server/authentication";
import { useMutation } from "@tanstack/react-query";

export const useAuthentication = () => {
const {setUser,user}=useUserContext()
  const registerUserWithEmail = useMutation({
    mutationFn: handleEmailVerifation,
  });
  const otpVerifation=useMutation({
    mutationFn:handleOtpVerification
  })
  const registerWithGoogle=useMutation({
    mutationFn:handleGoogleRegistration,
    onMutate:()=>{
      setUser((prev)=>({...prev, isLoading:true}))
    },
    onSuccess:(v)=>{
      localStorage.setItem('access_token',v.data.access_token)
      const data=v.data.data
      setUser({
        isAuthenticated:true,
        role:data.role,
        userName:data.userName,
        email:data.email,
        profilePicture:data.profilePicture
      ,cartCount:data.cartCount,
      isLoading:false
      })
    },
    onError:()=>{
      setUser((prev)=>({...prev, isLoading:false}))
    }
    ,onSettled:()=>{
      setUser((prev)=>({...prev, isLoading:false}))
    }
  })

  const loginWithAccessToken=useMutation({
    mutationFn:handleLoginWithAccessToken,
    onMutate:()=>{
      setUser((prev)=>({...prev, isLoading:true}))
    },
    onSuccess:(v)=>{
      localStorage.setItem('access_token',v.data.access_token)
      const data=v.data.data
      setUser({
        isAuthenticated:true,
        role:data.role,
        userName:data.userName,
        email:data.email,
        profilePicture:data.profilePicture
      ,cartCount:data.cartCount,
      isLoading:false
      })
    },
    onError:()=>{
      setUser((prev)=>({...prev, isLoading:false}))
    }
        ,onSettled:()=>{
      setUser((prev)=>({...prev, isLoading:false}))
    }
  })

  const loginWithEmail=useMutation({
    mutationFn:handleLoginWithEmail,
    onMutate:()=>{
      setUser((prev)=>({...prev, isLoading:true}))
    },
    onError:()=>{
      setUser((prev)=>({...prev, isLoading:false}))
    }    ,onSettled:()=>{
      setUser((prev)=>({...prev, isLoading:false}))
    }
  })

  return {loginWithAccessToken,registerWithGoogle,
loginWithEmail,  otpVerifation,registerUserWithEmail,
  };
};