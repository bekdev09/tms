import jwt from 'jsonwebtoken';
import { Response } from "express";
import { env } from '../configs/env.ts';
import { AuthPayload } from "../modules/auth/auth.schemas.ts";
import { UserDto } from '../modules/auth/auth.dto.ts';

export const createJWT = ({ payload }: { payload: AuthPayload }): string => {

  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const expiresIn: string | number = env.JWT_LIFETIME || "1h";

  const token = jwt.sign(
    { id: 1 },
    "SECRET_KEY",
    {
      expiresIn: expiresIn
    }
  );
  return token;
};

export const isTokenValid = ({ token }: { token: string }) => jwt.verify(token, env.JWT_SECRET) as unknown as AuthPayload;

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