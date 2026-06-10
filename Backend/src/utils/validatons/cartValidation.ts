import z from "zod";

export const AddToCart=z.object({
    size:z.string(),
    variantId:z.string(),
    productName:z.string(),
    productImageUrl:z.string(),
    colorName:z.string(),
    price:z.coerce.number(),
    quantity:z.number().default(1),
    deliveryCharge:z.coerce.number()
})