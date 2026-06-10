import { z } from "zod";

const emailValidation = z.object({
  email: z.string().email("Invalid email address"),
});

export default emailValidation;