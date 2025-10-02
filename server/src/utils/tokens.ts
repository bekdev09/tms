import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { env } from '../configs/env.ts';
import { prisma } from '../prisma/client.ts';
import { AuthPayload, DecodedAuthPayload, DecodedAuthPayloadSchema } from "../modules/auth/auth.schemas.ts";
import { UserDto } from '../modules/auth/auth.dto.ts';
import { UnauthorizedError } from '../errors/unauthorized.ts';

export const createJWT = ({ payload }: { payload: AuthPayload }): string => {

  const JWT_SECRET: Secret = env.JWT_ACCESS_SECRET || "SECRET_KEY";

  const expiresIn: SignOptions["expiresIn"] =
    (env.JWT_ACCESTOKEN_LIFETIME as SignOptions["expiresIn"]) || "1h";

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

  return token;
};

export const verifyJWT = ({ token }: { token: string }): DecodedAuthPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    // console.log("decoded--->", decoded);

    const parsed = DecodedAuthPayloadSchema.safeParse(decoded);
    if (!parsed.success) return null;
    return parsed.data;
  } catch (error) {
    return null;
  }
}

export const attachCookiesToResponse = async ({ res, refreshToken }: { res: Response, refreshToken: string }) => {

  const oneDay = 1000 * 60 * 60 * 24; // milliseconds
  // const now = new Date();
  // const absoluteExpiry = new Date(now.getTime() + oneDay);
  // const token = await issueRefreshToken(userId, absoluteExpiry)

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    sameSite: "strict",
  });
};

export async function issueRefreshToken(
  userId: string,
  absoluteExpiry: Date,
  ip?: string,
  userAgent?: string,
  idleExpiryMs: number = 1000 * 60 * 60 * 24 // default 1 day
) {
  const tokenId = crypto.randomUUID();
  const secret = crypto.randomBytes(32).toString("hex");
  const token = `${tokenId}.${secret}`;
  const tokenHash = await bcrypt.hash(secret, 10);

  const now = new Date();
  const expiresAt = new Date(Math.min(now.getTime() + idleExpiryMs, absoluteExpiry.getTime()));

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId,
      tokenHash,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
      expiresAt,
      absoluteExpiry,
    },
  });

  return token;
}

export async function verifyRefreshToken(token: string) {

  const [tokenId, secret] = token.split(".");
  if (!tokenId || !secret) return null;

  const record = await prisma.refreshToken.findUnique({ where: { id: tokenId } });
  if (!record || record.revoked) return null;
  const now = Date.now();

  if (!record.expiresAt || record.expiresAt.getTime() < now) return null;
  if (!record.absoluteExpiry || record.absoluteExpiry.getTime() < now) return null;

  const match = await bcrypt.compare(secret, record.tokenHash);
  return match ? record : null;
}

export async function revokeRefreshToken(tokenId: string) {
  await prisma.refreshToken.update({
    where: { id: tokenId },
    data: { revoked: true },
  });
}

export async function revokeAllRefreshTokensForUser(userId: string) {
  const result = await prisma.refreshToken.updateMany({
    where: {
      userId,
      revoked: false, // only revoke active tokens
    },
    data: {
      revoked: true,
    },
  });

  return result.count;
}

export async function revokeTokensByDevice(userId: string, ip?: string, userAgent?: string) {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
      revoked: false,
      ...(ip ? { ip } : {}),
      ...(userAgent ? { userAgent } : {}),
    },
    data: { revoked: true },
  });
}

// // revoke tokens dynamically
// interface RevokeTokensOptions {
//   tokenId?: string;
//   userId?: string;
//   ip?: string;
//   userAgent?: string;
//   onlyActive?: boolean; // default true
// }

// export async function revokeTokensDynamically(options: RevokeTokensOptions) {
//   const { tokenId, userId, ip, userAgent, onlyActive = true } = options;

//   const where: any = {};
//   if (tokenId) where.id = tokenId;
//   if (userId) where.userId = userId;
//   if (ip) where.ip = ip;
//   if (userAgent) where.userAgent = userAgent;
//   if (onlyActive) where.revoked = false;

//   const result = await prisma.refreshToken.updateMany({
//     where,
//     data: { revoked: true },
//   });

//   return result.count;
// }
