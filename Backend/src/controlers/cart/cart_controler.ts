import { Request, Response } from "express";
import { AddToCart } from "../../utils/validatons/cartValidation";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../middleware/errorHandler";
import logger from "../../utils/logger";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
   export  const throwInternalServerError=()=>{
            throw new ApiError('internal server error', 500)
    }
export const addToCart=async(req:Request,res:Response)=>{
    try{
        logger.info("hit add to Cart controler")
        const vr=AddToCart.safeParse(req.body)
        if(!vr.success){
            return res.status(400).json({message:"Input validation error",error:vr.error.flatten().fieldErrors})
        }

        const userId=req?.user?.id
        if(!userId){
            return res.status(401).json({message:"unauthorized",error:"user not authorized"})
        }
        const {variantId,size,quantity,productImageUrl,productName,price,colorName,deliveryCharge}=vr.data
        const variant=await prisma.productVariant.findUnique({where:{id:variantId}})
        if(!variant){
            return res.status(404).json({message:" product variant not found",})
        }
        const cartItem=await prisma.cartItem.create({data:{productImageUrl,Price:price,ProductColorName:colorName,deliveryCharge,productName,userId,quantity,size,productId:variant.productId,productVariantId:variant.id}})
        return res.status(201).json({message:"Added To Cart successfully ",data:cartItem})
    }catch(e){
        logger.info("error while Adding product to cart",e)
        throwInternalServerError()
    }
}

export const getCart=async(req:Request,res:Response)=>{
    try{
        logger.info("hit get cart")
         const userId=req?.user?.id
        if(!userId){
            return res.status(401).json({message:"unauthorized",error:"user not authorized"})
        }
        const cart=await prisma.cartItem.findMany({where:{userId}})
        return res.status(200).json({message:"fetched cart Items successfully",data:cart})
    }
    catch(e){
        logger.error("error while fetching cart",e)
throwInternalServerError()
    }
}

export const RemoveFromCart=async(req:Request,res:Response)=>{
    try{
        const itemId=req.params.id as string
        const userId=req.user?.id
        const deletedItem=await prisma.cartItem.delete({where:{id:itemId,userId}})
        res.status(200).json({message:"Removed from cart ",data:deletedItem})
    }catch(e){
            if(e instanceof PrismaClientKnownRequestError && e.code==="p2025"){
                return res.status(401).json({message:"unauthorized"})
            }
        logger.error("error while remove from cart",e)
        throwInternalServerError()
    }
}