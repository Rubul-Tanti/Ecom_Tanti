import { z } from "zod";

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const createAddressSchema = z.object({
  label: optionalString(50),

  isDefault: z.boolean().default(false),

  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(100, "Full name is too long"),

  phone: z
    .string()
    .trim()
    .regex(/^\+91[6-9]\d{9}$/, "Invalid phone number"),

  line1: z
    .string()
    .trim()
    .min(3, "Address line 1 is required")
    .max(200),

  line2: optionalString(200),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Invalid pincode"),

  district: optionalString(100),

  postOffice: optionalString(100),

  town: z
    .string()
    .trim()
    .min(2, "Town/City is required")
    .max(100),

  state: z
    .string()
    .trim()
    .min(2, "State is required")
    .max(100),

  country: z.string().trim().default("IN"),
});

export const updateAddressSchema =
  createAddressSchema.partial();

export type CreateAddress = z.infer<
  typeof createAddressSchema
>;

export type UpdateAddress = z.infer<
  typeof updateAddressSchema
>;