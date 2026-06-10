import crypto from 'crypto'
export const generateOtp=()=>{
    const otp=crypto.randomInt(100000,1000000)
    return otp
}