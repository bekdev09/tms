import { Request, Response } from "express";
import * as authService from "./auth.service.ts";
import { StatusCodes } from "http-status-codes";
import {
  attachCookiesToResponse,
  revokeRefreshToken,
  revokeAllRefreshTokensForUser,
} from "../../utils/tokens.ts";
import { UnauthorizedError } from "../../errors/unauthorized.ts";
import { jobManager } from "../../jobs/jobManager.ts";
import { cleanupExpiredTokens } from "../../jobs/cleanupRefreshToken.ts";

export async function register(req: Request, res: Response) {
  const user = await authService.register(req.body);
  res.status(201).json(user);
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(
      username,
      password
    );
    attachCookiesToResponse({ res, refreshToken });
    res.status(StatusCodes.OK).json({ user, accessToken });
  } catch (error) {
    res.clearCookie("refreshToken");
    throw new UnauthorizedError("Invalid Credentials");
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    // console.log('Refresh endpoint hit. Cookies:', req.cookies);
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) throw new UnauthorizedError("Invalid Credentials");

    const { accessToken, refreshToken } = await authService.rotateRefreshToken(
      oldToken
    );

    attachCookiesToResponse({ res, refreshToken });
    res.json({ accessToken });
  } catch (err: unknown) {
    res.clearCookie("refreshToken");

    if (err instanceof Error) {
      // console.warn(`Refresh token failed: ${err.message}, IP: ${req.ip}, User-Agent: ${req.headers["user-agent"]}`);
      console.warn("Refresh token failed:");
    }
    throw new UnauthorizedError("Invalid Credentials");
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies.refreshToken;
  if (token) {
    const [tokenId] = token.split(".");
    if (tokenId) {
      try {
        await revokeRefreshToken(tokenId);
        // additionally revoke all active tokens for this user to ensure logout everywhere
        // fetch the record to determine userId
        // (we rely on revokeRefreshToken to mark the token revoked already)
        // Optionally revoke all tokens: best-effort
        // Note: if you prefer single-device logout, remove the next line.
        // revokeAllRefreshTokensForUser will revoke all active tokens for that user.
        // We don't fail the request if this step errors.
        // ...call asynchronously
        // (we don't have record userId here without fetching; keep simple and leave as-is)
      } catch (e) {
        console.warn("Failed to revoke refresh token on logout", e);
      }
    }
    res.clearCookie("refreshToken");
  }
  res.sendStatus(204);
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError("User not authenticated");
  const user = await authService.getUserById(req.user.id);
  res.status(StatusCodes.OK).json({ user });
}

export async function changePassword(req: Request, res: Response) {
  const userId = req.user?.id;
  const { oldPassword, newPassword } = req.body;
  if (!userId) throw new UnauthorizedError("User not authenticated");

  await authService.changePassword(userId, oldPassword, newPassword);
  res.status(StatusCodes.OK).json({ message: "Password changed successfully" });
}

export async function cleanupTokens(req: Request, res: Response) {
  try {
    const { schedule } = req.body; // e.g., "0 3 * * *"
    jobManager.restartJob("cleanupTokens", {
      schedule,
      task: cleanupExpiredTokens,
    });

    res.json({ message: `Cleanup job restarted with schedule: ${schedule}` });
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to clean up expired tokens" });
  }
}
