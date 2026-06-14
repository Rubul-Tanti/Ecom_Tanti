import {Request,Response} from "express"
import { throwInternalServerError } from "../event/eventControler"
import logger from "../../utils/logger"
import { prisma } from "../../db/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"
import { createAddressSchema, updateAddressSchema } from "../../utils/validatons/addressValidation"

export const createAddress=async(req:Request,res:Response)=>{
    try{
        const vr=createAddressSchema.safeParse(req.body)
        const userId=req?.user?.id
        if(!userId){
            return res.status(401).json({message:"unauthorized"})
        }
        if(!vr.success){
            return res.status(400).json({message:"Input validation error",error:vr.error.flatten().fieldErrors})
        }
        const newAddress=await prisma.address.create({data:{...vr.data,userId,}})
        return res.status(201).json({message:"created new Address",data:newAddress})
    }catch(e){
        logger.error("error while creating address",e)
        throwInternalServerError()
    }
}

export const updateAddress=async(req:Request,res:Response)=>{
    try{
         const userId=req?.user?.id
        const id=req.params.id as string
         if(!userId){
            return res.status(401).json({message:"unauthorized"})
        }
        const vr=updateAddressSchema.safeParse(req.body)
            if(!vr.success){
            return res.status(400).json({message:"Input validation error",error:vr.error.flatten().fieldErrors})
        }
        const updatedAddress=await prisma.address.update({where:{userId,id},data:vr.data})
        return res.status(200).json({message:"successfully updated Adress",data:updatedAddress})
    }
    catch(e){
        if(e instanceof PrismaClientKnownRequestError && e.code=="p2025"){
            return res.status(404).json({message:" Adress not found"})
        }
        logger.error("Error while updated Address",e)
        throwInternalServerError()
    }
}

export const getAdress=async(req:Request,res:Response)=>{
    try{
        const userId=req?.user?.id
        if(!userId){
            return res.status(401).json({message:"unauthorized"})
        }
        const Address=await prisma.address.findMany({where:{userId}})
        return res.status(200).json({message:"fetched Address",data:Address})
    }catch(e){
        logger.error("Error while fetching Adress")
        throwInternalServerError()
    }
}

export const deleteAdress=async(req:Request,res:Response)=>{
    try{
         const userId=req?.user?.id
         const id=req?.params.id as string
        if(!userId){
            return res.status(401).json({message:"unauthorized"})
        }
        const deletedAddress=await prisma.address.delete({where:{userId,id}})
    }catch(e){
        if(e instanceof PrismaClientKnownRequestError && e.code=="p2025"){
            return res.status(404).json({message:" Adress not found"})
        }
        logger.error("Error while deleting Address")
        throwInternalServerError()
    }
}