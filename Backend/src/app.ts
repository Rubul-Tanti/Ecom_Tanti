import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { corsConfig } from './config/cors_config'
import { RequestLogger } from './middleware/requestLogger'
import userRouter from './routes/userRoutes'
import producRoutes from './routes/productRoutes'
import { globalErrorHandler } from './middleware/errorHandler'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import { categoryRouter } from './routes/categoryRoutes'
import { eventRouter } from './routes/eventRoutes'
import cartRoutes from './routes/cartRoutes'
import { promoCodeRouter } from './routes/promoCodeRoutes'
import addressRouter from './routes/addressRoutes'
import orderRouter from './routes/orderRoutes'
// import { prisma } from './db/prisma'
dotenv.config()

export const app=express()
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(RequestLogger)
app.use(cors(corsConfig))
app.use('/api/user',userRouter)
app.use('/api/product',producRoutes)
app.use('/api/category',categoryRouter)
app.use("/api/event/",eventRouter)
app.use('/api/promocode',promoCodeRouter)
app.use("/api/cart",cartRoutes)
app.use("/api/address/",addressRouter)
app.use("/api/order/",orderRouter)
app.use((req,res)=>{
    res.status(404).json({message:"Route not found"})
})
app.use(globalErrorHandler)

// const deletef=async()=>{
//     // await prisma.user.deleteMany({where:{email:'rubultanti440@gmail.com'}})
//     // console.log(await prisma.user.findMany())
//     // console.log(await prisma.otp.findMany())
//     await prisma.user.update({where:{email:'rubultanti440@gmail.com'},data:{role:'ADMIN'}})
// }
// deletef()