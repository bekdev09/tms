// import { User } from "../../generated/prisma/index.js";
import { prisma } from "../../prisma/client.ts";
import { RegisterInput } from "./auth.schemas.ts";
// import { User } from "@prisma/client"

export async function createUser(data: RegisterInput) {
    return prisma.user.create({ data });
}

export async function findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } })
}
