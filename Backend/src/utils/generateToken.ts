import jwt from "jsonwebtoken";
import { env } from "../config/env_config";

export const generateAccessToken = (userId: string) => {
  return jwt.sign(
    { userId },
    env.jwt_access_secret as string,
    {
      expiresIn:'15m',
    }
  );
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId },
    env.jwt_refresh_secret as string,
    {
      expiresIn:'30d',
    }
  );
};