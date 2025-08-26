import dotenv from "dotenv";
dotenv.config()

export const env: {
  PORT: number,
  JWT_SECRET: string,
  DATABASE_URL: string,
  EMAIL_FROM: string,
  SMTP_HOST: string,
  SMTP_USER: string,
  SMTP_PASS: string,
  TWILIO_ACCOUNT_SID: string,
  TWILIO_AUTH_TOKEN: string,
  TWILIO_PHONE: string,
  NOTIFICATIONS_MODE: string,
} = {
  PORT: Number(process.env.PORT) ?? 4000,
  JWT_SECRET: process.env.JWT_SECRET as string ?? "CHANGE_ME_JWT+SECRET",
  DATABASE_URL: process.env.DATABASE_URL as string ?? "",
  EMAIL_FROM: process.env.EMAIL_FROM as string,
  SMTP_HOST: process.env.SMTP_HOST as string,
  SMTP_USER: process.env.SMTP_USER as string,
  SMTP_PASS: process.env.SMTP_PASS as string,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID as string,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN as string,
  TWILIO_PHONE: process.env.TWILIO_PHONE as string,
  NOTIFICATIONS_MODE: process.env.NOTIFICATIONS_MODE as string
}
