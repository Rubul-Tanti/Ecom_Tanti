import { Request, Response } from 'express'
import { ApiError } from '../../middleware/errorHandler'
import logger from '../../utils/logger'
import { prisma } from '../../db/prisma'
import { createProductSchema, productImageSchema } from '../../utils/validatons/productValidation'
import { Prisma } from '../../generated/prisma/client'
import { uploadToCloudinary } from '../../services/uploadToCloudinary'
import { getUploadedFile } from '../category/categories'

type ProductWithVariant = Prisma.ProductGetPayload<{
  include: {
    variants: {
      include: {
        images: true
      }
    }
  }
}>

export const getSafeProduct = (product: ProductWithVariant) => {
  return {
    id: product.slug,
    name: product.name,
    description: product.description,
    moreAboutProduct: product.moreAboutProduct,
    refundable: product.refundable,
    returnable: product.returnable,
    returnWindowDays: product.returnWindowDays,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    createdAt: product.createdAt,
    variants: product.variants
  }
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    logger.info("hit create product")
    let uploads:{public_id:string,url:string}[]
    const role = req.user?.role
    if (role !== "ADMIN" && role !== "MODERATOR") {
      return res.status(403).json({ message: "not authorized" })
    }
    const files = req.files as Express.Multer.File[]

    if (!files?.length) {
    return res.status(400).json({message:'atleast one pic is required'})
    }
    const validationResult = createProductSchema.safeParse(req.body)

    if (!validationResult.success) {
      return res.status(400).json({
        message: "validation error",
        error: validationResult.error.flatten().fieldErrors
      })
    }

    const data = validationResult.data
    if(files.length){
      uploads = await Promise.all(
        files.map(file =>uploadToCloudinary(file))
      )
    }
    const product = await prisma.product.create({
      data: {
        slug:data.name.toLowerCase().replace(' ',"_"),
        name: data.name,
        description: data.description,
        moreAboutProduct: data.moreAboutProduct,
        categoryName:data.categoryName,
        refundable: data.refundable,
        returnable: data.returnable,
        returnWindowDays: data.returnWindowDays,
        isActive: data.isActive,
        isFeatured: data.isFeatured,

        variants: {
          create: data.variants.map((v, i) => ({
            size: v.size,
            color: v.color,
            finalPrice:v.finalPrice,
            colorName:v.colorName,
            deliveryCharge:v.deliveryCharge,
            price: v.price,
            discountPrice: v.discountPrice,
            discountPercentage: v.discountPercentage,
            sku: `${data.name}-${v.color}-${v.size}-${Date.now()}-${i}`,
            stock: v.stock,
            stockToDisplay: v.stockToDisplay,
            lowStockThreshold: v.lowStockThreshold,

            images: {
              create: v.images.map((img, i) => ({
                url:uploads.find((u) => u.public_id.split('-')[0] ===img.altText)?.url||'',
                altText: img.altText,
                isPrimary: img.isPrimary,
                sortOrder: i,
              }))
            }
          }))
        }
      },

      include: {
        variants: {
          include: {
            images: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'product created successfully',
      data: getSafeProduct(product)
    })

  } catch (e) {
    logger.error("error while creating product", e)
    throw new ApiError("internal server error", 500)
  }
}
export const createImageVariant = async (req: Request, res: Response) => {
  try {
    const file = getUploadedFile(req)
    const vr = productImageSchema.safeParse(req.body)

    // validate request body first
    if (!vr.success) {
      return res.status(400).json({
        message: "input validation error",
        error: vr.error.flatten().fieldErrors,
      })
    }

    // check file
    if (!file) {
      throw new ApiError("image file is required", 400)
    return
    }

    // upload image
    const uploaded = await uploadToCloudinary(file)

    if (!uploaded?.url) {
      throw new ApiError("error while uploading image", 500)
      return
    }

    // create product image
    const newProductImage = await prisma.productImage.create({
      data: {
        productId: vr.data.productId,
        productVariantId: vr.data.productVariantId,
        sortOrder: vr.data.sortOrder,
        altText: vr.data.altText,
        isPrimary: vr.data.isPrimary,
        url: uploaded.url,
      },
    })

    return res.status(201).json({
      message: "product image created successfully",
      data: newProductImage,
    })
  } catch (e) {
    logger.error("error while creating product image variant", e)
      throw new ApiError("internal server error", 500)
  }
}
