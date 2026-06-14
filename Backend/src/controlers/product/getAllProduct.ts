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

export const getMostPopular = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1, categoryName } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, parseInt(limit as string) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Get most popular products based on:
    // 1. Number of orders (salesCount)
    // 2. Average rating
    // 3. Review count
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(categoryName && { categoryName: categoryName as string }),
      },
      include: {
        variants: {
          include: {
            images: true,
          },
        },
        events: true,
        _count: {
          select: {
            orderItems: true,
            reviews: true,
          },
        },
      },
      orderBy: [
        // Order by highest average rating first
        { averageRating: 'desc' },
        // Then by review count
        { reviewCount: 'desc' },
      ],
      skip,
      take: limitNum,
    });

    // Enrich with order count and transform response
    const enrichedProducts = products.map((product) => ({
      ...product,
      orderCount: product._count.orderItems,
    }));

    // Get total count for pagination
    const totalCount = await prisma.product.count({
      where: {
        isActive: true,
        deletedAt: null,
        ...(categoryName && { categoryName: categoryName as string }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Most popular products fetched successfully',
      data: enrichedProducts,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (e) {
    logger.error('error while fetching most popular products', e);
    throw new ApiError('error while fetching most popular products', 500);
  }
};