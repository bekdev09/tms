import { prisma } from "../../prisma/client.ts";
// import { RegisterInput } from "./auth.schemas";

export async function createUser(data: RegisterInput) {
    return prisma.user.create({ data });
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
}
