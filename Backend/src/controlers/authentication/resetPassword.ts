import {Request,Response} from 'express'
import {z} from 'zod'
import { ApiError } from '../../middleware/errorHandler'
import { prisma } from '../../db/prisma'
import { HashResetPasswordToken} from '../../utils/resetPasswordToken'
import { hashPassword } from '../../utils/hashPassword'
import { getsafeUser } from './loginUser'
const zod=z.object({
    url:z.string(),
    newPassword:z.string().min(3).max(12),
    email:z.string().email('invalid email')
})
const resetPassword=async(req:Request,res:Response)=>{
    try{
        const validationResult=await zod.safeParse(req.body)
        if(validationResult.error){
            return res.status(400).json({message:'validation error',error:validationResult.error.flatten()})
        }
        const {email,url,newPassword}=validationResult.data
        const token=HashResetPasswordToken(url)
        const user=await prisma.user.findFirst({where:{resetPasswordToken:token,resetPasswordTokenExpires:{gt:new Date()},email}})
        console.log(user)
            if(!user){
                return res.status(404).json({message:"reset token expired please try again"})
            }
            const hashedPassword=await hashPassword(newPassword)
            const updatedUser=await prisma.user.update({where:{id:user.id},data:{password:hashedPassword,resetPasswordToken:null,resetPasswordTokenExpires:null},include:{_count:{select:{cart:true}}}})
            res.status(200).json({success:true,message:"password reset successfully",data:getsafeUser(updatedUser)})
        }catch(e){
            console.log(e)
        throw new ApiError("internal server error",500)
    }
}
export default resetPassword