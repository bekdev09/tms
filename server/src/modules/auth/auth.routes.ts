import { Request, Router, Response } from "express";
import * as authController from "./auth.controller.ts";
import { loginSchema, registerSchema } from "./auth.schemas.ts";
import { validate } from "../../middlewares/validateRequest.ts";
// import { authenticate } from "../../middlewares/auth.middleware.ts";
const router = Router();

router.get("/register", /* authenticate(["ADMIN"]),*/ validate(registerSchema), authController.register)
router.post("/login", validate(loginSchema), authController.login);
// router.post("/refresh", authController.refreshToken);
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password", authController.resetPassword);

// Authenticated
// router.post("/logout", /* authenticate(), */ authController.logout);
// router.post("/change-password", /* authenticate(), */ authController.changePassword);

export default router;
