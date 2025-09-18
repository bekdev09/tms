// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import { AuthPayload } from "";
import { AuthPayload, AuthPayloadSchema } from "../modules/auth/auth.schemas.ts";
import { UnauthenticatedError } from "../errors/unauthenticated.ts";
import { UnauthorizedError } from "../errors/unauthorized.ts";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // move to env
type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export function authenticate(requiredRoles?: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        throw new UnauthenticatedError("Missing or invalid Authorization header")
      }
      const token = authHeader?.split(" ")[1];
      if (!token) {
        throw new UnauthenticatedError("Invalid credentials")
      }
      const decoded = jwt.verify(token, JWT_SECRET) as unknown as AuthPayload;
      const parsed = AuthPayloadSchema.safeParse(decoded);
      if (!parsed.success) {
        throw new UnauthenticatedError("Invalid credentials")
      }
      // attach decoded and parsed payload
      req.user = parsed.data;

      // if roles are required, check them
      if (requiredRoles?.length) {
        const userRoles = parsed.data.roles;
        const hasAccess = userRoles.some(role => userRoles.includes(role));
        if (!hasAccess) {
          throw new UnauthorizedError("Forbidden: insufficient role")
        }
      }
      next();
    } catch (err) {
      throw new UnauthenticatedError("Invalid credentials")
    }
  };
}
