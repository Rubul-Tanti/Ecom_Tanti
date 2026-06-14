import {Request,Response} from 'express'
import { ApiError } from '../../middleware/errorHandler'
import logger from '../../utils/logger'
import {  addressUpdateSchema, createAddressSchema, updateUserSchema } from '../../utils/validatons/userValidation'
import { prisma } from '../../db/prisma'
import { throwInternalServerError } from '../event/eventControler'
export const updateUser=async(req:Request,res:Response)=>{
logger.info("hit update user")
    try{
    const validationResult=await updateUserSchema.safeParse(req.body)
    if(validationResult.error){
        return res.status(400).json({message:'validation error',error:validationResult.error.flatten()})
    }
    try{
        const user=await prisma.user.update({where:{id:req.user?.id},data:validationResult.data})
        res.status(200).json({message:"updated successfully",data:user,})
        logger.info("updated user",user)
    }catch{
        return res.status(402).json({message:'not authorized'})
    }

}catch(e){
    logger.error("error while updating user",e)
    throw new ApiError("internal server error",500)
}
}

export const getUser=async(req:Request,res:Response)=>{
  try{
    const userId=req?.user?.id
    if(!userId){
      return res.status(401).json({message:"not authorized"})
    }
    const user =await prisma.user.findFirst({where:{id:userId},include:{addresses:true}})
  return res.status(200).json({message:"fetched user",data:user})
  }catch(e){
    logger.error("Error while fetching user",e)
    throwInternalServerError()
  }
}