import bcrypt from "bcryptjs";
import * as authDao from "./auth.dao.ts";
import { RegisterInput } from "./auth.schemas.ts";
import { LoginResponse, loginResponseDtoSchema, RefreshResponse, refreshResponseDtoSchema, UserDto } from "./auth.dto.ts";
import { createJWT, issueRefreshToken, revokeAllRefreshTokensForUser, revokeRefreshToken, revokeTokensByDevice, verifyRefreshToken } from "../../utils/tokens.ts";
import { InternalServerError } from "../../errors/internal-server.ts";
import { UnauthorizedError } from "../../errors/unauthorized.ts";
import { NotFoundError } from "../../errors/not-found.ts";
import { UnauthenticatedError } from "../../errors/unauthenticated.ts";

export async function register(data: RegisterInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const createdUser = authDao.createUser({ ...data, password: hashedPassword });
    return createdUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const user = await authDao.findUserByEmail(email);
    
    if (!user) throw new NotFoundError("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthenticatedError("Invalid credentials");
    const userDto: UserDto = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    }

    const accessToken = createJWT({ payload: { id: user.id, role: user.role } })

    const absoluteExpiry: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);;

    // //revoke refresh tokens by device
    // const ip = req.ip;
    // const userAgent = req.headers["user-agent"] ?? null;
    // await revokeTokensByDevice(user.id, ip, userAgent);

    // //revoke refresh token by user
    await revokeAllRefreshTokensForUser(user.id);
    // issue new refresh token on log in
    const refreshToken = await issueRefreshToken(user.id, absoluteExpiry)

    const result = loginResponseDtoSchema.safeParse({ user: userDto, accessToken, refreshToken })
    if (!result.success) {
        throw new InternalServerError("Invalid response format")
    }

    return result.data;
}

export async function rotateRefreshToken(oldToken: string, ip?: string, userAgent?: string): Promise<RefreshResponse> {
    const record = await verifyRefreshToken(oldToken);
    if (!record) {
        throw new UnauthorizedError("Invalid Credentials")
    }

    const findUserAttachedToToken = await authDao.findUserById(record.userId)
    if (!findUserAttachedToToken) throw new UnauthorizedError("Invalid Credentials")

    const accessToken = createJWT({ payload: { id: findUserAttachedToToken.id, role: findUserAttachedToToken.role } })

    await revokeRefreshToken(record.id);
    // // Revoke old token only (rotation)
    // const userId = record.userId;
    // await revokeTokensByDevice(userId, ip, userAgent);

    const idleExpiryMs = 1000 * 60 * 60 * 24;
    const absoluteExpiry = record.absoluteExpiry;

    const newRefreshToken = await issueRefreshToken(
        record.userId,
        absoluteExpiry,
        ip,
        userAgent,
        idleExpiryMs
    );

    const result = refreshResponseDtoSchema.safeParse({ accessToken, refreshToken: newRefreshToken })

    if (!result.success) {
        throw new InternalServerError("Invalid response format")
    }

    return result.data
}

