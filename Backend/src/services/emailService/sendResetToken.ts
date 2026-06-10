import { emailTransporter } from "../../config/emailTransporter"
import { env } from "../../config/env_config"
import logger from "../../utils/logger"

const sendResetPasswordToken = async (token: string, email: string) => {
  try {
    const resetLink = `${env.frontend_url}/reset-password?token=${token}?email=${email}`

    const html = `
    <div style="background-color:#ffffff; padding:40px 0; font-family:Arial, Helvetica, sans-serif;">
      <div style="max-width:600px; margin:0 auto; padding:40px; border:1px solid #e5e5e5;">

        <h2 style="color:#000000; margin-bottom:20px;">
          Reset Your Password
        </h2>

        <p style="color:#333333; font-size:16px; line-height:1.6;">
          We received a request to reset your password.
          Click the button below to set a new password.
        </p>

        <div style="text-align:center; margin:40px 0;">
          <a href="${resetLink}"
             style="background-color:#000000;
                    color:#ffffff;
                    padding:14px 28px;
                    text-decoration:none;
                    font-size:16px;
                    display:inline-block;">
            Reset Password
          </a>
        </div>

        <p style="color:#666666; font-size:14px; line-height:1.6;">
          If you did not request a password reset, you can safely ignore this email.
        </p>

        <hr style="margin:40px 0; border:none; border-top:1px solid #e5e5e5;" />

        <p style="color:#999999; font-size:12px; text-align:center;">
          © ${new Date().getFullYear()} Tanti SK. All rights reserved.
        </p>

      </div>
    </div>
    `

    return await emailTransporter.sendMail({
      from: `Tanti SK <${env.email}>`,
      to: email,
      subject: "Reset Your Password",
      html
    })
  } catch (error) {
    logger.error("Error sending reset password email", error)
    throw error
  }
}

export default sendResetPasswordToken