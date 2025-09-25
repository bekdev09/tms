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
