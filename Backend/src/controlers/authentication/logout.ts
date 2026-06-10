import { ApiError } from "../../middleware/errorHandler";
import logger from "../../utils/logger";
import { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
  logger.info("Hit logout controller");

  try {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (e) {
    logger.error("Error while logout", e);
    throw new ApiError("Internal Server Error", 500);
  }
};