
import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'name is required').max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid('invalid parent id').optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  parentId: z.string().uuid('invalid parent id').optional().nullable(),
})
