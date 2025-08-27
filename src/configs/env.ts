import dotenv from "dotenv";
dotenv.config()
import z from "zod";

const EnvSchema = z.object({
PORT: z.coerce.number().positive().default(3000),
JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters."),
DATABASE_URL: z.url(),
// EMAIL_FROM: z.string(),
// SMTP_HOST: z.string(),
// SMTP_USER: z.string(),
// SMTP_PASS: z.string(),
// TWILIO_ACCOUNT_SID: z.string(),
// TWILIO_AUTH_TOKEN: z.string(),
// TWILIO_PHONE: z.string(),
// NOTIFICATIONS_MODE: z.string(),
})

const parsed = EnvSchema.safeParse(process.env);
console.log("parsed::::::::: ",parsed);

if (!parsed.success) {
  const format = parsed.error.format();
  // Pretty print field errors
  const details = Object.entries(format)
    .filter(([key]) => key !== "_errors")
    .map(([key, val]) => `  ${key}: ${(val as any)._errors.join(", ")}`)
    .join("\n");

  // Also show raw fieldErrors for quick debugging
  // console.error(parsed.error.flatten().fieldErrors);

  throw new Error(
    `❌ Invalid environment variables:\n${details}\n\n` +
      `Fix your .env or environment and restart.`
  );
}
export const env = Object.freeze(parsed.data);
export type Env = z.infer<typeof EnvSchema>;

setTimeout(() => {
  console.log('salommmme');
}, 2000);

// export const env: Env = {
//   PORT: Number(process.env.PORT) ?? 4000,
//   JWT_SECRET: process.env.JWT_SECRET as string ?? "CHANGE_ME_JWT+SECRET",
//   DATABASE_URL: process.env.DATABASE_URL as string ?? "",
//   EMAIL_FROM: process.env.EMAIL_FROM as string,
//   SMTP_HOST: process.env.SMTP_HOST as string,
//   SMTP_USER: process.env.SMTP_USER as string,
//   SMTP_PASS: process.env.SMTP_PASS as string,
//   TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID as string,
//   TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN as string,
//   TWILIO_PHONE: process.env.TWILIO_PHONE as string,
//   NOTIFICATIONS_MODE: process.env.NOTIFICATIONS_MODE as string
// }
