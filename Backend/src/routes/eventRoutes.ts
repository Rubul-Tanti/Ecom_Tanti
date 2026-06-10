import express from "express"
import { uploadMiddleware } from '../middleware/multer'
import authorizationMiddleware from "../middleware/authentication"
import { asyncError, multerErrorHandler } from "../middleware/errorHandler"
import { addProductToEvent, createEvent, deleteEvent, editEvent, getAllEvents, getEventById, getEventsForUser } from "../controlers/event/eventControler"
export const eventRouter=express.Router()
eventRouter.post('/',authorizationMiddleware(['ADMIN']),uploadMiddleware.any(),asyncError(createEvent))
eventRouter.get("/",authorizationMiddleware([]),asyncError(getAllEvents))
eventRouter.get("/get",asyncError(getEventsForUser))
eventRouter.post("/:eventId/product/:productId",authorizationMiddleware(['ADMIN']),asyncError(addProductToEvent))
eventRouter.delete("/:id",authorizationMiddleware(['ADMIN']),asyncError(deleteEvent))
eventRouter.put("/:id",authorizationMiddleware(['ADMIN']),asyncError(editEvent))
eventRouter.get("/:id",([]),asyncError(getEventById))
eventRouter.use(multerErrorHandler)