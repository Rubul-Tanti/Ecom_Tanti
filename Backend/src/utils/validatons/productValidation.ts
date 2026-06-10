import { z } from "zod"

/* ─── Helpers ───────────────────────────── */
const booleanFromString = z.coerce.boolean()
const jsonOrObject = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
  }, schema)

/* ─── Image Schema ─────────────────────── */
export const ImagesSchema = z.object({
  altText: z.string(),
  isPrimary: booleanFromString,
  sortOrder: z.coerce.number().int().min(0).default(0).optional(),
  productVariantId: z.string().optional(),
  productId: z.string().optional(),
})

/* ─── Variant Schema ───────────────────── */
export const variantSchema = z.object({
  size: z.string().min(1).max(100).optional(),
  colorName:z.string(),
  color: z
    .string()
    .min(1)
    .max(50)
    .trim()
    .regex(
      /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$|^[a-zA-Z]+$/,
      "Color must be a valid name or hex code"
    )
    .optional(),
      deliveryCharge:z.coerce.number().positive().optional(),
  price: z.coerce
    .number({ error: "Price is required" })
    .positive("Price must be greater than 0")
    .multipleOf(0.01),
  finalPrice: z.coerce
    .number({ error: "final Price is required" })
    .positive("Price must be greater than 0")
    .multipleOf(0.01),

  discountPercentage: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(0),

  discountPrice: z.coerce
    .number()
    .positive()
    .multipleOf(0.01)
    .optional(),

  stock: z.coerce
    .number()
    .int()
    .min(0),

  stockToDisplay: z.coerce
    .number()
    .int()
    .min(0),

  lowStockThreshold: z.coerce
    .number()
    .int()
    .min(0)
    .default(5),

  images: z.array(ImagesSchema).min(1, "At least one image is required"),
})

/* ─── Product Schema ───────────────────── */
export const productSchema = z.object({
  name: z.string().min(2).max(255).trim(),

  description: z.string().min(10).max(5000).trim(),

  moreAboutProduct: z.string().max(10000).trim().optional(),

  categoryId: z.string().uuid().optional(),
  categoryName:z.string(),

  refundable: booleanFromString.default(false),

  returnable: booleanFromString.default(false),

  returnWindowDays: z.coerce
    .number()
    .int()
    .min(1)
    .max(365)
    .optional(),

  isActive: booleanFromString.default(false),

  isFeatured: booleanFromString.default(false),

  variants: jsonOrObject(z.array(variantSchema)),
})

export const createProductSchema = productSchema

export const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  moreAboutProduct: z.string().optional(),
  refundable: z.boolean().optional(),
  returnable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  slug: z.string().optional(),
  returnWindowDays:z.coerce.number().min(1).max(30).optional(),
  categoryId:z.string().uuid().optional(),
})


export const productParamsSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
})

export const productSlugParamsSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
})

// ─── Query / Filters ──────────────────────────────────────────────────────────

export const productQuerySchema = z.object({
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
  categoryName:  z.string().uuid().optional(),
  isActive:    z.coerce.boolean().optional(),
  isFeatured:  z.coerce.boolean().optional(),
  minPrice:    z.coerce.number().min(0).optional(),
  maxPrice:    z.coerce.number().min(0).optional(),
  search:      z.string().max(100).trim().optional(),
  sortBy:      z.enum(['price', 'createdAt', 'averageRating', 'reviewCount']).default('createdAt'),
  sortOrder:   z.enum(['asc', 'desc']).default('desc'),
})
.refine(
  (data) => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
  {
    message: 'minPrice cannot be greater than maxPrice',
    path: ['minPrice'],
  }
)
export const filterProductSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  categoryName: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  productslug:z.coerce.string().optional()
  ,isActive:z.coerce.boolean().optional()
})

export const productImageSchema=z.object({
altText:z.coerce.string(),
isPrimary:z.coerce.boolean(),
productId:z.coerce.string(),
productVariantId:z.coerce.string()
,sortOrder:z.coerce.number()
})

export const updateProductVariantSchema = z.object({
  color: z.string().optional(),

  colorName: z.string().optional(),

  size: z.string().optional(),
  deliveryCharge:z.coerce.number().positive().optional(),

  price: z.coerce
    .number()
    .positive()
    .optional(),
  finalPrice: z.coerce
    .number()
    .positive()
    .optional(),

  discountPercentage: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional(),

  discountPrice: z.coerce
    .number()
    .min(0)
    .optional(),

  stock: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),

  stockToDisplay: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),

  lowStockThreshold: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),

  sku: z.string().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductParams      = z.infer<typeof productParamsSchema>
export type ProductQuery       = z.infer<typeof productQuerySchema>
