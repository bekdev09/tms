import { z } from "zod";

export const AuthPayloadSchema = z.object({
    id: z.cuid2(),
    role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
}).strict();

export type AuthPayload = z.infer<typeof AuthPayloadSchema>;
// ✅ Decoded payload (includes JWT metadata)
export const DecodedAuthPayloadSchema = AuthPayloadSchema.extend({
    iat: z.number(),
    exp: z.number(),
}).strict();

export type DecodedAuthPayload = z.infer<typeof DecodedAuthPayloadSchema>;

export const registerSchema = z.object({
    username: z.string().min(3),
    firstname: z.string().min(2),
    lastname: z.string().min(2),
    patronymic: z.union([z.string(), z.null()]).default(null),
    email: z.email(),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/),
    password: z.string().min(6),
    role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).default("EMPLOYEE"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginSchema>;
