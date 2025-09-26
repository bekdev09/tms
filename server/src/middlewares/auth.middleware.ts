// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload, AuthPayloadSchema, DecodedAuthPayload } from "../modules/auth/auth.schemas.ts";
import { UnauthenticatedError } from "../errors/unauthenticated.ts";
import { UnauthorizedError } from "../errors/unauthorized.ts";
import { env } from "../configs/env.ts";
import { verifyJWT } from "../utils/jwt.ts";

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
      const decoded: DecodedAuthPayload | null = verifyJWT({ token, isAccessToken: true });
      if (!decoded) {
        throw new UnauthenticatedError("Unauthorized")
      }
      // attach decoded and parsed payload
      req.user = decoded;

      if (requiredRoles?.length) {
        const userRoles = decoded.role;
        const hasAccess = requiredRoles.some(role => userRoles.includes(role));
        if (!hasAccess) {
          throw new UnauthorizedError("Forbidden: insufficient role")
        }
      }
      next();
    } catch (err) {
      next(err)
    }
  };
}
