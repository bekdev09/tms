import { Request, Router, Response } from "express";
import * as authController from "./auth.controller.ts";
// import { authenticate } from "../../middlewares/auth.middleware.ts";
const router = Router();

router.get("/register", /* authenticate(["ADMIN"]),*/ authController.register)
router.post("/login", authController.login);
// router.post("/refresh", authController.refreshToken);
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password", authController.resetPassword);

// Authenticated
// router.post("/logout", /* authenticate(), */ authController.logout);
// router.post("/change-password", /* authenticate(), */ authController.changePassword);

export default router;
