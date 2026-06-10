import {Request,Response} from 'express'
import { ApiError } from '../../middleware/errorHandler'
import logger from '../../utils/logger'
import {  addressUpdateSchema, createAddressSchema, updateUserSchema } from '../../utils/validatons/userValidation'
import { prisma } from '../../db/prisma'
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

export const createAdress=async(req:Request,res:Response)=>{
try{
    logger.info("hit create Adress ")
    const validationResult=createAddressSchema.safeParse(req.body)
    if(!validationResult.success){
        logger.warn("validation failed")
        return res.status(400).json({error:validationResult.error.flatten(),message:"validation result"})
    }
    const user=await prisma.user.findUnique({where:{id:req.user?.id}})
    if(!user){
        return res.status(401).json({message:'user not found'})
    }

    const data=validationResult.data
    const updatedAdress=await prisma.address.create({data:{
        fullName:data.fullName,
        pincode:data.pincode,
        userId:user.id
        ,state:data.state,
        district:data.district,
        line1:data.line1,
        line2:data.line2,
        town:data.town,
        postOffice:data.postOffice,
        phone:data.phone
    }})

    res.status(200).json({message:"adress updated successfully",data:updatedAdress,})

}catch(e){
    logger.error('error while updating adress',e)
    throw new ApiError("internal Server error",500)
}
}

export const updateUserAddress = async (req: Request, res: Response) => {
  try {
    logger.info('Hit update address')

    const validationResult = addressUpdateSchema.safeParse({
      params: req.params,
      body: req.body,
    })

    if (!validationResult.success) {
      logger.warn('Validation error', validationResult.error)
      return res.status(400).json({
        error: validationResult.error.flatten(),
        message: 'Validation failed',
      })
    }

    const { adressId } = validationResult.data.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const updatedAddress = await prisma.address.update({
      where: { userId, id: adressId },
      data: validationResult.data.body,
    })

    return res.status(200).json({ message: 'Address updated', data: updatedAddress })
  } catch (e) {
    logger.error('Failed to update address', e)
    throw new ApiError('Internal server error', 500)
  }
}