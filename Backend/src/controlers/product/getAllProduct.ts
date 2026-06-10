import {Request,Response} from 'express'
import { ApiError } from '../../middleware/errorHandler'
import { prisma } from '../../db/prisma'
import logger from '../../utils/logger'
import { filterProductSchema } from '../../utils/validatons/productValidation'
export const getAllProduct=async(req:Request,res:Response)=>{
try{
const vr=filterProductSchema.safeParse(req.query)
if(!vr.success){
    return res.status(400).json({message:"validation error",error:vr.error.flatten().fieldErrors})
}
const {isActive,limit,categoryName,page,productslug}=vr.data
console.log(vr.data,'Filter data ................')
const [products]=await Promise.all([prisma.product.findMany({where:{
    categoryName,
    isActive,
    deletedAt:null,
    slug:productslug?.toLowerCase().replace(" ","_")
},skip:(page-1)*limit,take:limit
,include:{events:true,variants:{
    include:{images:true}
}}}),
prisma.product.count({where:{
    categoryName,
}})]
)
res.status(200).json({
    success:true,
    message:'products fetched successfully',
    data:products
})
}catch(e){
    logger.error("error while fetching products",e)
    throw new ApiError('error while fetching products',500)
}
}

// const getNewArraivals=async(req:Request,res:Response)=>{
//     try{
//         const {limit=20,page=1}=req.query
//         const newArraivals=await prisma.product.findMany({skip:Number(limit)*(Number(page)-1)})
//         return res.status(200).json({message:"successfully fetched new arival",data:{newArraivals,total}})
//     }catch(e){

//     }
// }