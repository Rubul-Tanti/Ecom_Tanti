import {Request,Response} from 'express'
import logger from '../../utils/logger'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { env } from '../../config/env_config'
import { ApiError } from '../../middleware/errorHandler'
import { prisma } from '../../db/prisma'
import { getsafeUser } from './loginUser'
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken'
interface customJwtPayload extends JwtPayload {
    userId:string
}
export const refreshUser=async(req:Request,res:Response)=>{
    try{
        logger.info("hit refresh user")
        const cookie=req.cookies.refresh_token
        if(!cookie){
            return res.status(403).json({message:"no cookie found"})
        }
        const decode=jwt.verify(cookie,env.jwt_refresh_secret) as customJwtPayload
        const user=await prisma.user.findUnique({where:{publicId:decode.userId},include:{_count:{select:{cart:true}}}})
        if(!user){
            return res.status(404).json({message:'not found'})
        }
        const access_token=generateAccessToken(user.publicId)
        const refresh_token=generateRefreshToken(user.publicId)
        res.status(200).cookie('refresh_token',refresh_token,{httpOnly:true,secure:true}).json({message:"refreash successfully",success:true,data:getsafeUser(user),access_token})
    }catch(e:unknown){
        if(e && typeof e ==="object" && "name" in e && (e as unknown)==='TokenExpiredError'){
            return res.status(404).json({message:'token expired'})
        }
        throw new ApiError("Token invalid",500)
    }
}