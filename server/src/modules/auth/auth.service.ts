import { prisma } from "../../prisma/client.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken, user };
}

export async function register(data: any) {
    const hash = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
        data: {
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            patronymic: data.patronymic,
            email: data.email,
            phone: data.phone,
            passwordHash: hash,
            role: data.role,
        },
    });
}
