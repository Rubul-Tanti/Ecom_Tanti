import { CorsOptions } from 'cors';
import { env } from './env_config';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedDomains = ['http://localhost:3000',env.frontend_url];

    if (!origin || allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not Allowed By Cors'));
    }
  },
  methods: ['PUT', 'POST', 'PATCH', 'GET', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Version'],
  exposedHeaders: ['X-Total-Count', 'Content-Range'],
  preflightContinue: false,
  credentials: true,
};