import { Request, Response } from 'express'
import { ApiError } from '../../middleware/errorHandler'
import logger from '../../utils/logger'
import { prisma } from '../../db/prisma'
import { createCategorySchema, updateCategorySchema } from '../../utils/validatons/categoryValidation'
import { Prisma } from '../../generated/prisma/client'
import { uploadToCloudinary } from '../../services/uploadToCloudinary'

// ── Types ─────────────────────────────────────────────────────────────────────

const INCLUDE_RELATIONS = {
  parent: true,
  children: true,
  _count: { select: { products: true } },
} as const

type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: typeof INCLUDE_RELATIONS
}>

/** Narrowed user shape attached to the request by auth middleware */
interface AuthUser {
  id: string
  role: 'ADMIN' | 'MODERATOR' | 'USER'
}



// ── Safe serialiser ────────────────────────────────────────────────────────────

export const getSafeCategory = (category: CategoryWithRelations) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description ?? null,
  imageUrl: category.imageUrl ?? null,
  parentId: category.parentId ?? null,
  parent: category.parent
    ? {
        id: category.parent.id,
        name: category.parent.name,
        slug: category.parent.slug,
      }
    : null,
  children: category.children.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  })),
  productCount: category._count.products,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
})

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Slugify: lowercase, strip non-alphanumeric, collapse hyphens */
const toSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

/** Pick the single uploaded file regardless of multer field config */
export const getUploadedFile = (req: Request): Express.Multer.File | undefined => {
  if (req.file) return req.file
  const files = req.files
  if (Array.isArray(files)) return files[0]
  return undefined
}

/** Returns true when the caller has one of the accepted roles */
const hasRole = (req: Request, ...roles: AuthUser['role'][]): boolean =>
  req.user != null && roles.includes(req.user.role)

// ── createCategory ─────────────────────────────────────────────────────────────

export const createCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    logger.info("hit create category")
    const validationResult = createCategorySchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'validation error',
        error: validationResult.error.flatten().fieldErrors,
      })
    }

    const data = validationResult.data

    // Optional image upload
    let imageUrl: string | undefined
    const file = getUploadedFile(req)
    if (file) {
      const uploaded = await uploadToCloudinary(file)
      imageUrl = uploaded.url
    }

    // Validate parentId when provided
    if (data.parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: data.parentId },
        select: { id: true },
      })
      if (!parentExists) {
        return res.status(400).json({ message: 'parent category not found' })
      }
    }

    const slug = toSlug(data.name)

    // Guard against duplicate slug
    const slugTaken = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (slugTaken) {
      return res.status(409).json({ message: 'a category with this name already exists' })
    }
    console.log("pass")
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl,
        parentId: data.parentId,
      },
      include: INCLUDE_RELATIONS,
    })

    return res.status(201).json({
      success: true,
      message: 'category created successfully',
      data: getSafeCategory(category),
    })
  } catch (e) {
    logger.error('error while creating category', e)
    throw new ApiError('internal server error', 500)
  }
}

// ── updateCategory ─────────────────────────────────────────────────────────────

export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!hasRole(req, 'ADMIN', 'MODERATOR')) {
      return res.status(403).json({ message: 'not authorized' })
    }

    const id = req.params.id as string
    if(!id){
      return res.status(400).json({message:"id required"})
    }

    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    })
    if (!existing) {
      return res.status(404).json({ message: 'category not found' })
    }

    const validationResult = updateCategorySchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'validation error',
        error: validationResult.error.flatten(),
      })
    }

    const data = validationResult.data

    // Optional new image
    let imageUrl: string | undefined
    const file = getUploadedFile(req)
    if (file) {
      const uploaded = await uploadToCloudinary(file)
      imageUrl = uploaded.url
    }

    // Validate parentId when provided (null means "detach from parent" — allow it)
    if (data.parentId) {
      if (data.parentId === id) {
        return res.status(400).json({ message: 'category cannot be its own parent' })
      }
      const parentExists = await prisma.category.findUnique({
        where: { id: data.parentId },
        select: { id: true },
      })
      if (!parentExists) {
        return res.status(400).json({ message: 'parent category not found' })
      }
    }

    // Re-slug only when name changes
    let slug = existing.slug
    if (data.name && data.name !== existing.name) {
      slug = toSlug(data.name)
      const slugTaken = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
        select: { id: true },
      })
      if (slugTaken) {
        return res.status(409).json({ message: 'a category with this name already exists' })
      }
    }

    /*
     * Build the update payload explicitly as Prisma.CategoryUpdateInput.
     * Using spread conditionals produces `Partial<...> | {}` unions that
     * Prisma's generated types reject when a value can be null.
     * Mutating a typed object avoids that entirely.
     *
     * For the relation field `parent`, use Prisma relational operations
     * (`connect` / `disconnect`) rather than writing `parentId` directly —
     * mixing the scalar foreign key with the relation object in an update
     * input is not permitted by Prisma's generated types.
     */
    const updateData: Prisma.CategoryUpdateInput = {}

    if (data.name !== undefined) {
      updateData.name = data.name
      updateData.slug = slug
    }
    if (data.description !== undefined) {
      updateData.description = data.description // null clears, string sets
    }
    if (data.parentId !== undefined) {
      updateData.parent =
        data.parentId === null
          ? { disconnect: true }
          : { connect: { id: data.parentId } }
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: INCLUDE_RELATIONS,
    })

    return res.status(200).json({
      success: true,
      message: 'category updated successfully',
      data: getSafeCategory(category),
    })
  } catch (e) {
    logger.error('error while updating category', e)
    throw new ApiError('internal server error', 500)
  }
}

// ── deleteCategory ─────────────────────────────────────────────────────────────

export const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!hasRole(req, 'ADMIN')) {
      return res.status(403).json({ message: 'not authorized' })
    }

     const id = req.params.id as string
    const existing = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        _count: { select: { products: true, children: true } },
      },
    })
    if (!existing) {
      return res.status(404).json({ message: 'category not found' })
    }
    if (existing._count.products > 0) {
      return res.status(409).json({
        message: 'cannot delete a category that has products — reassign them first',
      })
    }
    if (existing._count.children > 0) {
      return res.status(409).json({
        message: 'cannot delete a category that has sub-categories — remove them first',
      })
    }

    await prisma.category.delete({ where: { id } })

    return res.status(200).json({
      success: true,
      message: 'category deleted successfully',
    })
  } catch (e) {
    logger.error('error while deleting category', e)
    throw new ApiError('internal server error', 500)
  }
}

// ── getCategories ──────────────────────────────────────────────────────────────

export const getCategories = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('hit get category')
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({
      success: true,
      data: categories.map(getSafeCategory),
    })
  } catch (e) {
    logger.error('error while fetching categories', e)
    throw new ApiError('internal server error', 500)
  }
}

// ── getCategoryById ────────────────────────────────────────────────────────────

export const getCategoryById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string
    const category = await prisma.category.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    })
    if (!category) {
      return res.status(404).json({ message: 'category not found' })
    }

    return res.status(200).json({
      success: true,
      data: getSafeCategory(category),
    })
  } catch (e) {
    logger.error('error while fetching category', e)
    throw new ApiError('internal server error', 500)
  }
}