import { Request, Response } from "express";
import * as authService from "./auth.service.ts";

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(tokens);
}

export async function register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    res.status(201).json(user);
}
