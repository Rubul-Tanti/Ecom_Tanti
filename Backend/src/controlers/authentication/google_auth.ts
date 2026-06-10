import { Request, Response } from "express";
import { ApiError } from "../../middleware/errorHandler";
import logger from "../../utils/logger";
import { prisma } from "../../db/prisma";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken";

export const registerWithGoogle = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      logger.warn("google auth failed: token missing");
      return res.status(400).json({ success: false, message: "token not found" });
    }

    const googleResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!googleResponse.ok) {
      logger.error("google auth failed: invalid token response from google");
     return res.status(401).json({message:'invalid token'})
    }

    const googleUser = await googleResponse.json();

    if (!googleUser.email_verified) {
      logger.warn(`google auth rejected: email not verified for ${googleUser.email}`);
      return res
        .status(403)
        .json({ success: false, message: "google email not verified try different gmail" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: googleUser.email }, { googleId: googleUser.sub }],
      },
    });

    if (existingUser) {
      const access_token = await generateAccessToken(existingUser.publicId);
      const refresh_token = await generateRefreshToken(existingUser.publicId);

      logger.info(`google login success for ${existingUser.email}`);

      return res
        .status(200)
        .cookie("refresh_token", refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        })
        .json({
          success: true,
          message: "login successful",
          data: {
            userName: existingUser.userName,
            email: existingUser.email,
            role:existingUser.role,
            profilePicture:existingUser.profilePicture,
          },
          access_token,
        });
    }

    const newUser = await prisma.user.create({
      data: {
        userName: googleUser.name,
        email: googleUser.email,
        profilePicture: googleUser.picture,
        googleId: googleUser.sub,
        authProvider: "GOOGLE",
      },
    });

    const access_token = await generateAccessToken(newUser.publicId);
    const refresh_token = await generateRefreshToken(newUser.publicId
    );

    logger.info(`google account created for ${newUser.email}`);

    return res
      .status(201)
      .cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({
        success: true,
        message: "user created successfully",
        data: {
          userName: newUser.userName,
          email: newUser.email,
        },
        access_token,
      });

  } catch (error) {
    logger.error("error while registering with google", error);
    throw new ApiError("internal server error", 500);
  }
};