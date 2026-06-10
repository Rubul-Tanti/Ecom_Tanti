import crypto from "crypto"

export const HashResetPasswordToken=(url:string)=>{
return crypto.createHash('sha256').update(url).digest('hex')
}
export const generateResetPasswordToken = () => {
   const token = crypto.randomBytes(32).toString('hex')
  const hashedToken=HashResetPasswordToken(token)
   return {token,hashedToken}
}