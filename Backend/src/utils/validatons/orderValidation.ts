import { z } from "zod";

export const OrderItem = z.object({
  productId: z.string(),
  variantId: z.string(),
  size: z.string(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  addressId: z.string(),
  promoCodeId: z.string().optional(),
  item: z.array(OrderItem),
});

export const paidOrderSchema=z.object({
  razorpay_order_id:z.string(),
  razorpay_payment_id:z.string(),
  razorpay_signature:z.string()
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>;