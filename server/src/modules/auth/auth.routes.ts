import { Router } from "express";
import * as authController from "./auth.controller.ts";
import { loginSchema, registerSchema } from "./auth.schemas.ts";
import { validate } from "../../middlewares/validateRequest.ts";
import { authenticate } from "../../middlewares/auth.middleware.ts";
import { jobManager } from "../../jobs/jobManager.ts";
import { cleanupExpiredTokens } from "../../jobs/cleanupRefreshToken.ts";
import multer from "multer";
import path from "path";
import fs from "fs";
import pLimit from "p-limit";
import axios from "axios";
import xlsx from "xlsx";
import { BadRequestError } from "../../errors/bad-request.ts";
import { UnauthenticatedError } from "../../errors/unauthenticated.ts";
import { UnauthorizedError } from "../../errors/unauthorized.ts";
import { InternalServerError } from "../../errors/internal-server.ts";

const router = Router();

router.get("/me", authenticate(), authController.getMe);
router.post(
  "/register",
  authenticate(["ADMIN", "MANAGER"]),
  validate(registerSchema),
  authController.register
);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refreshToken);
// expose logout endpoint so client can revoke refresh token cookie and server-side token
router.post("/logout", authController.logout);
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password", authController.resetPassword);

// Authenticated
// router.post("/logout", /* authenticate(), */ authController.logout);
// router.post("/change-password", /* authenticate(), */ authController.changePassword);

// File processing endpoint
const upload = multer({ dest: "uploads/" });
const limit = pLimit(10);
router.post(
  "/process-file",
  authenticate(),
  upload.single("file"),
  async (req, res) => {
    res.json({ message: "File processed successfully" });
  }
);

// Admin-only: restart the cleanup job with new schedule
router.post(
  "/jobs/cleanupTokens/restart",
  authenticate(["ADMIN", "MANAGER"]),
  (req, res) => {
    const { schedule } = req.body; // e.g., "0 3 * * *"
    jobManager.restartJob("cleanupTokens", {
      schedule,
      task: cleanupExpiredTokens,
    });

    res.json({ message: `Cleanup job restarted with schedule: ${schedule}` });
  }
);

export default router;
