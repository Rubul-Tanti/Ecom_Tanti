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

export const createAddressSchema=z.object({
    label: z.string().min(1).max(50).optional(),
    isDefault: z.boolean().optional(),
    fullName: z.string().min(2).max(100),
    phone: z.string().regex(/^[0-9]{10}$/),
    line1: z.string().min(3).max(200) ,
    line2: z.string().max(200).optional(),
    pincode: z.string().regex(/^[0-9]{6}$/),
    district: z.string().max(100),
    postOffice: z.string().max(100),
    town: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    country: z.string().max(50).optional(),
})


export const addressUpdateSchema = z.object({
  params:z.object({
    adressId:z.string().uuid()
  }),
  body:z.object({
  label: z.string().min(1).max(50).optional(),
  isDefault: z.boolean().optional(),
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  line1: z.string().min(3).max(200).optional(),
  line2: z.string().max(200).optional(),
  pincode: z.string().regex(/^[0-9]{6}$/).optional(),
  district: z.string().max(100).optional(),
  postOffice: z.string().max(100).optional(),
  town: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  country: z.string().max(50).optional(),
  })
})
