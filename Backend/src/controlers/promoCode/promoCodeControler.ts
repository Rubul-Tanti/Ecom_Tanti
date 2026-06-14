import { prisma } from "../../db/prisma"
import logger from "../../utils/logger"
import { createPromoCodeSchema, updatePromoCodeSchema } from "../../utils/validatons/promoCodeValidation"
import { throwInternalServerError } from "../event/eventControler"
import {Request,Response} from "express"
export const createPromoCode=async(req:Request,res:Response)=>{
    try{
        const vr=createPromoCodeSchema.safeParse(req.body)
        if(!vr.success){
            return res.status(400).json({message:"Input validation error",error:vr.error.flatten().fieldErrors})
        }
        const promoCode=await prisma.promoCode.create({data:vr.data})
        res.status(200).json({message:"created promo code ",data:promoCode})
    }
    catch(e){
        logger.error("error while creating promo code",e)
        throwInternalServerError()
    }
}

export const getPromocodes=async(req:Request,res:Response)=>{
    try{
        const promoCodes=await prisma.promoCode.findMany()
        return res.status(200).json({message:"fetched promoCodes",data:promoCodes})
    }catch(e){
        logger.error("error while fetching promo codes",e)
        throwInternalServerError()
    }
}

export const getPromoCodeById=async(req:Request,res:Response)=>{
    try{
        const id=req.params.id as string
        const promoCode=await prisma.promoCode.findFirst({where:{code:id},include:{usages:true}})
        if((promoCode?.usedCount||1)>=(promoCode?.usageLimit||1)){

            return res.status(400).json({message:"invalid Promo Code"})
        }
        return res.status(200).json({message:"error while fetching promo code",data:promoCode})
    }
    catch(e){
        logger.error("error while fetching promo code by id",e)
        throwInternalServerError()
    }
}
export const deletePromoCode=async(req:Request,res:Response)=>{
    try{
        const id=req.params.id as string
        const promoCode=await prisma.promoCode.delete({where:{id}})
        return res.status(200).json({message:"error while fetching promo code",data:promoCode})
    }
    catch(e){
        logger.error("error while fetching promo code by id",e)
        throwInternalServerError()
    }
}
export const updatePromoCode=async(req:Request,res:Response)=>{
    try{
        const id=req.params.id as string
        const vr=updatePromoCodeSchema.safeParse(req.body)
        if(!vr.success){
        return res.status(400).json({message:'Input validation error',error:vr.error.flatten().fieldErrors})
        }
        const updatedPromoCode=await prisma.promoCode.update({where:{id},data:{...vr.data}})
        return res.status(200).json({message:"updated promo code",data:updatedPromoCode})
    }catch(e){
        logger.error("error while updating Promo code ",e)
        throwInternalServerError()
    }
}