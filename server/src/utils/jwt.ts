import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { env } from '../configs/env.ts';
import { prisma } from '../prisma/client.ts';
import { AuthPayload, DecodedAuthPayload, DecodedAuthPayloadSchema } from "../modules/auth/auth.schemas.ts";
import { UserDto } from '../modules/auth/auth.dto.ts';

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
    console.log(decoded);

    const parsed = DecodedAuthPayloadSchema.safeParse(decoded);
    if (!parsed.success) return null;
    return parsed.data;
  } catch (error) {
    return null;
  }
}

export const attachCookiesToResponse = async ({ res, user }: { res: Response, user: UserDto }) => {
  const token = await issueRefreshToken(user.id)
  console.log('attach cookies to response ', token);

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('refreshToken', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    sameSite: "strict",
  });
};

export async function issueRefreshToken(
  userId: string,
  ip?: string,
  userAgent?: string
) {
  const tokenId = crypto.randomUUID(); // public part
  const secret = crypto.randomBytes(32).toString("hex"); // private part
  const token = `${tokenId}.${secret}`; // full token for client
  console.log(token);

  const tokenHash = await bcrypt.hash(secret, 10);

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId,
      tokenHash,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    },
  });

  return token;
}

export async function verifyRefreshToken(token: string) {
  console.log(token);

  const [tokenId, secret] = token.split(".");
  if (!tokenId || !secret) return null;

  const record = await prisma.refreshToken.findUnique({
    where: { id: tokenId },
  });

  if (!record || record.revoked || record.expiresAt < new Date()) {
    return null;
  }

  const match = await bcrypt.compare(secret, record.tokenHash);
  return match ? record : null;
}

export async function revokeRefreshToken(tokenId: string) {
  await prisma.refreshToken.update({
    where: { id: tokenId },
    data: { revoked: true },
  });
}
