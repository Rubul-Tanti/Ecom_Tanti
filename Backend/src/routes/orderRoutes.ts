import express from "express"
import authorizationMiddleware from "../middleware/authentication"
import { asyncError } from "../middleware/errorHandler"
import { createOrder, getOrders, orderPaid } from "../controlers/order/orderControler"
const orderRouter=express.Router()
orderRouter.post("/",authorizationMiddleware(['ADMIN','MODERATOR','USER']),asyncError(createOrder))
orderRouter.get("/",authorizationMiddleware(['ADMIN','MODERATOR','USER']),asyncError(getOrders))
orderRouter.put("/paid/:id",authorizationMiddleware(['ADMIN','MODERATOR','USER']),asyncError(orderPaid))
export default orderRouter