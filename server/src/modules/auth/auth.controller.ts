import { Request, Response } from "express";
import * as authService from "./auth.service.ts";
import { StatusCodes } from "http-status-codes";

export async function register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    res.status(201).json(user);
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { user, accessToken } = await authService.login(email, password);
    res.status(StatusCodes.OK).json({ user, accessToken });
}

export async function refreshToken(req: Request, res: Response) {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const record = await verifyRefreshToken(token);
    if (!record) return res.status(403).json({ error: "Invalid token" });

    const accessToken = signAccessToken(record.userId);

    // Optionally rotate refresh token:
    await revokeRefreshToken(record.id);
    const newRefreshToken = await issueRefreshToken(record.userId, req.ip, req.headers["user-agent"]);
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.json({ accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
    const token = req.cookies.refreshToken;
    if (token) {
        const [tokenId] = token.split(".");
        if (tokenId) {
            await revokeRefreshToken(tokenId);
        }
        res.clearCookie("refreshToken");
    }
    res.sendStatus(204);
}