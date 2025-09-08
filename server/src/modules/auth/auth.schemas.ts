import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    patronymic: z.string().optional(),
    email: z.email(),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/),
    password: z.string().min(6),
    role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginSchema>;
