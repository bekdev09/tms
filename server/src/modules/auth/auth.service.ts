import bcrypt from "bcryptjs";
import * as authDao from "./auth.dao.ts";
import { RegisterInput } from "./auth.schemas.ts";
import { LoginResponse, loginResponseDtoSchema, UserDto } from "./auth.dto.ts";
import { createJWT, verifyRefreshToken } from "../../utils/jwt.ts";
import { InternalServerError } from "../../errors/internal-server.ts";
import { UnauthorizedError } from "../../errors/unauthorized.ts";

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

    const accessToken = createJWT({ payload: { id: user.id, role: user.role } })

    const result = loginResponseDtoSchema.safeParse({ user: userDto, accessToken, refreshToken })
    if (!result.success) {
        throw new InternalServerError("Invalid response format")
    }

    return result.data;
}

export async function refreshToken(oldToken: string, ip?: string, userAgent?: string) {
    const record = await verifyRefreshToken(oldToken);
    if (!record) throw new UnauthorizedError("Invalid token")
    console.log("record----->>>>", record);

    // const accessToken = createJWT({ payload: { id: user.id, role: user.role } })

    // Optionally rotate refresh token:
    // await revokeRefreshToken(record.id);
    // const newRefreshToken = await issueRefreshToken(record.userId, req.ip, req.headers["user-agent"]);
}
