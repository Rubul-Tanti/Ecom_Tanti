import {Request,Response} from 'express'
import { registerUserSchema } from "../../utils/validatons/userValidation"
import { prisma } from '../../db/prisma'
import { hashPassword } from '../../utils/hashPassword'
import { ApiError } from '../../middleware/errorHandler'
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken'
import logger from '../../utils/logger'
import { getsafeUser } from './loginUser'

const registerUser=async(req:Request,res:Response)=>{
    logger.info("hit register user")
    try{const date=new Date()
        const validationResult=await registerUserSchema.safeParse(req.body)
        if(validationResult.error){
            logger.error('validation failed at register user',req.body)
            return res.status(400).json({message:validationResult.error.flatten()})
        }
        const {email,password,otp,userName}=validationResult.data
        const userAlreadyExist=await prisma.user.findFirst({where:{email}})
        if(userAlreadyExist!==null){
            logger.warn("user already exist")
            return res.status(400).json({message:"user already exist"})
        }

        const otpObj=await prisma.otp.findFirst({where:{email,otp}})
        if(otpObj===null){
            return res.status(402).json({message:'otp does not match'})
        }
        const now=date.getTime()
        const createdAt=otpObj.createdAt.getTime()
        const remainingTime=(now-createdAt)/1000/60
        if(remainingTime>5){
            prisma.user.deleteMany({where:{email}})
               return res.status(402).json({message:'otp expired, please try again later'})
        }
            const hashedPassword=await hashPassword(password)
            const newUser=await prisma.user.create({data:{
                email:email,
                userName,
                password:hashedPassword
            },include:{_count:{select:{cart:true}}}})
            logger.info('new user create',newUser)
            if(newUser==null){
                throw new ApiError('error create new user',500)
            }
            await prisma.otp.delete({where:{email}})
            const access_token=await generateAccessToken(newUser.publicId)
            const refresh_token=await generateRefreshToken(newUser.publicId)

        res.status(200).cookie("refresh_token",refresh_token,{httpOnly:true,secure:true}).json({success:true,message:'user created successfully',data:getsafeUser(newUser),access_token})

    }catch(e){
        logger.error("error registering user",e)
throw new ApiError('internal server error',500)
    }
}
export default registerUser