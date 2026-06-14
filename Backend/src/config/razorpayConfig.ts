import Razorpay from "razorpay";
import { env } from "./env_config";

export const razorPayInstance = new Razorpay({
  key_id: env.razorpay_api_kay,
  key_secret: env.razorpay_api_secret,
});