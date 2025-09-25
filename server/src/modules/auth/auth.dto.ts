import z from 'zod'

export const userDtoSchema = z.object({
  id: z.cuid2(),
  username: z.string(),
  email: z.email(),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
});

export const loginResponseDtoSchema = z.object({
  user: userDtoSchema,
  accessToken: z.jwt(),
  refreshToken: z.jwt(),
})

export type UserDto = z.infer<typeof userDtoSchema>;
export type LoginResponse = z.infer<typeof loginResponseDtoSchema>;
