import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number(), // converts string → number
  EMAIL: z.string().email(),
  EMAILPASS: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(5),
  JWT_REFRESH_SECRET: z.string().min(5),
  FRONTEND_URL:z.string().url(),
  JWT_ACCESS_TOKEN_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_TOKEN_EXPIRES: z.string().default("30d"),
  CLOUDINARY_API:z.string(),
  CLOUDINARY_API_SECRET:z.string(),
  CLOUD_NAME:z.string(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  frontend_url:parsedEnv.FRONTEND_URL,
  port: parsedEnv.PORT,
  node_env: parsedEnv.NODE_ENV,

  smtp_host: parsedEnv.SMTP_HOST,
  smtp_port: parsedEnv.SMTP_PORT,
  email: parsedEnv.EMAIL,
  emailPass: parsedEnv.EMAILPASS,

  jwt_access_secret: parsedEnv.JWT_ACCESS_SECRET,
  jwt_refresh_secret: parsedEnv.JWT_REFRESH_SECRET,
  jwt_access_token_expires: parsedEnv.JWT_ACCESS_TOKEN_EXPIRES,
  jwt_refresh_token_expires: parsedEnv.JWT_REFRESH_TOKEN_EXPIRES,
  cloudinary_api:parsedEnv.CLOUDINARY_API,
  cloudinary_api_secret:parsedEnv.CLOUDINARY_API_SECRET
  ,cloud_name:parsedEnv.CLOUD_NAME
};