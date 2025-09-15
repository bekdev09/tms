// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import { AuthPayload } from "";
import { AuthPayload, AuthPayloadSchema } from "../modules/auth/auth.schemas.ts";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // move to env
type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export function authenticate(requiredRoles?: Role[]) {
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
            const parsed = AuthPayloadSchema.safeParse(decoded);
            if (!parsed.success) {
                return res.status(401).json({ message: "Invalid token payload" });
            }
            // attach decoded and parsed payload
            req.user = parsed.data;

            // if roles are required, check them
            if (requiredRoles?.length) {
                const userRoles = parsed.data.roles;
                const hasAccess = userRoles.some(role => userRoles.includes(role));
                if (!hasAccess) {
                    return res.status(403).json({ message: "Forbidden: insufficient role" });
                }
            }

            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
}
