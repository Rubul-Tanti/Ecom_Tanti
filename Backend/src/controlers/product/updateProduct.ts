import { ApiError } from "../../middleware/errorHandler"
import logger from "../../utils/logger"
import { Request, Response } from 'express'
import { updateProductSchema, updateProductVariantSchema, variantSchema } from "../../utils/validatons/productValidation"
import { prisma } from "../../db/prisma"
import { PrismaClientKnownRequestError } from "../../generated/prisma/internal/prismaNamespace"
import { uploadToCloudinary } from "../../services/uploadToCloudinary"

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const slug = req.params.id as string

        const parsed = updateProductSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation error",
                error: parsed.error.flatten()
            })
        }
        const data = parsed.data
        const product = await prisma.product.findUnique({
            where: { slug }
        })

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            })
        }

        const updatedProduct = await prisma.product.update({
            where: { slug },
            data: {
                name: data.name,
                description: data.description,
                moreAboutProduct: data.moreAboutProduct,
                categoryId:data.categoryId,
                refundable: data.refundable,
                returnable: data.returnable,
                returnWindowDays: data.returnWindowDays,
                isActive: data.isActive,
                isFeatured: data.isFeatured,
            },
            include: { variants: true }
        })

        return res.status(200).json({
            message: "Product updated successfully",
            success: true,
            data: updatedProduct
        })

    } catch (e:unknown) {
        if(e instanceof PrismaClientKnownRequestError && e.code==='p2025'){
            return res.status(404).json({message:"product not found"})
        }

        logger.error("Error while updating product", e)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const updateVariant = async (req: Request, res: Response) => {

    try {
             const id = req.params.id as string
        if(!id){
            return res.status(400).json({message:"Variant ID is required"})
        }

        const parsed = updateProductVariantSchema.safeParse(req.body)
        if(!parsed.success){
            return res.status(400).json({message:"validation error",error:parsed.error.flatten()})
        }
        const updatedVariant=await prisma.productVariant.update({where:{id},data:parsed.data})
    res.status(200).json({message:"product variant updated successfully",success:true,data:updatedVariant})

    } catch (e) {
              if(e instanceof PrismaClientKnownRequestError&&e.code==="p2025"){
            return res.status(404).json({message:"variant not found"})
        }

        logger.error("Error while updating productVariant", e)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const getProduct=async(req:Request,res:Response)=>{
    try{
        const id=req.params.id as string;
        const userId=req.user?.id
        if(!id){
            return res.status(400).json({message:"Product ID is required"})
        }

         const product=await prisma.product.findUnique({where:{slug:id,deletedAt:null},include:{variants:{
            include:{images:true}
         }}
        })
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        if(userId){
    const variantIds = product.variants.map(v => v.id);

const existingCartItems = await prisma.cartItem.findMany({
  where: {
    userId,
    productId: product.id,
    productVariantId: {
      in: variantIds,
    },
  }
});

const existInCart = existingCartItems.map(item => item.productVariantId);
        return res.status(200).json({message:'successfully fetched product',success:true,data:product,existInCart})
    }
        return res.status(200).json({message:'successfully fetched product',success:true,data:product})

    }catch(e){
              if(e instanceof PrismaClientKnownRequestError&&e.code==="p2025"){
            return res.status(404).json({message:"product not found"})
        }

        logger.error("Error while fetching product", e)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const deleteVariantImage=async(req:Request,res:Response)=>{
try{
logger.info("hit delete Variant image")
const id=req.params.id as string ;
    const deletedImage=await prisma.productImage.delete({where:{id}})
    res.status(200).json({success:true,data:deletedImage,message:"successfully deleted Image"})

}catch(e){
    if(e instanceof PrismaClientKnownRequestError&&e.code==="p2025"){
        return res.status(404).json({message:"does not exist"})
    }
        logger.error("Error while deleting Image", e)
     throw new ApiError("Error while deleting Image",500)
}
}
export const addVariant=async(req:Request,res:Response)=>{
try{
    const productId=req.params.productId as string
    const files=req.files as Express.Multer.File[] ||[]
    const parsed=variantSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({message:"validation error",error:parsed.error.flatten()})
    }
    if(files&&files.length===0){
        return res.status(400).json({message:"At least one image is required"})
    }
  const Images = await Promise.all(
  files?.map((file: Express.Multer.File) =>
    uploadToCloudinary(file)
  ) || []
)
    const getUrl=(sortOrder:number|undefined)=>{
return  Images.find(img=>img.public_id.split('-')[0].split('_')[1]===sortOrder?.toString())?.url||""
    }
    const variantData=parsed.data
    const product=await prisma.product.findUnique({where:{id:productId}})
    if(!product){
        return res.status(404).json({message:"Product not found"})
    }
    const newVariant=await prisma.productVariant.create({data:{
        productId,
        finalPrice:variantData.finalPrice,
        color: variantData.color,
        colorName: variantData.colorName,
        price: variantData.price,
        deleveryCharge:variantData.deliveryCharge,
        discountPercentage: variantData.discountPercentage,
        sku: `${product.slug}-${variantData.colorName}`,
        discountPrice: variantData.discountPrice,
        size: variantData.size,
        stock: variantData.stock,
        stockToDisplay: variantData.stockToDisplay,
        lowStockThreshold: variantData.lowStockThreshold,
        images:{create:variantData.images.map((img)=>({altText:img.altText,isPrimary:img.isPrimary,sortOrder:img.sortOrder,url:getUrl(img.sortOrder),
        }))}
    },include:{images:true}})
    res.status(201).json({message:"Variant added successfully",success:true,data:newVariant})
}catch(e){
    logger.error("Error while adding variant", e)
     throw new ApiError("Error while adding variant",500)}
}

export const deleteProduct=async(req:Request,res:Response)=>{
    try{
        const id=req.params.id as string
        const deleteProduct=await prisma.product.update({where:{id},data:{deletedAt:new Date()}})
        res.status(200).json({message:"Product deleted successfully",success:true,data:deleteProduct})
    }catch(e){
        if(e instanceof PrismaClientKnownRequestError&&e.code==="p2025"){
            return res.status(404).json({message:"product not found"})
        }
        logger.error("Error while deleting product", e)
        throw new ApiError("Error while deleting product",500)
    }

}
export const deleteProductVariant=async(req:Request,res:Response)=>{
    try{
        const id=req.params.id as string
        const deleteVariant=await prisma.productVariant.delete({where:{id}})
        res.status(200).json({message:"Product variant deleted successfully",success:true,data:deleteVariant})
    }catch(e){
        if(e instanceof PrismaClientKnownRequestError&&e.code==="p2025"){
            return res.status(404).json({message:"variant not found"})
        }
        logger.error("Error while deleting product variant", e)
        throw new ApiError("Error while deleting product variant",500)
    }
}