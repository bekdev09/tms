// import { User } from "../../generated/prisma/index.js";
import { prisma } from "../../prisma/client.ts";
import { RegisterInput } from "./auth.schemas.ts";
import { Prisma, RefreshToken, User } from "@prisma/client"

export async function createUser(data: RegisterInput): Promise<User> {
    return prisma.user.create({ data });
}

export async function findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
}

export async function findUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
}

export async function findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
}

export async function writeRefreshToken(data: Prisma.RefreshTokenUncheckedCreateInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data })
}
