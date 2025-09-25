import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Response } from "express";
import { env } from '../configs/env.ts';
import { AuthPayload, DecodedAuthPayload, DecodedAuthPayloadSchema } from "../modules/auth/auth.schemas.ts";

export const createJWT = ({ payload, isAccessToken }: { payload: AuthPayload, isAccessToken: boolean }): string => {

  const JWT_SECRET: Secret = isAccessToken ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET || "SECRET_KEY";

  const expiresIn: SignOptions["expiresIn"] =
    ((isAccessToken ? env.JWT_ACCESTOKEN_LIFETIME : env.JWT_REFRESHTOKEN_LIFETIME) as SignOptions["expiresIn"]) || "1h";

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

  return token;
};

export const verifyJWT = ({ token, isAccessToken }: { token: string, isAccessToken: boolean }): DecodedAuthPayload | null => {
  try {
    const decoded = jwt.verify(token, isAccessToken ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET);
    const parsed = DecodedAuthPayloadSchema.safeParse(decoded);
    if (!parsed.success) return null;
    return parsed.data;
  } catch (error) {
    return null;
  }
}

// const attachCookiesToResponse = ({ res, user }: { res: Response, user: UserDto }) => {
//   const token = createJWT({ payload: user });

//   const oneDay = 1000 * 60 * 60 * 24;

//   res.cookie('token', token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: "strict",
//     signed: true,
//   });
// };

// module.exports = {
//   createJWT,
//   isTokenValid,
//   // attachCookiesToResponse,
// };