import express from "express"
import authorizationMiddleware from "../middleware/authentication"
import { asyncError } from "../middleware/errorHandler"
import { createPromoCode, deletePromoCode, getPromoCodeById, getPromocodes, updatePromoCode } from "../controlers/promoCode/promoCodeControler"
export const promoCodeRouter=express.Router()
promoCodeRouter.get("/",authorizationMiddleware(['ADMIN']),asyncError(getPromocodes))
promoCodeRouter.post("/",authorizationMiddleware(['ADMIN']),asyncError(createPromoCode))
promoCodeRouter.put("/:id",authorizationMiddleware(['ADMIN']),asyncError(updatePromoCode))
promoCodeRouter.delete("/:id",authorizationMiddleware(['ADMIN']),asyncError(deletePromoCode))
promoCodeRouter.get("/:id",authorizationMiddleware(['ADMIN']),asyncError(getPromoCodeById))
