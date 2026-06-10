import { v2 as cloudinary } from "cloudinary"
import { env } from "./env_config"

cloudinary.config({
  cloud_name: env.cloud_name,
  api_key: env.cloudinary_api,
  api_secret: env.cloudinary_api_secret,
  secure: true,
  upload_prefix: "https://api-eu.cloudinary.com"
})

export { cloudinary }