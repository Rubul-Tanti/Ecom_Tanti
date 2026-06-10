import express from "express"
import authorizationMiddleware from "../middleware/authentication"
import { asyncError } from "../middleware/errorHandler"
import { addToCart, getCart, RemoveFromCart } from "../controlers/cart/cart_controler"

const cartRoutes=express.Router()
cartRoutes.post("/",authorizationMiddleware(["ADMIN","USER","MODERATOR"]),asyncError(addToCart))
cartRoutes.get("/",authorizationMiddleware(["ADMIN","USER","MODERATOR"]),asyncError(getCart))
cartRoutes.delete("/:id",authorizationMiddleware(["ADMIN","USER","MODERATOR"]),asyncError(RemoveFromCart))

export default cartRoutes