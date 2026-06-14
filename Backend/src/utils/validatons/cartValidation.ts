import z from "zod";

export const AddToCart=z.object({
    size:z.string(),
    variantId:z.string(),
    quantity:z.number().default(1),
})