// import { User } from "../../generated/prisma/index.js";
import { prisma } from "../../prisma/client.ts";
import { RegisterInput } from "./auth.schemas.ts";
import { User } from "@prisma/client"

export async function createUser(data: RegisterInput): Promise<User | null> {
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
