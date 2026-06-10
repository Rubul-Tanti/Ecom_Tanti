export type ProductFormData = {
  name: string
  description: string
  moreAboutProduct: string
  categoryId: string
  refundable: boolean
  returnable: boolean
  returnWindowDays: string
  isActive: boolean
  isFeatured: boolean
}
export interface VariantFormData {
  color: string
  colorName: string
  size: string
    sku:string,
  price: string
  discountPercentage: string
  discountPrice: string
  deliveryCharge:string
  stock: string
  stockToDisplay: string
  lowStockThreshold: string
}
export interface ProductImage {
  id: string
  url: string
  altText: string
  isPrimary: boolean
  sortOrder: number
  productId: string | null
  productVariantId: string
}
export
interface ProductVariant {
  id: string
  productId: string
  size: string
  color: string
  colorName: string
  price: number
  finalPrice:number
  discountPercentage: number
  discountPrice: number
  stock: number
  stockToDisplay: number
  lowStockThreshold: number,
  deliveryCharge:number,
  sku: string
  createdAt: string
  updatedAt: string
  images: ProductImage[]
}
export interface ApiProduct {
  id: string
  slug: string
  name: string
  description: string
  moreAboutProduct: string
  categoryId: string
  categoryName: string | null
  refundable: boolean
  returnable: boolean
  returnWindowDays: number
  isActive: boolean
  isFeatured: boolean
  averageRating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
  variants: ProductVariant[],
  productImages:ProductImage[]
}

export type GetProductResponse = {
  message: string
  success: boolean
  data: ApiProduct
}
export type GetProductsResponse={
  message:string
  success:boolean
  data:ApiProduct[]
}