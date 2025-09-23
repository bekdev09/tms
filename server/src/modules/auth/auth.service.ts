import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as authDao from "./auth.dao.ts";
// import { AuthTokens } from "./auth.types";
import { RegisterInput } from "./auth.schemas.ts";
import { LoginResponse, loginResponseDtoSchema, UserDto } from "./auth.dto.ts";

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
    const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    );

    // const refreshToken = jwt.sign(
    //     { userId: user.id },
    //     process.env.JWT_SECRET!,
    //     { expiresIn: "7d" }
    // );

    const result = loginResponseDtoSchema.safeParse({ user: userDto, token: accessToken })
    if (!result.success) {
        throw new Error("Invalid response format");
    }
    return result.data;
}
