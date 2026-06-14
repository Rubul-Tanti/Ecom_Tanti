import express from "express"
import authorizationMiddleware from "../middleware/authentication"
import { asyncError } from "../middleware/errorHandler"
import { createAddress, updateAddress } from "../controlers/address/addressControler"

const addressRouter=express.Router()

addressRouter.post("/",authorizationMiddleware(['ADMIN','MODERATOR','USER']),asyncError(createAddress))
addressRouter.put("/",authorizationMiddleware(['ADMIN','MODERATOR','USER']),asyncError(updateAddress))
export default addressRouter