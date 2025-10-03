import { Router } from "express";
import * as authController from "./auth.controller.ts";
import { loginSchema, registerSchema } from "./auth.schemas.ts";
import { validate } from "../../middlewares/validateRequest.ts";
import { authenticate } from "../../middlewares/auth.middleware.ts";
import { jobManager } from "../../jobs/jobManager.ts";
import { cleanupExpiredTokens } from "../../jobs/cleanupRefreshToken.ts";
// import { authenticate } from "../../middlewares/auth.middleware.ts";
const router = Router();

router.get("/me", authenticate(), (req, res) => {
    res.json({ user: req.user });
});
router.post("/register", authenticate(["ADMIN", "MANAGER"]), validate(registerSchema), authController.register)
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refreshToken);
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password", authController.resetPassword);

// Authenticated
// router.post("/logout", /* authenticate(), */ authController.logout);
// router.post("/change-password", /* authenticate(), */ authController.changePassword);
router.post("/jobs/cleanupTokens/restart", (req, res) => {
    const { schedule } = req.body; // e.g., "0 3 * * *"
    jobManager.restartJob("cleanupTokens", {
        schedule,
        task: cleanupExpiredTokens,
    });

    res.json({ message: `Cleanup job restarted with schedule: ${schedule}` });
});

export default router;
