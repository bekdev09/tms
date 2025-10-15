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
import { de } from "zod/locales";


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
        const [id, name] = line.trim().split(/\s*&\s*/);
        return { id, name };
      })
      .filter((r) => r.name && r.id);

    if (rows.length === 0) {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({ message: "No valid data found in file" });
    }
    console.dir(rows, { depth: null });


    const promises = rows.map((row) =>
      limit(async () => {
        try {
          const response = await axios.get(
            `https://api.example.com/company/${row.id}`
          );
          return {
            name: row.name,
            id: row.id,
            externalInfo: response.data.info || "N/A",
          };
        } catch (err: any) {
          // console.log("Error fetching data for--->", row.id, err.message);

          return { name: row.name, id: row.id, externalInfo: "Error" };
        }

        // // alternative way with 2 API calls
        // try {
        //   const [api1, api2] = await Promise.allSettled([
        //     axios.get(`https://api.example1.com/company/${row.id}`),
        //     axios.get(`https://api.example2.com/extra/${row.id}`),
        //   ]);

        //   const external1 =
        //     api1.status === "fulfilled"
        //       ? api1.value.data.info || "N/A"
        //       : "Error";
        //   const external2 =
        //     api2.status === "fulfilled"
        //       ? api2.value.data.score || "N/A"
        //       : "Error";

        //   return { name: row.name, id: row.id, external1, external2 };
        // } catch (err) {
        //   return { name: row.name, id: row.id, external1: "Error", external2: "Error" };
        // }
      })
    );

    const results = await Promise.all(promises);
    // console.log(results);

    // Create XLSX workbook
    const worksheet = xlsx.utils.json_to_sheet(results);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Results");

    const outputPath = path.join("uploads", `results_${Date.now()}.xlsx`);
    xlsx.writeFile(workbook, outputPath);
    console.log(outputPath);

    // Send file as response
    const uniqueFilename = `results_${Date.now()}.xlsx`;
    res.setHeader("Content-Disposition", `attachment; filename="${uniqueFilename}"`);
    res.setHeader("x-filename", uniqueFilename);

    res.download(outputPath, uniqueFilename, async (err) => {
      if (err) console.error("Error sending file:", err);
      try {
        await fs.promises.unlink(filePath);
        await fs.promises.unlink(outputPath);
      } catch (deleteErr) {
        console.error("Error cleaning up files:", deleteErr);
      }
    });

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
