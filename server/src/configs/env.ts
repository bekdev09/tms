import dotenv from "dotenv";
dotenv.config()
import z from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().positive().default(3000),
  JWT_SECRET: z.string().min(32, "JWT secret key must be at least 32 characters."),
  DATABASE_URL: z.url({ message: "DATABASE_URL must be a valid URL (e.g. postgres://...)" }),
  NODE_ENV: z.string().default("development"),
  JWT_LIFETIME: z.string().optional()
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

if (!parsed.success) {
  const tree = z.treeifyError(parsed.error);

  if (process.env.NODE_ENV === "development") {
    console.error("❌ Invalid environment variables:");
    console.dir(tree, { depth: null });
  }

  console.error(
    JSON.stringify({
      level: "error",
      type: "env_validation",
      errors: tree,
      timestamp: new Date().toISOString(),
    })
  );

  process.exit(1);
}
export const env = Object.freeze(parsed.data);
export type Env = z.infer<typeof EnvSchema>;
