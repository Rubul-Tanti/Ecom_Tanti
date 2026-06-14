import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env_config'
import { prisma } from '../db/prisma'
import { getsafeUser } from '../controlers/authentication/loginUser'
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken'
import { UserRole } from '../types/user'

//types

interface JwtCustomPayload extends JwtPayload {
  userId: string
}

const extractBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  const token = header.split(' ')[1]
  return token?.trim() || null
}

const verifyToken = (token: string): JwtCustomPayload => {
  return jwt.verify(token, env.jwt_access_secret) as JwtCustomPayload
}



//if login route handler
const handleLoginRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractBearerToken(req)
  if (!token) {
    next()
    return
  }

  try {
    const { userId } = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { publicId: userId },include:{_count:{select:{cart:true}}} })
    if (!user) {
      res.status(401).json({ message: 'User not found' })
      return
    }
    const access_token = generateAccessToken(user.publicId)
    const refresh_token = generateRefreshToken(user.publicId)
    res.status(200).cookie('refresh_token', refresh_token, { httpOnly: true, secure: true }).json({ message: 'Login successful', data: getsafeUser(user), access_token })
  } catch(e){
       if (e instanceof TokenExpiredError) {
        res.status(401).json({ message: 'Token expired' })
        return
      }
      if (e instanceof JsonWebTokenError) {
        res.status(401).json({ message: 'Invalid token' })
        return
      }
      next()
  }
}


const authorizationMiddleware = (requiredRole: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    //checking if login route
    if (req.originalUrl.startsWith('/api/user/login')) {
      await handleLoginRoute(req, res, next)
      return
    }

    const token = extractBearerToken(req)
  if(!token&&requiredRole.length===0){
  return next()
  }

    if (!token) {
      res.status(401).json({ message: 'No authorization header found' })
      return
    }

    try {
      const { userId } = verifyToken(token)
      const user = await prisma.user.findUnique({ where: { publicId: userId } })
      if (!user) {
        res.status(401).json({ message: 'User not found' })
        return
      }

      if (requiredRole.length>0&&!requiredRole.includes(user.role)) {
        res.status(403).json({ message: 'Insufficient permissions' })
        return
      }

      req.user = {id:user.id,role:user.role}
      next()
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        res.status(401).json({ message: 'Token expired' })
        return
      }
      if (e instanceof JsonWebTokenError) {
        res.status(401).json({ message: 'Invalid token' })
        return
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default authorizationMiddleware