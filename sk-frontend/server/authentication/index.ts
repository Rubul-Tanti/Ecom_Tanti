'use client'
import api from "@/lib/axios"

export const handleEmailVerifation=(data:{userName:string,password:string,email:string})=>{
const res=api.post('/api/user/email-verification',data)
return res
}
export const handleOtpVerification=(data:{otp:string,email:string,password:string,userName:string})=>{
    const res=api.post('/api/user/register',data)
return res
}
export const handleGoogleRegistration=(token:string)=>{
    const res=api.post('/api/user/register-with-google',{token})
    return res
}
export const handleLoginWithAccessToken=async()=>{
    const res=await api.post('/api/user/login')
    return res
}
export const handleRefreshAccessToken=async()=>{
    try{

        const res=await api.get('/api/user/refresh')
        if(res.status==200){
            localStorage.setItem('access_token',res.data.access_token)
            window.location.reload()
        }
    }catch(e:any){
        // if(e.response.status===404||e.response.status===500){
            localStorage.removeItem('access_token')
        // }

    }
}
export const handleLogout=async()=>{
    const res=await api.get('/api/user/logout')
    if(res.status===200){
        localStorage.removeItem('access_token')
    }
    return res
}


export const handleLoginWithEmail=async(data:{email:string,password:string})=>{
const res=await api.post('/api/user/login',data)
return res
}