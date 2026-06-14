import { z } from "zod";

export const createPromoCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Promo code must be at least 3 characters")
    .max(20, "Promo code cannot exceed 20 characters")
    .transform((val) => val.toUpperCase()),

  amount: z
    .number()
    .int()
    .positive("Amount must be greater than 0"),

  minOrder: z
    .number()
    .int()
    .nonnegative()
    .optional(),

  maxDiscount: z
    .number()
    .int()
    .positive()
    .optional(),

  usageLimit: z
    .number()
    .int()
    .positive()
    .optional(),

  isActive: z
    .boolean()
    .optional()
    .default(true),

  expiresAt: z
    .string()
    .datetime("Invalid date format"),
});

export const updatePromoCodeSchema = createPromoCodeSchema.partial();