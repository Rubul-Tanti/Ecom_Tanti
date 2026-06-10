import {emailTransporter} from "../../config/emailTransporter"
import { env } from "../../config/env_config"
import logger from "../../utils/logger"

export const sendOtp=async(email:string,otp:string)=>{
    logger.info('hit send otp ')
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>OTP Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table width="420" cellpadding="0" cellspacing="0"
          style="background:#ffffff; padding:40px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0; color:#000000; font-weight:600;">
                Account Verification
              </h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td align="center" style="color:#333333; font-size:14px; padding-bottom:30px;">
              Use the verification code below to complete your request.
              <br/>
              This code is valid for <b>5 minutes</b>.
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <div style="
                font-size:32px;
                letter-spacing:8px;
                font-weight:bold;
                color:#000000;
                border:2px dashed #000000;
                padding:15px 20px;
                display:inline-block;
                user-select:all;
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <!-- Copy Hint Button (Visual Only) -->
          <tr>
            <td align="center" style="padding-bottom:25px;">
              <div style="
                display:inline-block;
                padding:10px 20px;
                border:1px solid #000000;
                color:#000000;
                text-decoration:none;
                font-size:13px;
                border-radius:4px;
              ">
                Select & Copy Code
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="font-size:12px; color:#777777;">
              If you did not request this code, you can safely ignore this email.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
    return emailTransporter.sendMail({
    from:`Tanti sk ${env.email}`
    ,to:email,
    subject:'Your Varification Code ',
    html
})
}
