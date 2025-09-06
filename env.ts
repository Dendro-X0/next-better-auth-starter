import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().min(1),
    MAIL_PROVIDER: z.enum(["RESEND", "SMTP"]).default("RESEND"),
    SMTP_HOST: z.string().default("localhost"),
    SMTP_PORT: z.coerce.number().default(1025),
    // Parse booleans safely from env strings ("true"/"false"/"1"/"0").
    SMTP_SECURE: z
      .preprocess((val) => {
        if (typeof val === "string") {
          const s = val.trim().toLowerCase();
          if (["1", "true", "yes", "on"].includes(s)) return true;
          if (["0", "false", "no", "off", ""].includes(s)) return false;
        }
        return val;
      }, z.boolean())
      .default(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    // Optional: Upstash Redis for distributed rate limiting
    UPSTASH_REDIS_URL: z.string().url().optional(),
    UPSTASH_REDIS_TOKEN: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    MAIL_PROVIDER: process.env.MAIL_PROVIDER,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
    UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
  },
});
