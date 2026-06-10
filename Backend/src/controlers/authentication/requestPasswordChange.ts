import {Request,Response} from 'express'
import { ApiError } from '../../middleware/errorHandler'
import {z} from "zod"
import { prisma } from '../../db/prisma'
import { generateResetPasswordToken } from '../../utils/resetPasswordToken'
import sendResetPasswordToken from '../../services/emailService/sendResetToken'
import { getsafeUser } from './loginUser'
import logger from '../../utils/logger'
const zod=z.object({
    email:z.string().email("invalid email")
})
const requestPasswordChange=async(req:Request,res:Response)=>{
    try{
        const {email}=req.body
        const validationResult=await zod.safeParse(req.body)
        if(validationResult.error){
                return res.status(400).json({message:'validation error',error:validationResult.error.flatten()})
            }
            const user=await prisma.user.findUnique({where:{email}})
            if(!user){
            return res.status(400).json({message:'user now found',})
        }
        const {token,hashedToken}=generateResetPasswordToken()

        const updateUser=await prisma.user.update({where:{email},data:{
            resetPasswordToken:hashedToken,
            resetPasswordTokenExpires:new Date(Date.now()+15*60*1000)
        },include:{_count:{select:{cart:true}}}})
        await sendResetPasswordToken(token,email)
        res.status(200).json({success:true,message:'is account exist with this email we will send a email with reset link',data:getsafeUser(updateUser)})


    }catch(e){
        logger.error('error while requesting for password reset',e)
        throw new ApiError("internal server error",500)
    }
}
export default requestPasswordChange