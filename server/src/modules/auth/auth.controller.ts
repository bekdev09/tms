import { Request, Response } from "express";
import * as authService from "./auth.service.ts";
import { StatusCodes } from "http-status-codes";
import { attachCookiesToResponse, revokeRefreshToken } from "../../utils/tokens.ts";
import { UnauthenticatedError } from "../../errors/unauthenticated.ts";
import { UnauthorizedError } from "../../errors/unauthorized.ts";

export async function register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    res.status(201).json(user);
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await authService.login(email, password);
        attachCookiesToResponse({ res, refreshToken })
        res.status(StatusCodes.OK).json({ user, accessToken });
    } catch (error) {
        console.log(error);
        res.clearCookie("refreshToken");
    }
}

export async function refreshToken(req: Request, res: Response) {
    try {

        const oldToken = req.cookies.refreshToken;
        if (!oldToken) throw new UnauthorizedError("Invalid Credentials")

        const { accessToken, refreshToken } = await authService.rotateRefreshToken(oldToken)

        attachCookiesToResponse({ res, refreshToken })
        res.json({ accessToken });
    } catch (err: unknown) {
        res.clearCookie("refreshToken");

        if (err instanceof Error) {
            console.warn(`Refresh token failed: ${err.message}, IP: ${req.ip}, User-Agent: ${req.headers["user-agent"]}`);
        }
        throw new UnauthorizedError("Invalid Credentials")
    }
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