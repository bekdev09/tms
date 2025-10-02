import z from 'zod'
import { refreshToken } from './auth.controller.ts';

export const userDtoSchema = z.object({
  id: z.cuid2(),
  username: z.string(),
  email: z.email(),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
});

export const loginResponseDtoSchema = z.object({
  user: userDtoSchema,
  accessToken: z.jwt(),
  refreshToken: z.string().length(101)
}).strict()

export type UserDto = z.infer<typeof userDtoSchema>;
export type LoginResponse = z.infer<typeof loginResponseDtoSchema>;
