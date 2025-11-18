import { Router } from "express";
import * as authController from "./auth.controller.ts";
import { loginSchema, registerSchema } from "./auth.schemas.ts";
import { validate } from "../../middlewares/validateRequest.ts";
import { authenticate } from "../../middlewares/auth.middleware.ts";
import multer from "multer";
// import pLimit from "p-limit";

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
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password", authController.resetPassword);

// Authenticated
router.post("/logout", authenticate(), authController.logout);
router.post("/change-password", authenticate(), authController.changePassword);

// File processing endpoint
const upload = multer({ dest: "uploads/" });
// const limit = pLimit(10);
router.post(
  "/process-file",
  authenticate(),
  upload.single("file"),
  async (_req, res) => {
    res.json({ message: "File processed successfully" });
  }
);

// Admin-only: restart the cleanup job with new schedule
router.post(
  "/jobs/cleanupTokens/restart",
  authenticate(["ADMIN", "MANAGER"]),
  authController.cleanupTokens
);

export default router;
