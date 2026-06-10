import { useUserContext } from "@/contextProvider";
import {handleLoginWithEmail, handleEmailVerifation,handleGoogleRegistration,  handleLoginWithAccessToken, handleOtpVerification } from "@/server/authentication";
import { useMutation } from "@tanstack/react-query";

export const useAuthentication = () => {
const {setUser}=useUserContext()
  const registerUserWithEmail = useMutation({
    mutationFn: handleEmailVerifation,
  });
  const otpVerifation=useMutation({
    mutationFn:handleOtpVerification
  })
  const registerWithGoogle=useMutation({
    mutationFn:handleGoogleRegistration
  })

  const loginWithAccessToken=useMutation({
    mutationFn:handleLoginWithAccessToken,
    onSuccess:(v)=>{
      localStorage.setItem('access_token',v.data.access_token)
      const data=v.data.data
      setUser({
        isAuthenticated:true,
        role:data.role,
        userName:data.userName,
        email:data.email,
        profilePicture:data.profilePicture
      ,cartCount:data.cartCount
      })
    },
  })
  const loginWithEmail=useMutation({mutationFn:handleLoginWithEmail})

  return {loginWithAccessToken,registerWithGoogle,
loginWithEmail,  otpVerifation,registerUserWithEmail,
  };
};