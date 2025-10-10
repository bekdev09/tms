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
import pLimit from 'p-limit';
import axios from "axios";
import xlsx from "xlsx";
import { BadRequestError } from "../../errors/bad-request.ts";
import { UnauthenticatedError } from "../../errors/unauthenticated.ts";
import { UnauthorizedError } from "../../errors/unauthorized.ts";
import { InternalServerError } from "../../errors/internal-server.ts";


const router = Router();

router.get("/me", authenticate(), (req, res) => {
  res.json({ user: req.user });
});
router.post("/register", authenticate(["ADMIN", "MANAGER"]), validate(registerSchema), authController.register)
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refreshToken);
// expose logout endpoint so client can revoke refresh token cookie and server-side token
router.post('/logout', authController.logoutHandler);
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password", authController.resetPassword);

// Authenticated
// router.post("/logout", /* authenticate(), */ authController.logout);
// router.post("/change-password", /* authenticate(), */ authController.changePassword);

// File processing endpoint
const upload = multer({ dest: "uploads/" });
const limit = pLimit(10);
router.post("/process-file", authenticate(), upload.single("file"), async (req, res) => {
  console.log("File received:", req.file);
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== ".txt") {
      await fs.promises.unlink(filePath);
      throw new BadRequestError("Only .txt files are supported")
    }

    const content = await fs.promises.readFile(req.file.path, "utf-8");

    const rows = content
      .split("\n")
      .map((line) => {
        const [name, id] = line.trim().split(/\s+|,/); // support space or comma
        return { name, id };
      })
      .filter((r) => r.name && r.id);

    if (rows.length === 0) {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({ message: "No valid data found in file" });
    }

    const promises = rows.map((row) =>
      limit(async () => {
        try {
          const response = await axios.get(
            `https://api.example.com/company/${row.id}`
          );
          return {
            id: row.id,
            name: row.name,
            externalInfo: response.data.info || "N/A",
          };
        } catch (err) {
          return { name: row.name, id: row.id, externalInfo: "Error" };
        }
      })
    );

    const results = await Promise.all(promises);

    // Create XLSX workbook
    const worksheet = xlsx.utils.json_to_sheet(results);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Results");

    const outputPath = path.join("uploads", `results_${Date.now()}.xlsx`);
    xlsx.writeFile(workbook, outputPath);
    console.log(outputPath);

    // Send file as response
    res.download(outputPath, "processed_results.xlsx", async (err) => {
      if (err) console.error("Error sending file:", err);
      try {
        await fs.promises.unlink(filePath);
        await fs.promises.unlink(outputPath);
      } catch (deleteErr) {
        console.error("Error cleaning up files:", deleteErr);
      }
    });
    // res.json({ message: "✅ File processed successfully", fileContent: content });
  } catch (error) {
    if (error instanceof Error) {
      if (error instanceof BadRequestError) {
        throw new BadRequestError(error.message);
      } else if (error instanceof UnauthenticatedError) {
        console.error('Unauthenticated error:', error);
      } else if (error instanceof UnauthorizedError) {
        console.error('Unknown error:', error);
      } else {
        throw new InternalServerError("Internal server Error")
      }
    } else {
      throw new InternalServerError("Internal server Error")
    }
  }
});

// Admin-only: restart the cleanup job with new schedule
router.post("/jobs/cleanupTokens/restart", (req, res) => {
  const { schedule } = req.body; // e.g., "0 3 * * *"
  jobManager.restartJob("cleanupTokens", {
    schedule,
    task: cleanupExpiredTokens,
  });

  res.json({ message: `Cleanup job restarted with schedule: ${schedule}` });
});

export default router;
