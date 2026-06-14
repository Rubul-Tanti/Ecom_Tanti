import {Request,Response}from "express"
import { ApiError } from "../../middleware/errorHandler"
import logger from "../../utils/logger"
import { createEventSchema, updateEventSchema } from "../../utils/validatons/eventValidation"
import { uploadToCloudinary } from "../../services/uploadToCloudinary"
import { prisma } from "../../db/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"
export const throwInternalServerError=()=>{
    throw new ApiError("Internal server Error",500)
}
export const createEvent=async(req:Request,res:Response)=>{
    try{
        const vr=createEventSchema.safeParse(req.body)
            if(!vr.success){
        return res.status(400).json({message:"input error",error:vr.error.flatten().fieldErrors})
    }
        const files=req.files as Express.Multer.File[] ||[]
        if(files.length < 2){return res.status(400).json({message:"required thumnail and banner"})}
        const Images=await Promise.all(
            files.map(f=>uploadToCloudinary(f)))
            const getImageUrl=(v:string)=>{
                const url=Images.find(img=>img.public_id.split("-")[0]===v)?.url||''
                return url
            }

    const newEvent=await prisma.event.create({data:{
        ...vr.data,
        thumbnail:getImageUrl('thumnail'),
        banner:getImageUrl('banner'),
        slug:vr.data.name.toLowerCase(),
    }})
    res.status(201).json({message:"successfully created a Event ",data:newEvent})
    return
}catch(e){
        logger.error("error while creating Event",e)
        throwInternalServerError()
    }
}
export const editEvent=async(req:Request,res:Response)=>{
    try{
        const id=req.params.id as string
        const vr=updateEventSchema.safeParse(req.body)
        if(!vr.success){
            return res.status(400).json({message:"Invalid Input Error",error:vr.error})
        }
        const updatedEvent=await prisma.event.update({where:{deletedAt:null,id},data:{...vr.data,slug:vr.data.name?.toLowerCase()}})
        return res.status(200).json({message:"updated successfully",data:updatedEvent})

    }catch(e){
        logger.error("error while editing event",e)
        throwInternalServerError()
    }
}
export const deleteEvent=async(req:Request,res:Response)=>{
    try{
    const id=req.params.id as string
    const deleteEvent=await prisma.event.update({where:{id},data:{deletedAt: new Date()}})
        return res.status(204).json({message:"event deleted successfully",data:deleteEvent})
    }
    catch(e){
     if(e instanceof PrismaClientKnownRequestError&&e.code==='p2025'){
        return res.status(404).json({message:"event not found"})
     }
        logger.error("error While Deleting Event")
        throwInternalServerError()
    }
}
export const getAllEvents=async(req:Request,res:Response)=>{
 try{
    const events = await prisma.event.findMany({
  where: {
    deletedAt: null,
  },
  include: {
    _count: {
      select: {
        products: true,
      },
    },
  },
});
    const totalDraft=events.filter(e=>e.status==='DRAFT').length
    const totalActive=events.filter(e=>e.status==='ACTIVE').length
    let totalProduct=0
    events.forEach((e=>totalProduct += e._count.products))
    res.status(200).json({message:"successfully fetched events",data:{events,totalDraft,totalActive,totalProducts:totalProduct}})
 }catch(e){
    logger.error("Error while fetching Events",e)
    throwInternalServerError()
 }
}
export const getEventById=async(req:Request,res:Response)=>{
    try{
        const id=req.params.id as string
        const event =await prisma.event.findUnique({where:{id,deletedAt:null},include:{products:{include:{productImages:true,variants:{include:{images:true}}}},_count:{select:{products:true}}}})
        return res.status(200).json({message:"successfully fetched event",data:event})
    }catch(e){
    logger.error("Error while fetching Event",e)
    throwInternalServerError()
    }
}

export const getEventsForUser=async(req:Request,res:Response)=>{
    try{
        const events=await prisma.event.findMany({where:{deletedAt:null,status:'ACTIVE',endDate:{gte:new Date()}},include:{_count:{select:{products:true}}}})
        return res.status(200).json({message:"successfully fetched events",data:events})
    }catch(e){
    logger.error("Error while fetching Event for user",e)
    throwInternalServerError()
    }
}

export const addProductToEvent=async(req:Request,res:Response)=>{
    try{
        const {productId,eventId}=<{productId:string,eventId:string}>req.params;
        const product=await prisma.product.findUnique({where:{id:productId,isActive:true,deletedAt:null}})
        if(!product){
            return res.status(400).json({message:"only Actvie product can be added"})
        }
        const event=await prisma.event.update({where:{id:eventId},data:{products:{connect:{id:productId}}}})
        return res.status(200).json({message:"product added to event",data:event})
    }catch(e){
        if(e instanceof PrismaClientKnownRequestError && e.code==='p2025'){
            return res.status(404).json({message:"event not found"})
        }
        logger.error("Error while Adding Product To Event",e)
        throwInternalServerError()
    }
}