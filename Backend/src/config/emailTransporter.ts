import nodemailer,{TransportOptions} from 'nodemailer'
import {env} from './env_config'

export const emailTransporter = nodemailer.createTransport({
  host: env.smtp_host,
  port: Number(env.smtp_port),
  secure: Number(env.smtp_port) === 465,
  auth: {
    user: env.email,
    pass: env.emailPass,
  },
} as TransportOptions);