import express, { Application, type NextFunction, type Request, type Response } from "express";

import { setupSecurity } from "./middlewares/security.ts";

const app: Application = express();

setupSecurity(app);


app.get("/health", (req: Request, res: Response) => res.json({ ok: true, service: "Task & Work Order API" }))

app.use("/auth", (req: Request, res: Response) => res.json({ msg: "auth" }))
app.use("/users", (req: Request, res: Response) => res.json({ msg: "users" }))
app.use("/tasks", (req: Request, res: Response) => res.json({ msg: "tasks" }))
app.use("/notifications", (req: Request, res: Response) => res.json({ msg: "notifications" }))

export default app
