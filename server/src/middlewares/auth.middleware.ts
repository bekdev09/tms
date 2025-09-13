// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // move to env

export function authenticate(requiredRoles?: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith("Bearer ")) {
                return res.status(401).json({ message: "Missing or invalid Authorization header" });
            }
            const token = authHeader?.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Token missing" });
            }
            const decoded = jwt.verify(token, JWT_SECRET) as unknown as AuthPayload;

            // attach decoded payload
            req.user = decoded;

            // if roles are required, check them
            if (requiredRoles && requiredRoles.length > 0) {
                const userRole = (decoded as any).role;
                if (!requiredRoles.includes(userRole)) {
                    return res.status(403).json({ message: "Forbidden: insufficient role" });
                }
            }

            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
}
