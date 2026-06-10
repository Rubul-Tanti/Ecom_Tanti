import {prisma} from "../../db/prisma";
import {Request,Response} from 'express'
import emailValidation from "../../utils/validatons/emailvalidation";
import logger from "../../utils/logger";
import { sendOtp } from "../../services/emailService/sendOtp";
import { generateOtp } from "../../utils/generateOtp";

export const emailverification = async (req: Request, res: Response) => {
    logger.info("hit emailverification");

    const result = emailValidation.safeParse(req.body);
    if (result.error) {
        logger.warn("Invalid email input", { error: result.error });
        return res.status(400).json({ message: "Invalid email"});
    }
    const { email } = result.data;
    const userAlreadyExist=await prisma.user.findFirst({where:{email}})
    if(userAlreadyExist!==null){
        logger.warn('user already exist',userAlreadyExist)
        return res.status(400).json({message:'user already exist'})
    }
    const otp = generateOtp().toString();

    try {
        const existingOtp = await prisma.otp.findFirst({
            where: { email }
        });

        if (existingOtp) {
            const diffMinutes =
                (Date.now() - existingOtp.createdAt.getTime()) / 1000 / 60;

            if (diffMinutes < 5) {
                const remaining = 5 - diffMinutes;
                logger.warn("OTP rate limit hit", { email });
                return res.status(429).json({
                    message: `Please wait ${Math.ceil(remaining)} minutes before requesting another OTP`
                });
            }
            await prisma.otp.deleteMany({ where: { email } });
        }

        await prisma.otp.create({
           data:{email,otp}});

    } catch (dbError) {
        logger.error("Database error during OTP flow", { email, error: dbError });
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later."
        });
    }

    try {
    await sendOtp(email, otp);
    } catch (emailError) {
        logger.error("Failed to send OTP email", { email, error: emailError });

        try {
            await prisma.otp.deleteMany({ where: { email } });
        } catch (rollbackError) {
            logger.error("Failed to rollback OTP after email failure", { email, error: rollbackError });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again later."
        });
    }

    logger.info("OTP sent successfully", { email });
    return res.status(200).json({
        success: true,
        message: "If the email exists, an OTP has been sent for verification."
    });
};