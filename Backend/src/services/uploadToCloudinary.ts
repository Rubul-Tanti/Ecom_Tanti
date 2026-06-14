import { cloudinary } from "../config/cloudinaryConfig"
import fs from 'fs'
export const uploadToCloudinary = async (file: Express.Multer.File) => {
    const uniqueName=file.filename
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "products",
    public_id: file.filename
  })
  fs.unlinkSync(file.path)
  return {
    public_id:uniqueName,
    url: result.secure_url
  }
}