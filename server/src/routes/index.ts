import { Router, Request, Response } from "express";

const router = Router()

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "Task Management API", // optional: service name
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // in seconds
  });
});

router.use("/auth", (_req: Request, res: Response) => res.json({ msg: "auth" }))
router.use("/users", (_req: Request, res: Response) => res.json({ msg: "users" }))
router.use("/tasks", (_req: Request, res: Response) => res.json({ msg: "tasks" }))
router.use("/notifications", (_req: Request, res: Response) => res.json({ msg: "notifications" }))

export default router
