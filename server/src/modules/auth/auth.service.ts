import bcrypt from "bcryptjs";
import * as authDao from "./auth.dao.ts";
import { RegisterInput } from "./auth.schemas.ts";
import { LoginResponse, loginResponseDtoSchema, UserDto } from "./auth.dto.ts";
import { createJWT } from "../../utils/jwt.ts";
import { InternalServerError } from "../../errors/internal-server.ts";

export async function register(data: RegisterInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const createdUser = authDao.createUser({ ...data, password: hashedPassword });
    return createdUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const user = await authDao.findUserByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");
    const userDto: UserDto = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    }

    const accessToken = createJWT({ payload: { id: user.id, role: user.role }, isAccessToken: true })
    const refreshToken = createJWT({ payload: { id: user.id, role: user.role }, isAccessToken: false })

    const result = loginResponseDtoSchema.safeParse({ user: userDto, accessToken, refreshToken })
    if (!result.success) {
        throw new InternalServerError("Invalid response format")
    }

    return result.data;
}
