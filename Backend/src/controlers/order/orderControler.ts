import { Request, Response } from "express"
import { createOrderSchema, paidOrderSchema } from "../../utils/validatons/orderValidation"
import { prisma } from "../../db/prisma"
import { throwInternalServerError } from "../event/eventControler"
import logger from "../../utils/logger"
import { razorPayInstance } from "../../config/razorpayConfig"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"
export const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?.id
        if (!userId) {
            return res.status(401).json({ message: "not authenticated" })
        }
        const vr = createOrderSchema.safeParse(req.body)
        if (!vr.success) {
            return res.status(400).json({ message: "Input validation Error", error: vr.error.flatten().fieldErrors })
        }
        const promoCode = vr.data.promoCodeId;
        let promoCodeValid = null;

        if (promoCode) {
            promoCodeValid = await prisma.promoCode.findFirst({
                where: {
                    id: promoCode,
                    isActive: true,
                },
            });

            if (!promoCodeValid || promoCodeValid === null || promoCodeValid.usageLimit && promoCodeValid.usageLimit <= promoCodeValid.usedCount) {
                return res.status(400).json({
                    message: "Invalid or expired promo code",
                });
            }
        }
        const address = await prisma.address.findUnique({ where: { id: vr.data.addressId } })
        if (!address) {
            return res.status(404).json({ message: "Address not found" })
        }
        const allItems = await Promise.all(
            vr.data.item.map((item) =>
                prisma.productVariant.findUnique({
                    where: { id: item.variantId },
                    select: {
                        id: true,
                        productId: true,
                        finalPrice: true,
                        deliveryCharge: true
                    },
                })
            )
        ) || [];

        if (allItems.some((item) => !item)) {
            return res.status(404).json({
                message: "Some product variants were not found",
            });
        }
        if (allItems.length == 0) {
            return res.status(400).json({ message: "no product found" })
        }
        const getQuantity = (id: string) => vr.data.item.find(item => item.variantId === id)?.quantity || 1
        const totalAmount = allItems.reduce((sum, item) => sum = ((item?.finalPrice || 0) * getQuantity(item?.id || "")) + sum, 0)
        const deliveryCharge = allItems.reduce((sum, item) => sum = sum + ((item?.deliveryCharge || 0) * getQuantity(item?.id || '')), 0)
        const discount = promoCodeValid?.amount || 0
        const finalPrice = (totalAmount + deliveryCharge) - discount

        const receipt = `${userId.slice(0, 8)}_${Date.now()}`;

        const order = await razorPayInstance.orders.create({
            "amount": finalPrice * 100,
            "currency": "INR",
            "receipt": receipt,
        })
        const newOrder = await prisma.order.create({
            data: {
                currency: order.currency,
                razorPayOrderId: order.id,
                totalAmount: Number(order.amount)/100,
                promoCodeId: promoCode,
                 addressId: vr.data.addressId,
                  userId,
                items: {
                    create: vr.data.item.map(item => {
                        return {
                            productId: item.productId, productVariantId: item.variantId, size: item.size, quantity: item.quantity
                        }
                    })
                },
                ...(promoCodeValid && { promoCodeUsages: { create: { promoCodeId: promoCodeValid.id, userId } } })

            }
        })
        if (promoCodeValid && newOrder.promoCodeId === promoCodeValid.id) {
            const updatePromoCode = await prisma.promoCode.update({ where: { id: promoCodeValid.id }, data: { usedCount: { increment: 1 } } })
        }
        const clearCart = Promise.all(
            allItems.map(item =>
                prisma.cartItem.deleteMany({ where: { userId, productVariantId: item?.id || "", productId: item?.productId } })
            )
        )
        res.status(201).json({ message: "created order successfully", data: newOrder })
    }
    catch (e) {
        logger.error("error while creating order", e)
        throwInternalServerError()
    }
}


export const getOrders = async (req: Request, res: Response) => {
    try {
        const userId = req?.user?.id
        if (!userId) {
            return res.status(401).json({ message: "unAuthorized" })
        }

        const orders = await prisma.order.findMany({ where: { userId },include:{items:{include:{product:{select:{name:true,description:true,}},productVariant:{select:{images:{select:{url:true}},finalPrice:true,deliveryCharge:true}}}}} })
        return res.status(200).json({ message: "fetched orders", orders })
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError && e.code === "p2025") {
            return res.status(401).json({ message: "unauthorized" })
        }
        logger.error("error while remove from cart", e)
        throwInternalServerError()
    }
}

export const orderPaid = async (req: Request, res: Response) => {
    try {
        const vr = paidOrderSchema.safeParse(req.body)
        if (!vr.success) {
            return res.status(400).json({ message: "Input validation Error", error: vr.error.flatten().fieldErrors })
        }
        const orderId = req.params.id as string

        const updateOrder = await prisma.order.update({ where: { id: orderId, }, data: { paymentStatus: "PAID", razorPayPaymentSignature: vr.data.razorpay_signature,razorPayPaymentId:vr.data.razorpay_payment_id } })
        return res.status(200).json({ message: "updated Order paid" })
    }
    catch (e) {
        logger.info("Error while paid ", e)
        throwInternalServerError()
    }
}