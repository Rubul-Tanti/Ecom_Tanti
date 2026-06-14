import {z} from 'zod'
export const registerUserSchema=z.object({
    email:z.string().email('invalid email address'),
    userName:z.string().min(3).max(12),
    password:z.string().min(6).max(12),
    otp:z.string().min(6)
})
export const loginUserSchema=z.object({
    email:z.string().email('invalid email address')
    ,password:z.string()
})

export const updateUserSchema = z.object({
  userName: z.string().min(3).max(12).optional(),

  firstName: z.string().min(1).max(50).optional(),

  lastName: z.string().min(1).max(50).optional(),

  avatar: z.string().url("Avatar must be a valid URL").optional(),

  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .optional(),

  dateOfBirth: z
    .string()
    .datetime({ message: "Invalid date format" })
    .optional(),
});
